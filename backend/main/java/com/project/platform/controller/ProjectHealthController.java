package com.project.platform.controller;

import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.DelayedProjectResponse;
import com.project.platform.service.ProjectHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Feature 6: Detect Delayed/Inactive Projects. ADMIN-only. */
@RestController
@RequestMapping("/api/admin/projects/health")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ProjectHealthController {

    private final ProjectHealthService projectHealthService;

    @GetMapping("/flagged")
    public ApiResponse<List<DelayedProjectResponse>> getFlaggedProjects() {
        return ApiResponse.ok(projectHealthService.getDelayedAndInactiveProjects());
    }
}
