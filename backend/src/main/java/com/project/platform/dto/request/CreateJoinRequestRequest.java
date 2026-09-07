package com.project.platform.dto.request;

import jakarta.validation.constraints.Size;

public record CreateJoinRequestRequest(
    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    String message
) {}
