package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.service.AuthService;
import com.healthcare.portal.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {
    
    private final UserService userService;
    private final AuthService authService;

    @Autowired
    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }
    
    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Returns the current user's profile with statistics")
    public ResponseEntity<ApiResponse<UserDTO.UserProfileResponse>> getProfile() {
        UserDTO.UserProfileResponse profile = userService.getUserProfile();
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Updates the current user's profile")
    public ResponseEntity<ApiResponse<UserDTO.UserResponse>> updateProfile(
            @Valid @RequestBody UserDTO.UserUpdateRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        UserDTO.UserResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
    
    @PutMapping("/password")
    @Operation(summary = "Change password", description = "Changes the current user's password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody AuthDTO.ChangePasswordRequest request) {
        userService.changePassword(request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
    
    @PutMapping("/profile-photo")
    @Operation(summary = "Update profile photo", description = "Updates the current user's profile photo")
    public ResponseEntity<ApiResponse<Void>> updateProfilePhoto(
            @RequestParam String photoUrl) {
        userService.updateProfilePhoto(photoUrl);
        return ResponseEntity.ok(ApiResponse.success("Profile photo updated successfully", null));
    }
    
    @PostMapping("/verification")
    @Operation(summary = "Submit buyer verification", description = "Submits KYC document for buyer verification")
    public ResponseEntity<ApiResponse<UserDTO.BuyerVerificationResponse>> submitVerification(
            @Valid @RequestBody UserDTO.BuyerVerificationRequest request) {
        UserDTO.BuyerVerificationResponse response = userService.submitVerificationRequest(request);
        return ResponseEntity.ok(ApiResponse.success("Verification request submitted successfully", response));
    }
    
    @GetMapping("/verification")
    @Operation(summary = "Get verification status", description = "Returns the current user's latest verification status")
    public ResponseEntity<ApiResponse<UserDTO.BuyerVerificationResponse>> getVerificationStatus() {
        UserDTO.BuyerVerificationResponse response = userService.getVerificationStatus();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
