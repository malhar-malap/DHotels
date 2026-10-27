package com.healthcare.portal.controller;

import com.healthcare.portal.dto.ApiResponse;
import com.healthcare.portal.dto.PaymentDTO;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.service.AuthService;
import com.healthcare.portal.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Razorpay Payment operations
 */
@RestController
@RequestMapping("/payments")
@Tag(name = "Payments", description = "Razorpay Payment Gateway APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;

    @Autowired
    public PaymentController(PaymentService paymentService, AuthService authService) {
        this.paymentService = paymentService;
        this.authService = authService;
    }

    @PostMapping("/create-order")
    @Operation(summary = "Create payment order", description = "Creates a Razorpay order for listing contact access (₹1000)")
    public ResponseEntity<ApiResponse<PaymentDTO.CreateOrderResponse>> createOrder(
            @Valid @RequestBody PaymentDTO.CreateOrderRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        PaymentDTO.CreateOrderResponse response = paymentService.createOrder(
                request.getListingId(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Payment order created successfully", response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify payment", description = "Verifies Razorpay payment signature and unlocks seller contact details")
    public ResponseEntity<ApiResponse<PaymentDTO.PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentDTO.VerifyPaymentRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        PaymentDTO.PaymentResponse response = paymentService.verifyPayment(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully. Seller details unlocked!", response));
    }

    @GetMapping("/check/{listingId}")
    @Operation(summary = "Check payment status", description = "Checks if current user has already paid for contact access on a listing")
    public ResponseEntity<ApiResponse<PaymentDTO.PaymentStatusResponse>> checkPaymentStatus(
            @PathVariable Long listingId) {
        User currentUser = authService.getCurrentUserEntity();
        PaymentDTO.PaymentStatusResponse response = paymentService.checkPaymentStatus(
                listingId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
