package com.healthcare.portal.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * HospitalityPropertyDetail Entity - Category-specific specifications for hospitality assets:
 * - Hotels: numberOfRooms, plotAreaSqft, constructedAreaSqft, titleType
 * - Restaurants, Cafe, Banquet halls, Restaurants and Bar, Resorts: carpetAreaSqft
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
