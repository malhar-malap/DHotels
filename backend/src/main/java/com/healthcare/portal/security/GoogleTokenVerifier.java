package com.healthcare.portal.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

/**
 * Checks a Google Sign-In ID token: signed by Google (keys fetched and cached from Google's JWKS
 * endpoint), unexpired, issued by Google, meant for our client ID and for a verified email.
 */
@Component
public class GoogleTokenVerifier {

    private static final String JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> ISSUERS = Set.of("accounts.google.com", "https://accounts.google.com");

    /** The Google account behind a valid ID token. */
    public record GoogleProfile(String email, String fullName) { }

    private final String clientId;
    private volatile JwtDecoder decoder;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId == null ? "" : clientId.trim();
    }

    public boolean isEnabled() {
        return !clientId.isEmpty();
    }

    public String getClientId() {
        return clientId;
    }

    public GoogleProfile verify(String idToken) {
        if (!isEnabled()) {
            throw new RuntimeException("Google sign-in is not available");
        }
        if (idToken == null || idToken.isBlank()) {
            throw new RuntimeException("Google sign-in failed. Please try again.");
        }
        Jwt jwt;
        try {
            jwt = decoder().decode(idToken);
        } catch (JwtException e) {
            throw new RuntimeException("Google sign-in failed. Please try again.");
        }
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank() || !Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))) {
            throw new RuntimeException("Your Google account's email address is not verified");
        }
        String name = jwt.getClaimAsString("name");
        return new GoogleProfile(email.trim().toLowerCase(Locale.ROOT), name == null ? "" : name.trim());
    }

    private JwtDecoder decoder() {
        if (decoder == null) {
            synchronized (this) {
                if (decoder == null) {
                    NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(JWKS_URI).build();
                    nimbus.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                            JwtValidators.createDefault(), this::checkIssuerAndAudience));
                    decoder = nimbus;
                }
            }
        }
        return decoder;
    }

    OAuth2TokenValidatorResult checkIssuerAndAudience(Jwt jwt) {
        String issuer = jwt.getClaimAsString("iss");
        if (issuer == null || !ISSUERS.contains(issuer)) {
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Wrong issuer", null));
        }
        if (jwt.getAudience() == null || !jwt.getAudience().contains(clientId)) {
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Wrong audience", null));
        }
        return OAuth2TokenValidatorResult.success();
    }
}
