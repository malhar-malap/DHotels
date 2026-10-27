package com.healthcare.portal.repository;

import com.healthcare.portal.entity.User;
import com.healthcare.portal.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserRole entity
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    
    List<UserRole> findByUser(User user);
    
    List<UserRole> findByUserId(Long userId);
    
    Optional<UserRole> findByUserAndRole(User user, UserRole.Role role);
    
    void deleteByUserAndRole(User user, UserRole.Role role);
    
    boolean existsByUserAndRole(User user, UserRole.Role role);
}
