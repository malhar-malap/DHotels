package com.healthcare.portal.service;

import com.healthcare.portal.entity.Category;
import com.healthcare.portal.entity.Listing;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Approval assigns the category's photo; the frontend labels these URLs "for representation
 * purpose only", so they must stay the same pictures as the category tiles in hospitality.js.
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
    void everyCategoryHasItsOwnPhoto() {
        long distinct = CATEGORIES.stream().map(c -> ListingService.pickSampleImage(listing(1, c))).distinct().count();
        assertEquals(CATEGORIES.size(), distinct);
    }

    @Test
    void categoryNamesMatchIgnoringCaseAndSpaces() {
        assertEquals(ListingService.pickSampleImage(listing(1, "Hotels")), ListingService.pickSampleImage(listing(2, "  hotels ")));
        assertNotEquals(ListingService.pickSampleImage(listing(1, "Hotels")), ListingService.pickSampleImage(listing(1, "Cafe")));
    }

    @Test
    void unknownCategoryFallsBackToHotelPhoto() {
        assertEquals(ListingService.pickSampleImage(listing(1, "Hotels")), ListingService.pickSampleImage(listing(1, "Something new")));
        assertEquals(ListingService.pickSampleImage(listing(1, "Hotels")), ListingService.pickSampleImage(new Listing()));
    }

    @Test
    void photosAreTheCategoryTilesUsedOnTheSite() throws Exception {
        Path categories = Path.of("../frontend/src/utils/hospitality.js");
        String source = Files.readString(categories);
        for (String category : CATEGORIES) {
            String url = ListingService.pickSampleImage(listing(1, category));
            assertTrue(url.startsWith(ListingService.SAMPLE_IMAGE_BASE), url);
            String photoId = url.substring(ListingService.SAMPLE_IMAGE_BASE.length(), url.indexOf('?'));
            assertTrue(source.contains("'" + photoId + "'"), category + " photo " + photoId + " is not a category image in hospitality.js");
        }
    }
}
