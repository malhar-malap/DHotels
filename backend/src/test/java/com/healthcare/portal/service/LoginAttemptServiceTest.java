package com.healthcare.portal.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LoginAttemptServiceTest {

    @Test
    void locksAnEmailAfterRepeatedFailures() {
        LoginAttemptService service = new LoginAttemptService();
        for (int i = 0; i < LoginAttemptService.MAX_FAILURES - 1; i++) {
            service.recordFailure("Victim@Example.com");
            assertDoesNotThrow(() -> service.checkAllowed("victim@example.com"));
        }
        service.recordFailure("victim@example.com ");
        assertThrows(RuntimeException.class, () -> service.checkAllowed("VICTIM@example.com"));
        // Other accounts are unaffected
        assertDoesNotThrow(() -> service.checkAllowed("someone@example.com"));
    }

    @Test
    void successClearsEarlierFailures() {
        LoginAttemptService service = new LoginAttemptService();
        for (int i = 0; i < LoginAttemptService.MAX_FAILURES - 1; i++) {
            service.recordFailure("user@example.com");
        }
        service.recordSuccess("user@example.com");
        service.recordFailure("user@example.com");
        assertDoesNotThrow(() -> service.checkAllowed("user@example.com"));
    }

    @Test
    void unknownEmailsLockTheSameWaySoAccountsCantBeEnumerated() {
        LoginAttemptService service = new LoginAttemptService();
        for (int i = 0; i < LoginAttemptService.MAX_FAILURES; i++) {
            service.recordFailure("nobody@example.com");
        }
        assertThrows(RuntimeException.class, () -> service.checkAllowed("nobody@example.com"));
    }
}
