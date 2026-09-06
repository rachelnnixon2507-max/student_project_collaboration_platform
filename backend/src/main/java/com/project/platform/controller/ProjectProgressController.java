package com.project.platform.controller;

import com.project.platform.dto.request.UpdateProjectProgressRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.ProjectProgressDetailsResponse;
import com.project.platform.service.ProjectProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Project Progress Tracking.
 * Owned by Member 2 - Team Collaboration.
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectProgressController {

    private final ProjectProgressService projectProgressService;

    @GetMapping("/{projectId}/progress")
    public ApiResponse<ProjectProgressDetailsResponse> getProjectProgress(@PathVariable Long projectId) {
        ProjectProgressDetailsResponse response = projectProgressService.getProjectProgressDetails(projectId);
        return ApiResponse.ok(response);
    }

    @PatchMapping("/{projectId}/progress")
    public ApiResponse<ProjectProgressDetailsResponse> updateProjectProgress(
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectProgressRequest request
    ) {
        projectProgressService.manualUpdateProgress(projectId, request.overallProgress(), request.reason());
        ProjectProgressDetailsResponse response = projectProgressService.getProjectProgressDetails(projectId);
        return ApiResponse.ok("Project progress updated successfully", response);
    }

    @PostMapping("/{projectId}/progress/recalculate")
    public ApiResponse<ProjectProgressDetailsResponse> recalculateProgress(@PathVariable Long projectId) {
        projectProgressService.recalculateAndSaveProgress(projectId);
        ProjectProgressDetailsResponse response = projectProgressService.getProjectProgressDetails(projectId);
        return ApiResponse.ok("Project progress recalculated from tasks", response);
    }
}
