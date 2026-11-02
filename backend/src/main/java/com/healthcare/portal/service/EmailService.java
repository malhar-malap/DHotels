package com.healthcare.portal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service for sending email notifications.
 * All methods are @Async so they run in a background thread.
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
        String subject = "Welcome to DHotels24.in!";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>Welcome to DHotels24.in!</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + fullName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Thank you for registering on <strong style='color:#f7b538;'>DHotels24.in</strong> — India's premier hospitality marketplace.</p>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>You can now:</p>"
            + "<ul style='color:#9ca3af;font-size:15px;line-height:1.8;'>"
            + "<li>Browse and post listings for hotels, cafes, restaurants, resto-bars, banquet halls & resorts</li>"
            + "<li>Find and post hospitality careers and executive positions</li>"
            + "<li>Connect with verified owners, operators, and investors</li>"
            + "</ul>"
            + "<div style='text-align:center;margin:30px 0;'>"
            + "<a href='https://dhotels24.in/dashboard' style='background:#f7b538;color:#1a1a2e;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>Go to Dashboard</a>"
            + "</div>"
            + "<p style='color:#6b7280;font-size:13px;'>If you did not create this account, please ignore this email.</p>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(toEmail, subject, body);
    }

    // ========== 2. Buyer Verified / Approved Email ==========
    @Async
    public void sendBuyerApprovedEmail(String toEmail, String fullName) {
        String subject = "Your Buyer Verification is Approved — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>✅ Verified Buyer</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Congratulations, " + fullName + "!</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Your KYC verification has been <strong style='color:#f7b538;'>approved</strong> by our admin team.</p>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>As a verified buyer, you now have access to:</p>"
            + "<ul style='color:#9ca3af;font-size:15px;line-height:1.8;'>"
            + "<li>View full details of <strong>confidential listings</strong></li>"
            + "<li>Contact sellers directly for confidential deals</li>"
            + "<li>Priority access to premium listings</li>"
            + "</ul>"
            + "<div style='text-align:center;margin:30px 0;'>"
            + "<a href='https://dhotels24.in/listings' style='background:#f7b538;color:#1a1a2e;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>Browse Listings</a>"
            + "</div>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(toEmail, subject, body);
    }

    // ========== 3. Inquiry Notification to Seller ==========
    @Async
    public void sendInquiryNotificationToSeller(String sellerEmail, String sellerName,
            String buyerName, String buyerEmail, String buyerPhone, String message, String listingTitle) {
        String subject = "New Inquiry for Your Listing: " + listingTitle;
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>📩 New Inquiry Received</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + sellerName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>You have received a new inquiry for your listing <strong style='color:#f7b538;'>\"" + listingTitle + "\"</strong>.</p>"
            + "<div style='background:#1e293b;border:1px solid #334155;border-radius:8px;padding:20px;margin:20px 0;'>"
            + "<h3 style='color:#f7b538;margin-top:0;'>Buyer Details</h3>"
            + "<table style='width:100%;font-size:15px;color:#9ca3af;'>"
            + "<tr><td style='padding:5px 0;font-weight:bold;width:100px;color:#e5e7eb;'>Name:</td><td>" + buyerName + "</td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Email:</td><td><a href='mailto:" + buyerEmail + "' style='color:#f7b538;'>" + buyerEmail + "</a></td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Phone:</td><td><a href='tel:" + buyerPhone + "' style='color:#f7b538;'>" + buyerPhone + "</a></td></tr>"
            + "</table>"
            + "<h3 style='color:#f7b538;margin-bottom:5px;'>Message</h3>"
            + "<p style='color:#d1d5db;font-size:15px;line-height:1.6;background:#111827;padding:12px;border-radius:6px;border:1px solid #374151;'>" + message + "</p>"
            + "</div>"
            + "<div style='text-align:center;margin:25px 0;'>"
            + "<a href='https://dhotels24.in/dashboard/inquiries' style='background:#f7b538;color:#1a1a2e;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>View Inquiries</a>"
            + "</div>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(sellerEmail, subject, body);
    }

    // ========== 4. Job Application Notification to Employer ==========
    @Async
    public void sendJobApplicationNotification(String employerEmail, String employerName,
            String seekerName, String seekerEmail, String jobTitle) {
        String subject = "New Application for: " + jobTitle;
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>📋 New Job Application</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + employerName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>A new candidate has applied for your job posting <strong style='color:#f7b538;'>\"" + jobTitle + "\"</strong>.</p>"
            + "<div style='background:#1e293b;border:1px solid #334155;border-radius:8px;padding:20px;margin:20px 0;'>"
            + "<h3 style='color:#f7b538;margin-top:0;'>Applicant Details</h3>"
            + "<table style='width:100%;font-size:15px;color:#9ca3af;'>"
            + "<tr><td style='padding:5px 0;font-weight:bold;width:100px;color:#e5e7eb;'>Name:</td><td>" + seekerName + "</td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Email:</td><td><a href='mailto:" + seekerEmail + "' style='color:#f7b538;'>" + seekerEmail + "</a></td></tr>"
            + "</table>"
            + "</div>"
            + "<div style='text-align:center;margin:25px 0;'>"
            + "<a href='https://dhotels24.in/dashboard/applications' style='background:#f7b538;color:#1a1a2e;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>View Applications</a>"
            + "</div>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(employerEmail, subject, body);
    }

    // ========== 5. OTP Verification Email ==========
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Your DHotels24.in Verification Code: " + otp;
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>🔐 Email Verification</h1>"
            + "</div>"
            + "<div style='padding:30px;text-align:center;'>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Use the following verification code to complete your registration on <strong style='color:#f7b538;'>DHotels24.in</strong>.</p>"
            + "<div style='background:#1e293b;border:2px dashed #f7b538;border-radius:12px;padding:25px;margin:25px auto;max-width:280px;'>"
            + "<p style='font-size:40px;font-weight:bold;color:#f7b538;letter-spacing:12px;margin:0;font-family:monospace;'>" + otp + "</p>"
            + "</div>"
            + "<p style='color:#6b7280;font-size:14px;'>This code expires in <strong style='color:#e5e7eb;'>5 minutes</strong>.</p>"
            + "<p style='color:#6b7280;font-size:13px;margin-top:20px;'>If you did not request this code, please ignore this email.</p>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(toEmail, subject, body);
    }

    // ========== 6. Forgot Password Email ==========
    public void sendForgotPasswordEmail(String toEmail, String otp) {
        String resetUrl = "https://dhotels24.in/reset-password?email=" + toEmail + "&otp=" + otp;
        String subject = "Reset Your Password - DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>🔑 Password Reset</h1>"
            + "</div>"
            + "<div style='padding:40px;text-align:center;'>"
            + "<p style='color:#e5e7eb;font-size:18px;font-weight:600;'>Hello,</p>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>We received a request to reset your password for your DHotels24.in account. Click the button below to verify your identity and set a new password:</p>"
            + "<div style='margin:35px 0;'>"
            + "<a href='" + resetUrl + "' style='background-color:#f7b538;color:#1a1a2e;padding:14px 30px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;display:inline-block;box-shadow:0 4px 6px rgba(247,181,56,0.2);'>Verify & Reset Password</a>"
            + "</div>"
            + "<p style='color:#6b7280;font-size:14px;'>If the button doesn't work, copy and paste this link into your browser:</p>"
            + "<p style='color:#f7b538;font-size:14px;word-break:break-all;'>" + resetUrl + "</p>"
            + "<p style='color:#ef4444;font-size:14px;margin-top:25px;border-top:1px solid #1e293b;padding-top:20px;'>If you did not request a password reset, please ignore this email.</p>"
            + "</div>"
            + "<div style='background:#0f172a;padding:20px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(toEmail, subject, body);
    }


    // ========== 7. Contact Message Notification to Admin ==========
    @Async
    public void sendContactMessageNotification(String adminEmail, String senderName,
            String senderEmail, String senderPhone, String subject, String message) {
        String emailSubject = "New Contact Message: " + (subject != null ? subject : "No Subject");
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>📬 New Contact Message</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>New Contact Form Submission</h2>"
            + "<div style='background:#1e293b;border:1px solid #334155;border-radius:8px;padding:20px;margin:20px 0;'>"
            + "<h3 style='color:#f7b538;margin-top:0;'>Sender Details</h3>"
            + "<table style='width:100%;font-size:15px;color:#9ca3af;'>"
            + "<tr><td style='padding:5px 0;font-weight:bold;width:100px;color:#e5e7eb;'>Name:</td><td>" + senderName + "</td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Email:</td><td><a href='mailto:" + senderEmail + "' style='color:#f7b538;'>" + senderEmail + "</a></td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Phone:</td><td>" + (senderPhone != null ? senderPhone : "N/A") + "</td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Subject:</td><td>" + (subject != null ? subject : "N/A") + "</td></tr>"
            + "</table>"
            + "<h3 style='color:#f7b538;margin-bottom:5px;'>Message</h3>"
            + "<p style='color:#d1d5db;font-size:15px;line-height:1.6;background:#111827;padding:12px;border-radius:6px;border:1px solid #374151;'>" + message + "</p>"
            + "</div>"
            + "<div style='text-align:center;margin:25px 0;'>"
            + "<a href='https://dhotels24.in/admin/contact-messages' style='background:#f7b538;color:#1a1a2e;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>View Messages</a>"
            + "</div>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(adminEmail, emailSubject, body);
    }

    // ========== 8. Contact Reply Email to User ==========
    @Async
    public void sendContactReplyEmail(String toEmail, String userName, String originalSubject,
            String originalMessage, String replyContent) {
        String subject = "Re: " + (originalSubject != null ? originalSubject : "Your Contact Message") + " — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>💬 Reply from DHotels24.in</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + userName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Thank you for reaching out to us. Here is our response to your message:</p>"
            + "<div style='background:#1e293b;border:1px solid #334155;border-left:4px solid #f7b538;border-radius:8px;padding:20px;margin:20px 0;'>"
            + "<h3 style='color:#f7b538;margin-top:0;'>Our Reply</h3>"
            + "<p style='color:#d1d5db;font-size:15px;line-height:1.6;white-space:pre-wrap;'>" + replyContent + "</p>"
            + "</div>"
            + "<div style='background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:20px;margin:20px 0;'>"
            + "<h3 style='color:#6b7280;margin-top:0;font-size:14px;'>Your Original Message</h3>"
            + "<p style='color:#4b5563;font-size:13px;line-height:1.5;font-style:italic;'>" + originalMessage + "</p>"
            + "</div>"
            + "<p style='color:#9ca3af;font-size:14px;line-height:1.6;'>If you have any further questions, feel free to reply to this email or visit our website.</p>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(toEmail, subject, body);
    }

    // ========== Helper ==========
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {} — Error: {}", to, e.getMessage());
        }
    }

    // ========== Approval/Rejection Notifications ==========
    @Async
    public void sendListingApprovedEmail(String toEmail, String fullName, String listingTitle) {
        String subject = "Your Listing has been Approved — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #10b981;'>"
            + "<h1 style='color:#10b981;margin:0;font-size:28px;'>✅ Listing Approved</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + fullName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Great news! Your listing <strong>" + listingTitle + "</strong> has been approved by our team.</p>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>It is now live on our marketplace and visible to potential buyers.</p>"
            + "<div style='text-align:center;margin:30px 0;'>"
            + "<a href='https://dhotels24.in/dashboard' style='background:#10b981;color:#ffffff;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>View in Dashboard</a>"
            + "</div>"
            + "</div></div></body></html>";
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendListingRejectedEmail(String toEmail, String fullName, String listingTitle, String reason) {
        String subject = "Update on Your Listing — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #ef4444;'>"
            + "<h1 style='color:#ef4444;margin:0;font-size:28px;'>⚠️ Listing Rejected</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + fullName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Unfortunately, your listing <strong>" + listingTitle + "</strong> could not be approved at this time.</p>"
            + "<div style='background:#1e293b;border-left:4px solid #ef4444;padding:15px;margin:20px 0;'>"
            + "<h3 style='color:#ef4444;margin-top:0;font-size:15px;'>Reason for Rejection:</h3>"
            + "<p style='color:#d1d5db;margin:0;'>" + reason + "</p>"
            + "</div>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Please review the feedback and update your listing in the dashboard to submit it again.</p>"
            + "</div></div></body></html>";
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendJobApprovedEmail(String toEmail, String fullName, String jobTitle) {
        String subject = "Your Job Posting has been Approved — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #10b981;'>"
            + "<h1 style='color:#10b981;margin:0;font-size:28px;'>✅ Job Approved</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + fullName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Great news! Your job posting for <strong>" + jobTitle + "</strong> has been approved by our team.</p>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>It is now live on our platform and visible to job seekers.</p>"
            + "<div style='text-align:center;margin:30px 0;'>"
            + "<a href='https://dhotels24.in/dashboard' style='background:#10b981;color:#ffffff;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>View in Dashboard</a>"
            + "</div>"
            + "</div></div></body></html>";
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendJobRejectedEmail(String toEmail, String fullName, String jobTitle, String reason) {
        String subject = "Update on Your Job Posting — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #ef4444;'>"
            + "<h1 style='color:#ef4444;margin:0;font-size:28px;'>⚠️ Job Rejected</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + fullName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Unfortunately, your job posting for <strong>" + jobTitle + "</strong> could not be approved at this time.</p>"
            + "<div style='background:#1e293b;border-left:4px solid #ef4444;padding:15px;margin:20px 0;'>"
            + "<h3 style='color:#ef4444;margin-top:0;font-size:15px;'>Reason for Rejection:</h3>"
            + "<p style='color:#d1d5db;margin:0;'>" + reason + "</p>"
            + "</div>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>Please review the feedback and update your job posting in the dashboard to submit it again.</p>"
            + "</div></div></body></html>";
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendItemDeletedEmail(String toEmail, String fullName, String itemType, String itemTitle) {
        String subject = "Notice of Deletion: " + itemTitle + " — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #ef4444;'>"
            + "<h1 style='color:#ef4444;margin:0;font-size:28px;'>⚠️ " + itemType + " Deleted</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>Hello " + fullName + ",</h2>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>This is a notice that your " + itemType.toLowerCase() + " <strong>" + itemTitle + "</strong> has been removed from our platform by an administrator.</p>"
            + "<p style='color:#9ca3af;font-size:16px;line-height:1.6;'>If you believe this was a mistake or have any questions, please contact our support team.</p>"
            + "</div></div></body></html>";
        sendHtmlEmail(toEmail, subject, body);
    }
    // ========== 9. Consultation Notification to Admin ==========
    @Async
    public void sendConsultationNotification(String toAdmin, String name, String email, String phone, String preferredDate, String timeSlot, String topic) {
        String subject = "New Call Request — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>📞 New Call Request</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>New Consultation Request</h2>"
            + "<div style='background:#1e293b;border:1px solid #334155;border-radius:8px;padding:20px;margin:20px 0;'>"
            + "<table style='width:100%;font-size:15px;color:#9ca3af;'>"
            + "<tr><td style='padding:5px 0;font-weight:bold;width:120px;color:#e5e7eb;'>Name:</td><td>" + name + "</td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Email:</td><td><a href='mailto:" + email + "' style='color:#f7b538;'>" + email + "</a></td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Phone:</td><td>" + phone + "</td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Date:</td><td>" + (preferredDate != null ? preferredDate : "Flexible") + "</td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Duration:</td><td>" + (timeSlot != null ? timeSlot : "Flexible") + "</td></tr>"
            + "</table>"
            + "<h3 style='color:#f7b538;margin-bottom:5px;margin-top:15px;'>Topic</h3>"
            + "<p style='color:#d1d5db;font-size:15px;line-height:1.6;background:#111827;padding:12px;border-radius:6px;border:1px solid #374151;'>" + (topic != null ? topic : "N/A") + "</p>"
            + "</div>"
            + "<div style='text-align:center;margin:25px 0;'>"
            + "<a href='https://dhotels24.in/admin/consultations' style='background:#f7b538;color:#1a1a2e;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>View Consultations</a>"
            + "</div>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(toAdmin, subject, body);
    }

    // ========== 10. Mandate Notification to Admin ==========
    @Async
    public void sendMandateNotification(String toAdmin, String name, String email, String phone, String objectives) {
        String subject = "New Mandate Submission — DHotels24.in";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#0c1222;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#111827;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);'>"
            + "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;border-bottom:3px solid #f7b538;'>"
            + "<h1 style='color:#f7b538;margin:0;font-size:28px;'>📋 New Mandate Submission</h1>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<h2 style='color:#e5e7eb;'>New Strategic Mandate Received</h2>"
            + "<div style='background:#1e293b;border:1px solid #334155;border-radius:8px;padding:20px;margin:20px 0;'>"
            + "<table style='width:100%;font-size:15px;color:#9ca3af;'>"
            + "<tr><td style='padding:5px 0;font-weight:bold;width:100px;color:#e5e7eb;'>Name:</td><td>" + name + "</td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Email:</td><td><a href='mailto:" + email + "' style='color:#f7b538;'>" + email + "</a></td></tr>"
            + "<tr><td style='padding:5px 0;font-weight:bold;color:#e5e7eb;'>Phone:</td><td>" + phone + "</td></tr>"
            + "</table>"
            + "<h3 style='color:#f7b538;margin-bottom:5px;margin-top:15px;'>Objectives</h3>"
            + "<p style='color:#d1d5db;font-size:15px;line-height:1.6;background:#111827;padding:12px;border-radius:6px;border:1px solid #374151;white-space:pre-wrap;'>" + (objectives != null ? objectives : "N/A") + "</p>"
            + "</div>"
            + "<div style='text-align:center;margin:25px 0;'>"
            + "<a href='https://dhotels24.in/admin/mandates' style='background:#f7b538;color:#1a1a2e;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;'>View Mandates</a>"
            + "</div>"
            + "</div>"
            + "<div style='background:#0f172a;padding:15px;text-align:center;border-top:1px solid #1e293b;'>"
            + "<p style='color:#4b5563;font-size:12px;margin:0;'>© 2026 DHotels24.in. All rights reserved.</p>"
            + "</div></div></body></html>";

        sendHtmlEmail(toAdmin, subject, body);
    }
}
