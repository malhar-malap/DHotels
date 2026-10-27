package com.healthcare.portal.repository;

import com.healthcare.portal.entity.BuyerVerification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for BuyerVerification entity
 */
@Repository
public interface BuyerVerificationRepository extends JpaRepository<BuyerVerification, Long> {
    
    List<BuyerVerification> findByUserId(Long userId);
    
    Optional<BuyerVerification> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<BuyerVerification> findByStatus(BuyerVerification.VerificationStatus status);
    
    Page<BuyerVerification> findByStatus(BuyerVerification.VerificationStatus status, Pageable pageable);
    
    @Query("SELECT bv FROM BuyerVerification bv JOIN FETCH bv.user WHERE bv.status = :status")
    List<BuyerVerification> findByStatusWithUser(@Param("status") BuyerVerification.VerificationStatus status);
    
    @Query("SELECT COUNT(bv) FROM BuyerVerification bv WHERE bv.status = :status")
    long countByStatus(@Param("status") BuyerVerification.VerificationStatus status);
    
    boolean existsByUserIdAndStatus(Long userId, BuyerVerification.VerificationStatus status);

    @Query("SELECT bv FROM BuyerVerification bv LEFT JOIN bv.user u WHERE " +
           "(:status IS NULL OR bv.status = :status) AND " +
           "(:fromDate IS NULL OR bv.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR bv.createdAt <= :toDate) AND " +
           "(:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(COALESCE(u.mobileNumber, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(COALESCE(bv.rejectionReason, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " CAST(u.id AS string) LIKE CONCAT('%', :keyword, '%'))")
    Page<BuyerVerification> searchVerifications(@Param("status") BuyerVerification.VerificationStatus status,
                                                @Param("fromDate") java.time.LocalDateTime fromDate,
                                                @Param("toDate") java.time.LocalDateTime toDate,
                                                @Param("keyword") String keyword,
                                                Pageable pageable);
}
