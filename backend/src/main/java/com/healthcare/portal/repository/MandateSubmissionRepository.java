package com.healthcare.portal.repository;

import com.healthcare.portal.entity.MandateSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface MandateSubmissionRepository extends JpaRepository<MandateSubmission, Long> {
    Page<MandateSubmission> findByStatus(MandateSubmission.MandateStatus status, Pageable pageable);
    long countByStatus(MandateSubmission.MandateStatus status);

    @Query("SELECT m FROM MandateSubmission m WHERE " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:startDate IS NULL OR m.createdAt >= :startDate) AND " +
           "(:keyword IS NULL OR " +
           "  LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(m.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(m.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<MandateSubmission> searchMandates(@Param("status") MandateSubmission.MandateStatus status,
                                           @Param("startDate") java.time.LocalDateTime startDate,
                                           @Param("keyword") String keyword,
                                           Pageable pageable);
}
