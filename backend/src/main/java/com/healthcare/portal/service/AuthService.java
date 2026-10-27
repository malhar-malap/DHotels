package com.healthcare.portal.service;

import com.healthcare.portal.dto.AuthDTO;
import com.healthcare.portal.dto.UserDTO;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import com.healthcare.portal.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

/**
 * Service class for Authentication operations
 */
@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final CityRepository cityRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpService otpService;

    public AuthService(UserRepository userRepository, 
                      UserRoleRepository userRoleRepository, 
                      CityRepository cityRepository, 
                      AuthenticationManager authenticationManager, 
                      JwtTokenProvider tokenProvider, 
                      PasswordEncoder passwordEncoder,
                      EmailService emailService,
                      OtpService otpService) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.cityRepository = cityRepository;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.otpService = otpService;
    }
    
    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Check if mobile number already exists
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new RuntimeException("Mobile number already registered");
        }
        
        // Create user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setMobileNumber(request.getMobileNumber());
        user.setCompanyName(request.getCompanyName());
        user.setStatus(User.UserStatus.ACTIVE);
        user.setIsEmailVerified(false);
        user.setIsPhoneVerified(false);
        user.setIsVerifiedBuyer(false);
        
        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found"));
            user.setCity(city);
        }
        
        user = userRepository.save(user);
        
        // Assign roles
        Set<UserRole> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(UserRole.Role.valueOf(roleName.toUpperCase()));
            roles.add(userRoleRepository.save(userRole));
        }
        user.setRoles(roles.stream().collect(Collectors.toList()));
        
        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
        
        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);
        
        // Build response
        AuthDTO.AuthResponse response = new AuthDTO.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(3600000L);
        response.setUser(mapToUserResponse(user));
        
        return response;
    }
    
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = userRepository.findByEmailWithRoles(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getStatus() == User.UserStatus.SUSPENDED) {
            throw new RuntimeException("Your account has been suspended, unable to login. For more info contact us.");
        }
        
        // Update last login
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);
        
        AuthDTO.AuthResponse response = new AuthDTO.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(3600000L);
        response.setUser(mapToUserResponse(user));
        
        return response;
    }
    
    public AuthDTO.AuthResponse refreshToken(AuthDTO.RefreshTokenRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        Long userId = tokenProvider.getUserIdFromToken(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);
        
        AuthDTO.AuthResponse response = new AuthDTO.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(3600000L);
        response.setUser(mapToUserResponse(user));
        
        return response;
    }
    
    public void forgotPassword(AuthDTO.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
        
        // Generate OTP via OtpService
        String otp = otpService.generateOtp(user.getEmail());
        
        // Send reset email with verification link
        emailService.sendForgotPasswordEmail(user.getEmail(), otp);
    }
    
    @Transactional
    public void resetPassword(AuthDTO.ResetPasswordRequest request) {
        // 1. Verify OTP
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!isValid) {
            throw new RuntimeException("Invalid or expired verification code. Please request a new one.");
        }
        
        // 2. Update Password
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    public UserDTO.UserResponse getCurrentUserResponse() {
        User user = getCurrentUserEntity();
        return mapToUserResponse(user);
    }

    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public UserDTO.UserResponse mapToUserResponse(User user) {
        UserDTO.UserResponse response = new UserDTO.UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setMobileNumber(user.getMobileNumber());
        response.setCompanyName(user.getCompanyName());
        response.setProfilePhotoUrl(user.getProfilePhotoUrl());
        response.setIsEmailVerified(user.getIsEmailVerified());
        response.setIsPhoneVerified(user.getIsPhoneVerified());
        response.setIsVerifiedBuyer(user.getIsVerifiedBuyer());
        response.setStatus(user.getStatus().name());
        response.setCreatedAt(user.getCreatedAt());
        
        if (user.getCity() != null) {
            UserDTO.CityDTO cityDTO = new UserDTO.CityDTO();
            cityDTO.setId(user.getCity().getId());
            cityDTO.setName(user.getCity().getName());
            if (user.getCity().getState() != null) {
                cityDTO.setStateName(user.getCity().getState().getName());
            }
            response.setCity(cityDTO);
        }
        
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getRole().name())
                .collect(Collectors.toList());
        response.setRoles(roles);
        
        return response;
    }
    
    // ========== OTP-based Registration ==========
    
    /**
     * Send OTP for email verification before registration.
     * Checks that email and mobile are not already taken.
     */
    public void sendRegistrationOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }
        
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
    }
    
    /**
     * Verify OTP and register user if OTP is valid.
     */
    @Transactional
    public AuthDTO.AuthResponse verifyOtpAndRegister(AuthDTO.VerifyOtpAndRegisterRequest request) {
        // Verify OTP
        boolean otpValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!otpValid) {
            throw new RuntimeException("Invalid or expired OTP. Please request a new one.");
        }
        
        // OTP is valid — create a RegisterRequest and delegate to existing register logic
        AuthDTO.RegisterRequest registerRequest = new AuthDTO.RegisterRequest();
        registerRequest.setFullName(request.getFullName());
        registerRequest.setEmail(request.getEmail());
        registerRequest.setPassword(request.getPassword());
        registerRequest.setMobileNumber(request.getMobileNumber());
        registerRequest.setCompanyName(request.getCompanyName());
        registerRequest.setCityId(request.getCityId());
        registerRequest.setRoles(request.getRoles());
        
        return register(registerRequest);
    }

    /**
     * Check if email or mobile number already exists.
     */
    public Map<String, Boolean> checkAvailability(String email, String mobileNumber) {
        Map<String, Boolean> result = new HashMap<>();
        if (email != null && !email.trim().isEmpty()) {
            result.put("emailExists", userRepository.existsByEmail(email.trim()));
        }
        if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
            result.put("mobileExists", userRepository.existsByMobileNumber(mobileNumber.trim()));
        }
        return result;
    }
}
