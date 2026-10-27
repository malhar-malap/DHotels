package com.healthcare.portal.repository;

import com.healthcare.portal.entity.Category;
import com.healthcare.portal.entity.DealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DealType entity
 */
@Repository
public interface DealTypeRepository extends JpaRepository<DealType, Long> {
    
    List<DealType> findByCategory(Category category);
    
    List<DealType> findByCategoryId(Long categoryId);
    
    Optional<DealType> findByNameAndCategory(String name, Category category);
    
    List<DealType> findAllByOrderByNameAsc();
}
