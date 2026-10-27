package com.healthcare.portal.dto;

import jakarta.validation.constraints.*;

/**
 * DTOs for Contact Message operations
 */
public class ContactMessageDTO {
    
    public static class ContactMessageRequest {
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        private String name;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 100, message = "Email must not exceed 100 characters")
        private String email;
        
        @Size(max = 15, message = "Phone must not exceed 15 characters")
        private String phone;
        
        @Size(max = 200, message = "Subject must not exceed 200 characters")
        private String subject;
        
        @NotBlank(message = "Message is required")
        private String message;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    public static class ContactMessageResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String subject;
        private String message;
        private String status;
        private String createdAt;
        private String repliedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getRepliedAt() { return repliedAt; }
        public void setRepliedAt(String repliedAt) { this.repliedAt = repliedAt; }
    }
}
