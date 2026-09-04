package com.project.platform.dto.response;

import java.util.List;

public record RevieweeRatingSummaryResponse(
    Long revieweeId,
    double averageRating,
    int totalReviews,
    List<TeamMemberReviewResponse> reviews
) {}
