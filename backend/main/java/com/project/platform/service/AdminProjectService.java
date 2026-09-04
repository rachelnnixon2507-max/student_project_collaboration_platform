package com.project.platform.service;

import com.project.platform.dto.response.ProjectAdminResponse;
import com.project.platform.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Feature 2: Manage Projects (admin oversight/moderation of all projects). */
public interface AdminProjectService {

    Page<ProjectAdminResponse> listProjects(ProjectStatus status, Pageable pageable);

    ProjectAdminResponse getProject(Long projectId);

    ProjectAdminResponse updateProjectStatus(Long projectId, ProjectStatus newStatus, String reason);

    void deleteProject(Long projectId);
}
