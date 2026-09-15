package com.project.platform.dto.request;

import jakarta.validation.constraints.NotNull;

public record RespondInvitationRequest(
        @NotNull(message = "Project ID is required")
        Long projectId,

        Long notificationId,

        boolean accept,

        String message
) {}
