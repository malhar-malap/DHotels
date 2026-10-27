package com.healthcare.portal.service;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.scheduling.annotation.Scheduled;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;

/**
 * Service class for Job operations
 */
@Service
public class JobService {
    
    private static final Logger logger = LoggerFactory.getLogger(JobService.class);

    private final JobRepository jobRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserCVRepository userCVRepository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Autowired
    public JobService(JobRepository jobRepository, JobCategoryRepository jobCategoryRepository, CityRepository cityRepository, UserRepository userRepository, JobApplicationRepository jobApplicationRepository, UserCVRepository userCVRepository, FileStorageService fileStorageService, EmailService emailService, AuditLogService auditLogService) {
        this.jobRepository = jobRepository;
        this.jobCategoryRepository = jobCategoryRepository;
        this.cityRepository = cityRepository;
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userCVRepository = userCVRepository;
        this.fileStorageService = fileStorageService;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
    }
    
    public PageResponse<JobDTO.JobSummaryResponse> searchJobs(JobDTO.JobSearchRequest request) {
        Sort sort = Sort.by(
            request.getSortDirection().equalsIgnoreCase("asc") ? 
            Sort.Direction.ASC : Sort.Direction.DESC,
            request.getSortBy()
        );
        
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        
        Job.EmploymentType employmentType = null;
        if (request.getEmploymentType() != null) {
            employmentType = Job.EmploymentType.valueOf(request.getEmploymentType().toUpperCase());
        }
        
        Job.ExperienceLevel experienceLevel = null;
        if (request.getExperienceLevel() != null) {
            experienceLevel = Job.ExperienceLevel.valueOf(request.getExperienceLevel().toUpperCase());
        }
        
        Page<Job> jobs = jobRepository.searchJobs(
            request.getCategoryId(),
            request.getCityId(),
            employmentType,
            experienceLevel,
            request.getMinSalary(),
            request.getMaxSalary(),
            request.getKeyword(),
            pageable
        );
        
        Page<JobDTO.JobSummaryResponse> responsePage = jobs.map(this::mapToSummaryResponse);
        return PageResponse.from(responsePage);
    }
    
    public JobDTO.JobResponse getJobById(Long id) {
        Job job = jobRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        
        // Increment view count
        job.setViewCount(job.getViewCount() + 1);
        jobRepository.save(job);
        
        return mapToDetailResponse(job);
    }
    
    public List<JobDTO.JobSummaryResponse> getFeaturedJobs() {
        List<Job> jobs = jobRepository.findFeaturedJobs(PageRequest.of(0, 4));
        return jobs.stream().map(this::mapToSummaryResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public JobDTO.JobResponse createJob(JobDTO.JobRequest request, Long employerId) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        JobCategory category = jobCategoryRepository.findById(request.getJobCategoryId())
                .orElseThrow(() -> new RuntimeException("Job category not found"));
        
        City city = null;
        if (request.getCityId() != null) {
            city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found"));
        }
        
        Job job = new Job();
        job.setEmployer(employer);
        job.setJobCategory(category);
        job.setCity(city);
        job.setCityName(request.getCityName());
        job.setTitle(request.getTitle());
        job.setSpecialisation(request.getSpecialisation());
        job.setEmploymentType(Job.EmploymentType.valueOf(request.getEmploymentType().toUpperCase()));
        job.setSalaryMinLpa(request.getSalaryMinLpa());
        job.setSalaryMaxLpa(request.getSalaryMaxLpa());
        job.setExperienceRequired(Job.ExperienceLevel.valueOf(request.getExperienceRequired().toUpperCase()));
        job.setQualifications(request.getQualifications());
        job.setDescription(request.getDescription());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setNumberOfOpenings(request.getNumberOfOpenings());
        job.setContactEmail(request.getContactEmail());
        job.setStatus(Job.JobStatus.PENDING);
        
        job = jobRepository.save(job);
        
        return mapToDetailResponse(job);
    }
    
    @Transactional
    public JobDTO.JobResponse updateJob(Long id, JobDTO.JobRequest request, Long employerId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getEmployer().getId().equals(employerId)) {
            throw new RuntimeException("Unauthorized to update this job");
        }
        
        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getSpecialisation() != null) job.setSpecialisation(request.getSpecialisation());
        if (request.getEmploymentType() != null) 
            job.setEmploymentType(Job.EmploymentType.valueOf(request.getEmploymentType().toUpperCase()));
        if (request.getSalaryMinLpa() != null) job.setSalaryMinLpa(request.getSalaryMinLpa());
        if (request.getSalaryMaxLpa() != null) job.setSalaryMaxLpa(request.getSalaryMaxLpa());
        if (request.getExperienceRequired() != null)
            job.setExperienceRequired(Job.ExperienceLevel.valueOf(request.getExperienceRequired().toUpperCase()));
        if (request.getQualifications() != null) job.setQualifications(request.getQualifications());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getApplicationDeadline() != null) job.setApplicationDeadline(request.getApplicationDeadline());
        if (request.getNumberOfOpenings() != null) job.setNumberOfOpenings(request.getNumberOfOpenings());
        if (request.getContactEmail() != null) job.setContactEmail(request.getContactEmail());
        if (request.getCityName() != null) job.setCityName(request.getCityName());
        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found"));
            job.setCity(city);
        }
        
        job.setStatus(Job.JobStatus.PENDING); // Reset to pending after update
        
        job = jobRepository.save(job);
        
        return mapToDetailResponse(job);
    }
    
    @Transactional
    public void deleteJob(Long id, Long employerId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getEmployer().getId().equals(employerId)) {
            throw new RuntimeException("Unauthorized to delete this job");
        }
        
        jobRepository.delete(job);
    }
    
    public PageResponse<JobDTO.JobSummaryResponse> getMyJobs(Long employerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobs = jobRepository.findByEmployerIdOrderByCreatedAtDesc(employerId, pageable);
        
        Page<JobDTO.JobSummaryResponse> responsePage = jobs.map(this::mapToSummaryResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional
    public void applyForJob(Long jobId, Long seekerId, org.springframework.web.multipart.MultipartFile cvFile, String coverLetter) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if already applied
        if (jobApplicationRepository.existsByJobIdAndSeekerId(jobId, seekerId)) {
            throw new RuntimeException("You have already applied for this job");
        }
        
        // Store cv in FileStorageService
        String cvUrl = fileStorageService.storeFile(cvFile);
        // Build url directly mapped to the public url
        String fullUrl = "/api/uploads/" + cvUrl;

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setSeeker(seeker);
        application.setCvUrl(fullUrl);
        application.setCoverLetter(coverLetter);
        application.setStatus(JobApplication.ApplicationStatus.SUBMITTED);
        
        jobApplicationRepository.save(application);
        
        // Increment application count
        job.setApplicationCount(job.getApplicationCount() + 1);
        jobRepository.save(job);
        
        // Send email notification to employer
        User employer = job.getEmployer();
        emailService.sendJobApplicationNotification(
            employer.getEmail(),
            employer.getFullName(),
            seeker.getFullName(),
            seeker.getEmail(),
            job.getTitle()
        );
    }
    
    @Transactional(readOnly = true)
    public PageResponse<JobDTO.JobApplicationResponse> getApplicationsForJob(Long jobId, Long employerId, int page, int size) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getEmployer().getId().equals(employerId)) {
            throw new RuntimeException("Unauthorized to view applications");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<JobApplication> applications = jobApplicationRepository.findByJobId(jobId, pageable);
        
        Page<JobDTO.JobApplicationResponse> responsePage = applications.map(this::mapToApplicationResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<JobDTO.JobApplicationResponse> getMyApplications(Long seekerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<JobApplication> applications = jobApplicationRepository.findBySeekerId(seekerId, pageable);
        
        Page<JobDTO.JobApplicationResponse> responsePage = applications.map(this::mapToApplicationResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<JobDTO.JobApplicationResponse> getReceivedApplications(Long employerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<JobApplication> applications = jobApplicationRepository.findByJobEmployerId(employerId, pageable);
        
        Page<JobDTO.JobApplicationResponse> responsePage = applications.map(this::mapToApplicationResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional
    public void updateApplicationStatus(Long applicationId, String status, Long employerId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (!application.getJob().getEmployer().getId().equals(employerId)) {
            throw new RuntimeException("Unauthorized to update application status");
        }
        
        application.setStatus(JobApplication.ApplicationStatus.valueOf(status.toUpperCase()));
        jobApplicationRepository.save(application);
    }
    
    // Admin methods
    public PageResponse<JobDTO.JobSummaryResponse> getPendingJobs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobs = jobRepository.findByStatus(Job.JobStatus.PENDING, pageable);
        
        Page<JobDTO.JobSummaryResponse> responsePage = jobs.map(this::mapToSummaryResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional
    public void approveJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(Job.JobStatus.ACTIVE);
        jobRepository.save(job);
        emailService.sendJobApprovedEmail(job.getEmployer().getEmail(), job.getEmployer().getFullName(), job.getTitle());
    }
    
    @Transactional
    public void rejectJob(Long id, String reason) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(Job.JobStatus.CLOSED);
        jobRepository.save(job);
        emailService.sendJobRejectedEmail(job.getEmployer().getEmail(), job.getEmployer().getFullName(), job.getTitle(), reason);
    }
    
    private JobDTO.JobSummaryResponse mapToSummaryResponse(Job job) {
        JobDTO.JobSummaryResponse response = new JobDTO.JobSummaryResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setSpecialisation(job.getSpecialisation());
        response.setEmploymentType(job.getEmploymentType().name());
        response.setSalaryMinLpa(job.getSalaryMinLpa());
        response.setSalaryMaxLpa(job.getSalaryMaxLpa());
        response.setExperienceRequired(job.getExperienceRequired().name());
        response.setCategoryName(job.getJobCategory().getName());
        response.setCityName(job.getCity() != null ? job.getCity().getName() : job.getCityName());
        response.setStateName(job.getCity() != null ? job.getCity().getState().getName() : null);
        response.setApplicationDeadline(job.getApplicationDeadline());
        response.setEmployerName(job.getEmployer().getFullName());
        response.setEmployerCompany(job.getEmployer().getCompanyName());
        response.setCreatedAt(job.getCreatedAt());
        response.setViewCount(job.getViewCount());
        response.setStatus(job.getStatus().name());
        
        return response;
    }
    
    private JobDTO.JobResponse mapToDetailResponse(Job job) {
        JobDTO.JobResponse response = new JobDTO.JobResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setSpecialisation(job.getSpecialisation());
        response.setEmploymentType(job.getEmploymentType().name());
        response.setSalaryMinLpa(job.getSalaryMinLpa());
        response.setSalaryMaxLpa(job.getSalaryMaxLpa());
        response.setExperienceRequired(job.getExperienceRequired().name());
        response.setQualifications(job.getQualifications());
        response.setDescription(job.getDescription());
        response.setApplicationDeadline(job.getApplicationDeadline());
        response.setNumberOfOpenings(job.getNumberOfOpenings());
        response.setContactEmail(job.getContactEmail());
        response.setStatus(job.getStatus().name());
        response.setViewCount(job.getViewCount());
        response.setApplicationCount(job.getApplicationCount());
        response.setIsFeatured(job.getIsFeatured());
        response.setCreatedAt(job.getCreatedAt());
        response.setUpdatedAt(job.getUpdatedAt());
        
        // Job Category
        JobDTO.JobCategoryDTO categoryDTO = new JobDTO.JobCategoryDTO();
        categoryDTO.setId(job.getJobCategory().getId());
        categoryDTO.setName(job.getJobCategory().getName());
        categoryDTO.setDescription(job.getJobCategory().getDescription());
        response.setJobCategory(categoryDTO);
        
        // City
        if (job.getCity() != null) {
            UserDTO.CityDTO cityDTO = new UserDTO.CityDTO();
            cityDTO.setId(job.getCity().getId());
            cityDTO.setName(job.getCity().getName());
            cityDTO.setStateName(job.getCity().getState().getName());
            response.setCity(cityDTO);
        }
        response.setCityName(job.getCity() != null ? job.getCity().getName() : job.getCityName());
        
        // Employer
        JobDTO.EmployerInfo employerInfo = new JobDTO.EmployerInfo();
        employerInfo.setId(job.getEmployer().getId());
        employerInfo.setFullName(job.getEmployer().getFullName());
        employerInfo.setCompanyName(job.getEmployer().getCompanyName());
        employerInfo.setEmail(job.getEmployer().getEmail());
        response.setEmployer(employerInfo);
        
        return response;
    }
    
    private JobDTO.JobApplicationResponse mapToApplicationResponse(JobApplication application) {
        JobDTO.JobApplicationResponse response = new JobDTO.JobApplicationResponse();
        response.setId(application.getId());
        response.setJobId(application.getJob().getId());
        response.setJobTitle(application.getJob().getTitle());
        response.setSeekerName(application.getSeeker().getFullName());
        response.setSeekerEmail(application.getSeeker().getEmail());
        response.setSeekerMobile(application.getSeeker().getMobileNumber());
        response.setEmployerName(application.getJob().getEmployer().getFullName());
        response.setEmployerCompany(application.getJob().getEmployer().getCompanyName());
        response.setCvUrl(application.getCvUrl());
        response.setCoverLetter(application.getCoverLetter());
        response.setStatus(application.getStatus().name());
        response.setAppliedAt(application.getAppliedAt());
        response.setUpdatedAt(application.getUpdatedAt());
        
        return response;
    }
    
    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    @Transactional
    public void expireJobsDaily() {
        logger.info("Running daily job expiration task...");
        List<Job> expiredJobs = jobRepository.findByStatusAndApplicationDeadlineBefore(
                Job.JobStatus.ACTIVE, LocalDate.now());
        
        if (!expiredJobs.isEmpty()) {
            for (Job job : expiredJobs) {
                job.setStatus(Job.JobStatus.EXPIRED);
                logger.info("Expired job ID: {}", job.getId());
            }
            jobRepository.saveAll(expiredJobs);
            logger.info("Successfully expired {} jobs.", expiredJobs.size());
        } else {
            logger.info("No jobs to expire today.");
        }
    }
    @Transactional
    public void closeJob(Long jobId, Long employerId, String reason) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getEmployer().getId().equals(employerId)) {
            throw new RuntimeException("You do not have permission to close this job");
        }
        
        job.setStatus(Job.JobStatus.CLOSED);
        jobRepository.save(job);
        
        AuditLog log = new AuditLog();
        log.setUserId(job.getEmployer().getId());
        log.setAction("CLOSE_OWN_JOB");
        log.setEntityType("Job");
        log.setEntityId(jobId);
        log.setActorName(job.getEmployer().getFullName());
        log.setTargetName(job.getTitle());
        log.setDetails("Reason: " + reason);
        auditLogService.saveLogAsync(log);
    }
}
