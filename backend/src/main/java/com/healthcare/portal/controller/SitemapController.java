package com.healthcare.portal.controller;

import com.healthcare.portal.service.SitemapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
@Tag(name = "Sitemap", description = "XML sitemap for search engines")
public class SitemapController {

    private final SitemapService sitemapService;

    @Autowired
    public SitemapController(SitemapService sitemapService) {
        this.sitemapService = sitemapService;
    }

    // Served publicly at https://dhacquisitions.co/sitemap.xml via the Nginx proxy
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "XML sitemap", description = "Static pages plus every active listing and job")
    public ResponseEntity<String> getSitemap() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                .body(sitemapService.buildSitemapXml());
    }
}
