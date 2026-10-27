package com.healthcare.portal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ConsultationRequest Entity - Represents "Schedule a Call" form submissions
 */
@Entity
@Table(name = "consultation_requests")
public class ConsultationRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false, length = 15)
    private String phone;
    
    @Column(name = "preferred_date")
    private LocalDate preferredDate;
    
    @Column(name = "time_slot", length = 20)
    private String timeSlot; // "30_MIN" or "60_MIN"
    
    @Column(columnDefinition = "TEXT")
    private String topic;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ConsultationStatus status = ConsultationStatus.PENDING_CALL;
    
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum ConsultationStatus {
        PENDING_CALL, SCHEDULED, COMPLETED, CANCELLED
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getPreferredDate() { return preferredDate; }
    public void setPreferredDate(LocalDate preferredDate) { this.preferredDate = preferredDate; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public ConsultationStatus getStatus() { return status; }
    public void setStatus(ConsultationStatus status) { this.status = status; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
