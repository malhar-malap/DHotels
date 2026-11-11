package com.healthcare.portal.service;

import com.healthcare.portal.entity.Category;
import com.healthcare.portal.repository.ListingRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

class ListingUniqueCodeTest {

    private static Category category(String name) {
        Category category = new Category();
        category.setName(name);
        return category;
    }

    private static ListingService serviceWith(ListingRepository repository) {
        return new ListingService(repository, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    @Test
    void nextCodeFollowsTheHighestNumberInTheSeries() {
        ListingRepository repository = Mockito.mock(ListingRepository.class);
        when(repository.findUniqueCodesStartingWith("HTL")).thenReturn(List.of("HTL00014", "HTL00119", "HTLX", "htl00099"));
        assertEquals("HTL00120", serviceWith(repository).nextUniqueCode(category("Hotels")));
    }

    @Test
    void restaurantsKeepTheSpreadsheetsThreeDigitSeries() {
        ListingRepository repository = Mockito.mock(ListingRepository.class);
        when(repository.findUniqueCodesStartingWith("RRL")).thenReturn(List.of("RRL001", "RRL024"));
        assertEquals("RRL025", serviceWith(repository).nextUniqueCode(category("Restaurants and Bar")));
        assertEquals("RRL025", serviceWith(repository).nextUniqueCode(category("restaurants")));
    }

    @Test
    void emptySeriesStartsAtOne() {
        ListingRepository repository = Mockito.mock(ListingRepository.class);
        when(repository.findUniqueCodesStartingWith("BQH")).thenReturn(List.of());
        assertEquals("BQH001", serviceWith(repository).nextUniqueCode(category("Banquet halls")));
        assertArrayEquals(new String[] {"DHL", "5"}, ListingService.codeFormat(category("Unknown")));
    }

    @Test
    void onlyEnabledDealTypesAreOffered() {
        List<String> leaseOnly = List.of("For Lease");
        assertTrue(ListingService.isDealTypeEnabled(leaseOnly, " for lease "));
        assertFalse(ListingService.isDealTypeEnabled(leaseOnly, "For Sale"));
        assertFalse(ListingService.isDealTypeEnabled(leaseOnly, "Profit Sharing"));
        assertFalse(ListingService.isDealTypeEnabled(leaseOnly, null));
        assertTrue(ListingService.isDealTypeEnabled(List.of("For Lease", "For Sale"), "For Sale"));
    }

    @Test
    void priceUnitsAreValidated() {
        assertEquals("PER_MONTH", ListingService.normalizePriceUnit(" per_month "));
        assertEquals(null, ListingService.normalizePriceUnit(""));
        assertThrows(RuntimeException.class, () -> ListingService.normalizePriceUnit("WEEKLY"));
    }
}
