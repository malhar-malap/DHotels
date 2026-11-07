package com.healthcare.portal.config;

import com.healthcare.portal.entity.User;
import com.healthcare.portal.entity.UserRole;
import com.healthcare.portal.repository.UserRepository;
import com.healthcare.portal.repository.UserRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Creates the first production admin from ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD when no account
 * with that email exists yet. It never touches an existing account, so the password can be
 * changed in the app afterwards and the env vars can stay or be removed.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private static final List<UserRole.Role> ROLES = List.of(UserRole.Role.ADMIN, UserRole.Role.SELLER, UserRole.Role.BUYER);

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.email:}")
    private String email;
    @Value("${app.bootstrap-admin.password:}")
    private String password;
    @Value("${app.bootstrap-admin.name:DHotels24 Team}")
    private String fullName;
    @Value("${app.bootstrap-admin.mobile:}")
    private String mobile;
    @Value("${app.bootstrap-admin.company:Dhumavati Consulting LLP (DHotels24.in)}")
    private String company;

    public AdminBootstrap(UserRepository userRepository, UserRoleRepository userRoleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() || password.isBlank() || userRepository.findByEmail(email.trim()).isPresent()) {
            return;
        }
        if (password.length() < 12) {
            log.warn("ADMIN_INITIAL_PASSWORD is shorter than 12 characters; admin account not created");
            return;
        }
        if (mobile.isBlank() || userRepository.existsByMobileNumber(mobile.trim())) {
            log.warn("ADMIN_MOBILE is missing or already used by another account; admin account not created");
            return;
        }
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email.trim());
        user.setMobileNumber(mobile.trim());
        user.setCompanyName(company);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setStatus(User.UserStatus.ACTIVE);
        user.setIsEmailVerified(true);
        user.setIsPhoneVerified(true);
        user.setIsVerifiedBuyer(true);
        user = userRepository.save(user);
        for (UserRole.Role roleName : ROLES) {
            UserRole role = new UserRole();
            role.setUser(user);
            role.setRole(roleName);
            userRoleRepository.save(role);
        }
        log.info("Created the bootstrap admin account {}", user.getEmail());
    }
}
