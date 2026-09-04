package com.project.platform.controller;

import com.project.platform.dto.request.CreateTeamMemberReviewRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.RevieweeRatingSummaryResponse;
import com.project.platform.dto.response.TeamMemberReviewResponse;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.TeamMemberReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feature 7: Rate & Review Team Members.
 * Creating a review: any authenticated STUDENT (about a teammate in a shared project).
 * Viewing: STUDENT, FACULTY, or ADMIN.
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class TeamMemberReviewController {

    private final TeamMemberReviewService teamMemberReviewService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ApiResponse<TeamMemberReviewResponse> createReview(
        @Valid @RequestBody CreateTeamMemberReviewRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok("Review submitted", teamMemberReviewService.createReview(request, principal.getId()));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','ADMIN')")
    public ApiResponse<List<TeamMemberReviewResponse>> getReviewsForProject(@PathVariable Long projectId) {
        return ApiResponse.ok(teamMemberReviewService.getReviewsForProject(projectId));
    }

    @GetMapping("/student/{studentUserId}/summary")
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','ADMIN')")
    public ApiResponse<RevieweeRatingSummaryResponse> getRatingSummary(@PathVariable Long studentUserId) {
        return ApiResponse.ok(teamMemberReviewService.getRatingSummaryForStudent(studentUserId));
    }
}
