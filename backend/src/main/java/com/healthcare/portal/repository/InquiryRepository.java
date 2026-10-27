package com.healthcare.portal.repository;

import com.healthcare.portal.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Inquiry entity
 */
@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    
    List<Inquiry> findByListingId(Long listingId);
    
    List<Inquiry> findByBuyerId(Long buyerId);
    
    List<Inquiry> findBySellerId(Long sellerId);
    
    long countBySellerId(Long sellerId);
    
    Page<Inquiry> findBySellerId(Long sellerId, Pageable pageable);
    
    Page<Inquiry> findByBuyerId(Long buyerId, Pageable pageable);
    
    List<Inquiry> findByStatus(Inquiry.InquiryStatus status);
    

    
    @Query("SELECT COUNT(i) FROM Inquiry i WHERE i.createdAt >= :fromDate")
    long countCreatedAfter(@Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT COUNT(i) FROM Inquiry i WHERE i.status = :status")
    long countByStatus(@Param("status") Inquiry.InquiryStatus status);
    
    void deleteByListingId(Long listingId);
}
