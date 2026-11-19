package com.healthcare.portal.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GoogleSignInTest {

    private static final String CLIENT_ID = "123-abc.apps.googleusercontent.com";

    private static Jwt idToken(String issuer, String audience) {
        return Jwt.withTokenValue("t").header("alg", "RS256")
                .claim("iss", issuer).audience(List.of(audience))
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300)).build();
    }

    @Test
    void acceptsOnlyGoogleTokensForOurClient() {
        GoogleTokenVerifier verifier = new GoogleTokenVerifier(CLIENT_ID);
        assertFalse(verifier.checkIssuerAndAudience(idToken("https://accounts.google.com", CLIENT_ID)).hasErrors());
        assertFalse(verifier.checkIssuerAndAudience(idToken("accounts.google.com", CLIENT_ID)).hasErrors());
        assertTrue(verifier.checkIssuerAndAudience(idToken("https://evil.example.com", CLIENT_ID)).hasErrors());
        assertTrue(verifier.checkIssuerAndAudience(idToken("https://accounts.google.com", "someone-elses-client")).hasErrors());
    }

    @Test
    void disabledWithoutClientId() {
        GoogleTokenVerifier verifier = new GoogleTokenVerifier("  ");
        assertFalse(verifier.isEnabled());
        assertThrows(RuntimeException.class, () -> verifier.verify("anything"));
        assertThrows(RuntimeException.class, () -> new GoogleTokenVerifier(CLIENT_ID).verify(" "));
    }

    @Test
    void signupTokenRoundTripsAndCannotBeUsedAsAccessToken() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", "test-secret-that-is-at-least-32-characters-long");
        String token = provider.generateGoogleSignupToken("a@example.com", "A Person");
        assertArrayEquals(new String[] {"a@example.com", "A Person"}, provider.parseGoogleSignupToken(token));
        assertFalse(provider.validateToken(token, JwtTokenProvider.ACCESS));
        assertFalse(provider.validateToken(token, JwtTokenProvider.REFRESH));
        assertNull(provider.parseGoogleSignupToken(token + "x"));
        assertNull(provider.parseGoogleSignupToken(null));
    }
}
