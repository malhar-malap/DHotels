package com.healthcare.portal.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for Job operations
 */
public class JobDTO {
    
    public static class JobRequest {
        @NotBlank(message = "Job title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        private String title;
        
        @NotNull(message = "Job category is required")
        private Long jobCategoryId;
        
        private String specialisation;
        
        @NotNull(message = "Employment type is required")
        private String employmentType;
        
        private BigDecimal salaryMinLpa;
        
        private BigDecimal salaryMaxLpa;
        
        private Long cityId;
        
        @NotBlank(message = "City is required")
        private String cityName;
        
        @NotNull(message = "Experience level is required")
        private String experienceRequired;
        
        private String qualifications;
        
        @NotBlank(message = "Job description is required")
        @Size(max = 3000, message = "Description must not exceed 3000 characters")
        private String description;
        
        @NotNull(message = "Application deadline is required")
        private LocalDate applicationDeadline;
        
        private Integer numberOfOpenings = 1;
        
        @NotBlank(message = "Contact email is required")
        @Email(message = "Invalid email format")
        private String contactEmail;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Long getJobCategoryId() { return jobCategoryId; }
        public void setJobCategoryId(Long jobCategoryId) { this.jobCategoryId = jobCategoryId; }
        public String getSpecialisation() { return specialisation; }
        public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
        public BigDecimal getSalaryMinLpa() { return salaryMinLpa; }
        public void setSalaryMinLpa(BigDecimal salaryMinLpa) { this.salaryMinLpa = salaryMinLpa; }
        public BigDecimal getSalaryMaxLpa() { return salaryMaxLpa; }
        public void setSalaryMaxLpa(BigDecimal salaryMaxLpa) { this.salaryMaxLpa = salaryMaxLpa; }
        public Long getCityId() { return cityId; }
        public void setCityId(Long cityId) { this.cityId = cityId; }
        public String getCityName() { return cityName; }
        public void setCityName(String cityName) { this.cityName = cityName; }
        public String getExperienceRequired() { return experienceRequired; }
        public void setExperienceRequired(String experienceRequired) { this.experienceRequired = experienceRequired; }
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
    }
    
    public static class JobResponse {
        private Long id;
        private String title;
        private String specialisation;
        private String employmentType;
        private BigDecimal salaryMinLpa;
        private BigDecimal salaryMaxLpa;
        private String experienceRequired;
        private String qualifications;
        private String description;
        private LocalDate applicationDeadline;
        private Integer numberOfOpenings;
        private String contactEmail;
        private String status;
        private Integer viewCount;
        private Integer applicationCount;
        private Boolean isFeatured;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private JobCategoryDTO jobCategory;
        private UserDTO.CityDTO city;
        private String cityName;
        private EmployerInfo employer;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSpecialisation() { return specialisation; }
        public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
        public BigDecimal getSalaryMinLpa() { return salaryMinLpa; }
        public void setSalaryMinLpa(BigDecimal salaryMinLpa) { this.salaryMinLpa = salaryMinLpa; }
        public BigDecimal getSalaryMaxLpa() { return salaryMaxLpa; }
        public void setSalaryMaxLpa(BigDecimal salaryMaxLpa) { this.salaryMaxLpa = salaryMaxLpa; }
        public String getExperienceRequired() { return experienceRequired; }
        public void setExperienceRequired(String experienceRequired) { this.experienceRequired = experienceRequired; }
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
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
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
        public JobCategoryDTO getJobCategory() { return jobCategory; }
        public void setJobCategory(JobCategoryDTO jobCategory) { this.jobCategory = jobCategory; }
        public UserDTO.CityDTO getCity() { return city; }
        public void setCity(UserDTO.CityDTO city) { this.city = city; }
        public String getCityName() { return cityName; }
        public void setCityName(String cityName) { this.cityName = cityName; }
        public EmployerInfo getEmployer() { return employer; }
        public void setEmployer(EmployerInfo employer) { this.employer = employer; }
    }
    
    public static class JobSummaryResponse {
        private Long id;
        private String title;
        private String specialisation;
        private String employmentType;
        private BigDecimal salaryMinLpa;
        private BigDecimal salaryMaxLpa;
        private String experienceRequired;
        private String categoryName;
        private String cityName;
        private String stateName;
        private LocalDate applicationDeadline;
        private String employerName;
        private String employerCompany;
        private LocalDateTime createdAt;
        private Integer viewCount;
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSpecialisation() { return specialisation; }
        public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
        public BigDecimal getSalaryMinLpa() { return salaryMinLpa; }
        public void setSalaryMinLpa(BigDecimal salaryMinLpa) { this.salaryMinLpa = salaryMinLpa; }
        public BigDecimal getSalaryMaxLpa() { return salaryMaxLpa; }
        public void setSalaryMaxLpa(BigDecimal salaryMaxLpa) { this.salaryMaxLpa = salaryMaxLpa; }
        public String getExperienceRequired() { return experienceRequired; }
        public void setExperienceRequired(String experienceRequired) { this.experienceRequired = experienceRequired; }
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public String getCityName() { return cityName; }
        public void setCityName(String cityName) { this.cityName = cityName; }
        public String getStateName() { return stateName; }
        public void setStateName(String stateName) { this.stateName = stateName; }
        public LocalDate getApplicationDeadline() { return applicationDeadline; }
        public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }
        public String getEmployerName() { return employerName; }
        public void setEmployerName(String employerName) { this.employerName = employerName; }
        public String getEmployerCompany() { return employerCompany; }
        public void setEmployerCompany(String employerCompany) { this.employerCompany = employerCompany; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public Integer getViewCount() { return viewCount; }
        public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    }
    
    public static class JobCategoryDTO {
        private Long id;
        private String name;
        private String description;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class EmployerInfo {
        private Long id;
        private String fullName;
        private String companyName;
        private String email;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    public static class JobSearchRequest {
        private Long categoryId;
        private Long cityId;
        private String employmentType;
        private String experienceLevel;
        private BigDecimal minSalary;
        private BigDecimal maxSalary;
        private String keyword;
        private String sortBy = "createdAt";
        private String sortDirection = "desc";
        private Integer page = 0;
        private Integer size = 10;

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        public Long getCityId() { return cityId; }
        public void setCityId(Long cityId) { this.cityId = cityId; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
        public String getExperienceLevel() { return experienceLevel; }
        public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
        public BigDecimal getMinSalary() { return minSalary; }
        public void setMinSalary(BigDecimal minSalary) { this.minSalary = minSalary; }
        public BigDecimal getMaxSalary() { return maxSalary; }
        public void setMaxSalary(BigDecimal maxSalary) { this.maxSalary = maxSalary; }
        public String getKeyword() { return keyword; }
        public void setKeyword(String keyword) { this.keyword = keyword; }
        public String getSortBy() { return sortBy; }
        public void setSortBy(String sortBy) { this.sortBy = sortBy; }
        public String getSortDirection() { return sortDirection; }
        public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }
        public Integer getPage() { return page; }
        public void setPage(Integer page) { this.page = page; }
        public Integer getSize() { return size; }
        public void setSize(Integer size) { this.size = size; }
    }
    
    public static class JobApplicationRequest {
        @NotBlank(message = "CV URL is required")
        private String cvUrl;
        
        @Size(max = 500, message = "Cover letter must not exceed 500 characters")
        private String coverLetter;

        public String getCvUrl() { return cvUrl; }
        public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    }
    
    public static class JobApplicationResponse {
        private Long id;
        private Long jobId;
        private String jobTitle;
        private String seekerName;
        private String seekerEmail;
        private String seekerMobile;
        private String employerName;
        private String employerCompany;
        private String cvUrl;
        private String coverLetter;
        private String status;
        private LocalDateTime appliedAt;
        private LocalDateTime updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
        public String getSeekerName() { return seekerName; }
        public void setSeekerName(String seekerName) { this.seekerName = seekerName; }
        public String getSeekerEmail() { return seekerEmail; }
        public void setSeekerEmail(String seekerEmail) { this.seekerEmail = seekerEmail; }
        public String getSeekerMobile() { return seekerMobile; }
        public void setSeekerMobile(String seekerMobile) { this.seekerMobile = seekerMobile; }
        public String getEmployerName() { return employerName; }
        public void setEmployerName(String employerName) { this.employerName = employerName; }
        public String getEmployerCompany() { return employerCompany; }
        public void setEmployerCompany(String employerCompany) { this.employerCompany = employerCompany; }
        public String getCvUrl() { return cvUrl; }
        public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getAppliedAt() { return appliedAt; }
        public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}
