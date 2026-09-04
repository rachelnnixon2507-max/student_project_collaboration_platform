package com.project.platform.controller;

import com.project.platform.dto.request.AdminUpdateProjectStatusRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.ProjectAdminResponse;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.service.AdminProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Feature 2: Manage Projects (admin oversight of all projects). */
@RestController
@RequestMapping("/api/admin/projects")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProjectController {

    private final AdminProjectService adminProjectService;

    @GetMapping
    public ApiResponse<Page<ProjectAdminResponse>> listProjects(
        @RequestParam(required = false) ProjectStatus status,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(adminProjectService.listProjects(status, pageable));
    }

    @GetMapping("/{projectId}")
    public ApiResponse<ProjectAdminResponse> getProject(@PathVariable Long projectId) {
        return ApiResponse.ok(adminProjectService.getProject(projectId));
    }

    @PatchMapping("/{projectId}/status")
    public ApiResponse<ProjectAdminResponse> updateStatus(
        @PathVariable Long projectId,
        @Valid @RequestBody AdminUpdateProjectStatusRequest request
    ) {
        return ApiResponse.ok(
            "Project status updated",
            adminProjectService.updateProjectStatus(projectId, request.status(), request.reason())
        );
    }

    @DeleteMapping("/{projectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable Long projectId) {
        adminProjectService.deleteProject(projectId);
    }
}
