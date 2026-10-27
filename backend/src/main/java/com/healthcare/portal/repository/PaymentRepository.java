package com.healthcare.portal.repository;

import com.healthcare.portal.entity.Payment;
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
 * Repository interface for Payment entity
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    boolean existsByBuyerIdAndListingIdAndStatus(Long buyerId, Long listingId, Payment.PaymentStatus status);

    Optional<Payment> findByBuyerIdAndListingIdAndStatus(Long buyerId, Long listingId, Payment.PaymentStatus status);

    List<Payment> findByBuyerIdAndStatus(Long buyerId, Payment.PaymentStatus status);

    List<Payment> findByBuyerId(Long buyerId);

    // Admin queries
    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Payment p LEFT JOIN p.buyer b LEFT JOIN p.listing l WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:fromDate IS NULL OR p.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR p.createdAt <= :toDate) AND " +
           "(:keyword IS NULL OR LOWER(p.razorpayOrderId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(COALESCE(p.razorpayPaymentId, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(b.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(b.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(COALESCE(l.uniqueCode, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Payment> adminSearchPayments(@Param("status") Payment.PaymentStatus status,
                                     @Param("fromDate") LocalDateTime fromDate,
                                     @Param("toDate") LocalDateTime toDate,
                                     @Param("keyword") String keyword,
                                     Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.status = :status ORDER BY p.createdAt DESC")
    Page<Payment> findByStatusOrderByCreatedAtDesc(@Param("status") Payment.PaymentStatus status, Pageable pageable);

    long countByStatus(Payment.PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    long sumAmountByStatus(@Param("status") Payment.PaymentStatus status);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status AND p.createdAt >= :fromDate")
    long countByStatusAndCreatedAtAfter(@Param("status") Payment.PaymentStatus status, @Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status AND p.createdAt >= :fromDate")
    long sumAmountByStatusAndCreatedAtAfter(@Param("status") Payment.PaymentStatus status, @Param("fromDate") LocalDateTime fromDate);

    void deleteByListingId(Long listingId);
}
