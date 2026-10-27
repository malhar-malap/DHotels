package com.healthcare.portal.repository;

import com.healthcare.portal.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for ListingImage entity
 */
@Repository
public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    
    List<ListingImage> findByListingId(Long listingId);
    
    List<ListingImage> findByListingIdOrderByDisplayOrderAsc(Long listingId);
    
    @Query("SELECT li FROM ListingImage li WHERE li.listing.id = :listingId AND li.isPrimary = true")
    ListingImage findPrimaryImageByListingId(@Param("listingId") Long listingId);
    
    @Modifying
    @Query("DELETE FROM ListingImage li WHERE li.listing.id = :listingId")
    void deleteByListingId(@Param("listingId") Long listingId);
    
    @Modifying
    @Query("UPDATE ListingImage li SET li.isPrimary = false WHERE li.listing.id = :listingId")
    void clearPrimaryFlag(@Param("listingId") Long listingId);
}
