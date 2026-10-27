package com.healthcare.portal.repository;

import com.healthcare.portal.entity.User;
import com.healthcare.portal.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Repository interface for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByMobileNumber(String mobileNumber);
    
    boolean existsByEmail(String email);
    
    boolean existsByMobileNumber(String mobileNumber);
    
    List<User> findByStatus(User.UserStatus status);
    
    List<User> findByIsVerifiedBuyerTrue();
    
    @Query("SELECT u FROM User u JOIN FETCH u.city c JOIN FETCH c.state WHERE u.id = :id")
    Optional<User> findByIdWithCity(@Param("id") Long id);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatus(@Param("status") User.UserStatus status);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :fromDate")
    long countCreatedAfter(@Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate AND u.createdAt < :endDate")
    long countCreatedBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.roles r WHERE " +
           "(:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(COALESCE(u.companyName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:role IS NULL OR r.role = :role) AND " +
           "(:isVerified IS NULL OR :isVerified = '' OR " +
           "  (:isVerified = 'verified' AND u.isVerifiedBuyer = true) OR " +
           "  (:isVerified = 'unverified' AND u.isVerifiedBuyer = false) OR " +
           "  (:isVerified = 'kyc' AND u.isVerifiedBuyer = true) OR " +
           "  (:isVerified = 'true' AND u.isVerifiedBuyer = true) OR " +
           "  (:isVerified = 'false' AND u.isVerifiedBuyer = false))")
    Page<User> searchUsers(@Param("keyword") String keyword, 
                          @Param("status") User.UserStatus status,
                          @Param("role") UserRole.Role role,
                          @Param("isVerified") String isVerified,
                          Pageable pageable);
}

