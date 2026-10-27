package com.healthcare.portal.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Expected values were produced by frontend/src/utils/slugify.js - the two implementations must stay in sync.
 */
class SitemapServiceTest {

    @Test
    void generateSlugMatchesFrontendImplementation() {
        assertEquals("50-bed-multi-speciality-hospital-sale-pune-india",
                SitemapService.generateSlug("50-Bed Multi-Speciality Hospital for Sale", "Pune"));
        assertEquals("best-pharma-unit-mumbai-india",
                SitemapService.generateSlug("The Best Pharma Unit in Mumbai", "Mumbai"));
        assertEquals("diagnostic-centre-lab-nabl-running-newdelhi-india",
                SitemapService.generateSlug("Diagnostic Centre & Lab (NABL) — Running", "New Delhi"));
        assertEquals("clinic-india", SitemapService.generateSlug("Clinic in India", "India"));
        assertEquals("hospital-india", SitemapService.generateSlug("Hospital", null));
        assertEquals("-pune-india", SitemapService.generateSlug("!!!", "Pune"));
        assertEquals("caf-nit-sale-equipment-staff-available-now-navimumbai-india",
                SitemapService.generateSlug("Café Ünit For Sale With Equipment And Staff Available Now", "Navi Mumbai"));
        assertEquals("", SitemapService.generateSlug(null, "Pune"));
    }
}
