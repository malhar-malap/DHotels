package com.healthcare.portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User Entity - Represents Platform Users
 */
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "mobile_number", nullable = false, unique = true, length = 15)
    private String mobileNumber;
    
    @Column(name = "company_name", length = 200)
    private String companyName;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id")
    private City city;
    
    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;
    
    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = false;
    
    @Column(name = "is_phone_verified")
    private Boolean isPhoneVerified = false;
    
    @Column(name = "is_verified_buyer")
    private Boolean isVerifiedBuyer = false;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserStatus status = UserStatus.ACTIVE;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<UserRole> roles = new ArrayList<>();
    
    public enum UserStatus {
        ACTIVE, SUSPENDED, INACTIVE
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
    public Boolean getIsEmailVerified() { return isEmailVerified; }
    public void setIsEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }
    public Boolean getIsPhoneVerified() { return isPhoneVerified; }
    public void setIsPhoneVerified(Boolean isPhoneVerified) { this.isPhoneVerified = isPhoneVerified; }
    public Boolean getIsVerifiedBuyer() { return isVerifiedBuyer; }
    public void setIsVerifiedBuyer(Boolean isVerifiedBuyer) { this.isVerifiedBuyer = isVerifiedBuyer; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public List<UserRole> getRoles() { return roles; }
    public void setRoles(List<UserRole> roles) { this.roles = roles; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper method to check if user has a specific role
    public boolean hasRole(String roleName) {
        return roles.stream()
                .anyMatch(role -> role.getRole().name().equals(roleName));
    }
    
    // Helper method to check if user is admin
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }
}
