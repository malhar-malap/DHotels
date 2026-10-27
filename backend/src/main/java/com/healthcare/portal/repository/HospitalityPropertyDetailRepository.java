package com.healthcare.portal.repository;

import com.healthcare.portal.entity.HospitalityPropertyDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalityPropertyDetailRepository extends JpaRepository<HospitalityPropertyDetail, Long> {
    Optional<HospitalityPropertyDetail> findByListingId(Long listingId);
    void deleteByListingId(Long listingId);
}
