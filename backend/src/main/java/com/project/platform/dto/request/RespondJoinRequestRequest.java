package com.project.platform.dto.request;

import com.project.platform.entity.enums.JoinRequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RespondJoinRequestRequest(
    @NotNull(message = "Status is required (ACCEPTED or REJECTED)")
    JoinRequestStatus status,

    @Size(max = 1000, message = "Note cannot exceed 1000 characters")
    String note
) {}
