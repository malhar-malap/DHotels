package com.healthcare.portal.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Brute-force protection for sign-in. After MAX_FAILURES wrong passwords for one email within
 * WINDOW_MINUTES, that email is locked for LOCK_MINUTES. Works the same for emails that don't
 * exist, so the lock message doesn't reveal which accounts are registered.
 * Per-IP limits are applied in front of this by nginx (deploy/proxy/dhotels.conf).
 */
@Service
public class LoginAttemptService {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);
    static final int MAX_FAILURES = 5;
    static final int WINDOW_MINUTES = 15;
    static final int LOCK_MINUTES = 15;

    private static class Attempts {
        int failures;
        LocalDateTime firstFailureAt;
        LocalDateTime lockedUntil;
    }

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    /** Throws if this email is currently locked. */
    public void checkAllowed(String email) {
        Attempts a = attempts.get(key(email));
        if (a == null) {
            return;
        }
        synchronized (a) {
            if (a.lockedUntil != null && LocalDateTime.now().isBefore(a.lockedUntil)) {
                throw new RuntimeException("Too many failed sign-in attempts. Please try again in "
                        + LOCK_MINUTES + " minutes or reset your password.");
            }
        }
    }

    public void recordFailure(String email) {
        LocalDateTime now = LocalDateTime.now();
        attempts.entrySet().removeIf(e -> isStale(e.getValue(), now));
        Attempts a = attempts.computeIfAbsent(key(email), k -> new Attempts());
        synchronized (a) {
            if (a.firstFailureAt == null || a.firstFailureAt.isBefore(now.minusMinutes(WINDOW_MINUTES))) {
                a.failures = 0;
                a.firstFailureAt = now;
            }
            a.failures++;
            if (a.failures >= MAX_FAILURES) {
                a.lockedUntil = now.plusMinutes(LOCK_MINUTES);
                a.failures = 0;
                a.firstFailureAt = null;
                log.warn("Sign-in locked for {} minutes after {} failed attempts: {}", LOCK_MINUTES, MAX_FAILURES, email);
            }
        }
    }

    public void recordSuccess(String email) {
        attempts.remove(key(email));
    }

    private static boolean isStale(Attempts a, LocalDateTime now) {
        synchronized (a) {
            boolean lockOver = a.lockedUntil == null || now.isAfter(a.lockedUntil);
            boolean windowOver = a.firstFailureAt == null || a.firstFailureAt.isBefore(now.minusMinutes(WINDOW_MINUTES));
            return lockOver && windowOver;
        }
    }

    private static String key(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
