package com.project.platform.service;

import com.project.platform.dto.request.CreateProjectRequest;
import com.project.platform.dto.request.UpdateProjectRequest;
import com.project.platform.dto.response.ProjectDetailResponse;
import com.project.platform.dto.response.ProjectMemberResponse;
import com.project.platform.dto.response.ProjectSummaryResponse;
import com.project.platform.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProjectService {

    ProjectDetailResponse createProject(Long userId, CreateProjectRequest request);

    ProjectDetailResponse getProjectById(Long projectId, Long currentUserId);

    ProjectDetailResponse updateProject(Long projectId, Long userId, UpdateProjectRequest request);

    void deleteProject(Long projectId, Long userId);

    Page<ProjectSummaryResponse> searchProjects(String keyword, String skill, ProjectStatus status, Pageable pageable);

    List<ProjectSummaryResponse> getMyCreatedProjects(Long userId);

    List<ProjectSummaryResponse> getMyJoinedProjects(Long userId);

    List<ProjectMemberResponse> getProjectMembers(Long projectId);

    void removeMember(Long projectId, Long targetStudentId, Long currentUserId);
}
