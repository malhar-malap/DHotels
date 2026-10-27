package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.service.AuthService;
import com.healthcare.portal.service.InquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/inquiries")
@Tag(name = "Inquiries", description = "Inquiry management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class InquiryController {
    
    private final InquiryService inquiryService;
    private final AuthService authService;

    @Autowired
    public InquiryController(InquiryService inquiryService, AuthService authService) {
        this.inquiryService = inquiryService;
        this.authService = authService;
    }
    
    @PostMapping("/listing/{listingId}")
    @Operation(summary = "Create inquiry", description = "Submit an inquiry for a listing")
    public ResponseEntity<ApiResponse<InquiryDTO.InquiryResponse>> createInquiry(
            @PathVariable Long listingId,
            @Valid @RequestBody InquiryDTO.InquiryRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        InquiryDTO.InquiryResponse response = inquiryService.createInquiry(listingId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Inquiry submitted successfully", response));
    }
    
    @GetMapping("/received")
    @Operation(summary = "Get received inquiries", description = "Returns inquiries received for user's listings")
    public ResponseEntity<ApiResponse<PageResponse<InquiryDTO.InquiryResponse>>> getReceivedInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity();
        PageResponse<InquiryDTO.InquiryResponse> response = 
                inquiryService.getInquiriesForSeller(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/sent")
    @Operation(summary = "Get sent inquiries", description = "Returns inquiries sent by the current user")
    public ResponseEntity<ApiResponse<PageResponse<InquiryDTO.InquiryResponse>>> getSentInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity();
        PageResponse<InquiryDTO.InquiryResponse> response = 
                inquiryService.getInquiriesForBuyer(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get inquiry by ID", description = "Returns detailed inquiry information")
    public ResponseEntity<ApiResponse<InquiryDTO.InquiryResponse>> getInquiryById(@PathVariable Long id) {
        InquiryDTO.InquiryResponse inquiry = inquiryService.getInquiryById(id);
        return ResponseEntity.ok(ApiResponse.success(inquiry));
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "Update inquiry status", description = "Updates the status of an inquiry")
    public ResponseEntity<ApiResponse<Void>> updateInquiryStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        inquiryService.updateInquiryStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Inquiry status updated", null));
    }
    
    @PutMapping("/{id}/read")
    @Operation(summary = "Mark inquiry as read", description = "Marks an inquiry as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        inquiryService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Inquiry marked as read", null));
    }
}
