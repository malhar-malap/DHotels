package com.healthcare.portal.security;

import com.healthcare.portal.entity.User;
import com.healthcare.portal.entity.UserRole;
import com.healthcare.portal.repository.UserRepository;
import com.healthcare.portal.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

/**
 * Custom User Details Service for Spring Security
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        boolean enabled = user.getStatus() != User.UserStatus.SUSPENDED;
        
        return new AppUserDetails(
                user.getEmail(),
                user.getPasswordHash(),
                enabled,
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getRole().name()))
                        .collect(Collectors.toList()),
                user.getCredentialsChangedAt()
        );
    }

    /** Spring's user plus when the credentials last changed, so the JWT filter can reject older tokens. */
    public static class AppUserDetails extends org.springframework.security.core.userdetails.User {
        private final java.time.LocalDateTime credentialsChangedAt;

        AppUserDetails(String email, String passwordHash, boolean enabled,
                       java.util.Collection<SimpleGrantedAuthority> authorities, java.time.LocalDateTime credentialsChangedAt) {
            super(email, passwordHash, enabled, true, true, true, authorities);
            this.credentialsChangedAt = credentialsChangedAt;
        }

        public java.time.LocalDateTime getCredentialsChangedAt() { return credentialsChangedAt; }
    }
}
