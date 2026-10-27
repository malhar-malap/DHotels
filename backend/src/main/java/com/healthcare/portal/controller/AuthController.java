package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
    
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with specified roles")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        AuthDTO.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP for registration", description = "Generates and sends a 6-digit OTP to the specified email")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @Valid @RequestBody AuthDTO.SendOtpRequest request) {
        authService.sendRegistrationOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Verification code sent to your email", null));
    }

    @PostMapping("/verify-otp-register")
    @Operation(summary = "Verify OTP and register", description = "Verifies the OTP and completes the registration process")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> verifyOtpRegister(
            @Valid @RequestBody AuthDTO.VerifyOtpAndRegisterRequest request) {
        AuthDTO.AuthResponse response = authService.verifyOtpAndRegister(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }
    
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user and returns JWT tokens")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        AuthDTO.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token", description = "Generates new access token using refresh token")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> refreshToken(
            @RequestBody AuthDTO.RefreshTokenRequest request) {
        AuthDTO.AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }
    
    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Sends OTP for password reset")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody AuthDTO.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", null));
    }
    
    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets password using OTP")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody AuthDTO.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }
    
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the authenticated user's profile")
    public ResponseEntity<ApiResponse<UserDTO.UserResponse>> getCurrentUser() {
        UserDTO.UserResponse userResponse = authService.getCurrentUserResponse();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", userResponse));
    }

    @GetMapping("/check-availability")
    @Operation(summary = "Check if email or mobile number is already registered")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAvailability(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String mobileNumber) {
        Map<String, Boolean> availability = authService.checkAvailability(email, mobileNumber);
        return ResponseEntity.ok(ApiResponse.success("Availability check complete", availability));
    }
}
