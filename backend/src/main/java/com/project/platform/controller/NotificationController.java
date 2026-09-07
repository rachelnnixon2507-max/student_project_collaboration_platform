package com.project.platform.controller;

import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.NotificationResponse;
import com.project.platform.dto.response.UnreadCountResponse;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Notifications module (Member 1).
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<Page<NotificationResponse>> getMyNotifications(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.ok(notificationService.getMyNotifications(principal.getId(), pageable));
    }

    @GetMapping("/unread-count")
    public ApiResponse<UnreadCountResponse> getUnreadCount(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(notificationService.getUnreadCount(principal.getId()));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        NotificationResponse updated = notificationService.markAsRead(id, principal.getId());
        return ApiResponse.ok("Notification marked as read", updated);
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        notificationService.markAllAsRead(principal.getId());
        return ApiResponse.ok("All notifications marked as read", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        notificationService.deleteNotification(id, principal.getId());
        return ApiResponse.ok("Notification deleted successfully", null);
    }
}
