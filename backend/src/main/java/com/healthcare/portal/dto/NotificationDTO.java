package com.healthcare.portal.dto;

import com.healthcare.portal.entity.Notification;
import java.time.LocalDateTime;

public class NotificationDTO {

    public static class NotificationResponse {
        private Long id;
        private String type;
        private String title;
        private String message;
        private String link;
        private Boolean isRead;
        private LocalDateTime createdAt;

        public static NotificationResponse from(Notification n) {
            NotificationResponse r = new NotificationResponse();
            r.id = n.getId();
            r.type = n.getType();
            r.title = n.getTitle();
            r.message = n.getMessage();
            r.link = n.getLink();
            r.isRead = n.getIsRead();
            r.createdAt = n.getCreatedAt();
            return r;
        }

        public Long getId() { return id; }
        public String getType() { return type; }
        public String getTitle() { return title; }
        public String getMessage() { return message; }
        public String getLink() { return link; }
        public Boolean getIsRead() { return isRead; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
