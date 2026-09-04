package com.project.platform.dto.response;

import java.time.LocalDateTime;

public record TeamMemberReviewResponse(
    Long id,
    Long projectId,
    Long reviewerId,
    Long revieweeId,
    Integer rating,
    String comments,
    LocalDateTime createdAt
) {}
