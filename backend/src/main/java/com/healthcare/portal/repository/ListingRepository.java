package com.healthcare.portal.repository;

import com.healthcare.portal.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Listing entity
 */
@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    
    List<Listing> findByUserId(Long userId);
    
    long countByUserId(Long userId);
    
    List<Listing> findByStatus(Listing.ListingStatus status);
    
    Page<Listing> findByStatus(Listing.ListingStatus status, Pageable pageable);
    
    List<Listing> findByCategoryId(Long categoryId);
    
    List<Listing> findByCityId(Long cityId);
    
    List<Listing> findByIsFeaturedTrue();
    
    @Query("SELECT l FROM Listing l LEFT JOIN FETCH l.user u LEFT JOIN FETCH l.category c " +
           "LEFT JOIN FETCH l.dealType dt LEFT JOIN FETCH l.city city LEFT JOIN FETCH city.state " +
           "WHERE l.id = :id")
    Optional<Listing> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT l FROM Listing l JOIN FETCH l.images WHERE l.id = :id")
    Optional<Listing> findByIdWithImages(@Param("id") Long id);
    
    @Query("SELECT l FROM Listing l WHERE l.status = :status ORDER BY l.createdAt DESC")
    List<Listing> findTopByStatusOrderByCreatedAtDesc(@Param("status") Listing.ListingStatus status, Pageable pageable);
    
    @Query("SELECT l FROM Listing l LEFT JOIN l.category c LEFT JOIN l.dealType dt LEFT JOIN l.city city LEFT JOIN city.state s WHERE " +
           "l.status = 'ACTIVE' AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:dealTypeId IS NULL OR dt.id = :dealTypeId) AND " +
           "(:dealTypeName IS NULL OR LOWER(dt.name) = LOWER(:dealTypeName)) AND " +
           "(:cityId IS NULL OR city.id = :cityId) AND " +
           "(:stateId IS NULL OR s.id = :stateId) AND " +
           "(:cityName IS NULL OR LOWER(l.cityName) LIKE LOWER(CONCAT('%', :cityName, '%')) OR LOWER(l.locality) LIKE LOWER(CONCAT('%', :cityName, '%')) OR LOWER(l.stateName) LIKE LOWER(CONCAT('%', :cityName, '%')) OR LOWER(city.name) LIKE LOWER(CONCAT('%', :cityName, '%'))) AND " +
           "(:minPrice IS NULL OR l.askingPrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR l.askingPrice <= :maxPrice) AND " +
           "(:isConfidential IS NULL OR l.isConfidential = :isConfidential) AND " +
           "(:keyword IS NULL OR LOWER(CONCAT(COALESCE(l.title, ''), ' ', COALESCE(l.shortDescription, ''), ' ', COALESCE(l.detailedDescription, ''), ' ', COALESCE(c.name, ''), ' ', COALESCE(l.cityName, ''), ' ', COALESCE(l.locality, ''), ' ', COALESCE(l.stateName, ''), ' ', COALESCE(dt.name, ''))) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Listing> searchListings(@Param("categoryId") Long categoryId,
                                 @Param("dealTypeId") Long dealTypeId,
                                 @Param("dealTypeName") String dealTypeName,
                                 @Param("cityId") Long cityId,
                                 @Param("stateId") Long stateId,
                                 @Param("cityName") String cityName,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 @Param("isConfidential") Boolean isConfidential,
                                 @Param("keyword") String keyword,
                                 Pageable pageable);

    @Query("SELECT l FROM Listing l LEFT JOIN l.category c LEFT JOIN l.dealType dt LEFT JOIN l.city city LEFT JOIN city.state s WHERE " +
           "l.status = 'ACTIVE' AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:dealTypeId IS NULL OR dt.id = :dealTypeId) AND " +
           "(:dealTypeName IS NULL OR LOWER(dt.name) = LOWER(:dealTypeName)) AND " +
           "(:cityId IS NULL OR city.id = :cityId) AND " +
           "(:stateId IS NULL OR s.id = :stateId) AND " +
           "(:cityName IS NULL OR LOWER(l.cityName) LIKE LOWER(CONCAT('%', :cityName, '%')) OR LOWER(l.locality) LIKE LOWER(CONCAT('%', :cityName, '%')) OR LOWER(l.stateName) LIKE LOWER(CONCAT('%', :cityName, '%')) OR LOWER(city.name) LIKE LOWER(CONCAT('%', :cityName, '%'))) AND " +
           "(:minPrice IS NULL OR l.askingPrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR l.askingPrice <= :maxPrice) AND " +
           "(:isConfidential IS NULL OR l.isConfidential = :isConfidential) AND " +
           "(:keyword IS NULL OR (LOWER(l.uniqueCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR (l.uniqueCode IS NULL AND :numericKeyword IS NOT NULL AND l.id = :numericKeyword)))")
    Page<Listing> searchListingsByCodeOrId(@Param("categoryId") Long categoryId,
                                           @Param("dealTypeId") Long dealTypeId,
                                           @Param("dealTypeName") String dealTypeName,
                                           @Param("cityId") Long cityId,
                                           @Param("stateId") Long stateId,
                                           @Param("cityName") String cityName,
                                           @Param("minPrice") BigDecimal minPrice,
                                           @Param("maxPrice") BigDecimal maxPrice,
                                           @Param("isConfidential") Boolean isConfidential,
                                           @Param("keyword") String keyword,
                                           @Param("numericKeyword") Long numericKeyword,
                                           Pageable pageable);
    
    @Query("SELECT l FROM Listing l LEFT JOIN l.category c LEFT JOIN l.dealType dt LEFT JOIN l.city city LEFT JOIN city.state s WHERE " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:dealTypeId IS NULL OR dt.id = :dealTypeId) AND " +
           "(:cityId IS NULL OR city.id = :cityId) AND " +
           "(:stateId IS NULL OR s.id = :stateId) AND " +
           "(:sellerId IS NULL OR l.user.id = :sellerId) AND " +
           "(:keyword IS NULL OR LOWER(CONCAT(COALESCE(l.title, ''), ' ', COALESCE(l.shortDescription, ''), ' ', COALESCE(l.detailedDescription, ''), ' ', COALESCE(c.name, ''), ' ', COALESCE(l.cityName, ''), ' ', COALESCE(l.locality, ''), ' ', COALESCE(l.stateName, ''), ' ', COALESCE(dt.name, ''))) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Listing> adminSearchListings(@Param("status") Listing.ListingStatus status,
                                     @Param("categoryId") Long categoryId,
                                     @Param("dealTypeId") Long dealTypeId,
                                     @Param("cityId") Long cityId,
                                     @Param("stateId") Long stateId,
                                     @Param("sellerId") Long sellerId,
                                     @Param("keyword") String keyword,
                                     Pageable pageable);

    @Query("SELECT l FROM Listing l LEFT JOIN l.category c LEFT JOIN l.dealType dt LEFT JOIN l.city city LEFT JOIN city.state s WHERE " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:dealTypeId IS NULL OR dt.id = :dealTypeId) AND " +
           "(:cityId IS NULL OR city.id = :cityId) AND " +
           "(:stateId IS NULL OR s.id = :stateId) AND " +
           "(:sellerId IS NULL OR l.user.id = :sellerId) AND " +
           "(:keyword IS NULL OR (LOWER(l.uniqueCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR (l.uniqueCode IS NULL AND :numericKeyword IS NOT NULL AND l.id = :numericKeyword)))")
    Page<Listing> adminSearchListingsByCodeOrId(@Param("status") Listing.ListingStatus status,
                                               @Param("categoryId") Long categoryId,
                                               @Param("dealTypeId") Long dealTypeId,
                                               @Param("cityId") Long cityId,
                                               @Param("stateId") Long stateId,
                                               @Param("sellerId") Long sellerId,
                                               @Param("keyword") String keyword,
                                               @Param("numericKeyword") Long numericKeyword,
                                               Pageable pageable);
    
    Optional<Listing> findByUniqueCode(String uniqueCode);

    boolean existsByUniqueCode(String uniqueCode);

    @Query("SELECT l.uniqueCode FROM Listing l WHERE l.uniqueCode LIKE CONCAT(:prefix, '%')")
    List<String> findUniqueCodesStartingWith(@Param("prefix") String prefix);

    @Query("SELECT COUNT(l) FROM Listing l WHERE l.status = :status")
    long countByStatus(@Param("status") Listing.ListingStatus status);
    
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.createdAt >= :fromDate")
    long countCreatedAfter(@Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT l FROM Listing l WHERE l.user.id = :userId ORDER BY l.createdAt DESC")
    Page<Listing> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT l FROM Listing l LEFT JOIN l.category c LEFT JOIN l.dealType dt LEFT JOIN l.city city LEFT JOIN city.state s WHERE " +
           "l.user.id = :userId AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:keyword IS NULL OR (LOWER(l.uniqueCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR (l.uniqueCode IS NULL AND :numericKeyword IS NOT NULL AND l.id = :numericKeyword) OR LOWER(CONCAT(COALESCE(l.title, ''), ' ', COALESCE(l.shortDescription, ''), ' ', COALESCE(l.detailedDescription, ''), ' ', COALESCE(c.name, ''), ' ', COALESCE(l.cityName, ''), ' ', COALESCE(l.locality, ''), ' ', COALESCE(l.stateName, ''), ' ', COALESCE(dt.name, ''))) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<Listing> searchMyListings(@Param("userId") Long userId,
                                   @Param("categoryId") Long categoryId,
                                   @Param("keyword") String keyword,
                                   @Param("numericKeyword") Long numericKeyword,
                                   Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE l.status = 'ACTIVE' AND l.isFeatured = true " +
           "AND (l.featuredUntil IS NULL OR l.featuredUntil > :now) ORDER BY l.createdAt DESC")
    List<Listing> findFeaturedListings(@Param("now") LocalDateTime now, Pageable pageable);

    @Modifying
    @Query("UPDATE Listing l SET l.isFeatured = false WHERE l.isFeatured = true AND l.featuredUntil IS NOT NULL AND l.featuredUntil <= :now")
    int clearExpiredFeatures(@Param("now") LocalDateTime now);
}
