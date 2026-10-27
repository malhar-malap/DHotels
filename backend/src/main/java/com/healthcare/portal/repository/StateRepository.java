package com.healthcare.portal.repository;

import com.healthcare.portal.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for State entity
 */
@Repository
public interface StateRepository extends JpaRepository<State, Long> {
    
    Optional<State> findByCode(String code);
    
    Optional<State> findByName(String name);
    
    List<State> findAllByOrderByNameAsc();
}
