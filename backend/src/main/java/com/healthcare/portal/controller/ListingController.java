package com.healthcare.portal.controller;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.service.AuthService;
import com.healthcare.portal.service.ListingService;
import com.healthcare.portal.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import jakarta.validation.Valid;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/listings")
@Tag(name = "Listings", description = "Marketplace listing management APIs")
public class ListingController {
    
    private final ListingService listingService;
    private final AuthService authService;
    private final FileStorageService fileStorageService;

    @Autowired
    public ListingController(ListingService listingService, AuthService authService, FileStorageService fileStorageService) {
        this.listingService = listingService;
        this.authService = authService;
        this.fileStorageService = fileStorageService;
    }
    
    @GetMapping
    @Operation(summary = "Search listings", description = "Search and filter marketplace listings")
    public ResponseEntity<ApiResponse<PageResponse<ListingDTO.ListingSummaryResponse>>> searchListings(
            @ModelAttribute ListingDTO.ListingSearchRequest request) {
        PageResponse<ListingDTO.ListingSummaryResponse> response = listingService.searchListings(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/featured")
    @Operation(summary = "Get featured listings", description = "Returns featured listings for homepage")
    public ResponseEntity<ApiResponse<List<ListingDTO.ListingSummaryResponse>>> getFeaturedListings() {
        List<ListingDTO.ListingSummaryResponse> listings = listingService.getFeaturedListings();
        return ResponseEntity.ok(ApiResponse.success(listings));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get listing by ID", description = "Returns detailed listing information")
    public ResponseEntity<ApiResponse<ListingDTO.ListingResponse>> getListingById(@PathVariable Long id) {
        ListingDTO.ListingResponse listing = listingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success(listing));
    }
    
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get listings by category", description = "Returns listings filtered by category")
    public ResponseEntity<ApiResponse<PageResponse<ListingDTO.ListingSummaryResponse>>> getListingsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ListingDTO.ListingSummaryResponse> response = 
                listingService.getListingsByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/my")
    @Operation(summary = "Get my listings", description = "Returns listings created by the current user")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<PageResponse<ListingDTO.ListingSummaryResponse>>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        User currentUser = authService.getCurrentUserEntity();
        PageResponse<ListingDTO.ListingSummaryResponse> response = 
                listingService.getMyListings(currentUser.getId(), page, size, categoryId, keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @Operation(summary = "Create listing", description = "Creates a new marketplace listing")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<ListingDTO.ListingResponse>> createListing(
            @Valid @RequestBody ListingDTO.ListingRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        ListingDTO.ListingResponse response = listingService.createListing(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Listing created successfully", response));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update listing", description = "Updates an existing listing")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<ListingDTO.ListingResponse>> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody ListingDTO.ListingRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        ListingDTO.ListingResponse response = listingService.updateListing(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete listing", description = "Deletes a listing")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable Long id) {
        User currentUser = authService.getCurrentUserEntity();
        listingService.deleteListing(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully", null));
    }
    
    @PostMapping("/{id}/close")
    @Operation(summary = "Close listing", description = "Closes a listing with a reason")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Void>> closeListing(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        User currentUser = authService.getCurrentUserEntity();
        String reason = payload.getOrDefault("reason", "No reason provided");
        listingService.closeListing(id, currentUser.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Listing closed successfully", null));
    }

    @PostMapping("/media/upload")
    @Operation(summary = "Upload a listing image", description = "Uploads a single image for a listing")
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileDownloadUri));
    }

    @PostMapping("/media/upload-multiple")
    @Operation(summary = "Upload multiple listing images", description = "Uploads multiple images for a listing")
    public ResponseEntity<ApiResponse<List<String>>> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
        List<String> fileUrls = Arrays.asList(files)
                .stream()
                .map(file -> {
                    String fileName = fileStorageService.storeFile(file);
                    return ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/uploads/")
                            .path(fileName)
                            .toUriString();
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", fileUrls));
    }
}
