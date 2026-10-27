package com.healthcare.portal.repository;

import com.healthcare.portal.entity.UserCV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository interface for UserCV entity
 */
@Repository
public interface UserCVRepository extends JpaRepository<UserCV, Long> {
    
    Optional<UserCV> findByUserId(Long userId);
    
    void deleteByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
}
