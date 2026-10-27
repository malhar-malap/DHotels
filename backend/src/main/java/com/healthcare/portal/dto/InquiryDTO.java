package com.healthcare.portal.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * DTOs for Inquiry operations
 */
public class InquiryDTO {
    
    public static class InquiryRequest {
        @NotBlank(message = "Buyer name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        private String buyerName;
        
        @NotBlank(message = "Buyer email is required")
        @Email(message = "Invalid email format")
        private String buyerEmail;
        
        @NotBlank(message = "Buyer phone is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
        private String buyerPhone;
        
        @NotBlank(message = "Message is required")
        @Size(max = 300, message = "Message must not exceed 300 characters")
        private String message;

        public String getBuyerName() { return buyerName; }
        public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
        public String getBuyerEmail() { return buyerEmail; }
        public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }
        public String getBuyerPhone() { return buyerPhone; }
        public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    public static class InquiryResponse {
        private Long id;
        private Long listingId;
        private String listingTitle;
        private String buyerName;
        private String buyerEmail;
        private String buyerPhone;
        private String message;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private SellerInfo seller;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getListingId() { return listingId; }
        public void setListingId(Long listingId) { this.listingId = listingId; }
        public String getListingTitle() { return listingTitle; }
        public void setListingTitle(String listingTitle) { this.listingTitle = listingTitle; }
        public String getBuyerName() { return buyerName; }
        public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
        public String getBuyerEmail() { return buyerEmail; }
        public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }
        public String getBuyerPhone() { return buyerPhone; }
        public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
        public SellerInfo getSeller() { return seller; }
        public void setSeller(SellerInfo seller) { this.seller = seller; }
    }
    
    public static class SellerInfo {
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
    
    public static class InquiryUpdateRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
