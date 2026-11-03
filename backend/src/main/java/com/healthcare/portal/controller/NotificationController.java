package com.healthcare.portal.controller;

import com.healthcare.portal.dto.ApiResponse;
import com.healthcare.portal.dto.NotificationDTO;
import com.healthcare.portal.dto.PageResponse;
import com.healthcare.portal.service.AuthService;
import com.healthcare.portal.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications", description = "In-app notifications for the current user")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "List my notifications", description = "Newest first, paginated")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDTO.NotificationResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getCurrentUserEntity().getId();
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(userId, page, size)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount() {
        Long userId = authService.getCurrentUserEntity().getId();
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", notificationService.getUnreadCount(userId))));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark one notification as read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        notificationService.markRead(id, authService.getCurrentUserEntity().getId());
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all my notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead(authService.getCurrentUserEntity().getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
