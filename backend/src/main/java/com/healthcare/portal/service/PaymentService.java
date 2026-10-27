package com.healthcare.portal.service;

import com.healthcare.portal.annotation.LogActivity;
import com.healthcare.portal.dto.PaymentDTO;
import com.healthcare.portal.entity.*;
import com.healthcare.portal.repository.*;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * Service class for Razorpay Payment operations
 */
@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    private static final int CONTACT_ACCESS_AMOUNT_PAISE = 100000; // ₹1000 in paise

    private final PaymentRepository paymentRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency}")
    private String currency;

    @Value("${razorpay.company.name}")
    private String companyName;

    public PaymentService(
            PaymentRepository paymentRepository,
            ListingRepository listingRepository,
            UserRepository userRepository,
            InquiryRepository inquiryRepository,
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) throws RazorpayException {
        this.paymentRepository = paymentRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.inquiryRepository = inquiryRepository;
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
        logger.info("Razorpay client initialized successfully");
    }

    /**
     * Create a Razorpay order for contact access payment
     */
    @Transactional
    public PaymentDTO.CreateOrderResponse createOrder(Long listingId, Long buyerId) {
        // Validate listing exists
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        // Validate buyer exists
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if buyer is the listing owner
        if (listing.getUser().getId().equals(buyerId)) {
            throw new RuntimeException("You cannot purchase contact access for your own listing");
        }

        // Check if buyer already paid for this listing
        if (paymentRepository.existsByBuyerIdAndListingIdAndStatus(buyerId, listingId, Payment.PaymentStatus.PAID)) {
            throw new RuntimeException("You have already purchased contact access for this listing");
        }

        try {
            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", CONTACT_ACCESS_AMOUNT_PAISE); // amount in paise
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", "receipt_listing_" + listingId + "_buyer_" + buyerId);
            orderRequest.put("notes", new JSONObject()
                    .put("listingId", listingId.toString())
                    .put("buyerId", buyerId.toString())
                    .put("purpose", "Contact Access"));

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            // Save payment record
            Payment payment = new Payment();
            payment.setRazorpayOrderId(razorpayOrder.get("id"));
            payment.setBuyer(buyer);
            payment.setListing(listing);
            payment.setAmount(CONTACT_ACCESS_AMOUNT_PAISE);
            payment.setCurrency(currency);
            payment.setStatus(Payment.PaymentStatus.CREATED);
            paymentRepository.save(payment);

            logger.info("Razorpay order created: {} for listing: {} by buyer: {}",
                    razorpayOrder.get("id"), listingId, buyerId);

            // Build response
            PaymentDTO.CreateOrderResponse response = new PaymentDTO.CreateOrderResponse();
            response.setOrderId(razorpayOrder.get("id"));
            response.setAmount(CONTACT_ACCESS_AMOUNT_PAISE);
            response.setCurrency(currency);
            response.setKeyId(razorpayKeyId);
            response.setListingTitle(listing.getDisplayTitle());
            response.setCompanyName(companyName);

            return response;

        } catch (RazorpayException e) {
            logger.error("Error creating Razorpay order: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment order. Please try again.");
        }
    }


    /**
     * Verify Razorpay payment signature and unlock seller contact details
     */
    @Transactional
    @LogActivity(action = "VERIFY_PAYMENT", entityType = "Payment")
    public PaymentDTO.PaymentResponse verifyPayment(PaymentDTO.VerifyPaymentRequest request, Long buyerId) {
        // Find the payment record
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment order not found"));

        // Validate this payment belongs to the current buyer
        if (!payment.getBuyer().getId().equals(buyerId)) {
            throw new RuntimeException("Unauthorized: This payment does not belong to you");
        }

        // Verify Razorpay signature using HMAC SHA256
        String generatedSignature = generateSignature(
                request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId(),
                razorpayKeySecret
        );

        if (!generatedSignature.equals(request.getRazorpaySignature())) {
            // Mark payment as failed
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            logger.error("Payment signature verification failed for order: {}", request.getRazorpayOrderId());
            throw new RuntimeException("Payment verification failed. Invalid signature.");
        }

        // Signature verified — update payment record
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(Payment.PaymentStatus.PAID);
        paymentRepository.save(payment);

        logger.info("Payment verified successfully: orderId={}, paymentId={}",
                request.getRazorpayOrderId(), request.getRazorpayPaymentId());

        // Auto-create an inquiry so both buyer and seller are connected
        Listing listing = payment.getListing();
        User buyer = payment.getBuyer();
        User seller = listing.getUser();

        Inquiry inquiry = new Inquiry();
        inquiry.setListing(listing);
        inquiry.setBuyer(buyer);
        inquiry.setSeller(seller);
        inquiry.setBuyerName(buyer.getFullName());
        inquiry.setBuyerEmail(buyer.getEmail());
        inquiry.setBuyerPhone(buyer.getMobileNumber());
        inquiry.setMessage("Paid ₹1000 for contact access. Interested in: " + listing.getDisplayTitle());
        inquiry.setStatus(Inquiry.InquiryStatus.NEW);
        inquiryRepository.save(inquiry);

        // Increment inquiry count on listing
        listing.setInquiryCount(listing.getInquiryCount() + 1);
        listingRepository.save(listing);

        logger.info("Inquiry auto-created for buyer: {} on listing: {}", buyerId, listing.getId());

        // Build response with seller contact details
        PaymentDTO.PaymentResponse response = new PaymentDTO.PaymentResponse();
        response.setPaymentId(payment.getId());
        response.setStatus("PAID");
        response.setSellerName(seller.getFullName());
        response.setSellerEmail(seller.getEmail());
        response.setSellerPhone(seller.getMobileNumber());
        response.setListingTitle(listing.getDisplayTitle());
        response.setPaidAt(payment.getUpdatedAt());

        return response;
    }

    /**
     * Check if a buyer has already paid for contact access on a listing
     */
    @Transactional(readOnly = true)
    public PaymentDTO.PaymentStatusResponse checkPaymentStatus(Long listingId, Long buyerId) {
        PaymentDTO.PaymentStatusResponse response = new PaymentDTO.PaymentStatusResponse();

        var paidPayment = paymentRepository.findByBuyerIdAndListingIdAndStatus(
                buyerId, listingId, Payment.PaymentStatus.PAID);

        if (paidPayment.isPresent()) {
            Payment payment = paidPayment.get();
            Listing listing = payment.getListing();
            User seller = listing.getUser();

            response.setPaid(true);

            PaymentDTO.PaymentResponse details = new PaymentDTO.PaymentResponse();
            details.setPaymentId(payment.getId());
            details.setStatus("PAID");
            details.setSellerName(seller.getFullName());
            details.setSellerEmail(seller.getEmail());
            details.setSellerPhone(seller.getMobileNumber());
            details.setListingTitle(listing.getDisplayTitle());
            details.setPaidAt(payment.getUpdatedAt());

            response.setPaymentDetails(details);
        } else {
            response.setPaid(false);
        }

        return response;
    }

    /**
     * Generate HMAC SHA256 signature for Razorpay verification
     */
    private String generateSignature(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes());

            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();

        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Error generating HMAC signature: {}", e.getMessage());
            throw new RuntimeException("Signature generation failed");
        }
    }

    /**
     * Sync payment status directly from Razorpay
     */
    @Transactional
    public void syncPaymentWithRazorpay(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getRazorpayOrderId() == null) {
            throw new RuntimeException("No Razorpay Order ID found for this payment");
        }

        try {
            Order order = razorpayClient.orders.fetch(payment.getRazorpayOrderId());
            String status = order.get("status");

            if ("paid".equalsIgnoreCase(status)) {
                if (payment.getStatus() != Payment.PaymentStatus.PAID) {
                    payment.setStatus(Payment.PaymentStatus.PAID);
                    paymentRepository.save(payment);
                    
                    // Create inquiry if it doesn't exist
                    Listing listing = payment.getListing();
                    User buyer = payment.getBuyer();
                    User seller = listing.getUser();
                    
                    boolean inquiryExists = inquiryRepository.findByListingId(listing.getId()).stream()
                            .anyMatch(i -> i.getBuyer().getId().equals(buyer.getId()));
                            
                    if (!inquiryExists) {
                        Inquiry inquiry = new Inquiry();
                        inquiry.setListing(listing);
                        inquiry.setBuyer(buyer);
                        inquiry.setSeller(seller);
                        inquiry.setBuyerName(buyer.getFullName());
                        inquiry.setBuyerEmail(buyer.getEmail());
                        inquiry.setBuyerPhone(buyer.getMobileNumber());
                        inquiry.setMessage("Paid ₹1000 for contact access. Interested in: " + listing.getDisplayTitle());
                        inquiry.setStatus(Inquiry.InquiryStatus.NEW);
                        inquiryRepository.save(inquiry);
                        
                        listing.setInquiryCount(listing.getInquiryCount() + 1);
                        listingRepository.save(listing);
                    }
                }
            } else if ("attempted".equalsIgnoreCase(status)) {
                // Payment was attempted but failed/pending
                if (payment.getStatus() == Payment.PaymentStatus.CREATED) {
                    payment.setStatus(Payment.PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                }
            }
            // If "created", it means user never even tried to pay, we can leave it as CREATED or mark FAILED
        } catch (RazorpayException e) {
            logger.error("Error syncing Razorpay order: {}", e.getMessage());
            throw new RuntimeException("Failed to sync with Razorpay");
        }
    }
}
