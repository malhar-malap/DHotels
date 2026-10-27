package com.healthcare.portal.dto;

import java.time.LocalDateTime;

/**
 * DTOs for Admin operations
 */
public class AdminDTO {
    
    public static class DashboardStats {
        private Long totalUsers;
        private Long activeUsers;
        private Long newUsersToday;
        private Long newUsersWeek;
        private Long totalListings;
        private Long pendingListings;
        private Long activeListings;
        private Long newListingsToday;
        private Long totalJobs;
        private Long pendingJobs;
        private Long activeJobs;
        private Long newJobsWeek;
        private Long inquiriesToday;
        private Long pendingVerifications;
        private Long applicationsToday;

        public Long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
        public Long getActiveUsers() { return activeUsers; }
        public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }
        public Long getNewUsersToday() { return newUsersToday; }
        public void setNewUsersToday(Long newUsersToday) { this.newUsersToday = newUsersToday; }
        public Long getNewUsersWeek() { return newUsersWeek; }
        public void setNewUsersWeek(Long newUsersWeek) { this.newUsersWeek = newUsersWeek; }
        public Long getTotalListings() { return totalListings; }
        public void setTotalListings(Long totalListings) { this.totalListings = totalListings; }
        public Long getPendingListings() { return pendingListings; }
        public void setPendingListings(Long pendingListings) { this.pendingListings = pendingListings; }
        public Long getActiveListings() { return activeListings; }
        public void setActiveListings(Long activeListings) { this.activeListings = activeListings; }
        public Long getNewListingsToday() { return newListingsToday; }
        public void setNewListingsToday(Long newListingsToday) { this.newListingsToday = newListingsToday; }
        public Long getTotalJobs() { return totalJobs; }
        public void setTotalJobs(Long totalJobs) { this.totalJobs = totalJobs; }
        public Long getPendingJobs() { return pendingJobs; }
        public void setPendingJobs(Long pendingJobs) { this.pendingJobs = pendingJobs; }
        public Long getActiveJobs() { return activeJobs; }
        public void setActiveJobs(Long activeJobs) { this.activeJobs = activeJobs; }
        public Long getNewJobsWeek() { return newJobsWeek; }
        public void setNewJobsWeek(Long newJobsWeek) { this.newJobsWeek = newJobsWeek; }
        public Long getInquiriesToday() { return inquiriesToday; }
        public void setInquiriesToday(Long inquiriesToday) { this.inquiriesToday = inquiriesToday; }
        public Long getPendingVerifications() { return pendingVerifications; }
        public void setPendingVerifications(Long pendingVerifications) { this.pendingVerifications = pendingVerifications; }
        public Long getApplicationsToday() { return applicationsToday; }
        public void setApplicationsToday(Long applicationsToday) { this.applicationsToday = applicationsToday; }
    }
    
    public static class ListingApprovalRequest {
        private String action; // APPROVE, REJECT
        private String rejectionReason;
        private String uniqueCode;
        private java.util.List<String> imageUrls;

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
        public String getUniqueCode() { return uniqueCode; }
        public void setUniqueCode(String uniqueCode) { this.uniqueCode = uniqueCode; }
        public java.util.List<String> getImageUrls() { return imageUrls; }
        public void setImageUrls(java.util.List<String> imageUrls) { this.imageUrls = imageUrls; }
    }
    
    public static class JobApprovalRequest {
        private String action; // APPROVE, REJECT
        private String rejectionReason;

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    }
    
    public static class VerificationApprovalRequest {
        private String action; // APPROVE, REJECT
        private String rejectionReason;

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    }
    
    public static class UserStatusRequest {
        private String action; // SUSPEND, ACTIVATE, DELETE
        private String reason;

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
    public static class AdminVerificationResponse {
        private Long id;
        private String docType;
        private String docUrl;
        private String status;
        private String rejectionReason;
        private LocalDateTime createdAt;
        private UserSummary user;
        
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
        public UserSummary getUser() { return user; }
        public void setUser(UserSummary user) { this.user = user; }
        
        public static class UserSummary {
            private Long id;
            private String fullName;
            private String email;
            private String mobileNumber;
            
            public Long getId() { return id; }
            public void setId(Long id) { this.id = id; }
            public String getFullName() { return fullName; }
            public void setFullName(String fullName) { this.fullName = fullName; }
            public String getEmail() { return email; }
            public void setEmail(String email) { this.email = email; }
            public String getMobileNumber() { return mobileNumber; }
            public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        }
    }
    
    public static class AuditLogResponse {
        private Long id;
        private String adminName;
        private String action;
        private String entityType;
        private Long entityId;
        private String details;
        private String ipAddress;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getAdminName() { return adminName; }
        public void setAdminName(String adminName) { this.adminName = adminName; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public Long getEntityId() { return entityId; }
        public void setEntityId(Long entityId) { this.entityId = entityId; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class UserDetailResponse {
        private UserDTO.UserResponse profile;
        private Long listingCount;
        private Long jobCount;
        private Long inquiryCount;
        private Long applicationCount;

        public UserDTO.UserResponse getProfile() { return profile; }
        public void setProfile(UserDTO.UserResponse profile) { this.profile = profile; }
        public Long getListingCount() { return listingCount; }
        public void setListingCount(Long listingCount) { this.listingCount = listingCount; }
        public Long getJobCount() { return jobCount; }
        public void setJobCount(Long jobCount) { this.jobCount = jobCount; }
        public Long getInquiryCount() { return inquiryCount; }
        public void setInquiryCount(Long inquiryCount) { this.inquiryCount = inquiryCount; }
        public Long getApplicationCount() { return applicationCount; }
        public void setApplicationCount(Long applicationCount) { this.applicationCount = applicationCount; }
    }

    /**
     * Admin Payment Response - for viewing payment transactions
     */
    public static class AdminPaymentResponse {
        private Long id;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private Integer amount; // in paise
        private String currency;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private BuyerSummary buyer;
        private ListingSummary listing;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
        public BuyerSummary getBuyer() { return buyer; }
        public void setBuyer(BuyerSummary buyer) { this.buyer = buyer; }
        public ListingSummary getListing() { return listing; }
        public void setListing(ListingSummary listing) { this.listing = listing; }

        public static class BuyerSummary {
            private Long id;
            private String fullName;
            private String email;
            private String mobileNumber;

            public Long getId() { return id; }
            public void setId(Long id) { this.id = id; }
            public String getFullName() { return fullName; }
            public void setFullName(String fullName) { this.fullName = fullName; }
            public String getEmail() { return email; }
            public void setEmail(String email) { this.email = email; }
            public String getMobileNumber() { return mobileNumber; }
            public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        }

        public static class ListingSummary {
            private Long id;
            private String title;
            private String sellerName;
            private String sellerEmail;

            public Long getId() { return id; }
            public void setId(Long id) { this.id = id; }
            public String getTitle() { return title; }
            public void setTitle(String title) { this.title = title; }
            public String getSellerName() { return sellerName; }
            public void setSellerName(String sellerName) { this.sellerName = sellerName; }
            public String getSellerEmail() { return sellerEmail; }
            public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }
        }
    }

    /**
     * Payment Statistics for Admin Dashboard
     */
    public static class PaymentStats {
        private long totalPayments;
        private long successfulPayments;
        private long failedPayments;
        private long pendingPayments;
        private long totalRevenuePaise; // total revenue in paise
        private long todayRevenuePaise;
        private long weekRevenuePaise;
        private long todayPayments;
        private long weekPayments;

        public long getTotalPayments() { return totalPayments; }
        public void setTotalPayments(long totalPayments) { this.totalPayments = totalPayments; }
        public long getSuccessfulPayments() { return successfulPayments; }
        public void setSuccessfulPayments(long successfulPayments) { this.successfulPayments = successfulPayments; }
        public long getFailedPayments() { return failedPayments; }
        public void setFailedPayments(long failedPayments) { this.failedPayments = failedPayments; }
        public long getPendingPayments() { return pendingPayments; }
        public void setPendingPayments(long pendingPayments) { this.pendingPayments = pendingPayments; }
        public long getTotalRevenuePaise() { return totalRevenuePaise; }
        public void setTotalRevenuePaise(long totalRevenuePaise) { this.totalRevenuePaise = totalRevenuePaise; }
        public long getTodayRevenuePaise() { return todayRevenuePaise; }
        public void setTodayRevenuePaise(long todayRevenuePaise) { this.todayRevenuePaise = todayRevenuePaise; }
        public long getWeekRevenuePaise() { return weekRevenuePaise; }
        public void setWeekRevenuePaise(long weekRevenuePaise) { this.weekRevenuePaise = weekRevenuePaise; }
        public long getTodayPayments() { return todayPayments; }
        public void setTodayPayments(long todayPayments) { this.todayPayments = todayPayments; }
        public long getWeekPayments() { return weekPayments; }
        public void setWeekPayments(long weekPayments) { this.weekPayments = weekPayments; }
    }
}
