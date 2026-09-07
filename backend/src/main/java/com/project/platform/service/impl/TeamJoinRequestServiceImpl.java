package com.project.platform.service.impl;

import com.project.platform.dto.request.CreateJoinRequestRequest;
import com.project.platform.dto.request.RespondJoinRequestRequest;
import com.project.platform.dto.response.JoinRequestResponse;
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
import com.project.platform.service.TeamJoinRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamJoinRequestServiceImpl implements TeamJoinRequestService {

    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public JoinRequestResponse createJoinRequest(Long projectId, Long studentId, CreateJoinRequestRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new BadRequestException("This project is not open for new join requests (status: " + project.getStatus() + ").");
        }

        if (project.getCreatedBy().equals(studentId)) {
            throw new BadRequestException("You are the owner of this project.");
        }

        if (projectMemberRepository.existsByProjectIdAndStudentId(projectId, studentId)) {
            throw new BadRequestException("You are already a member of this project.");
        }

        if (teamJoinRequestRepository.existsByProjectIdAndStudentIdAndStatus(projectId, studentId, JoinRequestStatus.PENDING)) {
            throw new BadRequestException("You already have an active pending join request for this project.");
        }

        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + studentId));

        TeamJoinRequest joinRequest = TeamJoinRequest.builder()
            .projectId(projectId)
            .studentId(studentId)
            .message(request != null && request.message() != null ? request.message().trim() : null)
            .status(JoinRequestStatus.PENDING)
            .build();

        TeamJoinRequest saved = teamJoinRequestRepository.save(joinRequest);

        // Notify the project owner / leader
        notificationService.createNotification(
            project.getCreatedBy(),
            "New Team Join Request",
            student.getName() + " requested to join your project '" + project.getTitle() + "'.",
            NotificationType.JOIN_REQUEST,
            project.getId(),
            "PROJECT"
        );

        return toResponse(saved, project.getTitle());
    }

    @Override
    public List<JoinRequestResponse> getProjectJoinRequests(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!isLeader(projectId, userId) && !project.getCreatedBy().equals(userId)) {
            throw new BadRequestException("Only the project leader can view incoming join requests.");
        }

        List<TeamJoinRequest> requests = teamJoinRequestRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return requests.stream()
            .map(r -> toResponse(r, project.getTitle()))
            .toList();
    }

    @Override
    public List<JoinRequestResponse> getMyJoinRequests(Long studentId) {
        List<TeamJoinRequest> requests = teamJoinRequestRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        return requests.stream().map(r -> {
            Project p = projectRepository.findById(r.getProjectId()).orElse(null);
            String title = p != null ? p.getTitle() : "Unknown Project";
            return toResponse(r, title);
        }).toList();
    }

    @Override
    @Transactional
    public JoinRequestResponse respondToJoinRequest(Long projectId, Long requestId, Long leaderUserId, RespondJoinRequestRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!isLeader(projectId, leaderUserId) && !project.getCreatedBy().equals(leaderUserId)) {
            throw new BadRequestException("Only the project leader can respond to join requests.");
        }

        TeamJoinRequest joinRequest = teamJoinRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Join request not found with id: " + requestId));

        if (!joinRequest.getProjectId().equals(projectId)) {
            throw new BadRequestException("Join request does not match the specified project.");
        }

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new BadRequestException("Join request has already been processed (status: " + joinRequest.getStatus() + ").");
        }

        if (request.status() == JoinRequestStatus.ACCEPTED) {
            joinRequest.setStatus(JoinRequestStatus.ACCEPTED);
            joinRequest.setRespondedAt(LocalDateTime.now());

            // Add student as ProjectMember
            if (!projectMemberRepository.existsByProjectIdAndStudentId(projectId, joinRequest.getStudentId())) {
                ProjectMember newMember = ProjectMember.builder()
                    .projectId(projectId)
                    .studentId(joinRequest.getStudentId())
                    .role(ProjectMemberRole.MEMBER)
                    .build();
                projectMemberRepository.save(newMember);
            }

            // Notify the student
            notificationService.createNotification(
                joinRequest.getStudentId(),
                "Join Request Accepted!",
                "Congratulations! You were accepted into the team for '" + project.getTitle() + "'.",
                NotificationType.JOIN_ACCEPTED,
                project.getId(),
                "PROJECT"
            );
        } else if (request.status() == JoinRequestStatus.REJECTED) {
            joinRequest.setStatus(JoinRequestStatus.REJECTED);
            joinRequest.setRespondedAt(LocalDateTime.now());

            // Notify the student
            notificationService.createNotification(
                joinRequest.getStudentId(),
                "Join Request Declined",
                "Your request to join project '" + project.getTitle() + "' was declined.",
                NotificationType.JOIN_REJECTED,
                project.getId(),
                "PROJECT"
            );
        } else {
            throw new BadRequestException("Invalid response status. Must be ACCEPTED or REJECTED.");
        }

        TeamJoinRequest updated = teamJoinRequestRepository.save(joinRequest);
        return toResponse(updated, project.getTitle());
    }

    @Override
    @Transactional
    public void cancelJoinRequest(Long projectId, Long requestId, Long studentId) {
        TeamJoinRequest joinRequest = teamJoinRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Join request not found with id: " + requestId));

        if (!joinRequest.getProjectId().equals(projectId) || !joinRequest.getStudentId().equals(studentId)) {
            throw new BadRequestException("Unauthorized access to join request.");
        }

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new BadRequestException("Cannot cancel a request that has already been processed.");
        }

        teamJoinRequestRepository.delete(joinRequest);
    }

    private boolean isLeader(Long projectId, Long userId) {
        if (userId == null) return false;
        return projectMemberRepository.findByProjectIdAndStudentId(projectId, userId)
            .map(pm -> pm.getRole() == ProjectMemberRole.LEADER)
            .orElse(false);
    }

    private JoinRequestResponse toResponse(TeamJoinRequest r, String projectTitle) {
        User student = userRepository.findById(r.getStudentId()).orElse(null);
        StudentProfile profile = studentProfileRepository.findByUserId(r.getStudentId()).orElse(null);

        return new JoinRequestResponse(
            r.getId(),
            r.getProjectId(),
            projectTitle,
            r.getStudentId(),
            student != null ? student.getName() : "Unknown",
            student != null ? student.getEmail() : "Unknown",
            profile != null ? profile.getDepartment() : null,
            profile != null ? profile.getSkills() : null,
            r.getMessage(),
            r.getStatus(),
            r.getCreatedAt(),
            r.getRespondedAt()
        );
    }
}
