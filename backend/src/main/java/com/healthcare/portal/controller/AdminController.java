package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.BuyerVerification;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.service.AdminService;
import com.healthcare.portal.service.ContactMessageService;
import com.healthcare.portal.service.AuthService;
import com.healthcare.portal.service.PaymentService;
import com.healthcare.portal.service.ConsultationService;
import com.healthcare.portal.service.MandateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/admin")
@Tag(name = "Admin", description = "Admin panel management APIs")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    private final AuthService authService;
    private final ContactMessageService contactMessageService;
    private final PaymentService paymentService;
    private final ConsultationService consultationService;
    private final MandateService mandateService;

    @Autowired
    public AdminController(AdminService adminService, AuthService authService, ContactMessageService contactMessageService, PaymentService paymentService, ConsultationService consultationService, MandateService mandateService) {
        this.adminService = adminService;
        this.authService = authService;
        this.contactMessageService = contactMessageService;
        this.paymentService = paymentService;
        this.consultationService = consultationService;
        this.mandateService = mandateService;
    }
    
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard stats", description = "Returns dashboard statistics")
    public ResponseEntity<ApiResponse<AdminDTO.DashboardStats>> getDashboardStats() {
        AdminDTO.DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/listings/stats")
    @Operation(summary = "Get listing statistics", description = "Returns listing statistics")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getListingStats() {
        java.util.Map<String, Object> stats = adminService.getListingStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/users/stats")
    @Operation(summary = "Get user statistics", description = "Returns user statistics")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getUserStats() {
        java.util.Map<String, Object> stats = adminService.getUserStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    // Listing Management
    
    @GetMapping("/listings/{id}")
    @Operation(summary = "Get listing by id", description = "Returns full details of a listing")
    public ResponseEntity<ApiResponse<ListingDTO.ListingResponse>> getListingById(@PathVariable Long id) {
        ListingDTO.ListingResponse response = adminService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/listings")
    @Operation(summary = "Get all listings", description = "Returns all listings with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse<ListingDTO.ListingSummaryResponse>>> getAllListings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long dealTypeId,
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ListingDTO.ListingSummaryResponse> response = 
                adminService.getAllListings(page, size, status, categoryId, dealTypeId, cityId, stateId, sellerId, keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/listings/{id}/approve")
    @Operation(summary = "Approve listing", description = "Approves a pending listing")
    public ResponseEntity<ApiResponse<Void>> approveListing(
            @PathVariable Long id,
            @RequestBody AdminDTO.ListingApprovalRequest request) {
        adminService.approveListing(id, request.getUniqueCode(), request.getImageUrls());
        return ResponseEntity.ok(ApiResponse.success("Listing approved successfully", null));
    }
    
    @PostMapping("/listings/{id}/reject")
    @Operation(summary = "Reject listing", description = "Rejects a pending listing")
    public ResponseEntity<ApiResponse<Void>> rejectListing(
            @PathVariable Long id,
            @RequestBody AdminDTO.ListingApprovalRequest request) {
        adminService.rejectListing(id, request.getRejectionReason());
        return ResponseEntity.ok(ApiResponse.success("Listing rejected", null));
    }
    
    @DeleteMapping("/listings/{id}")
    @Operation(summary = "Delete listing", description = "Deletes a listing")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable Long id) {
        adminService.deleteListing(id);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully", null));
    }

    @PostMapping("/listings/bulk-approve")
    @Operation(summary = "Bulk approve listings", description = "Approves multiple listings at once")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> bulkApproveListings(
            @RequestBody java.util.Map<String, java.util.List<Long>> request) {
        java.util.List<Long> ids = request.get("ids");
        int successCount = 0, failedCount = 0;
        for (Long id : ids) {
            try {
                adminService.approveListing(id, null, java.util.Collections.emptyList());
                successCount++;
            } catch (Exception e) {
                failedCount++;
            }
        }
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("successCount", successCount);
        result.put("failedCount", failedCount);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/listings/bulk-delete")
    @Operation(summary = "Bulk delete listings", description = "Deletes multiple listings at once")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> bulkDeleteListings(
            @RequestBody java.util.Map<String, java.util.List<Long>> request) {
        java.util.List<Long> ids = request.get("ids");
        int successCount = 0, failedCount = 0;
        for (Long id : ids) {
            try {
                adminService.deleteListing(id);
                successCount++;
            } catch (Exception e) {
                failedCount++;
            }
        }
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("successCount", successCount);
        result.put("failedCount", failedCount);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    @PostMapping("/listings/{id}/feature")
    @Operation(summary = "Feature listing", description = "Marks a listing as featured")
    public ResponseEntity<ApiResponse<Void>> featureListing(
            @PathVariable Long id,
            @RequestParam(defaultValue = "7") int days) {
        adminService.featureListing(id, days);
        return ResponseEntity.ok(ApiResponse.success("Listing featured successfully", null));
    }
    
    @PutMapping("/listings/{id}")
    @Operation(summary = "Update listing", description = "Updates listing details")
    public ResponseEntity<ApiResponse<Void>> updateListing(
            @PathVariable Long id,
            @RequestBody ListingDTO.ListingRequest request) {
        adminService.updateListing(id, request);
        return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", null));
    }
    
    // Job Management
    
    @GetMapping("/jobs")
    @Operation(summary = "Get all jobs", description = "Returns all jobs with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse<JobDTO.JobSummaryResponse>>> getAllJobs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) Long employerId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<JobDTO.JobSummaryResponse> response = adminService.getAllJobs(
                page, size, status, categoryId, cityId, employmentType, experienceLevel, employerId, keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/jobs/{id}/approve")
    @Operation(summary = "Approve job", description = "Approves a pending job")
    public ResponseEntity<ApiResponse<Void>> approveJob(@PathVariable Long id) {
        adminService.approveJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job approved successfully", null));
    }
    
    @PostMapping("/jobs/{id}/reject")
    @Operation(summary = "Reject job", description = "Rejects a pending job")
    public ResponseEntity<ApiResponse<Void>> rejectJob(
            @PathVariable Long id,
            @RequestBody AdminDTO.JobApprovalRequest request) {
        adminService.rejectJob(id, request.getRejectionReason());
        return ResponseEntity.ok(ApiResponse.success("Job rejected", null));
    }
    
    @DeleteMapping("/jobs/{id}")
    @Operation(summary = "Delete job", description = "Deletes a job")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        adminService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job deleted successfully", null));
    }
    
    @PutMapping("/jobs/{id}/archive")
    @Operation(summary = "Archive job", description = "Archives an active job")
    public ResponseEntity<ApiResponse<Void>> archiveJob(@PathVariable Long id) {
        adminService.archiveJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job archived successfully", null));
    }
    
    @GetMapping("/jobs/{jobId}/applications")
    @Operation(summary = "Get job applications", description = "Get all applications for a job")
    public ResponseEntity<ApiResponse<PageResponse<JobDTO.JobApplicationResponse>>> getJobApplications(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<JobDTO.JobApplicationResponse> response = adminService.getJobApplications(jobId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    // User Management
    
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Returns all users with filtering and pagination")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO.UserResponse>>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String isVerified,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<UserDTO.UserResponse> response = adminService.getAllUsers(page, size, keyword, role, status, isVerified);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user details", description = "Returns full details and activity counts for a user")
    public ResponseEntity<ApiResponse<AdminDTO.UserDetailResponse>> getUserDetails(@PathVariable Long userId) {
        AdminDTO.UserDetailResponse response = adminService.getUserDetails(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/users/{userId}/suspend")
    @Operation(summary = "Suspend user", description = "Suspends a user account")
    public ResponseEntity<ApiResponse<Void>> suspendUser(
            @PathVariable Long userId,
            @RequestBody AdminDTO.UserStatusRequest request) {
        adminService.suspendUser(userId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("User suspended successfully", null));
    }
    
    @PostMapping("/users/{userId}/activate")
    @Operation(summary = "Activate user", description = "Activates a suspended user account")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long userId) {
        adminService.activateUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", null));
    }
    
    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete user", description = "Deletes a user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PutMapping("/users/{userId}/roles")
    @Operation(summary = "Update user roles", description = "Replaces all existing roles for a user with the provided list")
    public ResponseEntity<ApiResponse<Void>> updateUserRoles(
            @PathVariable Long userId,
            @RequestBody java.util.Map<String, java.util.List<String>> request) {
        java.util.List<String> roles = request.get("roles");
        if (roles == null || roles.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("At least one role is required"));
        }
        adminService.updateUserRoles(userId, roles);
        return ResponseEntity.ok(ApiResponse.success("User roles updated successfully", null));
    }
    
    // Verification Management
    
    @GetMapping("/verifications")
    @Operation(summary = "Get pending verifications", description = "Returns pending buyer verification requests")
    public ResponseEntity<ApiResponse<PageResponse<AdminDTO.AdminVerificationResponse>>> getPendingVerifications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminDTO.AdminVerificationResponse> response = adminService.getPendingVerifications(page, size, status, fromDate, toDate, keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/verifications/{id}/approve")
    @Operation(summary = "Approve verification", description = "Approves a buyer verification request")
    public ResponseEntity<ApiResponse<Void>> approveVerification(@PathVariable Long id) {
        User currentUser = authService.getCurrentUserEntity();
        adminService.approveVerification(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Verification approved successfully", null));
    }
    
    @PostMapping("/verifications/{id}/reject")
    @Operation(summary = "Reject verification", description = "Rejects a buyer verification request")
    public ResponseEntity<ApiResponse<Void>> rejectVerification(
            @PathVariable Long id,
            @RequestBody AdminDTO.VerificationApprovalRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        adminService.rejectVerification(id, currentUser.getId(), request.getRejectionReason());
        return ResponseEntity.ok(ApiResponse.success("Verification rejected", null));
    }

    // Payment Management

    @GetMapping("/payments")
    @Operation(summary = "Get all payments", description = "Returns all payments with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse<AdminDTO.AdminPaymentResponse>>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminDTO.AdminPaymentResponse> response = adminService.getAllPayments(page, size, status, fromDate, toDate, keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/payments/{id}/sync")
    @Operation(summary = "Sync payment", description = "Syncs a payment status directly from Razorpay")
    public ResponseEntity<ApiResponse<Void>> syncPayment(@PathVariable Long id) {
        paymentService.syncPaymentWithRazorpay(id);
        return ResponseEntity.ok(ApiResponse.success("Payment synced successfully", null));
    }

    @GetMapping("/payments/stats")
    @Operation(summary = "Get payment statistics", description = "Returns aggregate payment statistics")
    public ResponseEntity<ApiResponse<AdminDTO.PaymentStats>> getPaymentStats() {
        AdminDTO.PaymentStats stats = adminService.getPaymentStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // Contact Message Management

    @GetMapping("/contact-messages")
    @Operation(summary = "Get all contact messages", description = "Returns all contact messages with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse<ContactMessageDTO.ContactMessageResponse>>> getAllContactMessages(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ContactMessageDTO.ContactMessageResponse> response = contactMessageService.getAllMessages(page, size, status, duration, sortBy, keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/contact-messages/{id}/read")
    @Operation(summary = "Mark contact message as read", description = "Marks a contact message as read")
    public ResponseEntity<ApiResponse<Void>> markContactMessageAsRead(@PathVariable Long id) {
        contactMessageService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Message marked as read", null));
    }

    @DeleteMapping("/contact-messages/{id}")
    @Operation(summary = "Delete contact message", description = "Deletes a contact message")
    public ResponseEntity<ApiResponse<Void>> deleteContactMessage(@PathVariable Long id) {
        contactMessageService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.success("Message deleted successfully", null));
    }

    @PostMapping("/contact-messages/{id}/reply")
    @Operation(summary = "Reply to contact message", description = "Sends a reply email to the contact message sender")
    public ResponseEntity<ApiResponse<Void>> replyToContactMessage(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> request) {
        String replyContent = request.get("replyContent");
        if (replyContent == null || replyContent.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Reply content is required"));
        }
        contactMessageService.replyToMessage(id, replyContent);
        return ResponseEntity.ok(ApiResponse.success("Reply sent successfully", null));
    }

    @GetMapping("/contact-messages/stats")
    @Operation(summary = "Get contact message statistics", description = "Returns contact message statistics")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getContactMessageStats() {
        java.util.Map<String, Object> stats = contactMessageService.getMessageStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ========== Consultation Management ==========
    @GetMapping("/consultations")
    @Operation(summary = "Get all consultations")
    public ResponseEntity<ApiResponse<PageResponse<ConsultationDTO.ConsultationResponse>>> getConsultations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.getAllConsultations(page, size, status, duration, sortBy, keyword)));
    }
    
    @PutMapping("/consultations/{id}/status")
    @Operation(summary = "Update consultation status")
    public ResponseEntity<ApiResponse<Void>> updateConsultationStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String adminNotes) {
        consultationService.updateConsultationStatus(id, status, adminNotes);
        return ResponseEntity.ok(ApiResponse.success("Consultation status updated", null));
    }
    
    @GetMapping("/consultations/stats")
    @Operation(summary = "Get consultation stats")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getConsultationStats() {
        return ResponseEntity.ok(ApiResponse.success(consultationService.getConsultationStats()));
    }

    // ========== Mandate Management ==========
    @GetMapping("/mandates")
    @Operation(summary = "Get all mandates")
    public ResponseEntity<ApiResponse<PageResponse<MandateDTO.MandateResponse>>> getMandates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(mandateService.getAllMandates(page, size, status, duration, sortBy, keyword)));
    }
    
    @PutMapping("/mandates/{id}/status")
    @Operation(summary = "Update mandate status")
    public ResponseEntity<ApiResponse<Void>> updateMandateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String adminNotes) {
        mandateService.updateMandateStatus(id, status, adminNotes);
        return ResponseEntity.ok(ApiResponse.success("Mandate status updated", null));
    }
    
    @GetMapping("/mandates/stats")
    @Operation(summary = "Get mandate stats")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getMandateStats() {
        return ResponseEntity.ok(ApiResponse.success(mandateService.getMandateStats()));
    }
}
