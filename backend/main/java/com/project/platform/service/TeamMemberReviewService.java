package com.project.platform.service;

import com.project.platform.dto.request.CreateTeamMemberReviewRequest;
import com.project.platform.dto.response.RevieweeRatingSummaryResponse;
import com.project.platform.dto.response.TeamMemberReviewResponse;

import java.util.List;

/** Feature 7: Rate & Review Team Members. */
public interface TeamMemberReviewService {

    TeamMemberReviewResponse createReview(CreateTeamMemberReviewRequest request, Long reviewerId);

    List<TeamMemberReviewResponse> getReviewsForProject(Long projectId);

    RevieweeRatingSummaryResponse getRatingSummaryForStudent(Long studentUserId);
}
