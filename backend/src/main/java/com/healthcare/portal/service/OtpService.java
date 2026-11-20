package com.healthcare.portal.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP management service.
 * OTPs are OTP_LENGTH digits, expire after 5 minutes, are single-use, and are invalidated after
 * MAX_VERIFY_ATTEMPTS wrong guesses. Sending is throttled per email, and an email that collects
 * MAX_FAILURES_PER_DAY wrong guesses can't get or use codes for 24 hours, which keeps the odds of
 * guessing a 4-digit code for someone else's account to about 1 in 1,000 a day.
 * OTP values are never logged.
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_EXPIRY_MINUTES = 5;
    static final int MAX_VERIFY_ATTEMPTS = 5;
    static final int RESEND_COOLDOWN_SECONDS = 60;
    static final int MAX_SENDS_PER_HOUR = 5;
    static final int OTP_LENGTH = 4;
    static final int MAX_FAILURES_PER_DAY = 10;
    static final String LOCKED_MESSAGE = "Too many incorrect codes. Please try again in 24 hours, or sign in with your password.";
    private static final SecureRandom random = new SecureRandom();

    // email -> OtpEntry
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    // email -> times an OTP was sent in the last hour
    private final Map<String, Deque<LocalDateTime>> sendLog = new ConcurrentHashMap<>();
    // email -> wrong guesses in the last 24 hours
    private final Map<String, Deque<LocalDateTime>> failureLog = new ConcurrentHashMap<>();

    private static class OtpEntry {
        final String otp;
        final LocalDateTime expiresAt;
        int failedAttempts;

        OtpEntry(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    /**
     * Generate an OTP_LENGTH-digit OTP for the given email.
     * Any previous OTP for this email is overwritten.
     * Throws if OTPs are being requested too often for this email.
     */
    public String generateOtp(String email) {
        String key = email.toLowerCase();
        // Clean up expired entries periodically
        otpStore.entrySet().removeIf(e -> e.getValue().isExpired());

        ensureNotLockedOut(key);
        enforceSendLimit(key);

        String otp = String.format("%0" + OTP_LENGTH + "d", random.nextInt((int) Math.pow(10, OTP_LENGTH)));
        otpStore.put(key, new OtpEntry(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        log.info("OTP generated for email {}", email);
        return otp;
    }

    private void enforceSendLimit(String key) {
        LocalDateTime now = LocalDateTime.now();
        Deque<LocalDateTime> sends = sendLog.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (sends) {
            while (!sends.isEmpty() && sends.peekFirst().isBefore(now.minusHours(1))) {
                sends.pollFirst();
            }
            if (!sends.isEmpty() && sends.peekLast().isAfter(now.minusSeconds(RESEND_COOLDOWN_SECONDS))) {
                throw new RuntimeException("Please wait a minute before requesting another OTP.");
            }
            if (sends.size() >= MAX_SENDS_PER_HOUR) {
                throw new RuntimeException("Too many OTP requests. Please try again in an hour.");
            }
            sends.addLast(now);
        }
        sendLog.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                return !e.getValue().isEmpty() && e.getValue().peekLast().isBefore(now.minusHours(1));
            }
        });
    }

    /**
     * Verify the OTP for the given email.
     * OTP is single-use — removed after successful verification, or after too many wrong guesses.
     */
    public boolean verifyOtp(String email, String otp) {
        String key = email.toLowerCase();
        ensureNotLockedOut(key);
        OtpEntry entry = otpStore.get(key);
        if (entry == null) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }
        if (entry.isExpired()) {
            otpStore.remove(key);
            log.warn("OTP expired for email: {}", email);
            return false;
        }
        synchronized (entry) {
            if (otp != null && MessageDigest.isEqual(entry.otp.getBytes(), otp.getBytes())) {
                otpStore.remove(key);
                log.info("OTP verified successfully for email: {}", email);
                return true;
            }
            entry.failedAttempts++;
            recordFailure(key);
            if (entry.failedAttempts >= MAX_VERIFY_ATTEMPTS) {
                otpStore.remove(key);
                log.warn("OTP invalidated after {} wrong attempts for email: {}", MAX_VERIFY_ATTEMPTS, email);
            } else {
                log.warn("Invalid OTP attempt for email: {}", email);
            }
        }
        return false;
    }

    private Deque<LocalDateTime> recentFailures(String key) {
        Deque<LocalDateTime> failures = failureLog.computeIfAbsent(key, k -> new ArrayDeque<>());
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        synchronized (failures) {
            while (!failures.isEmpty() && failures.peekFirst().isBefore(cutoff)) {
                failures.pollFirst();
            }
        }
        return failures;
    }

    private void recordFailure(String key) {
        Deque<LocalDateTime> failures = recentFailures(key);
        synchronized (failures) {
            failures.addLast(LocalDateTime.now());
            if (failures.size() >= MAX_FAILURES_PER_DAY) {
                otpStore.remove(key);
                log.warn("OTP locked for 24 hours after {} wrong attempts", MAX_FAILURES_PER_DAY);
            }
        }
    }

    /** Throws once an email has had too many wrong guesses in the last 24 hours. */
    private void ensureNotLockedOut(String key) {
        Deque<LocalDateTime> failures = recentFailures(key);
        synchronized (failures) {
            if (failures.size() >= MAX_FAILURES_PER_DAY) {
                throw new RuntimeException(LOCKED_MESSAGE);
            }
            if (failures.isEmpty()) {
                failureLog.remove(key, failures);
            }
        }
    }
}
