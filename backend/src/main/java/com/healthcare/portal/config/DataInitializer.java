package com.healthcare.portal.config;

import com.healthcare.portal.entity.User;
import com.healthcare.portal.entity.UserRole;
import com.healthcare.portal.repository.UserRepository;
import com.healthcare.portal.repository.UserRoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * DataInitializer - Seeds sample user account on startup if not present or updates password.
 * Local development only: disabled unless app.seed-sample-user=true (SEED_SAMPLE_USER env var).
 */
@Component
@ConditionalOnProperty(name = "app.seed-sample-user", havingValue = "true")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           UserRoleRepository userRoleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedSampleUser();
    }

    private void seedSampleUser() {
        String email = "user@gmail.com";
        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            user.setPasswordHash(passwordEncoder.encode("user@123"));
            user.setStatus(User.UserStatus.ACTIVE);
            user.setIsEmailVerified(true);
            user.setIsPhoneVerified(true);
            user.setIsVerifiedBuyer(true);
            
            List<UserRole> existingRoles = userRoleRepository.findByUser(user);
            if (existingRoles == null || existingRoles.isEmpty()) {
                List<UserRole> roles = new ArrayList<>();
                for (UserRole.Role roleEnum : List.of(UserRole.Role.BUYER, UserRole.Role.SELLER, UserRole.Role.EMPLOYER, UserRole.Role.JOB_SEEKER)) {
                    UserRole role = new UserRole();
                    role.setUser(user);
                    role.setRole(roleEnum);
                    roles.add(userRoleRepository.save(role));
                }
                user.setRoles(roles);
            }
            userRepository.save(user);
            System.out.println("====== SAMPLE USER ALREADY EXISTS - PASSWORD & ROLES SYNCED: " + email + " ======");
        } else {
            User user = new User();
            user.setFullName("Sample User");
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode("user@123"));
            
            String mobile = "9876543210";
            if (userRepository.existsByMobileNumber(mobile)) {
                mobile = "99999" + (System.currentTimeMillis() % 100000);
            }
            user.setMobileNumber(mobile);
            user.setCompanyName("DHotels24.in Group");
            user.setIsEmailVerified(true);
            user.setIsPhoneVerified(true);
            user.setIsVerifiedBuyer(true);
            user.setStatus(User.UserStatus.ACTIVE);

            user = userRepository.save(user);

            List<UserRole> roles = new ArrayList<>();
            for (UserRole.Role roleEnum : List.of(UserRole.Role.BUYER, UserRole.Role.SELLER, UserRole.Role.EMPLOYER, UserRole.Role.JOB_SEEKER)) {
                UserRole role = new UserRole();
                role.setUser(user);
                role.setRole(roleEnum);
                roles.add(userRoleRepository.save(role));
            }
            user.setRoles(roles);
            userRepository.save(user);
            System.out.println("====== SAMPLE USER CREATED: " + email + " with password user@123 ======");
        }
    }
}

