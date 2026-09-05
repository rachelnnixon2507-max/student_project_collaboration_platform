package com.project.platform.service.impl;

import com.project.platform.dto.response.ProjectAdminResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.ProjectMemberRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.service.AdminProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProjectServiceImpl implements AdminProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Override
    public Page<ProjectAdminResponse> listProjects(ProjectStatus status, Pageable pageable) {
        Page<Project> page = (status != null)
            ? projectRepository.findByStatus(status, pageable)
            : projectRepository.findAll(pageable);
        return page.map(this::toResponse);
    }

    @Override
    public ProjectAdminResponse getProject(Long projectId) {
        return toResponse(findProjectOrThrow(projectId));
    }

    @Override
    @Transactional
    public ProjectAdminResponse updateProjectStatus(Long projectId, ProjectStatus newStatus, String reason) {
        Project project = findProjectOrThrow(projectId);
        project.setStatus(newStatus);
        // 'reason' is accepted for audit/notification purposes; wiring it to a
        // Notification entity is left to whoever owns the Notification module.
        return toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = findProjectOrThrow(projectId);
        projectRepository.delete(project);
    }

    private Project findProjectOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
    }

    private ProjectAdminResponse toResponse(Project project) {
        int memberCount = projectMemberRepository.findByProjectId(project.getId()).size();
        return new ProjectAdminResponse(
            project.getId(), project.getTitle(), project.getDescription(), project.getStatus(),
            project.getCreatedBy(), project.getCreatedAt(), project.getUpdatedAt(), memberCount
        );
    }
}
