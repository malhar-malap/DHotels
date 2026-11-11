package com.healthcare.portal.service;

import com.healthcare.portal.service.EmailTemplates.Email;
import com.healthcare.portal.service.EmailTemplates.Tone;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.healthcare.portal.service.EmailTemplates.SITE;
import static com.healthcare.portal.service.EmailTemplates.body;
import static com.healthcare.portal.service.EmailTemplates.layout;
import static com.healthcare.portal.service.EmailTemplates.rows;

/**
 * Service for sending email notifications.
 * All methods except the OTP and password-reset ones are @Async so they run in a background thread.
 *
 * Each email is built by a package-private static method (welcome(), otp(), ...) so templates can
 * be rendered in tests without a mail server. The layout lives in EmailTemplates.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ========== 1. Welcome Email on Sign-Up ==========
    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        send(toEmail, welcome(fullName));
    }

    static Email welcome(String fullName) {
        return new Email("Welcome to DHotels24.com", layout(
            "Your account is ready — browse hotels, resorts and restaurants for lease across India.",
            "Welcome", "Your account is ready", Tone.BRASS,
            body().greeting(fullName)
                .paragraph("Thank you for joining ", "DHotels24.com", " — India's marketplace for leasing hotels, resorts, restaurants, cafés, bars and banquet halls.")
                .paragraph("Here is what you can do now:")
                .bullets(
                    "Browse reviewed hotels, resorts, restaurants, bars, cafés and banquet halls for lease",
                    "List your own property and reach serious operators",
                    "Find and post hospitality jobs")
                .button("Go to your dashboard", SITE + "/dashboard")
                .small("If you did not create this account, you can ignore this email.")));
    }

    // ========== 2. Buyer Verified / Approved Email ==========
    @Async
    public void sendBuyerApprovedEmail(String toEmail, String fullName) {
        send(toEmail, buyerApproved(fullName));
    }

    static Email buyerApproved(String fullName) {
        return new Email("Your account is verified — DHotels24.com", layout(
            "Your verification is approved. Confidential listings are now open to you.",
            "Verification approved", "You're verified", Tone.BRASS,
            body().greeting(fullName)
                .paragraph("Our team has ", "approved", " your verification. Your account now has:")
                .bullets(
                    "Full details of confidential listings",
                    "Direct contact with property owners",
                    "Priority access to new listings")
                .button("Browse listings", SITE + "/listings")));
    }

    // ========== 3. Inquiry Notification to Seller ==========
    @Async
    public void sendInquiryNotificationToSeller(String sellerEmail, String sellerName,
            String buyerName, String buyerEmail, String buyerPhone, String message, String listingTitle) {
        send(sellerEmail, inquiry(sellerName, buyerName, buyerEmail, buyerPhone, message, listingTitle));
    }

    static Email inquiry(String ownerName, String name, String email, String phone, String message, String listingTitle) {
        return new Email("New inquiry: " + listingTitle, layout(
            "Someone is interested in " + listingTitle + ".",
            "New inquiry", "Someone is interested in your listing", Tone.BRASS,
            body().greeting(ownerName)
                .paragraph("You have a new inquiry for ", listingTitle, ".")
                .details("Contact", rows("Name", name, "Email", email, "Phone", phone))
                .quote("Message", message, Tone.BRASS)
                .button("View inquiries", SITE + "/dashboard/inquiries")));
    }

    // ========== 4. Job Application Notification to Employer ==========
    @Async
    public void sendJobApplicationNotification(String employerEmail, String employerName,
            String seekerName, String seekerEmail, String jobTitle) {
        send(employerEmail, jobApplication(employerName, seekerName, seekerEmail, jobTitle));
    }

    static Email jobApplication(String employerName, String seekerName, String seekerEmail, String jobTitle) {
        return new Email("New application: " + jobTitle, layout(
            seekerName + " applied for " + jobTitle + ".",
            "New application", "A candidate applied for your job", Tone.BRASS,
            body().greeting(employerName)
                .paragraph("A new candidate has applied for ", jobTitle, ".")
                .details("Applicant", rows("Name", seekerName, "Email", seekerEmail))
                .button("View applications", SITE + "/dashboard/applications")));
    }

    // ========== 5. OTP Verification Email ==========
    public void sendOtpEmail(String toEmail, String otp) {
        send(toEmail, otp(otp));
    }

    static Email otp(String otp) {
        return new Email("Your DHotels24.com verification code: " + otp, layout(
            "Your verification code is " + otp + ". It expires in 5 minutes.",
            "Email verification", "Your verification code", Tone.BRASS,
            body().paragraph("Enter this code to finish creating your ", "DHotels24.com", " account.")
                .code(otp)
                .paragraph("The code expires in 5 minutes. Never share it with anyone — our team will never ask for it.")
                .small("If you did not request this code, you can ignore this email.")));
    }

    // ========== 6. Forgot Password Email ==========
    public void sendForgotPasswordEmail(String toEmail, String otp) {
        send(toEmail, forgotPassword(toEmail, otp));
    }

    static Email forgotPassword(String toEmail, String otp) {
        String resetUrl = SITE + "/reset-password?email=" + EmailTemplates.url(toEmail) + "&otp=" + EmailTemplates.url(otp);
        return new Email("Reset your password — DHotels24.com", layout(
            "Use this link to set a new password for your DHotels24.com account.",
            "Password reset", "Reset your password", Tone.BRASS,
            body().paragraph("We received a request to reset the password for your DHotels24.com account. Use the button below to set a new one.")
                .button("Reset password", resetUrl)
                .fallbackLink(resetUrl)
                .small("If you did not ask to reset your password, ignore this email — your password stays the same.")));
    }

    // ========== 7. Contact Message Notification to Admin ==========
    @Async
    public void sendContactMessageNotification(String adminEmail, String senderName,
            String senderEmail, String senderPhone, String subject, String message) {
        send(adminEmail, contactMessage(senderName, senderEmail, senderPhone, subject, message));
    }

    static Email contactMessage(String name, String email, String phone, String subject, String message) {
        return new Email("New contact message: " + (subject != null ? subject : "No subject"), layout(
            "New message from " + name + " on the contact form.",
            "Contact form", "New contact message", Tone.BRASS,
            body().details("From", rows("Name", name, "Email", email, "Phone", phone, "Subject", subject))
                .quote("Message", message, Tone.BRASS)
                .button("View messages", SITE + "/admin/contact-messages")));
    }

    // ========== 8. Contact Reply Email to User ==========
    @Async
    public void sendContactReplyEmail(String toEmail, String userName, String originalSubject,
            String originalMessage, String replyContent) {
        send(toEmail, contactReply(userName, originalSubject, originalMessage, replyContent));
    }

    static Email contactReply(String userName, String originalSubject, String originalMessage, String replyContent) {
        return new Email("Re: " + (originalSubject != null ? originalSubject : "Your message") + " — DHotels24.com", layout(
            "We've replied to your message.",
            "Reply from our team", "We've replied to your message", Tone.BRASS,
            body().greeting(userName)
                .paragraph("Thank you for reaching out. Here is our reply:")
                .quote("Our reply", replyContent, Tone.BRASS)
                .quote("Your original message", originalMessage, Tone.BRASS)
                .paragraph("If you have more questions, just reply to this email.")));
    }

    // ========== Approval/Rejection Notifications ==========
    @Async
    public void sendListingApprovedEmail(String toEmail, String fullName, String listingTitle) {
        send(toEmail, listingApproved(fullName, listingTitle));
    }

    static Email listingApproved(String fullName, String listingTitle) {
        return new Email("Your listing is live — DHotels24.com", layout(
            listingTitle + " is now live on DHotels24.com.",
            "Listing approved", "Your listing is live", Tone.BRASS,
            body().greeting(fullName)
                .paragraph("Good news — ", listingTitle, " has been approved by our team.")
                .paragraph("It is now live on the marketplace and visible to operators looking for properties to lease.")
                .button("View in dashboard", SITE + "/dashboard")));
    }

    @Async
    public void sendListingRejectedEmail(String toEmail, String fullName, String listingTitle, String reason) {
        send(toEmail, listingRejected(fullName, listingTitle, reason));
    }

    static Email listingRejected(String fullName, String listingTitle, String reason) {
        return new Email("Update on your listing — DHotels24.com", layout(
            listingTitle + " needs changes before it can go live.",
            "Changes needed", "Your listing needs a few changes", Tone.ALERT,
            body().greeting(fullName)
                .paragraph("We couldn't approve ", listingTitle, " yet.")
                .quote("What needs to change", reason, Tone.ALERT)
                .paragraph("Update the listing from your dashboard and submit it again — we'll review it promptly.")
                .button("Update listing", SITE + "/dashboard/listings")));
    }

    @Async
    public void sendJobApprovedEmail(String toEmail, String fullName, String jobTitle) {
        send(toEmail, jobApproved(fullName, jobTitle));
    }

    static Email jobApproved(String fullName, String jobTitle) {
        return new Email("Your job posting is live — DHotels24.com", layout(
            jobTitle + " is now live on DHotels24.com.",
            "Job approved", "Your job posting is live", Tone.BRASS,
            body().greeting(fullName)
                .paragraph("Good news — your job posting for ", jobTitle, " has been approved.")
                .paragraph("It is now live and visible to job seekers.")
                .button("View in dashboard", SITE + "/dashboard/jobs")));
    }

    @Async
    public void sendJobRejectedEmail(String toEmail, String fullName, String jobTitle, String reason) {
        send(toEmail, jobRejected(fullName, jobTitle, reason));
    }

    static Email jobRejected(String fullName, String jobTitle, String reason) {
        return new Email("Update on your job posting — DHotels24.com", layout(
            jobTitle + " needs changes before it can go live.",
            "Changes needed", "Your job posting needs a few changes", Tone.ALERT,
            body().greeting(fullName)
                .paragraph("We couldn't approve your job posting for ", jobTitle, " yet.")
                .quote("What needs to change", reason, Tone.ALERT)
                .paragraph("Update the posting from your dashboard and submit it again.")
                .button("Update job posting", SITE + "/dashboard/jobs")));
    }

    @Async
    public void sendItemDeletedEmail(String toEmail, String fullName, String itemType, String itemTitle) {
        send(toEmail, itemDeleted(fullName, itemType, itemTitle));
    }

    static Email itemDeleted(String fullName, String itemType, String itemTitle) {
        String type = itemType == null ? "Item" : itemType;
        return new Email(type + " removed: " + itemTitle + " — DHotels24.com", layout(
            "Your " + type.toLowerCase() + " " + itemTitle + " was removed.",
            type + " removed", "Your " + type.toLowerCase() + " was removed", Tone.ALERT,
            body().greeting(fullName)
                .paragraph("Your " + type.toLowerCase() + " ", itemTitle, " has been removed from DHotels24.com by an administrator.")
                .paragraph("If you think this was a mistake or have questions, contact our team.")
                .button("Contact us", SITE + "/contact-us")));
    }

    @Async
    public void sendListingDeletedByAdminEmail(String toEmail, String fullName, String listingTitle, String reason) {
        send(toEmail, listingDeletedByAdmin(fullName, listingTitle, reason));
    }

    static Email listingDeletedByAdmin(String fullName, String listingTitle, String reason) {
        return new Email("Your listing was removed — DHotels24.com", layout(
            listingTitle + " was removed from DHotels24.com.",
            "Listing removed", "Your listing was removed", Tone.ALERT,
            body().greeting(fullName)
                .paragraph("Your listing ", listingTitle, " has been removed by an administrator.")
                .quote("Reason", reason, Tone.ALERT)
                .paragraph("If you think this was a mistake or have questions, contact our team.")
                .button("Contact us", SITE + "/contact-us")));
    }

    @Async
    public void sendListingDeletedByOwnerEmail(String toAdmin, String ownerName, String ownerEmail,
                                               Long listingId, String uniqueCode, String listingTitle, String reason) {
        send(toAdmin, listingDeletedByOwner(ownerName, ownerEmail, listingId, uniqueCode, listingTitle, reason));
    }

    static Email listingDeletedByOwner(String ownerName, String ownerEmail, Long listingId, String uniqueCode,
                                       String listingTitle, String reason) {
        return new Email("Listing deleted by owner — DHotels24.com", layout(
            ownerName + " deleted " + listingTitle + ".",
            "Owner action", "A listing was deleted by its owner", Tone.BRASS,
            body().details("Listing", rows(
                    "Title", listingTitle,
                    "ID", listingId == null ? null : String.valueOf(listingId),
                    "Code", uniqueCode,
                    "Owner", ownerName,
                    "Email", ownerEmail))
                .quote("Reason given", reason, Tone.BRASS)
                .button("Open admin listings", SITE + "/admin/listings")));
    }

    // ========== 9. Consultation Notification to Admin ==========
    @Async
    public void sendConsultationNotification(String toAdmin, String name, String email, String phone, String preferredDate, String timeSlot, String topic) {
        send(toAdmin, consultation(name, email, phone, preferredDate, timeSlot, topic));
    }

    static Email consultation(String name, String email, String phone, String preferredDate, String timeSlot, String topic) {
        return new Email("New call request — DHotels24.com", layout(
            name + " asked for a call.",
            "Call request", "New consultation request", Tone.BRASS,
            body().details("Requested by", rows(
                    "Name", name,
                    "Email", email,
                    "Phone", phone,
                    "Date", preferredDate != null ? preferredDate : "Flexible",
                    "Duration", timeSlot != null ? timeSlot : "Flexible"))
                .quote("Topic", topic, Tone.BRASS)
                .button("View consultations", SITE + "/admin/consultations")));
    }

    // ========== 10. Mandate Notification to Admin ==========
    @Async
    public void sendMandateNotification(String toAdmin, String name, String email, String phone, String objectives) {
        send(toAdmin, mandate(name, email, phone, objectives));
    }

    static Email mandate(String name, String email, String phone, String objectives) {
        return new Email("New mandate submission — DHotels24.com", layout(
            name + " submitted a mandate.",
            "Mandate", "New mandate submission", Tone.BRASS,
            body().details("Submitted by", rows("Name", name, "Email", email, "Phone", phone))
                .quote("Objectives", objectives, Tone.BRASS)
                .button("View mandates", SITE + "/admin/mandates")));
    }

    // ========== Helper ==========
    private void send(String to, Email email) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail, "DHotels24.com");
            helper.setTo(to);
            helper.setSubject(email.subject());
            helper.setText(email.html(), true);
            mailSender.send(mimeMessage);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {} — Error: {}", to, e.getMessage());
        }
    }
}
