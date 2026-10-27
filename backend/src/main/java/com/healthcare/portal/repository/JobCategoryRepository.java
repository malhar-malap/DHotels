package com.healthcare.portal.repository;

import com.healthcare.portal.entity.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for JobCategory entity
 */
@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Long> {
    
    Optional<JobCategory> findByName(String name);
    
    List<JobCategory> findAllByOrderByNameAsc();
}
