package com.healthcare.portal.service;

import com.healthcare.portal.dto.UserDTO;
import com.healthcare.portal.entity.City;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.entity.UserRole;
import com.healthcare.portal.entity.BuyerVerification;
import com.healthcare.portal.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for User operations
 */
@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final UserRoleRepository userRoleRepository;
    private final ListingRepository listingRepository;
    private final InquiryRepository inquiryRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final BuyerVerificationRepository buyerVerificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, CityRepository cityRepository, UserRoleRepository userRoleRepository, ListingRepository listingRepository, InquiryRepository inquiryRepository, JobRepository jobRepository, JobApplicationRepository jobApplicationRepository, BuyerVerificationRepository buyerVerificationRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.cityRepository = cityRepository;
        this.userRoleRepository = userRoleRepository;
        this.listingRepository = listingRepository;
        this.inquiryRepository = inquiryRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.buyerVerificationRepository = buyerVerificationRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public UserDTO.UserResponse getCurrentUserProfile() {
        User user = getCurrentAuthenticatedUser();
        return mapToUserResponse(user);
    }
    
    public UserDTO.UserProfileResponse getUserProfile() {
        User user = getCurrentAuthenticatedUser();
        
        UserDTO.UserProfileResponse response = new UserDTO.UserProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setMobileNumber(user.getMobileNumber());
        response.setCompanyName(user.getCompanyName());
        response.setProfilePhotoUrl(user.getProfilePhotoUrl());
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
        
        // Set counts
        response.setListingCount((int) listingRepository.findByUserId(user.getId()).size());
        response.setInquiryCount((int) inquiryRepository.findBySellerId(user.getId()).size());
        response.setJobCount((int) jobRepository.findByEmployerId(user.getId()).size());
        response.setApplicationCount((int) jobApplicationRepository.findBySeekerId(user.getId()).size());
        
        return response;
    }
    
    @Transactional
    public UserDTO.UserResponse updateProfile(UserDTO.UserUpdateRequest request) {
        User user = getCurrentAuthenticatedUser();
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getMobileNumber() != null) {
            user.setMobileNumber(request.getMobileNumber());
        }
        if (request.getCompanyName() != null) {
            user.setCompanyName(request.getCompanyName());
        }
        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found"));
            user.setCity(city);
        }
        
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }
    
    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        User user = getCurrentAuthenticatedUser();
        
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    @Transactional
    public void updateProfilePhoto(String photoUrl) {
        User user = getCurrentAuthenticatedUser();
        user.setProfilePhotoUrl(photoUrl);
        userRepository.save(user);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    @Transactional
    public void suspendUser(Long userId, String reason) {
        User user = getUserById(userId);
        user.setStatus(User.UserStatus.SUSPENDED);
        userRepository.save(user);
    }
    
    @Transactional
    public void activateUser(Long userId) {
        User user = getUserById(userId);
        user.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
    
    public User getCurrentAuthenticatedUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User not authenticated");
        }
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
                .distinct()
                .collect(Collectors.toList());
        response.setRoles(roles);
        
        return response;
    }
    
    @Transactional
    public UserDTO.BuyerVerificationResponse submitVerificationRequest(UserDTO.BuyerVerificationRequest request) {
        User user = getCurrentAuthenticatedUser();
        
        if (buyerVerificationRepository.existsByUserIdAndStatus(user.getId(), BuyerVerification.VerificationStatus.PENDING)) {
            throw new RuntimeException("A verification request is already pending.");
        }
        
        BuyerVerification verification = new BuyerVerification();
        verification.setUser(user);
        
        try {
            verification.setDocType(BuyerVerification.DocumentType.valueOf(request.getDocType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid document type. Allowed values: AADHAAR, PAN, PASSPORT");
        }
        
        verification.setDocUrl(request.getDocUrl());
        verification.setStatus(BuyerVerification.VerificationStatus.PENDING);
        
        verification = buyerVerificationRepository.save(verification);
        return mapToVerificationResponse(verification);
    }
    
    public UserDTO.BuyerVerificationResponse getVerificationStatus() {
        User user = getCurrentAuthenticatedUser();
        if (user == null) return null;
        
        return buyerVerificationRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .map(this::mapToVerificationResponse)
                .orElse(null);
    }
    
    private UserDTO.BuyerVerificationResponse mapToVerificationResponse(BuyerVerification verification) {
        UserDTO.BuyerVerificationResponse response = new UserDTO.BuyerVerificationResponse();
        response.setId(verification.getId());
        response.setDocType(verification.getDocType().name());
        response.setDocUrl(verification.getDocUrl());
        response.setStatus(verification.getStatus().name());
        response.setRejectionReason(verification.getRejectionReason());
        response.setCreatedAt(verification.getCreatedAt());
        return response;
    }
}
