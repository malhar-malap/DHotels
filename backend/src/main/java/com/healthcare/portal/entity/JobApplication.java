package com.healthcare.portal.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * JobApplication Entity - Represents Job Applications
 */
@Entity
@Table(name = "job_applications")
public class JobApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seeker_id", nullable = false)
    private User seeker;
    
    @Column(name = "cv_url", nullable = false, length = 500)
    private String cvUrl;
    
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;
    
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum ApplicationStatus {
        SUBMITTED, VIEWED, SHORTLISTED, REJECTED, HIRED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public User getSeeker() { return seeker; }
    public void setSeeker(User seeker) { this.seeker = seeker; }
    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
