package com.healthcare.portal.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP management service.
 * OTPs expire after 5 minutes and are single-use.
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final SecureRandom random = new SecureRandom();

    // email -> OtpEntry
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static class OtpEntry {
        final String otp;
        final LocalDateTime expiresAt;

        OtpEntry(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    /**
     * Generate a 6-digit OTP for the given email.
     * Any previous OTP for this email is overwritten.
     */
    public String generateOtp(String email) {
        // Clean up expired entries periodically
        otpStore.entrySet().removeIf(e -> e.getValue().isExpired());

        String otp = String.format("%06d", random.nextInt(1_000_000));
        otpStore.put(email.toLowerCase(), new OtpEntry(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        log.info("==================================================");
        log.info("OTP generated for email {}: {}", email, otp);
        log.info("==================================================");
        return otp;
    }

    /**
     * Verify the OTP for the given email.
     * OTP is single-use — removed after successful verification.
     */
    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email.toLowerCase());
        if (entry == null) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }
        if (entry.isExpired()) {
            otpStore.remove(email.toLowerCase());
            log.warn("OTP expired for email: {}", email);
            return false;
        }
        if (entry.otp.equals(otp)) {
            otpStore.remove(email.toLowerCase());
            log.info("OTP verified successfully for email: {}", email);
            return true;
        }
        log.warn("Invalid OTP attempt for email: {}", email);
        return false;
    }
}
