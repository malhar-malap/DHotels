package com.healthcare.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTOs for Payment operations
 */
public class PaymentDTO {

    /**
     * Request to create a Razorpay order
     */
    public static class CreateOrderRequest {
        @NotNull(message = "Listing ID is required")
        private Long listingId;

        public Long getListingId() { return listingId; }
        public void setListingId(Long listingId) { this.listingId = listingId; }
    }

    /**
     * Response after creating a Razorpay order - sent to frontend to open checkout
     */
    public static class CreateOrderResponse {
        private String orderId;
        private Integer amount; // in paise
        private String currency;
        private String keyId; // Razorpay key ID for frontend
        private String listingTitle;
        private String companyName;

        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getKeyId() { return keyId; }
        public void setKeyId(String keyId) { this.keyId = keyId; }
        public String getListingTitle() { return listingTitle; }
        public void setListingTitle(String listingTitle) { this.listingTitle = listingTitle; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
    }

    /**
     * Request to verify a completed Razorpay payment
     */
    public static class VerifyPaymentRequest {
        @NotBlank(message = "Razorpay payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Razorpay order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay signature is required")
        private String razorpaySignature;

        @NotNull(message = "Listing ID is required")
        private Long listingId;

        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
        public Long getListingId() { return listingId; }
        public void setListingId(Long listingId) { this.listingId = listingId; }
    }

    /**
     * Response after successful payment verification - includes seller contact details
     */
    public static class PaymentResponse {
        private Long paymentId;
        private String status;
        private String sellerName;
        private String sellerEmail;
        private String sellerPhone;
        private String listingTitle;
        private LocalDateTime paidAt;

        public Long getPaymentId() { return paymentId; }
        public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getSellerName() { return sellerName; }
        public void setSellerName(String sellerName) { this.sellerName = sellerName; }
        public String getSellerEmail() { return sellerEmail; }
        public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }
        public String getSellerPhone() { return sellerPhone; }
        public void setSellerPhone(String sellerPhone) { this.sellerPhone = sellerPhone; }
        public String getListingTitle() { return listingTitle; }
        public void setListingTitle(String listingTitle) { this.listingTitle = listingTitle; }
        public LocalDateTime getPaidAt() { return paidAt; }
        public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    }

    /**
     * Response for payment status check
     */
    public static class PaymentStatusResponse {
        private boolean paid;
        private PaymentResponse paymentDetails;

        public boolean isPaid() { return paid; }
        public void setPaid(boolean paid) { this.paid = paid; }
        public PaymentResponse getPaymentDetails() { return paymentDetails; }
        public void setPaymentDetails(PaymentResponse paymentDetails) { this.paymentDetails = paymentDetails; }
    }
}
