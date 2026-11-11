package com.healthcare.portal.service;

import com.healthcare.portal.service.EmailTemplates.Email;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Every email renders in the site theme and escapes what users typed.
 * Set -Demail.preview.dir=/some/dir to also write each email as an .html file for a visual check.
 */
class EmailTemplatesTest {

    private static final String EVIL = "<script>alert(1)</script>";

    private static Map<String, Email> allEmails(String text) {
        Map<String, Email> emails = new LinkedHashMap<>();
        emails.put("welcome", EmailService.welcome(text));
        emails.put("buyer-approved", EmailService.buyerApproved(text));
        emails.put("inquiry", EmailService.inquiry(text, text, "op@example.com", "+91 98765 43210", text + "\nSecond line", text));
        emails.put("job-application", EmailService.jobApplication(text, text, "cv@example.com", text));
        emails.put("otp", EmailService.otp("482913"));
        emails.put("forgot-password", EmailService.forgotPassword("a+b@example.com", "482913"));
        emails.put("contact-message", EmailService.contactMessage(text, "c@example.com", null, text, text));
        emails.put("contact-reply", EmailService.contactReply(text, text, text, text));
        emails.put("listing-approved", EmailService.listingApproved(text, text));
        emails.put("listing-rejected", EmailService.listingRejected(text, text, text));
        emails.put("job-approved", EmailService.jobApproved(text, text));
        emails.put("job-rejected", EmailService.jobRejected(text, text, text));
        emails.put("item-deleted", EmailService.itemDeleted(text, "Job", text));
        emails.put("listing-deleted-by-admin", EmailService.listingDeletedByAdmin(text, text, text));
        emails.put("listing-deleted-by-owner", EmailService.listingDeletedByOwner(text, "o@example.com", 12L, "HTL00012", text, text));
        emails.put("consultation", EmailService.consultation(text, "c@example.com", "9876543210", null, "30 min", text));
        emails.put("mandate", EmailService.mandate(text, "m@example.com", "9876543210", text));
        return emails;
    }

    @Test
    void everyEmailUsesTheSiteThemeAndEscapesUserText() {
        allEmails(EVIL).forEach((name, email) -> {
            String html = email.html();
            assertFalse(html.contains(EVIL), name + " does not escape user text");
            assertTrue(html.contains("#091013") && html.contains("#C9A25A"), name + " is not in the site theme");
            assertTrue(html.contains("DHotels24<span"), name + " is missing the wordmark");
            assertFalse(html.contains("#f7b538") || html.toLowerCase().contains("dhacquisitions"), name + " still has the old design");
        });
    }

    @Test
    void resetLinkEncodesTheEmail() {
        String html = EmailService.forgotPassword("a+b@example.com", "482913").html();
        assertTrue(html.contains("/reset-password?email=a%2Bb%40example.com&amp;otp=482913"));
    }

    @Test
    void writesPreviewsWhenAsked() throws Exception {
        String dir = System.getProperty("email.preview.dir");
        if (dir == null) {
            return;
        }
        Files.createDirectories(Path.of(dir));
        for (Map.Entry<String, Email> e : allEmails("Malhar Malap").entrySet()) {
            Files.writeString(Path.of(dir, e.getKey() + ".html"), e.getValue().html());
        }
    }
}
