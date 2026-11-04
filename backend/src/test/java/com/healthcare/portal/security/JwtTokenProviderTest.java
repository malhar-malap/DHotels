package com.healthcare.portal.security;

import com.healthcare.portal.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;
    private User user;

    private static JwtTokenProvider provider(String secret) {
        JwtTokenProvider p = new JwtTokenProvider();
        ReflectionTestUtils.setField(p, "jwtSecret", secret);
        ReflectionTestUtils.setField(p, "accessTokenExpiration", 3_600_000L);
        ReflectionTestUtils.setField(p, "refreshTokenExpiration", 604_800_000L);
        return p;
    }

    @BeforeEach
    void setUp() {
        provider = provider("0123456789abcdef0123456789abcdef0123456789abcdef");
        provider.checkSecret();
        user = new User();
        user.setId(7L);
        user.setEmail("buyer@example.com");
        user.setRoles(List.of());
    }

    @Test
    void missingOrShortSecretFailsStartup() {
        assertThrows(IllegalStateException.class, () -> provider("").checkSecret());
        assertThrows(IllegalStateException.class, () -> provider(null).checkSecret());
        assertThrows(IllegalStateException.class, () -> provider("short-secret").checkSecret());
    }

    @Test
    void accessAndRefreshTokensAreNotInterchangeable() {
        String access = provider.generateAccessToken(user);
        String refresh = provider.generateRefreshToken(user);
        assertTrue(provider.validateToken(access, JwtTokenProvider.ACCESS));
        assertFalse(provider.validateToken(access, JwtTokenProvider.REFRESH));
        assertTrue(provider.validateToken(refresh, JwtTokenProvider.REFRESH));
        assertFalse(provider.validateToken(refresh, JwtTokenProvider.ACCESS));
    }

    @Test
    void tokensSignedWithAnotherKeyOrTamperedAreRejected() {
        JwtTokenProvider other = provider("ffffffffffffffffffffffffffffffffffffffffffffffff");
        String foreign = other.generateAccessToken(user);
        assertFalse(provider.validateToken(foreign, JwtTokenProvider.ACCESS));

        String token = provider.generateAccessToken(user);
        String tampered = token.substring(0, token.length() - 2) + (token.endsWith("A") ? "BB" : "AA");
        assertFalse(provider.validateToken(tampered, JwtTokenProvider.ACCESS));
        assertFalse(provider.validateToken("not-a-jwt", JwtTokenProvider.ACCESS));
    }

    @Test
    void expiredTokensAreRejected() {
        ReflectionTestUtils.setField(provider, "accessTokenExpiration", -1_000L);
        assertFalse(provider.validateToken(provider.generateAccessToken(user), JwtTokenProvider.ACCESS));
    }

    @Test
    void tokensIssuedBeforeAPasswordChangeAreRevoked() {
        String token = provider.generateAccessToken(user);
        assertFalse(provider.issuedBefore(token, null));
        assertFalse(provider.issuedBefore(token, LocalDateTime.now().minusMinutes(1)));
        assertTrue(provider.issuedBefore(token, LocalDateTime.now().plusSeconds(5)));
    }
}
