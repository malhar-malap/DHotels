package com.healthcare.portal.service;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
    private final UserRoleRepository userRoleRepository;

    private final NotificationService notificationService;

    @Value("${app.notification-email}")
    private String adminInbox;

    @Autowired
    public ListingService(ListingRepository listingRepository, CategoryRepository categoryRepository, DealTypeRepository dealTypeRepository, CityRepository cityRepository, UserRepository userRepository, ListingImageRepository listingImageRepository, HospitalityPropertyDetailRepository hospitalityPropertyDetailRepository, InquiryRepository inquiryRepository, PaymentRepository paymentRepository, AuditLogService auditLogService, EmailService emailService, UserRoleRepository userRoleRepository, NotificationService notificationService) {
        this.notificationService = notificationService;
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
        this.userRoleRepository = userRoleRepository;
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
    
    private static final java.util.Set<Listing.ListingStatus> NON_PUBLIC_STATUSES = java.util.EnumSet.of(
            Listing.ListingStatus.PENDING, Listing.ListingStatus.REJECTED, Listing.ListingStatus.WITHDRAWN);

    public ListingDTO.ListingResponse getListingById(Long id) {
        Listing listing = listingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));
        
        // Increment view count
        Integer currentViews = listing.getViewCount();
        listing.setViewCount(currentViews != null ? currentViews + 1 : 1);
        listingRepository.save(listing);
        
        return mapToDetailResponse(listing);
    }
    
    /**
     * Public detail view. Seller contact details are only included for the owner, admins and
     * buyers who paid for contact access; confidential listings keep their real title hidden.
     */
    public ListingDTO.ListingResponse getListingById(Long id, User viewer) {
        Listing stored = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));
        boolean isAdmin = viewer != null && viewer.isAdmin();
        boolean ownsStored = viewer != null && stored.getUser() != null && viewer.getId().equals(stored.getUser().getId());
        // Listings awaiting approval, rejected or withdrawn are only visible to their owner and admins
        if (NON_PUBLIC_STATUSES.contains(stored.getStatus()) && !(ownsStored || isAdmin)) {
            throw new RuntimeException("Listing not found with id: " + id);
        }
        ListingDTO.ListingResponse response = getListingById(id);
        boolean isOwner = viewer != null && response.getSeller() != null && viewer.getId().equals(response.getSeller().getId());
        boolean hasPaid = viewer != null && paymentRepository.existsByBuyerIdAndListingIdAndStatus(
                viewer.getId(), id, Payment.PaymentStatus.PAID);

        boolean confidential = Boolean.TRUE.equals(response.getIsConfidential());
        if (response.getSeller() != null && !(isOwner || isAdmin || (hasPaid && !confidential))) {
            // Keep only the id so the page can tell owners apart; contact details stay behind the paywall
            ListingDTO.SellerInfo idOnly = new ListingDTO.SellerInfo();
            idOnly.setId(response.getSeller().getId());
            response.setSeller(idOnly);
        }
        if (confidential && !(isOwner || isAdmin)) {
            response.setTitle(response.getDisplayTitle());
        }
        return response;
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

        applyPrice(listing, request);
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

        notificationService.notifyAdmins(NotificationService.LISTING_PENDING, "New listing awaiting approval",
                "\"" + listing.getTitle() + "\" was submitted by " + user.getFullName() + ".", "/admin/listings?status=PENDING");
        
        return mapToDetailResponse(listing);
    }
    
    /**
     * Owner edit: the listing goes back to PENDING for re-verification.
     */
    @Transactional
    public ListingDTO.ListingResponse updateListing(Long id, ListingDTO.ListingRequest request, Long userId) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        if (!listing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this listing");
        }
        
        return applyUpdate(listing, request, true);
    }

    /**
     * Admin edit: the listing keeps its current status (an ACTIVE listing stays live)
     * and its unique code and images are left untouched.
     */
    @Transactional
    public ListingDTO.ListingResponse updateListingAsAdmin(Long id, ListingDTO.ListingRequest request) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        return applyUpdate(listing, request, false);
    }

    private ListingDTO.ListingResponse applyUpdate(Listing listing, ListingDTO.ListingRequest request, boolean resetToPending) {
        if (request.getTitle() != null) listing.setTitle(request.getTitle());
        if (request.getShortDescription() != null) listing.setShortDescription(request.getShortDescription());
        if (request.getDetailedDescription() != null) listing.setDetailedDescription(request.getDetailedDescription());
        applyPrice(listing, request);
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
        
        if (resetToPending) {
            listing.setStatus(Listing.ListingStatus.PENDING); // Owner edits need re-verification
            notificationService.notifyAdmins(NotificationService.LISTING_PENDING, "Edited listing needs re-verification",
                    "\"" + listing.getTitle() + "\" was edited by its owner.", "/admin/listings?status=PENDING");
        }
        
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
    public void deleteListing(Long id, Long userId, String reason) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        if (!listing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this listing");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Please provide a reason for deleting this listing");
        }
        
        inquiryRepository.deleteByListingId(id);
        paymentRepository.deleteByListingId(id);
        hospitalityPropertyDetailRepository.deleteByListingId(id);
        listingRepository.delete(listing);

        User owner = listing.getUser();
        for (String adminEmail : getAdminNotificationEmails()) {
            emailService.sendListingDeletedByOwnerEmail(adminEmail, owner.getFullName(), owner.getEmail(),
                    id, listing.getUniqueCode(), listing.getTitle(), reason.trim());
        }

        notificationService.notifyAdmins(NotificationService.LISTING_DELETED, "Listing deleted by its owner",
                owner.getFullName() + " deleted \"" + listing.getTitle() + "\". Reason: " + reason.trim(), "/admin/listings");
        notificationService.notify(owner, NotificationService.LISTING_DELETED, "Listing deleted",
                "You deleted \"" + listing.getTitle() + "\". Our team has been informed of your reason.", "/dashboard/listings");

        AuditLog log = new AuditLog();
        log.setUserId(owner.getId());
        log.setAction("DELETE_OWN_LISTING");
        log.setEntityType("Listing");
        log.setEntityId(id);
        log.setActorName(owner.getFullName());
        log.setTargetName(listing.getTitle());
        log.setDetails("Reason: " + reason.trim());
        auditLogService.saveLogAsync(log);
    }

    /** The shared admin inbox (also used for contact/consultation alerts) plus every ADMIN user. */
    private java.util.Set<String> getAdminNotificationEmails() {
        java.util.Set<String> emails = new java.util.LinkedHashSet<>();
        emails.add(adminInbox);
        userRoleRepository.findByRole(UserRole.Role.ADMIN).stream()
                .map(role -> role.getUser().getEmail())
                .filter(email -> email != null && !email.isBlank())
                .forEach(emails::add);
        return emails;
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
        if (uniqueCode == null || uniqueCode.trim().isEmpty()) {
            throw new RuntimeException("A unique code is required to approve a listing");
        }
        listing.setStatus(Listing.ListingStatus.ACTIVE);
        listing.setUniqueCode(uniqueCode.trim());
        
        // Approval always publishes a representative image; the admin only supplies the code
        if (imageUrls == null || imageUrls.isEmpty()) {
            imageUrls = List.of(pickSampleImage(listing));
        }
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
        listingRepository.save(listing);
        emailService.sendListingApprovedEmail(listing.getUser().getEmail(), listing.getUser().getFullName(), listing.getTitle());
        notificationService.notify(listing.getUser(), NotificationService.LISTING_APPROVED, "Your listing is live",
                "\"" + listing.getTitle() + "\" was approved and is now visible on the marketplace.", "/listings/" + listing.getId());
    }
    
    @Transactional
    public void rejectListing(Long id, String reason) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        listing.setStatus(Listing.ListingStatus.REJECTED);
        listing.setRejectionReason(reason);
        listingRepository.save(listing);
        emailService.sendListingRejectedEmail(listing.getUser().getEmail(), listing.getUser().getFullName(), listing.getTitle(), reason);
        notificationService.notify(listing.getUser(), NotificationService.LISTING_REJECTED, "Your listing was not approved",
                "\"" + listing.getTitle() + "\" was rejected" + (reason != null && !reason.isBlank() ? ": " + reason : "."), "/dashboard/listings");
    }
    
    static final int MAX_FEATURE_DAYS = 60;
    private static final java.time.format.DateTimeFormatter FEATURE_DATE =
            java.time.format.DateTimeFormatter.ofPattern("d MMM yyyy", java.util.Locale.ENGLISH);

    /**
     * Features an active listing on the homepage for `days` days starting now; featuredUntil is the
     * exact expiry (the homepage query hides it from then on). Re-featuring restarts the window.
     */
    @Transactional
    public void featureListing(Long id, int days) {
        if (days < 1 || days > MAX_FEATURE_DAYS) {
            throw new RuntimeException("Featured duration must be between 1 and " + MAX_FEATURE_DAYS + " days");
        }
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        if (listing.getStatus() != Listing.ListingStatus.ACTIVE) {
            throw new RuntimeException("Only active listings can be featured");
        }
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime until = start.plusDays(days);
        listing.setIsFeatured(true);
        listing.setFeaturedUntil(until);
        listingRepository.save(listing);

        notificationService.notify(listing.getUser(), NotificationService.LISTING_FEATURED, "Your listing is featured on the homepage",
                "\"" + listing.getTitle() + "\" is featured on the homepage for " + days + (days == 1 ? " day" : " days")
                        + " from " + start.format(FEATURE_DATE) + " (until " + until.format(FEATURE_DATE) + ").",
                "/listings/" + listing.getId());
    }

    /** Hourly: clear the featured flag once the window has passed so admin views stop showing it. */
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 5 * * * *")
    @Transactional
    public void clearExpiredFeatures() {
        listingRepository.clearExpiredFeatures(LocalDateTime.now());
    }
    
    private static boolean isCurrentlyFeatured(Listing listing) {
        return Boolean.TRUE.equals(listing.getIsFeatured())
                && (listing.getFeaturedUntil() == null || listing.getFeaturedUntil().isAfter(LocalDateTime.now()));
    }

    /** Price is required unless the seller chose not to disclose it, in which case none is stored. */
    private void applyPrice(Listing listing, ListingDTO.ListingRequest request) {
        if (request.getPriceNotDisclosed() != null) {
            listing.setPriceNotDisclosed(request.getPriceNotDisclosed());
        }
        if (Boolean.TRUE.equals(listing.getPriceNotDisclosed())) {
            listing.setAskingPrice(null);
        } else if (request.getAskingPrice() != null) {
            listing.setAskingPrice(request.getAskingPrice());
        }
        if (!Boolean.TRUE.equals(listing.getPriceNotDisclosed()) && listing.getAskingPrice() == null) {
            throw new RuntimeException("Asking price is required unless the price is not to be disclosed");
        }
    }

    // Representative photos per category, the same pictures as the category tiles on the site
    // (frontend/src/utils/hospitality.js). The frontend marks them "for representation purpose only".
    static final String SAMPLE_IMAGE_BASE = "https://images.unsplash.com/";
    static final String SAMPLE_IMAGE_PARAMS = "?auto=format&fit=crop&q=70&w=1400";
    private static final java.util.Map<String, String> SAMPLE_IMAGES = java.util.Map.of(
            "hotels", "photo-1566073771259-6a8506099945",
            "resorts", "photo-1582719508461-905c673771fd",
            "restaurants", "photo-1517248135467-4c7edcad34c4",
            "restaurants and bar", "photo-1514933651103-005eec06c04b",
            "cafe", "photo-1554118811-1e0d58224f24",
            "banquet halls", "photo-1519167758481-83f550bb49b3");

    static String pickSampleImage(Listing listing) {
        String categoryName = listing.getCategory() != null && listing.getCategory().getName() != null
                ? listing.getCategory().getName().trim().toLowerCase() : "";
        return SAMPLE_IMAGE_BASE + SAMPLE_IMAGES.getOrDefault(categoryName, SAMPLE_IMAGES.get("hotels")) + SAMPLE_IMAGE_PARAMS;
    }

    private static String normalizeAreaUnit(String unit) {
        return "ACRE".equalsIgnoreCase(unit) ? "ACRE" : "SQFT";
    }

    private void saveOrUpdateCategoryDetails(Listing listing, ListingDTO.ListingRequest request) {
        HospitalityPropertyDetail propertyDetail = hospitalityPropertyDetailRepository.findByListingId(listing.getId())
                .orElseGet(HospitalityPropertyDetail::new);
        propertyDetail.setListing(listing);
        // Only keep the fields that apply to the category, so switching category never leaves stale specs
        if (isHotel(listing.getCategory())) {
            propertyDetail.setNumberOfRooms(request.getNumberOfRooms());
            propertyDetail.setPlotAreaSqft(request.getPlotAreaSqft());
            propertyDetail.setPlotAreaUnit(normalizeAreaUnit(request.getPlotAreaUnit()));
            propertyDetail.setConstructedAreaSqft(request.getConstructedAreaSqft());
            propertyDetail.setTitleType(blankToNull(request.getTitleType()));
            propertyDetail.setCarpetAreaSqft(null);
        } else {
            propertyDetail.setNumberOfRooms(null);
            propertyDetail.setPlotAreaSqft(null);
            propertyDetail.setPlotAreaUnit(null);
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
            throw new RuntimeException("Deal type '" + dealType.getName() + "' is not available for " + category.getName());
        }
        if (isHotel(category)) {
            if (request.getNumberOfRooms() == null || request.getNumberOfRooms() < 1) {
                throw new RuntimeException("Number of rooms is required for hotels");
            }
            if (request.getPlotAreaSqft() == null || request.getPlotAreaSqft().signum() <= 0) {
                throw new RuntimeException("Plot area is required for hotels");
            }
            if (request.getConstructedAreaSqft() == null || request.getConstructedAreaSqft().signum() <= 0) {
                throw new RuntimeException("Constructed area is required for hotels");
            }
        } else if (request.getCarpetAreaSqft() == null || request.getCarpetAreaSqft().signum() <= 0) {
            throw new RuntimeException("Carpet area is required for " + category.getName());
        }
    }
    
    private ListingDTO.ListingSummaryResponse mapToSummaryResponse(Listing listing) {
        ListingDTO.ListingSummaryResponse response = new ListingDTO.ListingSummaryResponse();
        response.setId(listing.getId());
        response.setUniqueCode(listing.getUniqueCode());
        response.setDisplayTitle(listing.getDisplayTitle());
        response.setShortDescription(listing.getShortDescription());
        response.setAskingPrice(listing.getAskingPrice());
        response.setPriceNotDisclosed(Boolean.TRUE.equals(listing.getPriceNotDisclosed()));
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
        response.setPriceNotDisclosed(Boolean.TRUE.equals(listing.getPriceNotDisclosed()));
        response.setPriceNegotiable(listing.getPriceNegotiable());
        response.setIsConfidential(listing.getIsConfidential());
        response.setStatus(listing.getStatus().name());
        response.setRejectionReason(listing.getRejectionReason());
        response.setViewCount(listing.getViewCount());
        response.setInquiryCount(listing.getInquiryCount());
        response.setIsFeatured(isCurrentlyFeatured(listing));
        response.setFeaturedUntil(isCurrentlyFeatured(listing) ? listing.getFeaturedUntil() : null);
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
        
        // Seller info; the public detail view (getListingById(id, viewer)) redacts it for other users
        ListingDTO.SellerInfo sellerInfo = new ListingDTO.SellerInfo();
        sellerInfo.setId(listing.getUser().getId());
        sellerInfo.setFullName(listing.getUser().getFullName());
        sellerInfo.setEmail(listing.getUser().getEmail());
        sellerInfo.setMobileNumber(listing.getUser().getMobileNumber());
        sellerInfo.setCompanyName(listing.getUser().getCompanyName());
        response.setSeller(sellerInfo);
        
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
