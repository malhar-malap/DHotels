package com.healthcare.portal.repository;

import com.healthcare.portal.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for JobApplication entity
 */
@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    
    List<JobApplication> findByJobId(Long jobId);
    
    Page<JobApplication> findByJobId(Long jobId, Pageable pageable);
    
    List<JobApplication> findBySeekerId(Long seekerId);
    
    long countBySeekerId(Long seekerId);
    
    Page<JobApplication> findBySeekerId(Long seekerId, Pageable pageable);
    
    Optional<JobApplication> findByJobIdAndSeekerId(Long jobId, Long seekerId);
    
    boolean existsByJobIdAndSeekerId(Long jobId, Long seekerId);
    
    Page<JobApplication> findByJobEmployerId(Long employerId, Pageable pageable);

    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.appliedAt >= :fromDate")
    long countAppliedAfter(@Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.status = :status")
    long countByStatus(@Param("status") JobApplication.ApplicationStatus status);
}
