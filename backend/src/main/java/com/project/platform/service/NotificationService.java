package com.project.platform.service;

import com.project.platform.dto.response.NotificationResponse;
import com.project.platform.dto.response.UnreadCountResponse;
import com.project.platform.entity.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    NotificationResponse createNotification(Long userId, String title, String message, NotificationType type, Long referenceId, String referenceType);

    Page<NotificationResponse> getMyNotifications(Long userId, Pageable pageable);

    UnreadCountResponse getUnreadCount(Long userId);

    NotificationResponse markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    void deleteNotification(Long notificationId, Long userId);
}
