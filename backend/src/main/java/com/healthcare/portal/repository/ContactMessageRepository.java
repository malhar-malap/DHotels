package com.healthcare.portal.repository;

import com.healthcare.portal.entity.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository interface for ContactMessage entity
 */
@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    
    Page<ContactMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Page<ContactMessage> findByStatusOrderByCreatedAtDesc(ContactMessage.ContactMessageStatus status, Pageable pageable);
    
    long countByStatus(ContactMessage.ContactMessageStatus status);

    @Query("SELECT c FROM ContactMessage c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:startDate IS NULL OR c.createdAt >= :startDate) AND " +
           "(:keyword IS NULL OR " +
           "  LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ContactMessage> searchMessages(@Param("status") ContactMessage.ContactMessageStatus status,
                                        @Param("startDate") java.time.LocalDateTime startDate,
                                        @Param("keyword") String keyword,
                                        Pageable pageable);
}
