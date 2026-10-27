package com.healthcare.portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * UserCV Entity - Represents User's CV/Resume
 */
@Entity
@Table(name = "user_cvs")
public class UserCV {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "cv_url", nullable = false, length = 500)
    private String cvUrl;
    
    @Column(name = "file_name", length = 200)
    private String fileName;
    
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
