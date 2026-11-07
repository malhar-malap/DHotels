package com.healthcare.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * HospitalityPropertyDetail Entity - Category-specific specifications for hospitality assets:
 * - Hotels: numberOfRooms, plotAreaSqft, constructedAreaSqft, titleType
 * - Restaurants, Cafe, Banquet halls, Restaurants and Bar, Resorts: carpetAreaSqft
 * - Every category: star category, amenities, floors, operational status, deposit, turnover, kitchen permissions
 */
@Entity
@Table(name = "hospitality_property_details")
public class HospitalityPropertyDetail {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "listing_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Listing listing;
    
    // Hotel-specific fields
    @Column(name = "number_of_rooms")
    private Integer numberOfRooms;
    
    @Column(name = "plot_area_sqft", precision = 12, scale = 2)
    private BigDecimal plotAreaSqft;

    // Unit the seller entered the plot area in (SQFT or ACRE); the value itself is always stored in sq ft
    @Column(name = "plot_area_unit", length = 10)
    private String plotAreaUnit;
    
    @Column(name = "constructed_area_sqft", precision = 12, scale = 2)
    private BigDecimal constructedAreaSqft;

    // Ownership title of the hotel property, e.g. Freehold / Leasehold
    @Column(name = "title_type", length = 50)
    private String titleType;
    
    // Shared Area for Restaurants, Cafe, Banquet halls, Restaurants and Bar, Resorts
    @Column(name = "carpet_area_sqft", precision = 12, scale = 2)
    private BigDecimal carpetAreaSqft;
    
    // Facts that apply to every category; all optional
    @Column(name = "star_category", length = 50)
    private String starCategory; // e.g. 3 Star, Boutique, Homestay

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities; // comma-separated, e.g. "Swimming pool, Bar, Parking"

    @Column(name = "floors", length = 100)
    private String floors; // e.g. "B + G + 1"

    @Column(name = "operational_status", length = 50)
    private String operationalStatus; // e.g. Running, Bare shell, Fully furnished

    @Column(name = "security_deposit", length = 100)
    private String securityDeposit; // e.g. "6 months' rent"

    @Column(name = "annual_turnover", length = 100)
    private String annualTurnover;

    @Column(name = "kitchen_permissions", length = 200)
    private String kitchenPermissions; // e.g. "Gas cooking, non-veg and liquor allowed"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    
    public Integer getNumberOfRooms() { return numberOfRooms; }
    public void setNumberOfRooms(Integer numberOfRooms) { this.numberOfRooms = numberOfRooms; }
    
    public BigDecimal getPlotAreaSqft() { return plotAreaSqft; }
    public void setPlotAreaSqft(BigDecimal plotAreaSqft) { this.plotAreaSqft = plotAreaSqft; }
    public String getPlotAreaUnit() { return plotAreaUnit; }
    public void setPlotAreaUnit(String plotAreaUnit) { this.plotAreaUnit = plotAreaUnit; }
    
    public BigDecimal getConstructedAreaSqft() { return constructedAreaSqft; }
    public void setConstructedAreaSqft(BigDecimal constructedAreaSqft) { this.constructedAreaSqft = constructedAreaSqft; }
    
    public String getTitleType() { return titleType; }
    public void setTitleType(String titleType) { this.titleType = titleType; }
    
    public BigDecimal getCarpetAreaSqft() { return carpetAreaSqft; }
    public void setCarpetAreaSqft(BigDecimal carpetAreaSqft) { this.carpetAreaSqft = carpetAreaSqft; }
    
    public String getStarCategory() { return starCategory; }
    public void setStarCategory(String starCategory) { this.starCategory = starCategory; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    public String getFloors() { return floors; }
    public void setFloors(String floors) { this.floors = floors; }
    public String getOperationalStatus() { return operationalStatus; }
    public void setOperationalStatus(String operationalStatus) { this.operationalStatus = operationalStatus; }
    public String getSecurityDeposit() { return securityDeposit; }
    public void setSecurityDeposit(String securityDeposit) { this.securityDeposit = securityDeposit; }
    public String getAnnualTurnover() { return annualTurnover; }
    public void setAnnualTurnover(String annualTurnover) { this.annualTurnover = annualTurnover; }
    public String getKitchenPermissions() { return kitchenPermissions; }
    public void setKitchenPermissions(String kitchenPermissions) { this.kitchenPermissions = kitchenPermissions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
