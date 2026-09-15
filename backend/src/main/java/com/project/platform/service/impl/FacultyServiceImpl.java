package com.project.platform.service.impl;

import com.project.platform.dto.request.CreateFacultyFeedbackRequest;
import com.project.platform.dto.request.CreateProjectApprovalRequest;
import com.project.platform.dto.request.CreateProjectEvaluationRequest;
import com.project.platform.dto.request.UpdateFacultyProfileRequest;
import com.project.platform.dto.response.*;
import com.project.platform.entity.*;
import com.project.platform.entity.enums.ProjectApprovalDecision;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.TaskStatus;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.*;
import com.project.platform.service.FacultyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FacultyServiceImpl implements FacultyService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final FacultyFeedbackRepository facultyFeedbackRepository;
    private final ProjectEvaluationRepository projectEvaluationRepository;
    private final ProjectApprovalRepository projectApprovalRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final ProjectProgressRepository projectProgressRepository;
    private final StudentProfileRepository studentProfileRepository;

    // =========================================================================
    // 1. Faculty Profile
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public FacultyProfileResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        FacultyProfile profile = facultyProfileRepository.findByUserId(userId)
                .orElseGet(() -> FacultyProfile.builder().userId(userId).build());

        return mapToProfileResponse(user, profile);
    }

    @Override
    @Transactional
    public FacultyProfileResponse updateMyProfile(Long userId, UpdateFacultyProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        FacultyProfile profile = facultyProfileRepository.findByUserId(userId)
                .orElse(FacultyProfile.builder().userId(userId).build());

        if (request.getDepartment() != null) {
            profile.setDepartment(request.getDepartment().trim());
        }
        if (request.getDesignation() != null) {
            profile.setDesignation(request.getDesignation().trim());
        }
        if (request.getSpecialization() != null) {
            profile.setSpecialization(request.getSpecialization().trim());
        }

        FacultyProfile saved = facultyProfileRepository.save(profile);
        return mapToProfileResponse(user, saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyProfileResponse getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        FacultyProfile profile = facultyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + userId));

        return mapToProfileResponse(user, profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyProfileResponse> getAllFacultyProfiles() {
        List<FacultyProfile> profiles = facultyProfileRepository.findAll();
        Map<Long, User> userMap = userRepository.findAllById(
                profiles.stream().map(FacultyProfile::getUserId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(User::getId, u -> u));

        return profiles.stream()
                .map(p -> {
                    User u = userMap.get(p.getUserId());
                    return mapToProfileResponse(u, p);
                })
                .collect(Collectors.toList());
    }

    // =========================================================================
    // 2. Browse Student Projects
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectSummaryResponse> browseProjects(String keyword, String skill, ProjectStatus status, Pageable pageable) {
        Page<Project> page = projectRepository.searchProjects(keyword, skill, status, pageable);

        Set<Long> creatorIds = page.getContent().stream().map(Project::getCreatedBy).collect(Collectors.toSet());
        Map<Long, User> creatorMap = userRepository.findAllById(creatorIds)
                .stream().collect(Collectors.toMap(User::getId, u -> u));

        return page.map(p -> {
            User creator = creatorMap.get(p.getCreatedBy());
            int memberCount = (int) projectMemberRepository.countByProjectId(p.getId());
            int maxMembers = p.getMaxMembers() != null && p.getMaxMembers() > 0 ? p.getMaxMembers() : 4;
            int availableSeats = Math.max(0, maxMembers - memberCount);
            return new ProjectSummaryResponse(
                    p.getId(),
                    p.getTitle(),
                    p.getDescription(),
                    p.getRequiredSkills(),
                    p.getStatus(),
                    p.getCreatedBy(),
                    creator != null ? creator.getName() : "Unknown",
                    creator != null ? creator.getEmail() : null,
                    p.getCreatedAt(),
                    p.getUpdatedAt(),
                    memberCount,
                    maxMembers,
                    availableSeats
            );
        });

    }

    @Override
    @Transactional(readOnly = true)
    public FacultyProjectMonitoringResponse getProjectDetails(Long projectId) {
        return monitorProjectProgress(projectId);
    }

    // =========================================================================
    // 3. Monitor Project Progress
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public FacultyProjectMonitoringResponse monitorProjectProgress(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        User creator = userRepository.findById(project.getCreatedBy()).orElse(null);

        // Progress record
        Optional<ProjectProgress> progressOpt = projectProgressRepository.findByProjectId(projectId);

        // Tasks breakdown
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        int totalTasks = tasks.size();
        int completedTasks = 0;
        int inProgressTasks = 0;
        int todoTasks = 0;

        Set<Long> assigneeIds = new HashSet<>();
        for (Task t : tasks) {
            if (t.getAssignedTo() != null) {
                assigneeIds.add(t.getAssignedTo());
            }
            if (t.getStatus() == TaskStatus.COMPLETED) {
                completedTasks++;
            } else if (t.getStatus() == TaskStatus.IN_PROGRESS) {
                inProgressTasks++;
            } else {
                todoTasks++;
            }
        }

        Map<Long, User> assigneeMap = userRepository.findAllById(assigneeIds)
                .stream().collect(Collectors.toMap(User::getId, u -> u));

        List<FacultyProjectMonitoringResponse.TaskSummary> taskSummaries = tasks.stream()
                .map(t -> {
                    User assignee = t.getAssignedTo() != null ? assigneeMap.get(t.getAssignedTo()) : null;
                    return FacultyProjectMonitoringResponse.TaskSummary.builder()
                            .taskId(t.getId())
                            .title(t.getTitle())
                            .status(t.getStatus().name())
                            .progress(t.getProgress() != null ? t.getProgress() : 0)
                            .assignedTo(t.getAssignedTo())
                            .assigneeName(assignee != null ? assignee.getName() : "Unassigned")
                            .dueDate(t.getDueDate())
                            .build();
                })
                .collect(Collectors.toList());

        // Computed or recorded overall progress
        int computedProgress = (totalTasks == 0) ? 0 : (completedTasks * 100) / totalTasks;
        int overallProgress = progressOpt.map(ProjectProgress::getOverallProgress).orElse(computedProgress);

        LocalDateTime lastActivity = progressOpt.map(ProjectProgress::getLastActivityAt).orElse(project.getUpdatedAt());

        // Team members
        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(projectId);
        Set<Long> memberUserIds = projectMembers.stream().map(ProjectMember::getStudentId).collect(Collectors.toSet());
        Map<Long, User> memberUserMap = userRepository.findAllById(memberUserIds)
                .stream().collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, StudentProfile> studentProfileMap = studentProfileRepository.findAll().stream()
                .filter(sp -> memberUserIds.contains(sp.getUserId()))
                .collect(Collectors.toMap(StudentProfile::getUserId, sp -> sp));

        List<FacultyProjectMonitoringResponse.MemberSummary> memberSummaries = projectMembers.stream()
                .map(pm -> {
                    User u = memberUserMap.get(pm.getStudentId());
                    StudentProfile sp = studentProfileMap.get(pm.getStudentId());
                    return FacultyProjectMonitoringResponse.MemberSummary.builder()
                            .userId(pm.getStudentId())
                            .name(u != null ? u.getName() : "Unknown")
                            .email(u != null ? u.getEmail() : null)
                            .role(pm.getRole() != null ? pm.getRole().name() : "MEMBER")
                            .department(sp != null ? sp.getDepartment() : "General")
                            .build();
                })
                .collect(Collectors.toList());

        // Evaluations and Approvals
        Optional<ProjectEvaluation> latestEvalOpt = projectEvaluationRepository.findTopByProjectIdOrderByEvaluatedAtDesc(projectId);
        ProjectEvaluationResponse latestEvalResponse = latestEvalOpt.map(this::mapToEvaluationResponse).orElse(null);

        Optional<ProjectApproval> latestApprovalOpt = projectApprovalRepository.findTopByProjectIdOrderByDecidedAtDesc(projectId);
        ProjectApprovalResponse latestApprovalResponse = latestApprovalOpt.map(this::mapToApprovalResponse).orElse(null);

        // Recent feedback
        List<FacultyFeedbackResponse> recentFeedback = getProjectFeedbacks(projectId);

        return FacultyProjectMonitoringResponse.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .requiredSkills(project.getRequiredSkills())
                .status(project.getStatus())
                .createdBy(project.getCreatedBy())
                .creatorName(creator != null ? creator.getName() : "Unknown")
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .overallProgress(overallProgress)
                .lastActivityAt(lastActivity)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .todoTasks(todoTasks)
                .members(memberSummaries)
                .tasks(taskSummaries)
                .latestEvaluation(latestEvalResponse)
                .latestApproval(latestApprovalResponse)
                .recentFeedback(recentFeedback)
                .build();
    }

    // =========================================================================
    // 4. Give Feedback
    // =========================================================================

    @Override
    @Transactional
    public FacultyFeedbackResponse giveFeedback(Long projectId, Long facultyId, CreateFacultyFeedbackRequest request) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found: " + projectId);
        }

        String taskTitle = null;
        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + request.getTaskId()));
            if (!task.getProjectId().equals(projectId)) {
                throw new BadRequestException("Task #" + request.getTaskId() + " does not belong to Project #" + projectId);
            }
            taskTitle = task.getTitle();
        }

        FacultyFeedback feedback = FacultyFeedback.builder()
                .projectId(projectId)
                .facultyId(facultyId)
                .taskId(request.getTaskId())
                .feedbackText(request.getFeedbackText().trim())
                .rating(request.getRating())
                .build();

        FacultyFeedback saved = facultyFeedbackRepository.save(feedback);
        User faculty = userRepository.findById(facultyId).orElse(null);

        // Update last activity timestamp on project progress
        updateProjectLastActivity(projectId);

        return FacultyFeedbackResponse.builder()
                .id(saved.getId())
                .projectId(saved.getProjectId())
                .facultyId(saved.getFacultyId())
                .facultyName(faculty != null ? faculty.getName() : "Faculty")
                .facultyEmail(faculty != null ? faculty.getEmail() : null)
                .taskId(saved.getTaskId())
                .taskTitle(taskTitle)
                .feedbackText(saved.getFeedbackText())
                .rating(saved.getRating())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyFeedbackResponse> getProjectFeedbacks(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found: " + projectId);
        }

        List<FacultyFeedback> list = facultyFeedbackRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        if (list.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> facultyIds = list.stream().map(FacultyFeedback::getFacultyId).collect(Collectors.toSet());
        Map<Long, User> facultyMap = userRepository.findAllById(facultyIds)
                .stream().collect(Collectors.toMap(User::getId, u -> u));

        Set<Long> taskIds = list.stream().map(FacultyFeedback::getTaskId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, Task> taskMap = taskRepository.findAllById(taskIds)
                .stream().collect(Collectors.toMap(Task::getId, t -> t));

        return list.stream()
                .map(f -> {
                    User faculty = facultyMap.get(f.getFacultyId());
                    Task task = f.getTaskId() != null ? taskMap.get(f.getTaskId()) : null;
                    return FacultyFeedbackResponse.builder()
                            .id(f.getId())
                            .projectId(f.getProjectId())
                            .facultyId(f.getFacultyId())
                            .facultyName(faculty != null ? faculty.getName() : "Faculty")
                            .facultyEmail(faculty != null ? faculty.getEmail() : null)
                            .taskId(f.getTaskId())
                            .taskTitle(task != null ? task.getTitle() : null)
                            .feedbackText(f.getFeedbackText())
                            .rating(f.getRating())
                            .createdAt(f.getCreatedAt())
                            .updatedAt(f.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFeedback(Long feedbackId, Long facultyId) {
        FacultyFeedback feedback = facultyFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found: " + feedbackId));

        if (!feedback.getFacultyId().equals(facultyId)) {
            User requester = userRepository.findById(facultyId).orElse(null);
            if (requester == null || requester.getRole() != com.project.platform.entity.enums.Role.ADMIN) {
                throw new BadRequestException("You can only delete your own feedback entries.");
            }
        }

        facultyFeedbackRepository.delete(feedback);
    }

    // =========================================================================
    // 5. Evaluate / Approve Projects
    // =========================================================================

    @Override
    @Transactional
    public ProjectEvaluationResponse evaluateProject(Long projectId, Long facultyId, CreateProjectEvaluationRequest request) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found: " + projectId);
        }

        // Calculate total rubric score:
        // When criteria are scored out of 25 each (max 100), compute direct sum.
        // If criteria are scored on a 100-point scale, compute weighted score.
        double tech = request.getTechnicalScore() != null ? request.getTechnicalScore() : 0.0;
        double exec = request.getExecutionScore() != null ? request.getExecutionScore() : 0.0;
        double innov = request.getInnovationScore() != null ? request.getInnovationScore() : 0.0;
        double pres = request.getPresentationScore() != null ? request.getPresentationScore() : 0.0;

        double computedTotal;
        if (tech <= 25.0 && exec <= 25.0 && innov <= 25.0 && pres <= 25.0) {
            computedTotal = tech + exec + innov + pres;
        } else {
            computedTotal = (tech * 0.35) + (exec * 0.30) + (innov * 0.20) + (pres * 0.15);
        }

        BigDecimal roundedTotal = BigDecimal.valueOf(computedTotal).setScale(1, RoundingMode.HALF_UP);
        double totalScore = roundedTotal.doubleValue();

        String grade = calculateGrade(totalScore);

        ProjectEvaluation evaluation = projectEvaluationRepository.findByProjectIdAndEvaluatorId(projectId, facultyId)
                .orElseGet(() -> ProjectEvaluation.builder()
                        .projectId(projectId)
                        .evaluatorId(facultyId)
                        .build());

        evaluation.setTechnicalScore(request.getTechnicalScore());
        evaluation.setInnovationScore(request.getInnovationScore());
        evaluation.setExecutionScore(request.getExecutionScore());
        evaluation.setPresentationScore(request.getPresentationScore());
        evaluation.setTotalScore(totalScore);
        evaluation.setGrade(grade);
        evaluation.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);

        ProjectEvaluation saved = projectEvaluationRepository.save(evaluation);
        updateProjectLastActivity(projectId);

        return mapToEvaluationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectEvaluationResponse> getProjectEvaluations(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found: " + projectId);
        }

        List<ProjectEvaluation> list = projectEvaluationRepository.findByProjectIdOrderByEvaluatedAtDesc(projectId);
        return list.stream().map(this::mapToEvaluationResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectApprovalResponse approveOrRejectProject(Long projectId, Long facultyId, CreateProjectApprovalRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        // Create approval audit record
        ProjectApproval approval = ProjectApproval.builder()
                .projectId(projectId)
                .facultyId(facultyId)
                .decision(request.getDecision())
                .comments(request.getComments() != null ? request.getComments().trim() : null)
                .build();

        ProjectApproval saved = projectApprovalRepository.save(approval);

        // Update project status according to decision
        if (request.getDecision() == ProjectApprovalDecision.APPROVED) {
            project.setStatus(ProjectStatus.APPROVED);
        } else if (request.getDecision() == ProjectApprovalDecision.REJECTED) {
            project.setStatus(ProjectStatus.REJECTED);
        } else if (request.getDecision() == ProjectApprovalDecision.NEEDS_REVISION) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        }

        projectRepository.save(project);
        updateProjectLastActivity(projectId);

        return mapToApprovalResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectApprovalResponse> getProjectApprovals(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found: " + projectId);
        }

        List<ProjectApproval> list = projectApprovalRepository.findByProjectIdOrderByDecidedAtDesc(projectId);
        return list.stream().map(this::mapToApprovalResponse).collect(Collectors.toList());
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    private void updateProjectLastActivity(Long projectId) {
        projectProgressRepository.findByProjectId(projectId).ifPresent(pp -> {
            pp.setLastActivityAt(LocalDateTime.now());
            projectProgressRepository.save(pp);
        });
    }

    private String calculateGrade(double score) {
        if (score >= 90.0) return "A+";
        if (score >= 80.0) return "A";
        if (score >= 70.0) return "B+";
        if (score >= 60.0) return "B";
        if (score >= 50.0) return "C";
        return "F";
    }

    private FacultyProfileResponse mapToProfileResponse(User user, FacultyProfile profile) {
        return FacultyProfileResponse.builder()
                .id(profile.getId())
                .userId(user != null ? user.getId() : profile.getUserId())
                .name(user != null ? user.getName() : "Faculty Member")
                .email(user != null ? user.getEmail() : null)
                .department(profile.getDepartment())
                .designation(profile.getDesignation())
                .specialization(profile.getSpecialization())
                .build();
    }

    private ProjectEvaluationResponse mapToEvaluationResponse(ProjectEvaluation eval) {
        User evaluator = userRepository.findById(eval.getEvaluatorId()).orElse(null);
        return ProjectEvaluationResponse.builder()
                .id(eval.getId())
                .projectId(eval.getProjectId())
                .evaluatorId(eval.getEvaluatorId())
                .evaluatorName(evaluator != null ? evaluator.getName() : "Faculty Evaluator")
                .evaluatorEmail(evaluator != null ? evaluator.getEmail() : null)
                .technicalScore(eval.getTechnicalScore())
                .scores(ProjectEvaluationResponse.InnovationScoreDetails.builder()
                        .technical(eval.getTechnicalScore())
                        .innovation(eval.getInnovationScore())
                        .execution(eval.getExecutionScore())
                        .presentation(eval.getPresentationScore())
                        .build())
                .totalScore(eval.getTotalScore())
                .grade(eval.getGrade())
                .remarks(eval.getRemarks())
                .evaluatedAt(eval.getEvaluatedAt())
                .updatedAt(eval.getUpdatedAt())
                .build();
    }

    private ProjectApprovalResponse mapToApprovalResponse(ProjectApproval approval) {
        User faculty = userRepository.findById(approval.getFacultyId()).orElse(null);
        return ProjectApprovalResponse.builder()
                .id(approval.getId())
                .projectId(approval.getProjectId())
                .facultyId(approval.getFacultyId())
                .facultyName(faculty != null ? faculty.getName() : "Faculty Reviewer")
                .facultyEmail(faculty != null ? faculty.getEmail() : null)
                .decision(approval.getDecision())
                .comments(approval.getComments())
                .decidedAt(approval.getDecidedAt())
                .build();
    }
}
