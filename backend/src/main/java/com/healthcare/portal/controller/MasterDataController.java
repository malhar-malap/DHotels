package com.healthcare.portal.controller;

import com.healthcare.portal.dto.ApiResponse;
import com.healthcare.portal.dto.ListingDTO;
import com.healthcare.portal.dto.JobDTO;
import com.healthcare.portal.entity.City;
import com.healthcare.portal.entity.State;
import com.healthcare.portal.service.MasterDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/master")
@Tag(name = "Master Data", description = "Master data APIs for dropdowns and filters")
public class MasterDataController {
    
    private final MasterDataService masterDataService;

    @Autowired
    public MasterDataController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }
    
    @GetMapping("/states")
    @Operation(summary = "Get all states", description = "Returns list of all Indian states")
    public ResponseEntity<ApiResponse<List<State>>> getAllStates() {
        List<State> states = masterDataService.getAllStates();
        return ResponseEntity.ok(ApiResponse.success(states));
    }
    
    @GetMapping("/cities")
    @Operation(summary = "Get all cities", description = "Returns list of all cities with state info")
    public ResponseEntity<ApiResponse<List<City>>> getAllCities() {
        List<City> cities = masterDataService.getAllCities();
        return ResponseEntity.ok(ApiResponse.success(cities));
    }

    @GetMapping("/cities/with-listings")
    @Operation(summary = "Get cities with active listings", description = "Returns list of cities that have at least one active listing")
    public ResponseEntity<ApiResponse<List<City>>> getCitiesWithListings() {
        List<City> cities = masterDataService.getCitiesWithListings();
        return ResponseEntity.ok(ApiResponse.success(cities));
    }
    
    @GetMapping("/states/{stateId}/cities")
    @Operation(summary = "Get cities by state", description = "Returns cities filtered by state")
    public ResponseEntity<ApiResponse<List<City>>> getCitiesByState(@PathVariable Long stateId) {
        List<City> cities = masterDataService.getCitiesByState(stateId);
        return ResponseEntity.ok(ApiResponse.success(cities));
    }
    
    @GetMapping("/cities/search")
    @Operation(summary = "Search cities", description = "Search cities by name")
    public ResponseEntity<ApiResponse<List<City>>> searchCities(@RequestParam String name) {
        List<City> cities = masterDataService.searchCities(name);
        return ResponseEntity.ok(ApiResponse.success(cities));
    }
    
    @GetMapping("/categories")
    @Operation(summary = "Get all categories", description = "Returns list of listing categories")
    public ResponseEntity<ApiResponse<List<ListingDTO.CategoryDTO>>> getAllCategories() {
        List<ListingDTO.CategoryDTO> categories = masterDataService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
    
    @GetMapping("/categories/{categoryId}/deal-types")
    @Operation(summary = "Get deal types by category", description = "Returns deal types for a category")
    public ResponseEntity<ApiResponse<List<ListingDTO.DealTypeDTO>>> getDealTypesByCategory(
            @PathVariable Long categoryId) {
        List<ListingDTO.DealTypeDTO> dealTypes = masterDataService.getDealTypesByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(dealTypes));
    }
    
    @GetMapping("/job-categories")
    @Operation(summary = "Get all job categories", description = "Returns list of job categories")
    public ResponseEntity<ApiResponse<List<JobDTO.JobCategoryDTO>>> getAllJobCategories() {
        List<JobDTO.JobCategoryDTO> categories = masterDataService.getAllJobCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
    
    @GetMapping("/equipment-types")
    @Operation(summary = "Get all equipment types", description = "Returns list of equipment types")
    public ResponseEntity<ApiResponse<List<Object>>> getAllEquipmentTypes() {
        return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList()));
    }
    
    @GetMapping("/hospital-types")
    @Operation(summary = "Get all hospital types", description = "Returns list of hospital types")
    public ResponseEntity<ApiResponse<List<Object>>> getAllHospitalTypes() {
        return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList()));
    }
}
