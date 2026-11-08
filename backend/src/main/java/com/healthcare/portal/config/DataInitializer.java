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
 * DataInitializer - Seeds sample accounts on startup (user@gmail.com / user@123, buyer@gmail.com / buyer@123, admin@gmail.com / admin@123).
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
        seedAccount("user@gmail.com", "user@123", "Sample User", "9876543210",
                List.of(UserRole.Role.BUYER, UserRole.Role.SELLER, UserRole.Role.EMPLOYER, UserRole.Role.JOB_SEEKER));
        seedAccount("buyer@gmail.com", "buyer@123", "Sample Buyer", "9876543212",
                List.of(UserRole.Role.BUYER));
        seedAccount("admin@gmail.com", "admin@123", "Sample Admin", "9876543211",
                List.of(UserRole.Role.ADMIN, UserRole.Role.BUYER, UserRole.Role.SELLER, UserRole.Role.EMPLOYER));
    }

    /** Creates the account, or resets its password and verification flags and adds any missing roles. */
    private void seedAccount(String email, String password, String fullName, String mobile, List<UserRole.Role> wantedRoles) {
        User user = userRepository.findByEmail(email).orElse(null);
        boolean created = user == null;
        if (created) {
            user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            if (userRepository.existsByMobileNumber(mobile)) {
                mobile = "99999" + (System.currentTimeMillis() % 100000);
            }
            user.setMobileNumber(mobile);
            user.setCompanyName("DHotels24.com Group");
        }
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setStatus(User.UserStatus.ACTIVE);
        user.setIsEmailVerified(true);
        user.setIsPhoneVerified(true);
        user.setIsVerifiedBuyer(true);
        user = userRepository.save(user);

        List<UserRole> roles = new ArrayList<>(Optional.ofNullable(userRoleRepository.findByUser(user)).orElse(List.of()));
        for (UserRole.Role roleEnum : wantedRoles) {
            if (roles.stream().noneMatch(r -> r.getRole() == roleEnum)) {
                UserRole role = new UserRole();
                role.setUser(user);
                role.setRole(roleEnum);
                roles.add(userRoleRepository.save(role));
            }
        }
        user.setRoles(roles);
        userRepository.save(user);
        System.out.println("====== SAMPLE ACCOUNT " + (created ? "CREATED" : "SYNCED") + ": " + email + " ======");
    }
}
