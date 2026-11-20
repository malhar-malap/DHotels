package com.healthcare.portal.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OtpServiceTest {

    /** Lets a test send again straight away instead of waiting out the resend cooldown. */
    private static void clearSendLimit(OtpService service) {
        ((Map<?, ?>) ReflectionTestUtils.getField(service, "sendLog")).clear();
    }

    private static String wrongCode(String code) {
        return code.equals("0000") ? "0001" : "0000";
    }

    @Test
    void codesAreFourDigitsAndSingleUse() {
        OtpService service = new OtpService();
        String code = service.generateOtp("a@example.com");
        assertTrue(code.matches("\\d{4}"), code);
        assertTrue(service.verifyOtp("A@example.com", code));
        assertFalse(service.verifyOtp("a@example.com", code));
    }

    @Test
    void codeIsDroppedAfterTooManyWrongGuesses() {
        OtpService service = new OtpService();
        String code = service.generateOtp("b@example.com");
        for (int i = 0; i < OtpService.MAX_VERIFY_ATTEMPTS; i++) {
            assertFalse(service.verifyOtp("b@example.com", wrongCode(code)));
        }
        assertFalse(service.verifyOtp("b@example.com", code));
    }

    @Test
    void tooManyWrongGuessesInADayLocksTheEmail() {
        OtpService service = new OtpService();
        String email = "c@example.com";
        int failures = 0;
        String code = null;
        while (failures < OtpService.MAX_FAILURES_PER_DAY) {
            clearSendLimit(service);
            code = service.generateOtp(email);
            for (int i = 0; i < OtpService.MAX_VERIFY_ATTEMPTS && failures < OtpService.MAX_FAILURES_PER_DAY; i++) {
                assertFalse(service.verifyOtp(email, wrongCode(code)));
                failures++;
            }
        }
        String lastCode = code;
        RuntimeException verifyLocked = assertThrows(RuntimeException.class, () -> service.verifyOtp(email, lastCode));
        assertEquals(OtpService.LOCKED_MESSAGE, verifyLocked.getMessage());
        clearSendLimit(service);
        assertThrows(RuntimeException.class, () -> service.generateOtp(email));
        // Other accounts are unaffected
        clearSendLimit(service);
        assertTrue(service.verifyOtp("d@example.com", service.generateOtp("d@example.com")));
    }
}
