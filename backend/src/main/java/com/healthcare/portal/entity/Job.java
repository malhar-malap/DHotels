package com.healthcare.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Job Entity - Represents Job Postings
 */
@Entity
@Table(name = "jobs")
public class Job {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_category_id", nullable = false)
    private JobCategory jobCategory;
    
    @Column(length = 100)
    private String specialisation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 20)
    private EmploymentType employmentType;
    
    @Column(name = "salary_min_lpa", precision = 10, scale = 2)
    private BigDecimal salaryMinLpa;
    
    @Column(name = "salary_max_lpa", precision = 10, scale = 2)
    private BigDecimal salaryMaxLpa;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id", nullable = true)
    private City city;
    
    @Column(name = "city_name", length = 100)
    private String cityName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "experience_required", nullable = false, length = 20)
    private ExperienceLevel experienceRequired;
    
    @Column(length = 500)
    private String qualifications;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "application_deadline", nullable = false)
    private LocalDate applicationDeadline;
    
    @Column(name = "number_of_openings")
    private Integer numberOfOpenings = 1;
    
    @Column(name = "contact_email", nullable = false, length = 100)
    private String contactEmail;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JobStatus status = JobStatus.PENDING;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(name = "application_count")
    private Integer applicationCount = 0;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    private List<JobApplication> applications = new ArrayList<>();
    
    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, LOCUM
    }
    
    public enum ExperienceLevel {
        FRESHER, ONE_TO_THREE, THREE_TO_FIVE, FIVE_TO_TEN, TEN_PLUS
    }
    
    public enum JobStatus {
        PENDING, ACTIVE, CLOSED, FILLED, EXPIRED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getEmployer() { return employer; }
    public void setEmployer(User employer) { this.employer = employer; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public JobCategory getJobCategory() { return jobCategory; }
    public void setJobCategory(JobCategory jobCategory) { this.jobCategory = jobCategory; }
    public String getSpecialisation() { return specialisation; }
    public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }
    public EmploymentType getEmploymentType() { return employmentType; }
    public void setEmploymentType(EmploymentType employmentType) { this.employmentType = employmentType; }
    public BigDecimal getSalaryMinLpa() { return salaryMinLpa; }
    public void setSalaryMinLpa(BigDecimal salaryMinLpa) { this.salaryMinLpa = salaryMinLpa; }
    public BigDecimal getSalaryMaxLpa() { return salaryMaxLpa; }
    public void setSalaryMaxLpa(BigDecimal salaryMaxLpa) { this.salaryMaxLpa = salaryMaxLpa; }
    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public ExperienceLevel getExperienceRequired() { return experienceRequired; }
    public void setExperienceRequired(ExperienceLevel experienceRequired) { this.experienceRequired = experienceRequired; }
    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }
    public Integer getNumberOfOpenings() { return numberOfOpenings; }
    public void setNumberOfOpenings(Integer numberOfOpenings) { this.numberOfOpenings = numberOfOpenings; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    public Integer getApplicationCount() { return applicationCount; }
    public void setApplicationCount(Integer applicationCount) { this.applicationCount = applicationCount; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<JobApplication> getApplications() { return applications; }
    public void setApplications(List<JobApplication> applications) { this.applications = applications; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
