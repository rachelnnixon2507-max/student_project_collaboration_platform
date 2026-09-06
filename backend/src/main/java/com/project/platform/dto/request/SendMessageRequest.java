package com.project.platform.dto.request;

import com.project.platform.entity.enums.MessageType;
import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for sending a chat message (project channel or direct message).
 * Owned by Member 2 - Team Collaboration.
 */
public record SendMessageRequest(
    Long projectId,

    Long receiverId,

    @NotBlank(message = "content cannot be blank")
    String content,

    MessageType messageType
) {}
