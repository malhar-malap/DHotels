package com.healthcare.portal.security;

import com.healthcare.portal.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * JWT Token Provider for generating and validating tokens
 */
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;
    
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;
    
    /** "typ" claim values: an access token can't be used to refresh, nor a refresh token to call the API. */
    public static final String ACCESS = "access";
    public static final String REFRESH = "refresh";

    /** Fails startup instead of signing tokens with a missing or guessable secret. */
    @jakarta.annotation.PostConstruct
    void checkSecret() {
        if (jwtSecret == null || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be set to at least 32 characters");
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getRoles().stream()
                .map(role -> role.getRole().name())
                .collect(Collectors.toList()));
        claims.put("email", user.getEmail());
        claims.put("typ", ACCESS);
        
        return Jwts.builder()
                .claims(claims)
                .subject(user.getId().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .claim("typ", REFRESH)
                .subject(user.getId().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public Long getUserIdFromToken(String token) {
        return Long.parseLong(parse(token).getSubject());
    }
    
    /** True when the token is correctly signed, unexpired and of the given type (ACCESS or REFRESH). */
    public boolean validateToken(String token, String type) {
        try {
            return type.equals(parse(token).get("typ", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    public String getEmailFromToken(String token) {
        return parse(token).get("email", String.class);
    }

    /**
     * True when the token was issued before the user's password last changed (or they were signed
     * out everywhere), so older stolen tokens stop working. JWT times have second precision.
     */
    public boolean issuedBefore(String token, java.time.LocalDateTime credentialsChangedAt) {
        if (credentialsChangedAt == null) {
            return false;
        }
        Date issuedAt = parse(token).getIssuedAt();
        long changedSecond = credentialsChangedAt.atZone(java.time.ZoneId.systemDefault()).toEpochSecond();
        return issuedAt == null || issuedAt.getTime() / 1000 < changedSecond;
    }
}
