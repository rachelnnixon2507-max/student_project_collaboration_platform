package com.project.platform.dto.response;

import java.time.LocalDateTime;

/**
 * Summary for active chat list (project channels and direct conversations).
 * Owned by Member 2 - Team Collaboration.
 */
public record ConversationSummaryResponse(
    String conversationType, // "PROJECT" or "DIRECT"
    Long targetId,           // projectId or userId
    String title,            // Project Title or User Name
    String subtitle,         // Project status / User email
    String lastMessage,
    LocalDateTime lastMessageAt,
    int unreadCount
) {}
