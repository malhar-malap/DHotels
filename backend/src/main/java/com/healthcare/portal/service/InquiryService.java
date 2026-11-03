package com.healthcare.portal.service;

import com.healthcare.portal.dto.*;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Inquiry operations
 */
@Service
public class InquiryService {
    
    private final InquiryRepository inquiryRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;


    @Autowired
    public InquiryService(InquiryRepository inquiryRepository, ListingRepository listingRepository, UserRepository userRepository, EmailService emailService, PaymentRepository paymentRepository, NotificationService notificationService) {
        this.notificationService = notificationService;
        this.inquiryRepository = inquiryRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.paymentRepository = paymentRepository;
    }
    
    @Transactional
    public InquiryDTO.InquiryResponse createInquiry(Long listingId, Long buyerId, InquiryDTO.InquiryRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User seller = listing.getUser();
        
        // Check if confidential and buyer is verified
        if (Boolean.TRUE.equals(listing.getIsConfidential()) && !Boolean.TRUE.equals(buyer.getIsVerifiedBuyer())) {
            throw new RuntimeException("Buyer verification required for confidential listings");
        }
        
        Inquiry inquiry = new Inquiry();
        inquiry.setListing(listing);
        inquiry.setBuyer(buyer);
        inquiry.setSeller(seller);
        inquiry.setBuyerName(request.getBuyerName());
        inquiry.setBuyerEmail(request.getBuyerEmail());
        inquiry.setBuyerPhone(request.getBuyerPhone());
        inquiry.setMessage(request.getMessage());
        inquiry.setStatus(Inquiry.InquiryStatus.NEW);
        
        inquiry = inquiryRepository.save(inquiry);
        
        // Increment inquiry count on listing
        listing.setInquiryCount(listing.getInquiryCount() + 1);
        listingRepository.save(listing);
        
        // Send email notification to seller
        emailService.sendInquiryNotificationToSeller(
            seller.getEmail(),
            seller.getFullName(),
            request.getBuyerName(),
            request.getBuyerEmail(),
            request.getBuyerPhone(),
            request.getMessage(),
            listing.getDisplayTitle()
        );
        notificationService.notify(seller, NotificationService.INQUIRY_RECEIVED, "New inquiry",
                buyer.getFullName() + " sent an inquiry about \"" + listing.getDisplayTitle() + "\".", "/dashboard/inquiries");
        
        return mapToResponse(inquiry);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<InquiryDTO.InquiryResponse> getInquiriesForSeller(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Inquiry> inquiries = inquiryRepository.findBySellerId(sellerId, pageable);
        
        Page<InquiryDTO.InquiryResponse> responsePage = inquiries.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<InquiryDTO.InquiryResponse> getInquiriesForBuyer(Long buyerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Inquiry> inquiries = inquiryRepository.findByBuyerId(buyerId, pageable);
        
        Page<InquiryDTO.InquiryResponse> responsePage = inquiries.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }
    
    @Transactional(readOnly = true)
    /** Buyer, seller and admins may view an inquiry; others get "not found" so ids can't be probed. */
    public InquiryDTO.InquiryResponse getInquiryById(Long id, User viewer) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .filter(i -> viewer.isAdmin() || isParty(i.getBuyer(), viewer) || isParty(i.getSeller(), viewer))
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
        
        return mapToResponse(inquiry);
    }
    
    @Transactional
    public void updateInquiryStatus(Long id, String status, User viewer) {
        Inquiry inquiry = findForSeller(id, viewer);
        
        inquiry.setStatus(Inquiry.InquiryStatus.valueOf(status.toUpperCase()));
        inquiryRepository.save(inquiry);
    }
    
    @Transactional
    public void markAsRead(Long id, User viewer) {
        Inquiry inquiry = findForSeller(id, viewer);
        
        inquiry.setStatus(Inquiry.InquiryStatus.READ);
        inquiryRepository.save(inquiry);
    }

    /** Only the receiving seller (or an admin) manages an inquiry's status. */
    private Inquiry findForSeller(Long id, User viewer) {
        return inquiryRepository.findById(id)
                .filter(i -> viewer.isAdmin() || isParty(i.getSeller(), viewer))
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
    }

    private static boolean isParty(User party, User viewer) {
        return party != null && party.getId().equals(viewer.getId());
    }
    
    private InquiryDTO.InquiryResponse mapToResponse(Inquiry inquiry) {
        InquiryDTO.InquiryResponse response = new InquiryDTO.InquiryResponse();
        response.setId(inquiry.getId());
        response.setListingId(inquiry.getListing().getId());
        response.setListingTitle(inquiry.getListing().getDisplayTitle());
        response.setBuyerName(inquiry.getBuyerName());
        response.setBuyerEmail(inquiry.getBuyerEmail());
        response.setBuyerPhone(inquiry.getBuyerPhone());
        response.setMessage(inquiry.getMessage());
        response.setStatus(inquiry.getStatus().name());
        response.setCreatedAt(inquiry.getCreatedAt());
        response.setUpdatedAt(inquiry.getUpdatedAt());
        
        // Seller contact details are what buyers pay for, so they're only included once paid
        InquiryDTO.SellerInfo sellerInfo = new InquiryDTO.SellerInfo();
        sellerInfo.setId(inquiry.getSeller().getId());
        boolean paid = inquiry.getBuyer() != null && paymentRepository.existsByBuyerIdAndListingIdAndStatus(
                inquiry.getBuyer().getId(), inquiry.getListing().getId(), Payment.PaymentStatus.PAID);
        if (paid) {
            sellerInfo.setFullName(inquiry.getSeller().getFullName());
            sellerInfo.setEmail(inquiry.getSeller().getEmail());
            sellerInfo.setMobileNumber(inquiry.getSeller().getMobileNumber());
        }
        response.setSeller(sellerInfo);
        
        return response;
    }
}
