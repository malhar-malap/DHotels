package com.healthcare.portal.repository;

import com.healthcare.portal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Job entity
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    
    List<Job> findByEmployerId(Long employerId);
    
    long countByEmployerId(Long employerId);
    
    Page<Job> findByEmployerId(Long employerId, Pageable pageable);
    
    List<Job> findByStatus(Job.JobStatus status);
    
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);
    
    List<Job> findByJobCategoryId(Long categoryId);
    
    List<Job> findByStatusAndApplicationDeadlineBefore(Job.JobStatus status, java.time.LocalDate date);
    
    List<Job> findByCityId(Long cityId);
    
    @Query("SELECT j FROM Job j JOIN FETCH j.employer e JOIN FETCH j.jobCategory jc " +
           "LEFT JOIN FETCH j.city c LEFT JOIN FETCH c.state WHERE j.id = :id")
    Optional<Job> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT j FROM Job j LEFT JOIN j.city city LEFT JOIN j.jobCategory c LEFT JOIN j.employer emp WHERE j.status = 'ACTIVE' AND " +
           "j.applicationDeadline >= CURRENT_DATE AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:cityId IS NULL OR city.id = :cityId) AND " +
           "(:employmentType IS NULL OR j.employmentType = :employmentType) AND " +
           "(:experienceLevel IS NULL OR j.experienceRequired = :experienceLevel) AND " +
           "(:minSalary IS NULL OR j.salaryMaxLpa >= :minSalary) AND " +
           "(:maxSalary IS NULL OR j.salaryMinLpa <= :maxSalary) AND " +
           "(:keyword IS NULL OR LOWER(CONCAT(COALESCE(j.title, ''), ' ', COALESCE(j.specialisation, ''), ' ', COALESCE(j.cityName, ''), ' ', COALESCE(city.name, ''), ' ', COALESCE(c.name, ''), ' ', COALESCE(emp.companyName, ''), ' ', COALESCE(emp.fullName, ''))) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Job> searchJobs(@Param("categoryId") Long categoryId,
                         @Param("cityId") Long cityId,
                         @Param("employmentType") Job.EmploymentType employmentType,
                         @Param("experienceLevel") Job.ExperienceLevel experienceLevel,
                         @Param("minSalary") BigDecimal minSalary,
                         @Param("maxSalary") BigDecimal maxSalary,
                         @Param("keyword") String keyword,
                         Pageable pageable);
    
    @Query("SELECT j FROM Job j LEFT JOIN j.city city LEFT JOIN j.jobCategory c LEFT JOIN j.employer emp WHERE " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:cityId IS NULL OR city.id = :cityId) AND " +
           "(:employmentType IS NULL OR j.employmentType = :employmentType) AND " +
           "(:experienceLevel IS NULL OR j.experienceRequired = :experienceLevel) AND " +
           "(:employerId IS NULL OR emp.id = :employerId) AND " +
           "(:keyword IS NULL OR LOWER(CONCAT(COALESCE(j.title, ''), ' ', COALESCE(j.specialisation, ''), ' ', COALESCE(j.cityName, ''), ' ', COALESCE(city.name, ''), ' ', COALESCE(c.name, ''), ' ', COALESCE(emp.companyName, ''), ' ', COALESCE(emp.fullName, ''))) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Job> adminSearchJobs(@Param("status") Job.JobStatus status,
                             @Param("categoryId") Long categoryId,
                             @Param("cityId") Long cityId,
                             @Param("employmentType") Job.EmploymentType employmentType,
                             @Param("experienceLevel") Job.ExperienceLevel experienceLevel,
                             @Param("employerId") Long employerId,
                             @Param("keyword") String keyword,
                             Pageable pageable);
    
    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = :status")
    long countByStatus(@Param("status") Job.JobStatus status);
    
    @Query("SELECT COUNT(j) FROM Job j WHERE j.createdAt >= :fromDate")
    long countCreatedAfter(@Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.isFeatured = true " +
           "AND j.applicationDeadline >= CURRENT_DATE " +
           "ORDER BY j.createdAt DESC")
    List<Job> findFeaturedJobs(Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE j.employer.id = :employerId ORDER BY j.createdAt DESC")
    Page<Job> findByEmployerIdOrderByCreatedAtDesc(@Param("employerId") Long employerId, Pageable pageable);
}
