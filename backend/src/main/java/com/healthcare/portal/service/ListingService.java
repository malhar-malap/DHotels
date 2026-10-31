package com.healthcare.portal.service;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Listing operations
 */
@Service
public class ListingService {
    
    private final ListingRepository listingRepository;
    private final CategoryRepository categoryRepository;
    private final DealTypeRepository dealTypeRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;
    private final ListingImageRepository listingImageRepository;
    private final HospitalityPropertyDetailRepository hospitalityPropertyDetailRepository;
    private final InquiryRepository inquiryRepository;
    private final PaymentRepository paymentRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    @Autowired
    public ListingService(ListingRepository listingRepository, CategoryRepository categoryRepository, DealTypeRepository dealTypeRepository, CityRepository cityRepository, UserRepository userRepository, ListingImageRepository listingImageRepository, HospitalityPropertyDetailRepository hospitalityPropertyDetailRepository, InquiryRepository inquiryRepository, PaymentRepository paymentRepository, AuditLogService auditLogService, EmailService emailService) {
        this.listingRepository = listingRepository;
        this.categoryRepository = categoryRepository;
        this.dealTypeRepository = dealTypeRepository;
        this.cityRepository = cityRepository;
        this.userRepository = userRepository;
        this.listingImageRepository = listingImageRepository;
        this.hospitalityPropertyDetailRepository = hospitalityPropertyDetailRepository;
        this.inquiryRepository = inquiryRepository;
        this.paymentRepository = paymentRepository;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }
    
    public PageResponse<ListingDTO.ListingSummaryResponse> searchListings(ListingDTO.ListingSearchRequest request) {
        Sort sort = Sort.by(
            request.getSortDirection().equalsIgnoreCase("asc") ? 
            Sort.Direction.ASC : Sort.Direction.DESC,
            request.getSortBy()
        );
        
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        
        String keyword = request.getKeyword();
        Boolean isNumericOrCode = false;
        Long numericKeyword = null;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            String trimmed = keyword.trim();
            isNumericOrCode = trimmed.matches("\\d+") || trimmed.matches("[A-Za-z]+\\d+");
            if (trimmed.matches("\\d+")) {
                try {
                    numericKeyword = Long.parseLong(trimmed);
                } catch (NumberFormatException ignored) {}
            }
        }
        
        Page<Listing> listings;
        if (isNumericOrCode) {
            listings = listingRepository.searchListingsByCodeOrId(
                request.getCategoryId(),
                request.getDealTypeId(),
                blankToNull(request.getDealTypeName()),
                request.getCityId(),
                null, // stateId
                request.getCityName(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getIsConfidential(),
                keyword,
                numericKeyword,
                pageable
            );
        } else {
            listings = listingRepository.searchListings(
                request.getCategoryId(),
                request.getDealTypeId(),
                blankToNull(request.getDealTypeName()),
                request.getCityId(),
                null, // stateId
                request.getCityName(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getIsConfidential(),
                keyword,
                pageable
            );
        }
        
        Page<ListingDTO.ListingSummaryResponse> responsePage = listings.map(this::mapToSummaryResponse);
        return PageResponse.from(responsePage);
    }
    
    public ListingDTO.ListingResponse getListingById(Long id) {
        Listing listing = listingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));
        
        // Increment view count
        Integer currentViews = listing.getViewCount();
        listing.setViewCount(currentViews != null ? currentViews + 1 : 1);
        listingRepository.save(listing);
        
        return mapToDetailResponse(listing);
    }
    
    public List<ListingDTO.ListingSummaryResponse> getFeaturedListings() {
        List<Listing> listings = listingRepository.findFeaturedListings(LocalDateTime.now(), 
                PageRequest.of(0, 6));
        return listings.stream().map(this::mapToSummaryResponse).collect(Collectors.toList());
    }
    
    public PageResponse<ListingDTO.ListingSummaryResponse> getListingsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listings = listingRepository.findByCategoryId(categoryId).stream()
                .filter(l -> l.getStatus() == Listing.ListingStatus.ACTIVE)
                .collect(Collectors.toList())
                .stream()
                .collect(Collectors.collectingAndThen(
                    Collectors.toList(),
                    list -> new PageImpl<>(list, pageable, list.size())
                ));
        
        Page<ListingDTO.ListingSummaryResponse> responsePage = listings.map(this::mapToSummaryResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional
    public ListingDTO.ListingResponse createListing(ListingDTO.ListingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        DealType dealType = dealTypeRepository.findById(request.getDealTypeId())
                .orElseThrow(() -> new RuntimeException("Deal type not found"));
        
        validateCategorySpecifics(category, dealType, request);
        
        // City is now a string entered manually and city entity is optional
        
        Listing listing = new Listing();
        listing.setUser(user);
        listing.setCategory(category);
        listing.setDealType(dealType);
        listing.setCityName(request.getCityName());
        listing.setTitle(request.getTitle());
        listing.setShortDescription(request.getShortDescription());
        listing.setDetailedDescription(request.getDetailedDescription());

        listing.setAskingPrice(request.getAskingPrice());
        listing.setPriceNegotiable(request.getPriceNegotiable());
        listing.setIsConfidential(request.getIsConfidential());
        listing.setConfidentialTitle(request.getConfidentialTitle());
        listing.setStatus(Listing.ListingStatus.PENDING);
        listing.setExpiresAt(LocalDateTime.now().plusDays(90));
        
        listing = listingRepository.save(listing);
        
        // Save images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            int order = 0;
            for (String imageUrl : request.getImageUrls()) {
                ListingImage image = new ListingImage();
                image.setListing(listing);
                image.setImageUrl(imageUrl);
                image.setDisplayOrder(order++);
                image.setIsPrimary(order == 1);
                listingImageRepository.save(image);
            }
        }
        
        // Save category-specific details
        saveOrUpdateCategoryDetails(listing, request);
        
        return mapToDetailResponse(listing);
    }
    
    @Transactional
    public ListingDTO.ListingResponse updateListing(Long id, ListingDTO.ListingRequest request, Long userId) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        if (!listing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this listing");
        }
        
        if (request.getTitle() != null) listing.setTitle(request.getTitle());
        if (request.getShortDescription() != null) listing.setShortDescription(request.getShortDescription());
        if (request.getDetailedDescription() != null) listing.setDetailedDescription(request.getDetailedDescription());
        if (request.getAskingPrice() != null) listing.setAskingPrice(request.getAskingPrice());
        if (request.getPriceNegotiable() != null) listing.setPriceNegotiable(request.getPriceNegotiable());
        if (request.getIsConfidential() != null) listing.setIsConfidential(request.getIsConfidential());
        if (request.getConfidentialTitle() != null) listing.setConfidentialTitle(request.getConfidentialTitle());
        if (request.getCityName() != null) listing.setCityName(request.getCityName());

        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            listing.setCategory(category);
        }
        if (request.getDealTypeId() != null) {
            DealType dealType = dealTypeRepository.findById(request.getDealTypeId())
                    .orElseThrow(() -> new RuntimeException("Deal type not found"));
            listing.setDealType(dealType);
        }
        validateCategorySpecifics(listing.getCategory(), listing.getDealType(), request);
        
        listing.setStatus(Listing.ListingStatus.PENDING); // Reset to pending after update
        
        listing = listingRepository.save(listing);
        
        // Update images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            listingImageRepository.deleteByListingId(listing.getId());
            int order = 0;
            for (String imageUrl : request.getImageUrls()) {
                ListingImage image = new ListingImage();
                image.setListing(listing);
                image.setImageUrl(imageUrl);
                image.setDisplayOrder(order++);
                image.setIsPrimary(order == 1);
                listingImageRepository.save(image);
            }
        }
        
        // Update category-specific details
        saveOrUpdateCategoryDetails(listing, request);
        
        return mapToDetailResponse(listing);
    }
    
    @Transactional
    public void deleteListing(Long id, Long userId) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        if (!listing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this listing");
        }
        
        inquiryRepository.deleteByListingId(id);
        paymentRepository.deleteByListingId(id);
        hospitalityPropertyDetailRepository.deleteByListingId(id);
        listingRepository.delete(listing);
    }
    
    public PageResponse<ListingDTO.ListingSummaryResponse> getMyListings(Long userId, int page, int size, Long categoryId, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Long numericKeyword = null;
        if (keyword != null && !keyword.trim().isEmpty()) {
            String trimmed = keyword.trim();
            if (trimmed.matches("\\d+")) {
                try {
                    numericKeyword = Long.parseLong(trimmed);
                } catch (NumberFormatException ignored) {}
            }
        }
        
        Page<Listing> listings = listingRepository.searchMyListings(userId, categoryId, keyword, numericKeyword, pageable);
        
        Page<ListingDTO.ListingSummaryResponse> responsePage = listings.map(this::mapToSummaryResponse);
        return PageResponse.from(responsePage);
    }
    
    // Admin methods
    public PageResponse<ListingDTO.ListingSummaryResponse> getPendingListings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listings = listingRepository.findByStatus(Listing.ListingStatus.PENDING, pageable);
        
        Page<ListingDTO.ListingSummaryResponse> responsePage = listings.map(this::mapToSummaryResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional
    public void approveListing(Long id, String uniqueCode, java.util.List<String> imageUrls) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        listing.setStatus(Listing.ListingStatus.ACTIVE);
        if(uniqueCode != null && !uniqueCode.trim().isEmpty()) {
            listing.setUniqueCode(uniqueCode);
        }
        
        if (imageUrls != null && !imageUrls.isEmpty()) {
            listingImageRepository.deleteByListingId(listing.getId());
            int order = 0;
            for (String imageUrl : imageUrls) {
                ListingImage image = new ListingImage();
                image.setListing(listing);
                image.setImageUrl(imageUrl);
                image.setDisplayOrder(order++);
                image.setIsPrimary(order == 1);
                listingImageRepository.save(image);
            }
        }
        listingRepository.save(listing);
        emailService.sendListingApprovedEmail(listing.getUser().getEmail(), listing.getUser().getFullName(), listing.getTitle());
    }
    
    @Transactional
    public void rejectListing(Long id, String reason) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        listing.setStatus(Listing.ListingStatus.REJECTED);
        listing.setRejectionReason(reason);
        listingRepository.save(listing);
        emailService.sendListingRejectedEmail(listing.getUser().getEmail(), listing.getUser().getFullName(), listing.getTitle(), reason);
    }
    
    @Transactional
    public void featureListing(Long id, int days) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        listing.setIsFeatured(true);
        listing.setFeaturedUntil(LocalDateTime.now().plusDays(days));
        listingRepository.save(listing);
    }
    
    private void saveOrUpdateCategoryDetails(Listing listing, ListingDTO.ListingRequest request) {
        HospitalityPropertyDetail propertyDetail = hospitalityPropertyDetailRepository.findByListingId(listing.getId())
                .orElseGet(HospitalityPropertyDetail::new);
        propertyDetail.setListing(listing);
        // Only keep the fields that apply to the category, so switching category never leaves stale specs
        if (isHotel(listing.getCategory())) {
            propertyDetail.setNumberOfRooms(request.getNumberOfRooms());
            propertyDetail.setPlotAreaSqft(request.getPlotAreaSqft());
            propertyDetail.setConstructedAreaSqft(request.getConstructedAreaSqft());
            propertyDetail.setTitleType(blankToNull(request.getTitleType()));
            propertyDetail.setCarpetAreaSqft(null);
        } else {
            propertyDetail.setNumberOfRooms(null);
            propertyDetail.setPlotAreaSqft(null);
            propertyDetail.setConstructedAreaSqft(null);
            propertyDetail.setTitleType(null);
            propertyDetail.setCarpetAreaSqft(request.getCarpetAreaSqft());
        }
        hospitalityPropertyDetailRepository.save(propertyDetail);
    }
    
    private static boolean isHotel(Category category) {
        return category != null && category.getName() != null
                && category.getName().trim().equalsIgnoreCase("Hotels");
    }
    
    private static String blankToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }
    
    /**
     * Hotels need rooms, plot area and constructed area; every other category needs carpet area.
     * The deal type must also belong to the chosen category (e.g. Profit Sharing is Hotels-only).
     */
    private void validateCategorySpecifics(Category category, DealType dealType, ListingDTO.ListingRequest request) {
        if (dealType.getCategory() != null && !dealType.getCategory().getId().equals(category.getId())) {
            throw new IllegalArgumentException("Deal type '" + dealType.getName() + "' is not available for " + category.getName());
        }
        if (isHotel(category)) {
            if (request.getNumberOfRooms() == null || request.getNumberOfRooms() < 1) {
                throw new IllegalArgumentException("Number of rooms is required for hotels");
            }
            if (request.getPlotAreaSqft() == null || request.getPlotAreaSqft().signum() <= 0) {
                throw new IllegalArgumentException("Plot area is required for hotels");
            }
            if (request.getConstructedAreaSqft() == null || request.getConstructedAreaSqft().signum() <= 0) {
                throw new IllegalArgumentException("Constructed area is required for hotels");
            }
        } else if (request.getCarpetAreaSqft() == null || request.getCarpetAreaSqft().signum() <= 0) {
            throw new IllegalArgumentException("Carpet area is required for " + category.getName());
        }
    }
    
    private ListingDTO.ListingSummaryResponse mapToSummaryResponse(Listing listing) {
        ListingDTO.ListingSummaryResponse response = new ListingDTO.ListingSummaryResponse();
        response.setId(listing.getId());
        response.setUniqueCode(listing.getUniqueCode());
        response.setDisplayTitle(listing.getDisplayTitle());
        response.setShortDescription(listing.getShortDescription());
        response.setAskingPrice(listing.getAskingPrice());
        response.setPriceNegotiable(listing.getPriceNegotiable());
        response.setIsConfidential(listing.getIsConfidential());
        response.setStatus(listing.getStatus().name());
        response.setCategoryName(listing.getCategory().getName());
        response.setDealType(listing.getDealType().getName());
        response.setCityName(listing.getCityName());
        
        if (listing.getCity() != null && listing.getCity().getState() != null) {
            response.setStateName(listing.getCity().getState().getName());
        }
        
        response.setCreatedAt(listing.getCreatedAt());
        
        // Get primary image
        ListingImage primaryImage = listingImageRepository.findPrimaryImageByListingId(listing.getId());
        if (primaryImage != null) {
            response.setPrimaryImage(primaryImage.getImageUrl());
        }
        
        response.setViewCount(listing.getViewCount());
        
        // Category specific details
        hospitalityPropertyDetailRepository.findByListingId(listing.getId())
                .ifPresent(response::setCategoryDetails);
        
        return response;
    }
    
    private ListingDTO.ListingResponse mapToDetailResponse(Listing listing) {
        ListingDTO.ListingResponse response = new ListingDTO.ListingResponse();
        response.setId(listing.getId());
        response.setUniqueCode(listing.getUniqueCode());
        response.setTitle(listing.getTitle());
        response.setDisplayTitle(listing.getDisplayTitle());
        response.setShortDescription(listing.getShortDescription());
        response.setDetailedDescription(listing.getDetailedDescription());
        response.setAskingPrice(listing.getAskingPrice());
        response.setPriceNegotiable(listing.getPriceNegotiable());
        response.setIsConfidential(listing.getIsConfidential());
        response.setStatus(listing.getStatus().name());
        response.setRejectionReason(listing.getRejectionReason());
        response.setViewCount(listing.getViewCount());
        response.setInquiryCount(listing.getInquiryCount());
        response.setIsFeatured(listing.getIsFeatured());
        response.setCreatedAt(listing.getCreatedAt());
        response.setUpdatedAt(listing.getUpdatedAt());
        response.setExpiresAt(listing.getExpiresAt());
        
        // Category
        ListingDTO.CategoryDTO categoryDTO = new ListingDTO.CategoryDTO();
        categoryDTO.setId(listing.getCategory().getId());
        categoryDTO.setName(listing.getCategory().getName());
        categoryDTO.setDescription(listing.getCategory().getDescription());
        categoryDTO.setIcon(listing.getCategory().getIcon());
        response.setCategory(categoryDTO);
        
        // Deal Type
        ListingDTO.DealTypeDTO dealTypeDTO = new ListingDTO.DealTypeDTO();
        dealTypeDTO.setId(listing.getDealType().getId());
        dealTypeDTO.setName(listing.getDealType().getName());
        response.setDealType(dealTypeDTO);
        
        // City & State
        response.setCityName(listing.getCityName());
        if (listing.getCity() != null && listing.getCity().getState() != null) {
            response.setStateName(listing.getCity().getState().getName());
        }
        

        
        // Images
        List<ListingImage> images = listingImageRepository.findByListingIdOrderByDisplayOrderAsc(listing.getId());
        List<String> imageUrls = images.stream()
                .map(ListingImage::getImageUrl)
                .collect(Collectors.toList());
        response.setImages(imageUrls);
        
        // Seller info (hide for confidential listings)
        if (!Boolean.TRUE.equals(listing.getIsConfidential())) {
            ListingDTO.SellerInfo sellerInfo = new ListingDTO.SellerInfo();
            sellerInfo.setId(listing.getUser().getId());
            sellerInfo.setFullName(listing.getUser().getFullName());
            sellerInfo.setEmail(listing.getUser().getEmail());
            sellerInfo.setMobileNumber(listing.getUser().getMobileNumber());
            sellerInfo.setCompanyName(listing.getUser().getCompanyName());
            response.setSeller(sellerInfo);
        }
        
        // Category specific details
        hospitalityPropertyDetailRepository.findByListingId(listing.getId())
                .ifPresent(response::setCategoryDetails);
        
        return response;
    }

    @Transactional
    public void closeListing(Long id, Long sellerId, String reason) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        // Ensure the listing belongs to the current user
        if (!listing.getUser().getId().equals(sellerId)) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to close this listing.");
        }

        if (listing.getStatus() != Listing.ListingStatus.ACTIVE) {
            throw new IllegalStateException("Only active listings can be closed.");
        }

        listing.setStatus(Listing.ListingStatus.WITHDRAWN);
        listingRepository.save(listing);

        AuditLog log = new AuditLog();
        log.setUserId(listing.getUser().getId());
        log.setAction("CLOSE_OWN_LISTING");
        log.setEntityType("Listing");
        log.setEntityId(id);
        log.setActorName(listing.getUser().getFullName());
        log.setTargetName(listing.getTitle());
        log.setDetails("Reason: " + reason);
        auditLogService.saveLogAsync(log);
    }
}
