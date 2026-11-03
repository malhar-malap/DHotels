package com.healthcare.portal.service;

import com.healthcare.portal.dto.NotificationDTO;
import com.healthcare.portal.dto.PageResponse;
import com.healthcare.portal.entity.Notification;
import com.healthcare.portal.entity.User;
import com.healthcare.portal.entity.UserRole;
import com.healthcare.portal.repository.NotificationRepository;
import com.healthcare.portal.repository.UserRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * In-app notifications, created alongside (not instead of) the existing emails.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final int RETENTION_DAYS = 90;

    /** Notification types; the frontend picks an icon per type. */
    public static final String LISTING_APPROVED = "LISTING_APPROVED";
    public static final String LISTING_REJECTED = "LISTING_REJECTED";
    public static final String LISTING_DELETED = "LISTING_DELETED";
    public static final String LISTING_PENDING = "LISTING_PENDING";
    public static final String LISTING_FEATURED = "LISTING_FEATURED";
    public static final String INQUIRY_RECEIVED = "INQUIRY_RECEIVED";
    public static final String CONTACT_UNLOCKED = "CONTACT_UNLOCKED";
    public static final String JOB_APPROVED = "JOB_APPROVED";
    public static final String JOB_REJECTED = "JOB_REJECTED";
    public static final String JOB_DELETED = "JOB_DELETED";
    public static final String JOB_PENDING = "JOB_PENDING";
    public static final String APPLICATION_RECEIVED = "APPLICATION_RECEIVED";
    public static final String APPLICATION_UPDATED = "APPLICATION_UPDATED";
    public static final String VERIFICATION_APPROVED = "VERIFICATION_APPROVED";
    public static final String VERIFICATION_REJECTED = "VERIFICATION_REJECTED";
    public static final String VERIFICATION_PENDING = "VERIFICATION_PENDING";
    public static final String ADMIN_ALERT = "ADMIN_ALERT";
    public static final String WELCOME = "WELCOME";

    private final NotificationRepository notificationRepository;
    private final UserRoleRepository userRoleRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRoleRepository userRoleRepository) {
        this.notificationRepository = notificationRepository;
        this.userRoleRepository = userRoleRepository;
    }

    public void notify(User user, String type, String title, String message, String link) {
        if (user == null || user.getId() == null) {
            return;
        }
        notify(user.getId(), type, title, message, link);
    }

    public void notify(Long userId, String type, String title, String message, String link) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(truncate(title, 200));
        n.setMessage(message);
        n.setLink(truncate(link, 300));
        notificationRepository.save(n);
    }

    /** Sends the same notification to every ADMIN user. */
    public void notifyAdmins(String type, String title, String message, String link) {
        Set<Long> adminIds = new LinkedHashSet<>();
        userRoleRepository.findByRole(UserRole.Role.ADMIN).forEach(r -> adminIds.add(r.getUser().getId()));
        adminIds.forEach(id -> notify(id, type, title, message, link));
    }

    public PageResponse<NotificationDTO.NotificationResponse> getNotifications(Long userId, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        return PageResponse.from(notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(Math.max(page, 0), safeSize))
                .map(NotificationDTO.NotificationResponse::from));
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markRead(Long id, Long userId) {
        Notification n = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }

    @Transactional
    public void deleteAllForUser(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }

    /** Daily at 03:30: drop read notifications older than RETENTION_DAYS. */
    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void purgeOldReadNotifications() {
        int removed = notificationRepository.deleteReadOlderThan(LocalDateTime.now().minusDays(RETENTION_DAYS));
        if (removed > 0) {
            log.info("Removed {} read notifications older than {} days", removed, RETENTION_DAYS);
        }
    }

    private static String truncate(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max - 1) + "…";
    }
}
