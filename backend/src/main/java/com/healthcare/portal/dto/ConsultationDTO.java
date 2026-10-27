package com.healthcare.portal.dto;

import jakarta.validation.constraints.*;

public class ConsultationDTO {
    
    public static class ConsultationRequest {
        @NotBlank(message = "Name is required")
        @Size(max = 100)
        private String name;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 100)
        private String email;
        
        @NotBlank(message = "Phone number is required")
        @Size(max = 15)
        private String phone;
        
        private String preferredDate; // yyyy-MM-dd format
        
        @Size(max = 20)
        private String timeSlot; // "30_MIN" or "60_MIN"
        
        private String topic;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPreferredDate() { return preferredDate; }
        public void setPreferredDate(String preferredDate) { this.preferredDate = preferredDate; }
        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
    }
    
    public static class ConsultationResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String preferredDate;
        private String timeSlot;
        private String topic;
        private String status;
        private String adminNotes;
        private String createdAt;
        private String updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPreferredDate() { return preferredDate; }
        public void setPreferredDate(String preferredDate) { this.preferredDate = preferredDate; }
        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAdminNotes() { return adminNotes; }
        public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }
}
