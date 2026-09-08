package com.project.platform.controller;

import com.project.platform.dto.request.CreateFacultyFeedbackRequest;
import com.project.platform.dto.request.CreateProjectApprovalRequest;
import com.project.platform.dto.request.CreateProjectEvaluationRequest;
import com.project.platform.dto.request.UpdateFacultyProfileRequest;
import com.project.platform.dto.response.*;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Member 3 - Faculty Module.
 * Implements:
 * 1. Faculty Profile
 * 2. Browse Student Projects
 * 3. Monitor Project Progress
 * 4. Give Feedback
 * 5. Evaluate / Approve Projects
 */
@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    // =========================================================================
    // 1. Faculty Profile
    // =========================================================================

    @GetMapping("/me")
    public ApiResponse<FacultyProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ApiResponse.ok("Not authenticated", null);
        }
        return ApiResponse.ok("Faculty profile retrieved", facultyService.getMyProfile(principal.getId()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ApiResponse<FacultyProfileResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateFacultyProfileRequest request
    ) {
        return ApiResponse.ok("Faculty profile updated successfully", facultyService.updateMyProfile(principal.getId(), request));
    }

    @GetMapping("/profile/{userId}")
    public ApiResponse<FacultyProfileResponse> getProfileByUserId(@PathVariable Long userId) {
        return ApiResponse.ok("Faculty profile retrieved", facultyService.getProfileByUserId(userId));
    }

    @GetMapping
    public ApiResponse<List<FacultyProfileResponse>> getAllFaculty() {
        return ApiResponse.ok("Faculty directory retrieved", facultyService.getAllFacultyProfiles());
    }

    // =========================================================================
    // 2. Browse Student Projects
    // =========================================================================

    @GetMapping("/projects")
    public ApiResponse<Page<ProjectSummaryResponse>> browseProjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ApiResponse.ok("Projects retrieved", facultyService.browseProjects(keyword, skill, status, pageable));
    }

    @GetMapping("/projects/{projectId}")
    public ApiResponse<FacultyProjectMonitoringResponse> getProjectDetails(@PathVariable Long projectId) {
        return ApiResponse.ok("Project details retrieved", facultyService.getProjectDetails(projectId));
    }

    // =========================================================================
    // 3. Monitor Project Progress
    // =========================================================================

    @GetMapping("/projects/{projectId}/progress")
    public ApiResponse<FacultyProjectMonitoringResponse> monitorProjectProgress(@PathVariable Long projectId) {
        return ApiResponse.ok("Project progress monitoring data retrieved", facultyService.monitorProjectProgress(projectId));
    }

    // =========================================================================
    // 4. Give Feedback
    // =========================================================================

    @PostMapping("/projects/{projectId}/feedback")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ApiResponse<FacultyFeedbackResponse> giveFeedback(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateFacultyFeedbackRequest request
    ) {
        return ApiResponse.ok("Feedback submitted successfully", facultyService.giveFeedback(projectId, principal.getId(), request));
    }

    @GetMapping("/projects/{projectId}/feedback")
    public ApiResponse<List<FacultyFeedbackResponse>> getProjectFeedbacks(@PathVariable Long projectId) {
        return ApiResponse.ok("Project feedbacks retrieved", facultyService.getProjectFeedbacks(projectId));
    }

    @DeleteMapping("/feedback/{feedbackId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ApiResponse<Void> deleteFeedback(
            @PathVariable Long feedbackId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        facultyService.deleteFeedback(feedbackId, principal.getId());
        return ApiResponse.ok("Feedback deleted successfully", null);
    }

    // =========================================================================
    // 5. Evaluate / Approve Projects
    // =========================================================================

    @PostMapping("/projects/{projectId}/evaluations")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ApiResponse<ProjectEvaluationResponse> evaluateProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProjectEvaluationRequest request
    ) {
        return ApiResponse.ok("Project evaluation submitted successfully", facultyService.evaluateProject(projectId, principal.getId(), request));
    }

    @GetMapping("/projects/{projectId}/evaluations")
    public ApiResponse<List<ProjectEvaluationResponse>> getProjectEvaluations(@PathVariable Long projectId) {
        return ApiResponse.ok("Project evaluations retrieved", facultyService.getProjectEvaluations(projectId));
    }

    @PostMapping("/projects/{projectId}/approval")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ApiResponse<ProjectApprovalResponse> approveOrRejectProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProjectApprovalRequest request
    ) {
        return ApiResponse.ok("Project approval status updated", facultyService.approveOrRejectProject(projectId, principal.getId(), request));
    }

    @GetMapping("/projects/{projectId}/approval")
    public ApiResponse<List<ProjectApprovalResponse>> getProjectApprovals(@PathVariable Long projectId) {
        return ApiResponse.ok("Project approval records retrieved", facultyService.getProjectApprovals(projectId));
    }
}
