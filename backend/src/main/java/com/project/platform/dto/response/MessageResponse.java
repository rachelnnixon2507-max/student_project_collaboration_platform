package com.project.platform.dto.response;

import com.project.platform.entity.enums.MessageType;

import java.time.LocalDateTime;

/**
 * Detailed chat/direct message response.
 * Owned by Member 2 - Team Collaboration.
 */
public record MessageResponse(
    Long id,
    Long senderId,
    String senderName,
    String senderEmail,
    String senderRole,
    Long projectId,
    String projectTitle,
    Long receiverId,
    String receiverName,
    String content,
    MessageType messageType,
    Boolean isRead,
    LocalDateTime createdAt
) {}
