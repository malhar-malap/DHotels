package com.healthcare.portal.repository;

import com.healthcare.portal.entity.ConsultationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, Long> {
    Page<ConsultationRequest> findByStatus(ConsultationRequest.ConsultationStatus status, Pageable pageable);
    long countByStatus(ConsultationRequest.ConsultationStatus status);

    @Query("SELECT cr FROM ConsultationRequest cr WHERE " +
           "(:status IS NULL OR cr.status = :status) AND " +
           "(:startDate IS NULL OR cr.createdAt >= :startDate) AND " +
           "(:keyword IS NULL OR " +
           "  LOWER(cr.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(cr.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(cr.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ConsultationRequest> searchConsultations(@Param("status") ConsultationRequest.ConsultationStatus status,
                                                  @Param("startDate") java.time.LocalDateTime startDate,
                                                  @Param("keyword") String keyword,
                                                  Pageable pageable);
}
