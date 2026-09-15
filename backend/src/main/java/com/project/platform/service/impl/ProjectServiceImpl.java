package com.project.platform.service.impl;

import com.project.platform.dto.request.CreateProjectRequest;
import com.project.platform.dto.request.UpdateProjectRequest;
import com.project.platform.dto.response.ProjectDetailResponse;
import com.project.platform.dto.response.ProjectMemberResponse;
import com.project.platform.dto.response.ProjectSummaryResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.ProjectMember;
import com.project.platform.entity.StudentProfile;
import com.project.platform.entity.TeamJoinRequest;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.JoinRequestStatus;
import com.project.platform.entity.enums.NotificationType;
import com.project.platform.entity.enums.ProjectMemberRole;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.ProjectMemberRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.StudentProfileRepository;
import com.project.platform.repository.TeamJoinRequestRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.NotificationService;
import com.project.platform.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ProjectDetailResponse createProject(Long userId, CreateProjectRequest request) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        ProjectStatus initialStatus = request.status() != null ? request.status() : ProjectStatus.OPEN;
        int maxMembers = (request.maxMembers() != null && request.maxMembers() > 0) ? request.maxMembers() : 4;

        Project project = Project.builder()
            .title(request.title().trim())
            .description(request.description() != null ? request.description().trim() : null)
            .requiredSkills(request.requiredSkills() != null ? request.requiredSkills().trim() : null)
            .status(initialStatus)
            .maxMembers(maxMembers)
            .createdBy(userId)
            .build();

        Project savedProject = projectRepository.save(project);

        // Creator automatically becomes the team LEADER
        ProjectMember leader = ProjectMember.builder()
            .projectId(savedProject.getId())
            .studentId(userId)
            .role(ProjectMemberRole.LEADER)
            .build();
        projectMemberRepository.save(leader);

        return toDetailResponse(savedProject, userId);
    }

    @Override
    public ProjectDetailResponse getProjectById(Long projectId, Long currentUserId) {
        Project project = findProjectOrThrow(projectId);
        return toDetailResponse(project, currentUserId);
    }

    @Override
    @Transactional
    public ProjectDetailResponse updateProject(Long projectId, Long userId, UpdateProjectRequest request) {
        Project project = findProjectOrThrow(projectId);

        if (!isLeader(projectId, userId) && !project.getCreatedBy().equals(userId)) {
            throw new BadRequestException("Only the project leader can update project details.");
        }

        if (request.title() != null && !request.title().trim().isEmpty()) {
            project.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            project.setDescription(request.description().trim());
        }
        if (request.requiredSkills() != null) {
            project.setRequiredSkills(request.requiredSkills().trim());
        }
        if (request.status() != null) {
            project.setStatus(request.status());
        }
        if (request.maxMembers() != null && request.maxMembers() > 0) {
            project.setMaxMembers(request.maxMembers());
        }

        Project updated = projectRepository.save(project);
        return toDetailResponse(updated, userId);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = findProjectOrThrow(projectId);

        if (!project.getCreatedBy().equals(userId) && !isLeader(projectId, userId)) {
            throw new BadRequestException("Only the project creator can delete this project.");
        }

        projectMemberRepository.deleteByProjectId(projectId);
        teamJoinRequestRepository.deleteByProjectId(projectId);
        projectRepository.delete(project);
    }

    @Override
    public Page<ProjectSummaryResponse> searchProjects(String keyword, String skill, ProjectStatus status, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanSkill = (skill != null && !skill.trim().isEmpty()) ? skill.trim() : null;

        Page<Project> page = projectRepository.searchProjects(cleanKeyword, cleanSkill, status, pageable);
        return page.map(this::toSummaryResponse);
    }

    @Override
    public List<ProjectSummaryResponse> getMyCreatedProjects(Long userId) {
        List<Project> list = projectRepository.findByCreatedByOrderByCreatedAtDesc(userId);
        return list.stream().map(this::toSummaryResponse).toList();
    }

    @Override
    public List<ProjectSummaryResponse> getMyJoinedProjects(Long userId) {
        List<ProjectMember> memberships = projectMemberRepository.findByStudentId(userId);
        List<ProjectSummaryResponse> result = new ArrayList<>();

        for (ProjectMember pm : memberships) {
            projectRepository.findById(pm.getProjectId())
                .ifPresent(p -> result.add(toSummaryResponse(p)));
        }
        return result;
    }

    @Override
    public List<ProjectMemberResponse> getProjectMembers(Long projectId) {
        findProjectOrThrow(projectId);
        return fetchMembers(projectId);
    }

    @Override
    @Transactional
    public void removeMember(Long projectId, Long targetStudentId, Long currentUserId) {
        Project project = findProjectOrThrow(projectId);

        ProjectMember membership = projectMemberRepository.findByProjectIdAndStudentId(projectId, targetStudentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student is not a member of this project."));

        boolean isCurrentUserLeader = isLeader(projectId, currentUserId) || project.getCreatedBy().equals(currentUserId);
        boolean isSelfLeaving = currentUserId.equals(targetStudentId);

        if (!isCurrentUserLeader && !isSelfLeaving) {
            throw new BadRequestException("Unauthorized to remove member from this project.");
        }

        if (membership.getRole() == ProjectMemberRole.LEADER && isSelfLeaving) {
            throw new BadRequestException("The project leader cannot leave the project directly. Please reassign or delete the project.");
        }

        projectMemberRepository.deleteByProjectIdAndStudentId(projectId, targetStudentId);

        if (isCurrentUserLeader && !isSelfLeaving) {
            notificationService.createNotification(
                targetStudentId,
                "Removed from Project",
                "You have been removed from the team for project '" + project.getTitle() + "'.",
                NotificationType.PROJECT_UPDATE,
                projectId,
                "PROJECT"
            );
        } else if (isSelfLeaving) {
            notificationService.createNotification(
                project.getCreatedBy(),
                "Member Left Project",
                "A team member has left project '" + project.getTitle() + "'.",
                NotificationType.PROJECT_UPDATE,
                projectId,
                "PROJECT"
            );
        }
    }

    private Project findProjectOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
    }

    private boolean isLeader(Long projectId, Long userId) {
        if (userId == null) return false;
        return projectMemberRepository.findByProjectIdAndStudentId(projectId, userId)
            .map(pm -> pm.getRole() == ProjectMemberRole.LEADER)
            .orElse(false);
    }

    private ProjectSummaryResponse toSummaryResponse(Project project) {
        User creator = userRepository.findById(project.getCreatedBy()).orElse(null);
        int memberCount = (int) projectMemberRepository.countByProjectId(project.getId());
        int maxMembers = project.getMaxMembers() != null && project.getMaxMembers() > 0 ? project.getMaxMembers() : 4;
        int availableSeats = Math.max(0, maxMembers - memberCount);

        return new ProjectSummaryResponse(
            project.getId(),
            project.getTitle(),
            project.getDescription(),
            project.getRequiredSkills(),
            project.getStatus(),
            project.getCreatedBy(),
            creator != null ? creator.getName() : "Unknown",
            creator != null ? creator.getEmail() : "Unknown",
            project.getCreatedAt(),
            project.getUpdatedAt(),
            memberCount,
            maxMembers,
            availableSeats
        );
    }

    private ProjectDetailResponse toDetailResponse(Project project, Long currentUserId) {
        User creator = userRepository.findById(project.getCreatedBy()).orElse(null);
        List<ProjectMemberResponse> members = fetchMembers(project.getId());
        int maxMembers = project.getMaxMembers() != null && project.getMaxMembers() > 0 ? project.getMaxMembers() : 4;
        int availableSeats = Math.max(0, maxMembers - members.size());

        boolean isLeader = false;
        boolean isMember = false;
        JoinRequestStatus joinStatus = null;
        Long joinRequestId = null;

        if (currentUserId != null) {
            Optional<ProjectMember> membership = projectMemberRepository.findByProjectIdAndStudentId(project.getId(), currentUserId);
            if (membership.isPresent()) {
                isMember = true;
                isLeader = membership.get().getRole() == ProjectMemberRole.LEADER || project.getCreatedBy().equals(currentUserId);
            } else {
                Optional<TeamJoinRequest> activeRequest = teamJoinRequestRepository
                    .findByProjectIdAndStudentIdAndStatus(project.getId(), currentUserId, JoinRequestStatus.PENDING);
                if (activeRequest.isPresent()) {
                    joinStatus = JoinRequestStatus.PENDING;
                    joinRequestId = activeRequest.get().getId();
                }
            }
        }

        return new ProjectDetailResponse(
            project.getId(),
            project.getTitle(),
            project.getDescription(),
            project.getRequiredSkills(),
            project.getStatus(),
            project.getCreatedBy(),
            creator != null ? creator.getName() : "Unknown",
            creator != null ? creator.getEmail() : "Unknown",
            project.getCreatedAt(),
            project.getUpdatedAt(),
            members,
            members.size(),
            maxMembers,
            availableSeats,
            isLeader,
            isMember,
            joinStatus,
            joinRequestId
        );
    }


    private List<ProjectMemberResponse> fetchMembers(Long projectId) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        List<ProjectMemberResponse> list = new ArrayList<>();

        for (ProjectMember pm : members) {
            User user = userRepository.findById(pm.getStudentId()).orElse(null);
            StudentProfile profile = studentProfileRepository.findByUserId(pm.getStudentId()).orElse(null);

            list.add(new ProjectMemberResponse(
                pm.getId(),
                pm.getProjectId(),
                pm.getStudentId(),
                user != null ? user.getName() : "Unknown",
                user != null ? user.getEmail() : "Unknown",
                profile != null ? profile.getDepartment() : null,
                profile != null ? profile.getSkills() : null,
                pm.getRole(),
                pm.getJoinedAt()
            ));
        }
        return list;
    }
}
