package com.healthcare.portal.repository;

import com.healthcare.portal.entity.City;
import com.healthcare.portal.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for City entity
 */
@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    
    List<City> findByState(State state);
    
    List<City> findByStateId(Long stateId);
    
    Optional<City> findByNameAndState(String name, State state);
    
    List<City> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT c FROM City c JOIN FETCH c.state WHERE c.state.id = :stateId ORDER BY c.name")
    List<City> findByStateIdWithState(@Param("stateId") Long stateId);
    
    @Query("SELECT c FROM City c JOIN FETCH c.state ORDER BY c.state.name, c.name")
    List<City> findAllWithState();
    
    @Query("SELECT c FROM City c JOIN FETCH c.state WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY c.name")
    List<City> searchByName(@Param("name") String name);
}
