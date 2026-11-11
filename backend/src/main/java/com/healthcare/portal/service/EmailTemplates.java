package com.healthcare.portal.service;

import org.springframework.web.util.HtmlUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Year;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Builds DHotels24.com emails in the site's "Midnight & Brass" style: ink background, brass accent,
 * serif headings. Every email shares one layout so they stay consistent.
 *
 * Email clients ignore most CSS, so everything is table-based with inline styles, web-safe font
 * fallbacks (Georgia for Fraunces, Arial for Manrope) and a "bulletproof" table button.
 * All text passed in is HTML-escaped here; callers never escape.
 */
final class EmailTemplates {

    static final String SITE = "https://dhotels24.com";

    // Colours from frontend/tailwind.config.js (ink = gray, brass = primary)
    private static final String INK_950 = "#091013";
    private static final String INK_900 = "#0E171B";
    private static final String INK_850 = "#131D22";
    private static final String INK_700 = "#26343A";
    private static final String INK_500 = "#5D6D74";
    private static final String INK_400 = "#8796A0";
    private static final String INK_300 = "#AEB9B8";
    private static final String INK_50 = "#F4F6F5";
    private static final String BRASS_400 = "#C9A25A";
    private static final String BRASS_200 = "#EBD7A6";
    private static final String ALERT = "#E0907E";

    private static final String SERIF = "'Fraunces',Georgia,'Times New Roman',serif";
    private static final String SANS = "'Manrope','Helvetica Neue',Arial,sans-serif";

    enum Tone { BRASS, ALERT }

    record Email(String subject, String html) {}

    private EmailTemplates() {}

    static String esc(String value) {
        return value == null ? "" : HtmlUtils.htmlEscape(value);
    }

    static String url(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    /** Fluent builder for the content area between the shared header and footer. */
    static final class Body {
        private final StringBuilder html = new StringBuilder();

        Body greeting(String name) {
            String n = name == null || name.isBlank() ? "there" : name.trim();
            return paragraph("Hello " + n + ",");
        }

        /** Plain text paragraph (escaped). */
        Body paragraph(String text) {
            html.append("<p style=\"margin:0 0 16px;font-family:").append(SANS).append(";font-size:16px;line-height:1.65;color:")
                .append(INK_300).append(";\">").append(esc(text)).append("</p>");
            return this;
        }

        /** Paragraph where {@code highlight} is shown in light brass; both parts escaped. */
        Body paragraph(String before, String highlight, String after) {
            html.append("<p style=\"margin:0 0 16px;font-family:").append(SANS).append(";font-size:16px;line-height:1.65;color:")
                .append(INK_300).append(";\">").append(esc(before))
                .append("<strong style=\"color:").append(BRASS_200).append(";font-weight:600;\">").append(esc(highlight)).append("</strong>")
                .append(esc(after)).append("</p>");
            return this;
        }

        Body small(String text) {
            html.append("<p style=\"margin:16px 0 0;font-family:").append(SANS).append(";font-size:13px;line-height:1.6;color:")
                .append(INK_400).append(";\">").append(esc(text)).append("</p>");
            return this;
        }

        Body bullets(String... items) {
            html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:4px 0 20px;\">");
            for (String item : items) {
                html.append("<tr><td valign=\"top\" style=\"padding:9px 12px 0 0;\"><div style=\"width:12px;height:1px;background:")
                    .append(BRASS_400).append(";line-height:1px;font-size:1px;\">&nbsp;</div></td>")
                    .append("<td style=\"padding:0 0 8px;font-family:").append(SANS).append(";font-size:15px;line-height:1.6;color:")
                    .append(INK_300).append(";\">").append(esc(item)).append("</td></tr>");
            }
            html.append("</table>");
            return this;
        }

        /** Label/value card. Values starting with mailto:/tel: are rendered as links. */
        Body details(String title, Map<String, String> rows) {
            html.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:8px 0 20px;background:")
                .append(INK_850).append(";border:1px solid ").append(INK_700).append(";border-radius:12px;\"><tr><td style=\"padding:20px 22px;\">");
            if (title != null) {
                html.append(eyebrowHtml(title, BRASS_400, 14));
            }
            html.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");
            rows.forEach((label, value) -> {
                String shown = value == null || value.isBlank() ? "—" : value.trim();
                String cell = esc(shown);
                if (value != null && value.contains("@") && !value.contains(" ")) {
                    cell = link("mailto:" + value.trim(), shown);
                } else if (value != null && label.toLowerCase().contains("phone") && shown.matches("[+0-9 ()-]{6,}")) {
                    cell = link("tel:" + shown.replaceAll("[^+0-9]", ""), shown);
                }
                html.append("<tr><td valign=\"top\" style=\"padding:6px 14px 6px 0;width:110px;font-family:").append(SANS)
                    .append(";font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:").append(INK_400).append(";\">")
                    .append(esc(label)).append("</td><td style=\"padding:6px 0;font-family:").append(SANS)
                    .append(";font-size:15px;line-height:1.5;color:").append(INK_50).append(";word-break:break-word;\">")
                    .append(cell).append("</td></tr>");
            });
            html.append("</table></td></tr></table>");
            return this;
        }

        /** Quoted block for free text (messages, reasons). Line breaks are kept. */
        Body quote(String title, String text, Tone tone) {
            String accent = tone == Tone.ALERT ? ALERT : BRASS_400;
            html.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:8px 0 20px;background:")
                .append(INK_850).append(";border:1px solid ").append(INK_700).append(";border-left:3px solid ").append(accent)
                .append(";border-radius:12px;\"><tr><td style=\"padding:18px 22px;\">");
            if (title != null) {
                html.append(eyebrowHtml(title, accent, 10));
            }
            String body = text == null || text.isBlank() ? "—" : esc(text.trim()).replace("\r\n", "\n").replace("\n", "<br>");
            html.append("<p style=\"margin:0;font-family:").append(SANS).append(";font-size:15px;line-height:1.65;color:")
                .append(INK_50).append(";\">").append(body).append("</p></td></tr></table>");
            return this;
        }

        /** Large one-time code. */
        Body code(String code) {
            html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" align=\"center\" style=\"margin:8px auto 24px;\">")
                .append("<tr><td style=\"padding:18px 30px;background:").append(INK_850).append(";border:1px solid ").append(INK_700)
                .append(";border-radius:14px;font-family:").append(SERIF).append(";font-size:38px;letter-spacing:12px;color:")
                .append(BRASS_200).append(";text-align:center;\">").append(esc(code)).append("</td></tr></table>");
            return this;
        }

        /** Pill button, brass like .btn-brass on the site. {@code href} must be a trusted absolute URL. */
        Body button(String label, String href) {
            html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:12px 0 8px;\"><tr>")
                .append("<td align=\"center\" bgcolor=\"").append(BRASS_400).append("\" style=\"border-radius:999px;background:").append(BRASS_400).append(";\">")
                .append("<a href=\"").append(esc(href)).append("\" target=\"_blank\" style=\"display:inline-block;padding:14px 30px;font-family:")
                .append(SANS).append(";font-size:15px;font-weight:700;color:").append(INK_950)
                .append(";text-decoration:none;border-radius:999px;\">").append(esc(label)).append(" &rarr;</a></td></tr></table>");
            return this;
        }

        /** The button's URL in plain text, for clients that block buttons. */
        Body fallbackLink(String href) {
            html.append("<p style=\"margin:14px 0 0;font-family:").append(SANS).append(";font-size:13px;line-height:1.6;color:")
                .append(INK_400).append(";\">If the button doesn't work, copy this link into your browser:<br>")
                .append("<a href=\"").append(esc(href)).append("\" style=\"color:").append(BRASS_400)
                .append(";word-break:break-all;\">").append(esc(href)).append("</a></p>");
            return this;
        }

        String html() {
            return html.toString();
        }
    }

    static Body body() {
        return new Body();
    }

    /**
     * Wraps content in the shared layout.
     *
     * @param preheader inbox preview text
     * @param eyebrow   small uppercase label above the title
     * @param title     main heading
     */
    static String layout(String preheader, String eyebrow, String title, Tone tone, Body content) {
        String accent = tone == Tone.ALERT ? ALERT : BRASS_400;
        return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            + "<meta name=\"color-scheme\" content=\"dark\"><meta name=\"supported-color-schemes\" content=\"dark\">"
            + "<title>" + esc(title) + "</title>"
            + "<link href=\"https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Manrope:wght@400;600;700&display=swap\" rel=\"stylesheet\">"
            + "</head>"
            + "<body style=\"margin:0;padding:0;background:" + INK_950 + ";-webkit-text-size-adjust:100%;\">"
            // Inbox preview text, hidden in the email itself
            + "<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:" + INK_950 + ";\">" + esc(preheader) + "</div>"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"" + INK_950 + "\" style=\"background:" + INK_950 + ";\">"
            + "<tr><td align=\"center\" style=\"padding:32px 12px;\">"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:600px;\">"

            // Brand row
            + "<tr><td style=\"padding:0 8px 22px;\"><a href=\"" + SITE + "\" target=\"_blank\" style=\"text-decoration:none;\">"
            + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>"
            + "<td valign=\"middle\" style=\"padding-right:10px;\"><img src=\"" + SITE + "/images/logo.png\" width=\"34\" height=\"34\" alt=\"\" style=\"display:block;border:0;\"></td>"
            + "<td valign=\"middle\"><div style=\"font-family:" + SERIF + ";font-size:22px;line-height:1;color:" + INK_50 + ";\">DHotels24<span style=\"color:" + BRASS_400 + ";\">.com</span></div>"
            + "<div style=\"padding-top:5px;font-family:" + SANS + ";font-size:9px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:" + BRASS_400 + ";\">Hospitality Marketplace</div></td>"
            + "</tr></table></a></td></tr>"

            // Card
            + "<tr><td bgcolor=\"" + INK_900 + "\" style=\"background:" + INK_900 + ";border:1px solid " + INK_700 + ";border-radius:18px;\">"
            + "<div style=\"height:2px;line-height:2px;font-size:2px;background:" + accent + ";border-radius:18px 18px 0 0;\">&nbsp;</div>"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding:34px 34px 30px;\">"
            + eyebrowHtml(eyebrow, accent, 14)
            + "<h1 style=\"margin:0 0 22px;font-family:" + SERIF + ";font-size:30px;line-height:1.2;font-weight:400;letter-spacing:-0.01em;color:" + INK_50 + ";\">" + esc(title) + "</h1>"
            + content.html()
            + "</td></tr></table></td></tr>"

            // Footer
            + "<tr><td style=\"padding:24px 8px 0;font-family:" + SANS + ";font-size:12px;line-height:1.7;color:" + INK_500 + ";\">"
            + "<a href=\"" + SITE + "/listings\" style=\"color:" + INK_400 + ";text-decoration:none;\">Browse listings</a>&nbsp;&nbsp;·&nbsp;&nbsp;"
            + "<a href=\"" + SITE + "/dashboard\" style=\"color:" + INK_400 + ";text-decoration:none;\">Your dashboard</a>&nbsp;&nbsp;·&nbsp;&nbsp;"
            + "<a href=\"" + SITE + "/contact-us\" style=\"color:" + INK_400 + ";text-decoration:none;\">Contact us</a><br>"
            + "© " + Year.now().getValue() + " DHotels24.com · Dhumavati Consulting LLP. India's hospitality leasing marketplace."
            + "</td></tr>"

            + "</table></td></tr></table></body></html>";
    }

    private static String eyebrowHtml(String text, String color, int marginBottom) {
        return "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:0 0 " + marginBottom + "px;\"><tr>"
            + "<td valign=\"middle\" style=\"padding-right:10px;\"><div style=\"width:28px;height:1px;background:" + color + ";line-height:1px;font-size:1px;\">&nbsp;</div></td>"
            + "<td valign=\"middle\" style=\"font-family:" + SANS + ";font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:" + color + ";\">"
            + esc(text) + "</td></tr></table>";
    }

    private static String link(String href, String text) {
        return "<a href=\"" + esc(href) + "\" style=\"color:" + BRASS_400 + ";text-decoration:none;\">" + esc(text) + "</a>";
    }

    static Map<String, String> rows(String... labelValuePairs) {
        Map<String, String> rows = new LinkedHashMap<>();
        for (int i = 0; i + 1 < labelValuePairs.length; i += 2) {
            rows.put(labelValuePairs[i], labelValuePairs[i + 1]);
        }
        return rows;
    }
}
