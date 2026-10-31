package com.healthcare.portal.service;

import com.healthcare.portal.dto.ListingDTO;
import com.healthcare.portal.dto.JobDTO;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Objects;
import java.util.Comparator;
import java.util.stream.Collectors;

/**
 * Service class for Master Data operations
 */
@Service
public class MasterDataService {
    
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final CategoryRepository categoryRepository;
    private final DealTypeRepository dealTypeRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final ListingRepository listingRepository;

    @Autowired
    public MasterDataService(StateRepository stateRepository, CityRepository cityRepository, CategoryRepository categoryRepository, DealTypeRepository dealTypeRepository, JobCategoryRepository jobCategoryRepository, ListingRepository listingRepository) {
        this.stateRepository = stateRepository;
        this.cityRepository = cityRepository;
        this.categoryRepository = categoryRepository;
        this.dealTypeRepository = dealTypeRepository;
        this.jobCategoryRepository = jobCategoryRepository;
        this.listingRepository = listingRepository;
    }
    
    public List<State> getAllStates() {
        return stateRepository.findAllByOrderByNameAsc();
    }
    
    public List<City> getAllCities() {
        return cityRepository.findAllWithState();
    }
    
    public List<City> getCitiesByState(Long stateId) {
        return cityRepository.findByStateIdWithState(stateId);
    }
    
    public List<City> searchCities(String name) {
        return cityRepository.searchByName(name);
    }
    
    public List<City> getCitiesWithListings() {
        return listingRepository.findByStatus(Listing.ListingStatus.ACTIVE).stream()
                .map(Listing::getCity)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.comparing(City::getName))
                .collect(Collectors.toList());
    }
    
    public List<ListingDTO.CategoryDTO> getAllCategories() {
        return categoryRepository.findAllWithDealTypes().stream()
                .map(this::mapToCategoryDTO)
                .collect(Collectors.toList());
    }
    
    public List<ListingDTO.DealTypeDTO> getDealTypesByCategory(Long categoryId) {
        return dealTypeRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToDealTypeDTO)
                .collect(Collectors.toList());
    }
    
    public List<JobDTO.JobCategoryDTO> getAllJobCategories() {
        return jobCategoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToJobCategoryDTO)
                .collect(Collectors.toList());
    }
    
    private ListingDTO.CategoryDTO mapToCategoryDTO(Category category) {
        ListingDTO.CategoryDTO dto = new ListingDTO.CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setIcon(category.getIcon());
        return dto;
    }
    
    private ListingDTO.DealTypeDTO mapToDealTypeDTO(DealType dealType) {
        ListingDTO.DealTypeDTO dto = new ListingDTO.DealTypeDTO();
        dto.setId(dealType.getId());
        dto.setName(dealType.getName());
        return dto;
    }
    
    private JobDTO.JobCategoryDTO mapToJobCategoryDTO(JobCategory category) {
        JobDTO.JobCategoryDTO dto = new JobDTO.JobCategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        return dto;
    }
}
