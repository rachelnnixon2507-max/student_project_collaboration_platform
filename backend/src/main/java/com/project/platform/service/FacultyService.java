package com.project.platform.service;

import com.project.platform.dto.request.CreateFacultyFeedbackRequest;
import com.project.platform.dto.request.CreateProjectApprovalRequest;
import com.project.platform.dto.request.CreateProjectEvaluationRequest;
import com.project.platform.dto.request.UpdateFacultyProfileRequest;
import com.project.platform.dto.response.*;
import com.project.platform.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for Member 3 - Faculty Module.
 * Covers:
 * 1. Faculty Profile
 * 2. Browse Student Projects
 * 3. Monitor Project Progress
 * 4. Give Feedback
 * 5. Evaluate / Approve Projects
 */
public interface FacultyService {

    // 1. Faculty Profile
    FacultyProfileResponse getMyProfile(Long userId);
    FacultyProfileResponse updateMyProfile(Long userId, UpdateFacultyProfileRequest request);
    FacultyProfileResponse getProfileByUserId(Long userId);
    List<FacultyProfileResponse> getAllFacultyProfiles();

    // 2. Browse Student Projects
    Page<ProjectSummaryResponse> browseProjects(String keyword, String skill, ProjectStatus status, Pageable pageable);
    FacultyProjectMonitoringResponse getProjectDetails(Long projectId);

    // 3. Monitor Project Progress
    FacultyProjectMonitoringResponse monitorProjectProgress(Long projectId);

    // 4. Give Feedback
    FacultyFeedbackResponse giveFeedback(Long projectId, Long facultyId, CreateFacultyFeedbackRequest request);
    List<FacultyFeedbackResponse> getProjectFeedbacks(Long projectId);
    void deleteFeedback(Long feedbackId, Long facultyId);

    // 5. Evaluate / Approve Projects
    ProjectEvaluationResponse evaluateProject(Long projectId, Long facultyId, CreateProjectEvaluationRequest request);
    List<ProjectEvaluationResponse> getProjectEvaluations(Long projectId);
    ProjectApprovalResponse approveOrRejectProject(Long projectId, Long facultyId, CreateProjectApprovalRequest request);
    List<ProjectApprovalResponse> getProjectApprovals(Long projectId);
}
