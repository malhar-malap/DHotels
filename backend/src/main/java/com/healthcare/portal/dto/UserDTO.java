package com.healthcare.portal.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for User operations
 */
public class UserDTO {
    
    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private String mobileNumber;
        private String companyName;
        private CityDTO city;
        private String profilePhotoUrl;
        private Boolean isEmailVerified;
        private Boolean isPhoneVerified;
        private Boolean isVerifiedBuyer;
        private String status;
        private List<String> roles;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public CityDTO getCity() { return city; }
        public void setCity(CityDTO city) { this.city = city; }
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
        public Boolean getIsEmailVerified() { return isEmailVerified; }
        public void setIsEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }
        public Boolean getIsPhoneVerified() { return isPhoneVerified; }
        public void setIsPhoneVerified(Boolean isPhoneVerified) { this.isPhoneVerified = isPhoneVerified; }
        public Boolean getIsVerifiedBuyer() { return isVerifiedBuyer; }
        public void setIsVerifiedBuyer(Boolean isVerifiedBuyer) { this.isVerifiedBuyer = isVerifiedBuyer; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
    
    public static class UserUpdateRequest {
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        private String fullName;
        
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
        private String mobileNumber;
        
        private String companyName;
        
        private Long cityId;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public Long getCityId() { return cityId; }
        public void setCityId(Long cityId) { this.cityId = cityId; }
    }
    
    public static class CityDTO {
        private Long id;
        private String name;
        private String stateName;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getStateName() { return stateName; }
        public void setStateName(String stateName) { this.stateName = stateName; }
    }
    
    public static class UserProfileResponse {
        private Long id;
        private String fullName;
        private String email;
        private String mobileNumber;
        private String companyName;
        private CityDTO city;
        private String profilePhotoUrl;
        private Boolean isVerifiedBuyer;
        private String status;
        private List<String> roles;
        private LocalDateTime createdAt;
        private Integer listingCount;
        private Integer inquiryCount;
        private Integer jobCount;
        private Integer applicationCount;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public CityDTO getCity() { return city; }
        public void setCity(CityDTO city) { this.city = city; }
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
        public Boolean getIsVerifiedBuyer() { return isVerifiedBuyer; }
        public void setIsVerifiedBuyer(Boolean isVerifiedBuyer) { this.isVerifiedBuyer = isVerifiedBuyer; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public Integer getListingCount() { return listingCount; }
        public void setListingCount(Integer listingCount) { this.listingCount = listingCount; }
        public Integer getInquiryCount() { return inquiryCount; }
        public void setInquiryCount(Integer inquiryCount) { this.inquiryCount = inquiryCount; }
        public Integer getJobCount() { return jobCount; }
        public void setJobCount(Integer jobCount) { this.jobCount = jobCount; }
        public Integer getApplicationCount() { return applicationCount; }
        public void setApplicationCount(Integer applicationCount) { this.applicationCount = applicationCount; }
    }
    
    public static class BuyerVerificationRequest {
        @NotBlank(message = "Document type is required")
        private String docType;
        
        @NotBlank(message = "Document URL is required")
        private String docUrl;

        public String getDocType() { return docType; }
        public void setDocType(String docType) { this.docType = docType; }
        public String getDocUrl() { return docUrl; }
        public void setDocUrl(String docUrl) { this.docUrl = docUrl; }
    }
    
    public static class BuyerVerificationResponse {
        private Long id;
        private String docType;
        private String docUrl;
        private String status;
        private String rejectionReason;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getDocType() { return docType; }
        public void setDocType(String docType) { this.docType = docType; }
        public String getDocUrl() { return docUrl; }
        public void setDocUrl(String docUrl) { this.docUrl = docUrl; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
