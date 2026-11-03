package com.healthcare.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Listing Entity - Main Entity for Marketplace Listings
 */
@Entity
@Table(name = "listings")
public class Listing {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "deal_type_id", nullable = false)
    private DealType dealType;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(name = "short_description", length = 500)
    private String shortDescription;
    
    @Column(name = "detailed_description", columnDefinition = "TEXT")
    private String detailedDescription;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id", nullable = true)
    private City city;

    @Column(name = "city_name", length = 100)
    private String cityName;
    

    // Null when the seller chose not to disclose the price
    @Column(name = "asking_price", precision = 15, scale = 2)
    private BigDecimal askingPrice;

    @Column(name = "price_not_disclosed")
    private Boolean priceNotDisclosed = false;
    
    @Column(name = "price_negotiable")
    private Boolean priceNegotiable = true;
    
    @Column(name = "is_confidential")
    private Boolean isConfidential = false;
    
    @Column(name = "confidential_title", length = 200)
    private String confidentialTitle;
    
    @Column(name = "unique_code", length = 50, unique = true)
    private String uniqueCode;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ListingStatus status = ListingStatus.PENDING;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(name = "inquiry_count")
    private Integer inquiryCount = 0;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "featured_until")
    private LocalDateTime featuredUntil;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ListingImage> images = new ArrayList<>();
    
    @OneToOne(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private HospitalityPropertyDetail propertyDetail;
    
    public enum ListingStatus {
        PENDING, ACTIVE, REJECTED, EXPIRED, SOLD, WITHDRAWN
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public DealType getDealType() { return dealType; }
    public void setDealType(DealType dealType) { this.dealType = dealType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public String getDetailedDescription() { return detailedDescription; }
    public void setDetailedDescription(String detailedDescription) { this.detailedDescription = detailedDescription; }
    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }
    public BigDecimal getAskingPrice() { return askingPrice; }
    public void setAskingPrice(BigDecimal askingPrice) { this.askingPrice = askingPrice; }
    public Boolean getPriceNotDisclosed() { return priceNotDisclosed; }
    public void setPriceNotDisclosed(Boolean priceNotDisclosed) { this.priceNotDisclosed = priceNotDisclosed; }
    public Boolean getPriceNegotiable() { return priceNegotiable; }
    public void setPriceNegotiable(Boolean priceNegotiable) { this.priceNegotiable = priceNegotiable; }
    public Boolean getIsConfidential() { return isConfidential; }
    public void setIsConfidential(Boolean isConfidential) { this.isConfidential = isConfidential; }
    public String getConfidentialTitle() { return confidentialTitle; }
    public void setConfidentialTitle(String confidentialTitle) { this.confidentialTitle = confidentialTitle; }
    public String getUniqueCode() { return uniqueCode; }
    public void setUniqueCode(String uniqueCode) { this.uniqueCode = uniqueCode; }
    public ListingStatus getStatus() { return status; }
    public void setStatus(ListingStatus status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    public Integer getInquiryCount() { return inquiryCount; }
    public void setInquiryCount(Integer inquiryCount) { this.inquiryCount = inquiryCount; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public LocalDateTime getFeaturedUntil() { return featuredUntil; }
    public void setFeaturedUntil(LocalDateTime featuredUntil) { this.featuredUntil = featuredUntil; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public List<ListingImage> getImages() { return images; }
    public void setImages(List<ListingImage> images) { this.images = images; }
    public HospitalityPropertyDetail getPropertyDetail() { return propertyDetail; }
    public void setPropertyDetail(HospitalityPropertyDetail propertyDetail) { this.propertyDetail = propertyDetail; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper method to get display title
    public String getDisplayTitle() {
        if (Boolean.TRUE.equals(isConfidential) && confidentialTitle != null) {
            return confidentialTitle;
        }
        return title;
    }
}
