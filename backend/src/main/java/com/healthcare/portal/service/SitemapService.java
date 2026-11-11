package com.healthcare.portal.service;

import com.healthcare.portal.entity.Job;
import com.healthcare.portal.entity.Listing;
import com.healthcare.portal.repository.JobRepository;
import com.healthcare.portal.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service class for building the public XML sitemap (static pages + all active listings and jobs)
 */
@Service
public class SitemapService {

    @Value("${app.site-url}")
    private String siteUrl;

    // Public, indexable frontend routes
    private static final List<String> STATIC_PATHS = List.of(
            "/", "/about", "/contact-us", "/blogs", "/listings",
            "/hotels-for-lease-india", "/restaurants-for-lease-india", "/cafes-for-lease-india",
            "/banquet-halls-for-lease-india", "/restaurant-and-bar-for-lease-india", "/resorts-for-lease-india",
            "/hospitality-jobs-india",
            "/hotels-for-lease-goa", "/hotels-for-lease-maharashtra", "/restaurants-for-lease-mumbai",
            "/resorts-for-lease-kerala", "/banquet-halls-for-lease-delhi",
            "/blogs/how-to-lease-a-hotel-in-india", "/blogs/hospitality-lease-agreement-checklist",
            "/blogs/restaurant-takeover-checklist-india",
            // Sale & profit sharing paused: "/partial-properties", "/blogs/how-to-buy-a-hotel-in-india",
            // "/blogs/how-to-value-a-hotel-or-restaurant", "/blogs/hotel-profit-sharing-agreements-explained",
            "/terms", "/privacy", "/cookies", "/refund-policy"
    );

    private static final Set<String> STOP_WORDS = Set.of("the", "a", "an", "in", "at", "of", "for", "to", "with", "and");

    private final ListingRepository listingRepository;
    private final JobRepository jobRepository;

    @Autowired
    public SitemapService(ListingRepository listingRepository, JobRepository jobRepository) {
        this.listingRepository = listingRepository;
        this.jobRepository = jobRepository;
    }

    @Transactional(readOnly = true)
    public String buildSitemapXml() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        for (String path : STATIC_PATHS) {
            appendUrl(xml, path, null);
        }

        // Slug uses the display title so confidential listings never expose their real name
        for (Listing listing : listingRepository.findByStatus(Listing.ListingStatus.ACTIVE)) {
            String slug = generateSlug(listing.getDisplayTitle(), listing.getCityName());
            appendUrl(xml, "/listings/" + listing.getId() + (slug.isEmpty() ? "" : "-" + slug),
                    lastModified(listing.getUpdatedAt(), listing.getCreatedAt()));
        }

        for (Job job : jobRepository.findByStatus(Job.JobStatus.ACTIVE)) {
            String slug = generateSlug(job.getTitle(), job.getCityName());
            appendUrl(xml, "/hospitality-jobs-india/" + job.getId() + (slug.isEmpty() ? "" : "-" + slug),
                    lastModified(job.getUpdatedAt(), job.getCreatedAt()));
        }

        xml.append("</urlset>\n");
        return xml.toString();
    }

    private void appendUrl(StringBuilder xml, String path, LocalDateTime lastMod) {
        xml.append("  <url>\n    <loc>").append(escapeXml(siteUrl + path)).append("</loc>\n");
        if (lastMod != null) {
            xml.append("    <lastmod>").append(lastMod.toLocalDate()).append("</lastmod>\n");
        }
        xml.append("  </url>\n");
    }

    private LocalDateTime lastModified(LocalDateTime updatedAt, LocalDateTime createdAt) {
        return updatedAt != null ? updatedAt : createdAt;
    }

    /**
     * Java port of frontend/src/utils/slugify.js generateSlug - must produce identical output,
     * otherwise sitemap URLs won't match the canonical URLs the frontend redirects to.
     */
    static String generateSlug(String title, String location) {
        if (title == null || title.isEmpty()) return "";

        String slug = Arrays.stream(title.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
                .filter(word -> !word.isEmpty() && !STOP_WORDS.contains(word))
                .limit(8)
                .collect(Collectors.joining("-"));

        slug = slug.replaceAll("[^a-z0-9-]", "")
                .replaceAll("-+", "-")
                .replaceAll("^-+|-+$", "");

        if (location != null && !location.isEmpty()) {
            String cleanLocation = location.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "").trim();
            if (!cleanLocation.isEmpty() && !slug.contains(cleanLocation)) {
                slug = slug + "-" + cleanLocation;
            }
        }

        if (!slug.endsWith("-india")) {
            slug = slug + "-india";
        }

        return slug;
    }

    private static String escapeXml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&apos;");
    }
}
