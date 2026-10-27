package com.healthcare.portal.service;

import com.healthcare.portal.annotation.LogActivity;
import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service class for Admin operations
 */
@Service
public class AdminService {
    
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final JobRepository jobRepository;
    private final InquiryRepository inquiryRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final BuyerVerificationRepository buyerVerificationRepository;
    private final PaymentRepository paymentRepository;
    private final UserRoleRepository userRoleRepository;
    private final ListingService listingService;
    private final JobService jobService;
    private final UserService userService;
    private final EmailService emailService;

    @Autowired
    public AdminService(UserRepository userRepository, ListingRepository listingRepository, JobRepository jobRepository, InquiryRepository inquiryRepository, JobApplicationRepository jobApplicationRepository, BuyerVerificationRepository buyerVerificationRepository, PaymentRepository paymentRepository, UserRoleRepository userRoleRepository, ListingService listingService, JobService jobService, UserService userService, EmailService emailService) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.jobRepository = jobRepository;
        this.inquiryRepository = inquiryRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.buyerVerificationRepository = buyerVerificationRepository;
        this.paymentRepository = paymentRepository;
        this.userRoleRepository = userRoleRepository;
        this.listingService = listingService;
        this.jobService = jobService;
        this.userService = userService;
        this.emailService = emailService;
    }
    
    public AdminDTO.DashboardStats getDashboardStats() {
        AdminDTO.DashboardStats stats = new AdminDTO.DashboardStats();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime weekStart = now.minusDays(7);
        
        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.countByStatus(User.UserStatus.ACTIVE));
        stats.setNewUsersToday(userRepository.countCreatedAfter(todayStart));
        stats.setNewUsersWeek(userRepository.countCreatedAfter(weekStart));
        
        stats.setTotalListings(listingRepository.count());
        stats.setPendingListings(listingRepository.countByStatus(Listing.ListingStatus.PENDING));
        stats.setActiveListings(listingRepository.countByStatus(Listing.ListingStatus.ACTIVE));
        stats.setNewListingsToday(listingRepository.countCreatedAfter(todayStart));
        
        stats.setTotalJobs(jobRepository.count());
        stats.setPendingJobs(jobRepository.countByStatus(Job.JobStatus.PENDING));
        stats.setActiveJobs(jobRepository.countByStatus(Job.JobStatus.ACTIVE));
        stats.setNewJobsWeek(jobRepository.countCreatedAfter(weekStart));
        
        stats.setInquiriesToday(inquiryRepository.countCreatedAfter(todayStart));
        stats.setPendingVerifications(buyerVerificationRepository.countByStatus(BuyerVerification.VerificationStatus.PENDING));
        stats.setApplicationsToday(jobApplicationRepository.countAppliedAfter(todayStart));
        
        return stats;
    }
    
    public Map<String, Object> getListingStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Listings by status
        Map<String, Long> byStatus = new HashMap<>();
        for (Listing.ListingStatus status : Listing.ListingStatus.values()) {
            byStatus.put(status.name(), listingRepository.countByStatus(status));
        }
        stats.put("byStatus", byStatus);
        
        // Listings by category
        // This would require a custom query
        stats.put("total", listingRepository.count());
        
        return stats;
    }
    
    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Users by status
        Map<String, Long> byStatus = new HashMap<>();
        for (User.UserStatus status : User.UserStatus.values()) {
            byStatus.put(status.name(), userRepository.countByStatus(status));
        }
        stats.put("byStatus", byStatus);
        stats.put("total", userRepository.count());
        stats.put("verifiedBuyers", userRepository.findByIsVerifiedBuyerTrue().size());
        
        return stats;
    }
    
    // Listing Management
    public PageResponse<ListingDTO.ListingSummaryResponse> getAllListings(
            int page, int size, String status, Long categoryId, Long dealTypeId, 
            Long cityId, Long stateId, Long sellerId, String keyword) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Listing.ListingStatus listingStatus = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                listingStatus = Listing.ListingStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status
            }
        }
        
        Boolean isNumericOrCode = false;
        Long numericKeyword = null;
        String searchKeyword = keyword;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            String trimmed = keyword.trim();
            isNumericOrCode = trimmed.matches("\\d+") || 
                              trimmed.matches("[A-Za-z]+-?\\d+") ||
                              trimmed.toLowerCase().matches("hsp|phm|dia|den|phy");
            if (trimmed.matches("\\d+")) {
                try {
                    numericKeyword = Long.parseLong(trimmed);
                } catch (NumberFormatException ignored) {}
            }
            if (isNumericOrCode) {
                searchKeyword = trimmed.replace("-", "");
            }
        }
        
        Page<Listing> listings;
        if (isNumericOrCode) {
            listings = listingRepository.adminSearchListingsByCodeOrId(
                    listingStatus, categoryId, dealTypeId, cityId, stateId, sellerId, searchKeyword, numericKeyword, pageable);
        } else {
            listings = listingRepository.adminSearchListings(
                    listingStatus, categoryId, dealTypeId, cityId, stateId, sellerId, keyword, pageable);
        }
        
        Page<ListingDTO.ListingSummaryResponse> responsePage = listings.map(this::mapToListingSummary);
        
        return PageResponse.from(responsePage);
    }
    
    private ListingDTO.ListingSummaryResponse mapToListingSummary(Listing listing) {
        ListingDTO.ListingSummaryResponse response = new ListingDTO.ListingSummaryResponse();
        response.setId(listing.getId());
        response.setDisplayTitle(listing.getDisplayTitle());
        response.setShortDescription(listing.getShortDescription());
        response.setAskingPrice(listing.getAskingPrice());
        response.setPriceNegotiable(listing.getPriceNegotiable());
        response.setIsConfidential(listing.getIsConfidential());
        response.setStatus(listing.getStatus().name());
        response.setCategoryName(listing.getCategory() != null ? listing.getCategory().getName() : null);
        response.setDealType(listing.getDealType() != null ? listing.getDealType().getName() : null);
        if (listing.getCity() != null) {
            response.setCityName(listing.getCity().getName());
            if (listing.getCity().getState() != null) {
                response.setStateName(listing.getCity().getState().getName());
            }
        } else {
            response.setCityName(listing.getCityName());
        }
        response.setCreatedAt(listing.getCreatedAt());
        return response;
    }
    public ListingDTO.ListingResponse getListingById(Long id) {
        return listingService.getListingById(id);
    }
    
    @Transactional
    public void updateListing(Long id, ListingDTO.ListingRequest request) {
        // Fetch listing to get the owner's userId, required for ListingService.updateListing(Long, Request, Long)
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));
        listingService.updateListing(id, request, listing.getUser().getId());
    }
    
    @Transactional
    @LogActivity(action = "APPROVE_LISTING", entityType = "Listing")
    public void approveListing(Long id, String uniqueCode, java.util.List<String> imageUrls) {
        listingService.approveListing(id, uniqueCode, imageUrls);
    }
    
    @Transactional
    @LogActivity(action = "REJECT_LISTING", entityType = "Listing")
    public void rejectListing(Long id, String reason) {
        listingService.rejectListing(id, reason);
    }
    
    @Transactional
    @LogActivity(action = "DELETE_LISTING", entityType = "Listing")
    public void deleteListing(Long id) {
        Listing listing = listingRepository.findById(id).orElse(null);
        inquiryRepository.deleteByListingId(id);
        paymentRepository.deleteByListingId(id);
        listingRepository.deleteById(id);
        if (listing != null && listing.getUser() != null) {
            emailService.sendItemDeletedEmail(listing.getUser().getEmail(), listing.getUser().getFullName(), "Listing", listing.getTitle());
        }
    }
    
    @Transactional
    public void featureListing(Long id, int days) {
        listingService.featureListing(id, days);
    }
    
    // Job Management
    public PageResponse<JobDTO.JobSummaryResponse> getAllJobs(
            int page, int size, String status, Long categoryId, Long cityId, 
            String employmentType, String experienceLevel, Long employerId, String keyword) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Job.JobStatus jobStatus = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                jobStatus = Job.JobStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
            }
        }
        
        Job.EmploymentType empType = null;
        if (employmentType != null && !employmentType.isEmpty()) {
            try {
                empType = Job.EmploymentType.valueOf(employmentType.toUpperCase());
            } catch (IllegalArgumentException e) {
            }
        }
        
        Job.ExperienceLevel expLevel = null;
        if (experienceLevel != null && !experienceLevel.isEmpty()) {
            try {
                expLevel = Job.ExperienceLevel.valueOf(experienceLevel.toUpperCase());
            } catch (IllegalArgumentException e) {
            }
        }
        
        Page<Job> jobs = jobRepository.adminSearchJobs(
                jobStatus, categoryId, cityId, empType, expLevel, employerId, keyword, pageable);
        
        Page<JobDTO.JobSummaryResponse> responsePage = jobs.map(this::mapToJobSummary);
        
        return PageResponse.from(responsePage);
    }
    
    private JobDTO.JobSummaryResponse mapToJobSummary(Job job) {
        JobDTO.JobSummaryResponse response = new JobDTO.JobSummaryResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setSpecialisation(job.getSpecialisation());
        response.setEmploymentType(job.getEmploymentType().name());
        response.setSalaryMinLpa(job.getSalaryMinLpa());
        response.setSalaryMaxLpa(job.getSalaryMaxLpa());
        response.setExperienceRequired(job.getExperienceRequired().name());
        response.setCategoryName(job.getJobCategory() != null ? job.getJobCategory().getName() : null);
        if (job.getCity() != null) {
            response.setCityName(job.getCity().getName());
            if (job.getCity().getState() != null) {
                response.setStateName(job.getCity().getState().getName());
            }
        } else {
            response.setCityName(job.getCityName());
        }
        response.setApplicationDeadline(job.getApplicationDeadline());
        if (job.getEmployer() != null) {
            response.setEmployerName(job.getEmployer().getFullName());
            response.setEmployerCompany(job.getEmployer().getCompanyName());
        }
        response.setCreatedAt(job.getCreatedAt());
        if (job.getStatus() != null) {
            response.setStatus(job.getStatus().name());
        }
        return response;
    }
    @Transactional
    @LogActivity(action = "APPROVE_JOB", entityType = "Job")
    public void approveJob(Long id) {
        jobService.approveJob(id);
    }
    
    @Transactional
    @LogActivity(action = "REJECT_JOB", entityType = "Job")
    public void rejectJob(Long id, String reason) {
        jobService.rejectJob(id, reason);
    }
    
    @Transactional
    public void archiveJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(Job.JobStatus.CLOSED);
        jobRepository.save(job);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<JobDTO.JobApplicationResponse> getJobApplications(Long jobId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<JobApplication> applications = jobApplicationRepository.findByJobId(jobId, pageable);
        
        Page<JobDTO.JobApplicationResponse> responsePage = applications.map(this::mapToApplicationResponse);
        return PageResponse.from(responsePage);
    }
    
    private JobDTO.JobApplicationResponse mapToApplicationResponse(JobApplication application) {
        JobDTO.JobApplicationResponse response = new JobDTO.JobApplicationResponse();
        response.setId(application.getId());
        response.setJobId(application.getJob().getId());
        response.setJobTitle(application.getJob().getTitle());
        response.setSeekerName(application.getSeeker().getFullName());
        response.setSeekerEmail(application.getSeeker().getEmail());
        response.setSeekerMobile(application.getSeeker().getMobileNumber());
        response.setEmployerName(application.getJob().getEmployer().getFullName());
        response.setEmployerCompany(application.getJob().getEmployer().getCompanyName());
        response.setCvUrl(application.getCvUrl());
        response.setCoverLetter(application.getCoverLetter());
        response.setStatus(application.getStatus().name());
        response.setAppliedAt(application.getAppliedAt());
        response.setUpdatedAt(application.getUpdatedAt());
        
        return response;
    }
    
    @Transactional
    @LogActivity(action = "DELETE_JOB", entityType = "Job")
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id).orElse(null);
        jobRepository.deleteById(id);
        if (job != null && job.getEmployer() != null) {
            emailService.sendItemDeletedEmail(job.getEmployer().getEmail(), job.getEmployer().getFullName(), "Job Posting", job.getTitle());
        }
    }
    
    // User Management
    public PageResponse<UserDTO.UserResponse> getAllUsers(int page, int size, String keyword, String role, String status, String isVerified) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        User.UserStatus userStatus = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                userStatus = User.UserStatus.valueOf(status.toUpperCase());
            } catch (Exception e) {
                // Ignore invalid status
            }
        }

        UserRole.Role userRole = null;
        if (role != null && !role.isEmpty() && !role.equalsIgnoreCase("ALL")) {
            try {
                userRole = UserRole.Role.valueOf(role.toUpperCase());
            } catch (Exception e) {
                // Ignore invalid role
            }
        }
        
        Page<User> users = userRepository.searchUsers(keyword, userStatus, userRole, isVerified, pageable);
        Page<UserDTO.UserResponse> responsePage = users.map(userService::mapToUserResponse);
        
        return PageResponse.from(responsePage);
    }
    @Transactional
    @LogActivity(action = "SUSPEND_USER", entityType = "User")
    public void suspendUser(Long userId, String reason) {
        userService.suspendUser(userId, reason);
    }
    
    @Transactional
    @LogActivity(action = "ACTIVATE_USER", entityType = "User")
    public void activateUser(Long userId) {
        userService.activateUser(userId);
    }
    
    @Transactional(readOnly = true)
    public AdminDTO.UserDetailResponse getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        AdminDTO.UserDetailResponse response = new AdminDTO.UserDetailResponse();
        response.setProfile(userService.mapToUserResponse(user));
        
        // Activity counts
        response.setListingCount(listingRepository.countByUserId(userId));
        response.setJobCount(jobRepository.countByEmployerId(userId));
        response.setInquiryCount(inquiryRepository.countBySellerId(userId)); // Inquiries received
        response.setApplicationCount(jobApplicationRepository.countBySeekerId(userId)); // Applications sent
        
        return response;
    }

    @Transactional
    @LogActivity(action = "DELETE_USER", entityType = "User")
    public void deleteUser(Long userId) {
        // Delete BuyerVerifications
        buyerVerificationRepository.deleteAll(buyerVerificationRepository.findByUserId(userId));
        
        // Delete Payments where user is buyer
        paymentRepository.deleteAll(paymentRepository.findByBuyerId(userId));
        
        // Delete Inquiries where user is buyer
        inquiryRepository.deleteAll(inquiryRepository.findByBuyerId(userId));
        
        // Delete Job Applications where user is seeker
        jobApplicationRepository.deleteAll(jobApplicationRepository.findBySeekerId(userId));
        
        // Delete Jobs posted by user
        java.util.List<com.healthcare.portal.entity.Job> jobs = jobRepository.findByEmployerId(userId);
        for (com.healthcare.portal.entity.Job job : jobs) {
            jobApplicationRepository.deleteAll(jobApplicationRepository.findByJobId(job.getId()));
            jobRepository.delete(job);
        }
        
        // Delete Listings (deleteListing handles child inquiries and payments)
        java.util.List<com.healthcare.portal.entity.Listing> listings = listingRepository.findByUserId(userId);
        for (com.healthcare.portal.entity.Listing listing : listings) {
            deleteListing(listing.getId());
        }
        
        // Finally delete user via userService
        userService.deleteUser(userId);
    }

    @Transactional
    @LogActivity(action = "UPDATE_USER_ROLES", entityType = "User")
    public void updateUserRoles(Long userId, java.util.List<String> roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Clear the collection - Hibernate will automatically delete orphan records due to orphanRemoval = true
        user.getRoles().clear();

        // Add the new roles (ensuring uniqueness)
        java.util.Set<String> uniqueRoles = new java.util.LinkedHashSet<>(roles);
        for (String roleStr : uniqueRoles) {
            UserRole.Role roleEnum = UserRole.Role.valueOf(roleStr.toUpperCase());
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(roleEnum);
            user.getRoles().add(userRole);
        }
        
        userRepository.save(user);
    }
    
    // Verification Management
    public PageResponse<AdminDTO.AdminVerificationResponse> getPendingVerifications(int page, int size, String status, String fromDate, String toDate, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        BuyerVerification.VerificationStatus verStatus = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                verStatus = BuyerVerification.VerificationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        LocalDateTime start = null;
        if (fromDate != null && !fromDate.trim().isEmpty()) {
            try {
                start = java.time.LocalDate.parse(fromDate.trim()).atStartOfDay();
            } catch (Exception ignored) {}
        }

        LocalDateTime end = null;
        if (toDate != null && !toDate.trim().isEmpty()) {
            try {
                end = java.time.LocalDate.parse(toDate.trim()).atTime(23, 59, 59, 999999999);
            } catch (Exception ignored) {}
        }

        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<BuyerVerification> verifications = buyerVerificationRepository
                .searchVerifications(verStatus, start, end, searchKeyword, pageable);
        
        Page<AdminDTO.AdminVerificationResponse> responsePage = verifications.map(this::mapToAdminVerificationResponse);
        return PageResponse.from(responsePage);
    }
    
    private AdminDTO.AdminVerificationResponse mapToAdminVerificationResponse(BuyerVerification verification) {
        AdminDTO.AdminVerificationResponse response = new AdminDTO.AdminVerificationResponse();
        response.setId(verification.getId());
        response.setDocType(verification.getDocType() != null ? verification.getDocType().name() : null);
        response.setDocUrl(verification.getDocUrl());
        response.setStatus(verification.getStatus() != null ? verification.getStatus().name() : null);
        response.setRejectionReason(verification.getRejectionReason());
        response.setCreatedAt(verification.getCreatedAt());
        
        if (verification.getUser() != null) {
            AdminDTO.AdminVerificationResponse.UserSummary userSummary = new AdminDTO.AdminVerificationResponse.UserSummary();
            userSummary.setId(verification.getUser().getId());
            userSummary.setFullName(verification.getUser().getFullName());
            userSummary.setEmail(verification.getUser().getEmail());
            userSummary.setMobileNumber(verification.getUser().getMobileNumber());
            response.setUser(userSummary);
        }
        
        return response;
    }
    
    @Transactional
    @LogActivity(action = "APPROVE_VERIFICATION", entityType = "BuyerVerification")
    public void approveVerification(Long id, Long adminId) {
        BuyerVerification verification = buyerVerificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification request not found"));
        
        verification.setStatus(BuyerVerification.VerificationStatus.APPROVED);
        verification.setReviewedAt(LocalDateTime.now());
        
        User admin = userRepository.findById(adminId).orElse(null);
        verification.setReviewedBy(admin);
        
        buyerVerificationRepository.save(verification);
        
        // Update user verified status
        User user = verification.getUser();
        user.setIsVerifiedBuyer(true);
        userRepository.save(user);
        
        // Send buyer approved email
        emailService.sendBuyerApprovedEmail(user.getEmail(), user.getFullName());
    }
    
    @Transactional
    @LogActivity(action = "REJECT_VERIFICATION", entityType = "BuyerVerification")
    public void rejectVerification(Long id, Long adminId, String reason) {
        BuyerVerification verification = buyerVerificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification request not found"));
        
        verification.setStatus(BuyerVerification.VerificationStatus.REJECTED);
        verification.setRejectionReason(reason);
        verification.setReviewedAt(LocalDateTime.now());
        
        User admin = userRepository.findById(adminId).orElse(null);
        verification.setReviewedBy(admin);
        
        buyerVerificationRepository.save(verification);
    }

    // ========== Payment Management ==========

    public PageResponse<AdminDTO.AdminPaymentResponse> getAllPayments(int page, int size, String status, String fromDate, String toDate, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Payment.PaymentStatus paymentStatus = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        LocalDateTime start = null;
        if (fromDate != null && !fromDate.trim().isEmpty()) {
            try {
                start = java.time.LocalDate.parse(fromDate.trim()).atStartOfDay();
            } catch (Exception ignored) {}
        }

        LocalDateTime end = null;
        if (toDate != null && !toDate.trim().isEmpty()) {
            try {
                end = java.time.LocalDate.parse(toDate.trim()).atTime(23, 59, 59, 999999999);
            } catch (Exception ignored) {}
        }

        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<Payment> payments = paymentRepository.adminSearchPayments(paymentStatus, start, end, searchKeyword, pageable);

        Page<AdminDTO.AdminPaymentResponse> responsePage = payments.map(this::mapToAdminPaymentResponse);
        return PageResponse.from(responsePage);
    }

    public AdminDTO.PaymentStats getPaymentStats() {
        AdminDTO.PaymentStats stats = new AdminDTO.PaymentStats();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime weekStart = now.minusDays(7);

        stats.setTotalPayments(paymentRepository.countByStatus(Payment.PaymentStatus.PAID) + paymentRepository.countByStatus(Payment.PaymentStatus.FAILED));
        stats.setSuccessfulPayments(paymentRepository.countByStatus(Payment.PaymentStatus.PAID));
        stats.setFailedPayments(paymentRepository.countByStatus(Payment.PaymentStatus.FAILED));
        stats.setPendingPayments(paymentRepository.countByStatus(Payment.PaymentStatus.CREATED));
        stats.setTotalRevenuePaise(paymentRepository.sumAmountByStatus(Payment.PaymentStatus.PAID));
        stats.setTodayRevenuePaise(paymentRepository.sumAmountByStatusAndCreatedAtAfter(Payment.PaymentStatus.PAID, todayStart));
        stats.setWeekRevenuePaise(paymentRepository.sumAmountByStatusAndCreatedAtAfter(Payment.PaymentStatus.PAID, weekStart));
        stats.setTodayPayments(paymentRepository.countByStatusAndCreatedAtAfter(Payment.PaymentStatus.PAID, todayStart));
        stats.setWeekPayments(paymentRepository.countByStatusAndCreatedAtAfter(Payment.PaymentStatus.PAID, weekStart));

        return stats;
    }

    private AdminDTO.AdminPaymentResponse mapToAdminPaymentResponse(Payment payment) {
        AdminDTO.AdminPaymentResponse response = new AdminDTO.AdminPaymentResponse();
        response.setId(payment.getId());
        response.setRazorpayOrderId(payment.getRazorpayOrderId());
        response.setRazorpayPaymentId(payment.getRazorpayPaymentId());
        response.setAmount(payment.getAmount());
        response.setCurrency(payment.getCurrency());
        response.setStatus(payment.getStatus().name());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());

        if (payment.getBuyer() != null) {
            AdminDTO.AdminPaymentResponse.BuyerSummary buyer = new AdminDTO.AdminPaymentResponse.BuyerSummary();
            buyer.setId(payment.getBuyer().getId());
            buyer.setFullName(payment.getBuyer().getFullName());
            buyer.setEmail(payment.getBuyer().getEmail());
            buyer.setMobileNumber(payment.getBuyer().getMobileNumber());
            response.setBuyer(buyer);
        }

        if (payment.getListing() != null) {
            AdminDTO.AdminPaymentResponse.ListingSummary listing = new AdminDTO.AdminPaymentResponse.ListingSummary();
            listing.setId(payment.getListing().getId());
            listing.setTitle(payment.getListing().getDisplayTitle());
            if (payment.getListing().getUser() != null) {
                listing.setSellerName(payment.getListing().getUser().getFullName());
                listing.setSellerEmail(payment.getListing().getUser().getEmail());
            }
            response.setListing(listing);
        }

        return response;
    }
}
