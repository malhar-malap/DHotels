package com.healthcare.portal.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * DTOs for Authentication operations
 */
public class AuthDTO {
    
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        private String fullName;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Password is required")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", 
                 message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number")
        private String password;
        
        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
        private String mobileNumber;
        
        private String companyName;
        
        private Long cityId;
        
        @NotEmpty(message = "At least one role is required")
        private List<String> roles;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public Long getCityId() { return cityId; }
        public void setCityId(Long cityId) { this.cityId = cityId; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
    }
    
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long expiresIn;
        private UserDTO.UserResponse user;

        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
        public Long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
        public UserDTO.UserResponse getUser() { return user; }
        public void setUser(UserDTO.UserResponse user) { this.user = user; }
    }
    
    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }
    
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    public static class ResetPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "OTP is required")
        private String otp;
        
        @NotBlank(message = "New password is required")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", 
                 message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number")
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
    
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;
        
        @NotBlank(message = "New password is required")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", 
                 message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number")
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
    
    public static class SendOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    public static class VerifyOtpAndRegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "OTP is required")
        private String otp;
        
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        private String fullName;
        
        @NotBlank(message = "Password is required")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", 
                 message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number")
        private String password;
        
        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
        private String mobileNumber;
        
        private String companyName;
        private Long cityId;
        
        @NotEmpty(message = "At least one role is required")
        private List<String> roles;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public Long getCityId() { return cityId; }
        public void setCityId(Long cityId) { this.cityId = cityId; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
    }
}
