package com.project.platform.controller;

import com.project.platform.dto.request.CreateProjectRequest;
import com.project.platform.dto.request.UpdateProjectRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.ProjectDetailResponse;
import com.project.platform.dto.response.ProjectMemberResponse;
import com.project.platform.dto.response.ProjectSummaryResponse;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Projects module (Member 1).
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ApiResponse<ProjectDetailResponse> createProject(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody CreateProjectRequest request
    ) {
        ProjectDetailResponse created = projectService.createProject(principal.getId(), request);
        return ApiResponse.ok("Project created successfully", created);
    }

    @GetMapping
    public ApiResponse<Page<ProjectSummaryResponse>> searchProjects(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String skill,
        @RequestParam(required = false) ProjectStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ApiResponse.ok(projectService.searchProjects(keyword, skill, status, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectDetailResponse> getProjectById(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ApiResponse.ok(projectService.getProjectById(id, currentUserId));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectDetailResponse> updateProject(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody UpdateProjectRequest request
    ) {
        ProjectDetailResponse updated = projectService.updateProject(id, principal.getId(), request);
        return ApiResponse.ok("Project updated successfully", updated);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProject(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        projectService.deleteProject(id, principal.getId());
        return ApiResponse.ok("Project deleted successfully", null);
    }

    @GetMapping("/my/created")
    public ApiResponse<List<ProjectSummaryResponse>> getMyCreatedProjects(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(projectService.getMyCreatedProjects(principal.getId()));
    }

    @GetMapping("/my/joined")
    public ApiResponse<List<ProjectSummaryResponse>> getMyJoinedProjects(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(projectService.getMyJoinedProjects(principal.getId()));
    }

    @GetMapping("/{id}/members")
    public ApiResponse<List<ProjectMemberResponse>> getProjectMembers(@PathVariable Long id) {
        return ApiResponse.ok(projectService.getProjectMembers(id));
    }

    @DeleteMapping("/{id}/members/{studentId}")
    public ApiResponse<Void> removeMember(
        @PathVariable Long id,
        @PathVariable Long studentId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        projectService.removeMember(id, studentId, principal.getId());
        return ApiResponse.ok("Member removed successfully", null);
    }
}
