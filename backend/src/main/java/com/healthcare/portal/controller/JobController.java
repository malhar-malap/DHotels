package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.service.AuthService;
import com.healthcare.portal.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/jobs")
@Tag(name = "Jobs", description = "Job board management APIs")
public class JobController {
    
    private final JobService jobService;
    private final AuthService authService;

    @Autowired
    public JobController(JobService jobService, AuthService authService) {
        this.jobService = jobService;
        this.authService = authService;
    }
    
    @GetMapping
    @Operation(summary = "Search jobs", description = "Search and filter job postings")
    public ResponseEntity<ApiResponse<PageResponse<JobDTO.JobSummaryResponse>>> searchJobs(
            @ModelAttribute JobDTO.JobSearchRequest request) {
        PageResponse<JobDTO.JobSummaryResponse> response = jobService.searchJobs(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/featured")
    @Operation(summary = "Get featured jobs", description = "Returns featured jobs for homepage")
    public ResponseEntity<ApiResponse<java.util.List<JobDTO.JobSummaryResponse>>> getFeaturedJobs() {
        java.util.List<JobDTO.JobSummaryResponse> jobs = jobService.getFeaturedJobs();
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get job by ID", description = "Returns detailed job information")
    public ResponseEntity<ApiResponse<JobDTO.JobResponse>> getJobById(@PathVariable Long id) {
        JobDTO.JobResponse job = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success(job));
    }
    
    @GetMapping("/my")
    @Operation(summary = "Get my jobs", description = "Returns jobs posted by the current user")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<PageResponse<JobDTO.JobSummaryResponse>>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity();
        PageResponse<JobDTO.JobSummaryResponse> response = 
                jobService.getMyJobs(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @Operation(summary = "Create job", description = "Creates a new job posting")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<JobDTO.JobResponse>> createJob(
            @Valid @RequestBody JobDTO.JobRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        JobDTO.JobResponse response = jobService.createJob(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job posted successfully", response));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update job", description = "Updates an existing job posting")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<JobDTO.JobResponse>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobDTO.JobRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        JobDTO.JobResponse response = jobService.updateJob(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete job", description = "Deletes a job posting")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        User currentUser = authService.getCurrentUserEntity();
        jobService.deleteJob(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job deleted successfully", null));
    }
    
    @PostMapping("/{id}/close")
    @Operation(summary = "Close job", description = "Closes a job posting with a reason")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Void>> closeJob(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        User currentUser = authService.getCurrentUserEntity();
        String reason = payload.getOrDefault("reason", "No reason provided");
        jobService.closeJob(id, currentUser.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Job closed successfully", null));
    }
    
    // Job Applications
    
    @PostMapping(value = "/{jobId}/apply", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Apply for job", description = "Submit a job application")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Void>> applyForJob(
            @PathVariable Long jobId,
            @RequestParam("cvFile") org.springframework.web.multipart.MultipartFile cvFile,
            @RequestParam(value = "coverLetter", required = false) String coverLetter) {
        User currentUser = authService.getCurrentUserEntity();
        jobService.applyForJob(jobId, currentUser.getId(), cvFile, coverLetter);
        return ResponseEntity.ok(ApiResponse.success("Application submitted successfully", null));
    }
    
    @GetMapping("/{jobId}/applications")
    @Operation(summary = "Get job applications", description = "Returns applications for a job")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<PageResponse<JobDTO.JobApplicationResponse>>> getJobApplications(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity();
        PageResponse<JobDTO.JobApplicationResponse> response = 
                jobService.getApplicationsForJob(jobId, currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/applications/my")
    @Operation(summary = "Get my applications", description = "Returns current user's job applications")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<PageResponse<JobDTO.JobApplicationResponse>>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity();
        PageResponse<JobDTO.JobApplicationResponse> response = 
                jobService.getMyApplications(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/applications/received")
    @Operation(summary = "Get received applications", description = "Returns job applications received by the employer across all posted jobs")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<PageResponse<JobDTO.JobApplicationResponse>>> getReceivedApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity();
        PageResponse<JobDTO.JobApplicationResponse> response = 
                jobService.getReceivedApplications(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PutMapping("/applications/{applicationId}/status")
    @Operation(summary = "Update application status", description = "Updates status of a job application")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Void>> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam String status) {
        User currentUser = authService.getCurrentUserEntity();
        jobService.updateApplicationStatus(applicationId, status, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Application status updated", null));
    }
}
