package com.healthcare.portal.service;

import com.healthcare.portal.entity.Category;
import com.healthcare.portal.entity.Listing;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Approval and import assign the category's representative photos.
 * The paths must exist under frontend/public/images/listing-samples.
 */
class ListingSampleImageTest {

    private static final List<String> CATEGORIES = List.of(
            "Hotels", "Resorts", "Restaurants", "Restaurants and Bar", "Cafe", "Banquet halls");

    private static Listing listing(long id, String categoryName) {
        Category category = new Category();
        category.setName(categoryName);
        Listing listing = new Listing();
        listing.setId(id);
        listing.setCategory(category);
        return listing;
    }

    @Test
    void everyCategoryGetsAGalleryOfItsOwnExistingPhotos() {
        for (String category : CATEGORIES) {
            List<String> gallery = ListingService.pickSampleImages(listing(1, category));
            assertEquals(ListingService.SAMPLE_GALLERY_SIZE, gallery.size(), category);
            assertEquals(gallery.size(), new HashSet<>(gallery).size(), category + " gallery repeats a photo");
            for (String image : gallery) {
                assertTrue(image.startsWith(ListingService.SAMPLE_IMAGE_DIR), image);
                assertTrue(Files.exists(Path.of("../frontend/public" + image)), image + " is missing");
            }
        }
    }

    @Test
    void neighbouringHotelsLeadWithDifferentPhotos() {
        Set<String> primaries = new HashSet<>();
        for (long id = 1; id <= 5; id++) {
            primaries.add(ListingService.pickSampleImage(listing(id, "Hotels")));
        }
        assertEquals(5, primaries.size());
    }

    @Test
    void categoryNamesMatchIgnoringCaseAndSpaces() {
        assertEquals(ListingService.pickSampleImages(listing(1, "Hotels")), ListingService.pickSampleImages(listing(1, "  hotels ")));
        assertTrue(ListingService.pickSampleImage(listing(1, "Cafe")).contains("/cafe-photo-"));
        assertTrue(ListingService.pickSampleImage(listing(1, "Restaurants and Bar")).contains("/bar-photo-"));
    }

    @Test
    void unknownCategoryFallsBackToHotelPhotos() {
        assertEquals(ListingService.pickSampleImages(listing(1, "Hotels")), ListingService.pickSampleImages(listing(1, "Something new")));
        assertTrue(ListingService.pickSampleImage(new Listing()).contains("/hotel-photo-"));
    }
}
