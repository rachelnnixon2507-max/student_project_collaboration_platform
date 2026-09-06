package com.project.platform.service.impl;

import com.project.platform.dto.response.MemberContributionDTO;
import com.project.platform.dto.response.ProjectProgressDetailsResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.ProjectProgress;
import com.project.platform.entity.Task;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.TaskStatus;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.ProjectProgressRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.TaskRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.ProjectProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of ProjectProgressService.
 * Owned by Member 2 - Team Collaboration.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectProgressServiceImpl implements ProjectProgressService {

    private final ProjectProgressRepository projectProgressRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public ProjectProgressDetailsResponse getProjectProgressDetails(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ProjectProgress progress = projectProgressRepository.findByProjectId(projectId)
                .orElseGet(() -> ProjectProgress.builder()
                        .projectId(projectId)
                        .overallProgress(0)
                        .lastActivityAt(project.getUpdatedAt() != null ? project.getUpdatedAt() : LocalDateTime.now())
                        .build());

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        int totalTasks = tasks.size();
        int completedTasks = 0;
        int inProgressTasks = 0;
        int todoTasks = 0;
        int delayedTasks = 0;
        LocalDateTime now = LocalDateTime.now();

        Map<Long, List<Task>> tasksByAssignee = new HashMap<>();

        for (Task task : tasks) {
            if (task.getStatus() == TaskStatus.COMPLETED) {
                completedTasks++;
            } else if (task.getStatus() == TaskStatus.IN_PROGRESS) {
                inProgressTasks++;
            } else {
                todoTasks++;
            }

            if (task.getStatus() != TaskStatus.COMPLETED && task.getDueDate() != null && task.getDueDate().isBefore(now)) {
                delayedTasks++;
            }

            if (task.getAssignedTo() != null) {
                tasksByAssignee.computeIfAbsent(task.getAssignedTo(), k -> new ArrayList<>()).add(task);
            }
        }

        // Determine health status
        String healthStatus;
        if (project.getStatus() == ProjectStatus.COMPLETED || (totalTasks > 0 && completedTasks == totalTasks)) {
            healthStatus = "COMPLETED";
        } else if (delayedTasks > 0) {
            healthStatus = "DELAYED";
        } else if (progress.getLastActivityAt() != null && progress.getLastActivityAt().isBefore(now.minusDays(7))) {
            healthStatus = "INACTIVE";
        } else {
            healthStatus = "ON_TRACK";
        }

        // Compute member contributions
        List<MemberContributionDTO> contributions = new ArrayList<>();
        for (Map.Entry<Long, List<Task>> entry : tasksByAssignee.entrySet()) {
            Long studentId = entry.getKey();
            List<Task> memberTasks = entry.getValue();
            int assignedCount = memberTasks.size();
            int memberCompleted = (int) memberTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            int percentage = assignedCount > 0 ? (memberCompleted * 100 / assignedCount) : 0;

            String studentName = "Unknown Student";
            String studentEmail = "";
            Optional<User> studentOpt = userRepository.findById(studentId);
            if (studentOpt.isPresent()) {
                studentName = studentOpt.get().getName();
                studentEmail = studentOpt.get().getEmail();
            }

            contributions.add(new MemberContributionDTO(
                    studentId, studentName, studentEmail, assignedCount, memberCompleted, percentage
            ));
        }

        return new ProjectProgressDetailsResponse(
                projectId,
                project.getTitle(),
                progress.getOverallProgress() != null ? progress.getOverallProgress() : 0,
                totalTasks,
                completedTasks,
                inProgressTasks,
                todoTasks,
                delayedTasks,
                progress.getLastActivityAt(),
                healthStatus,
                contributions,
                progress.getUpdatedAt()
        );
    }

    @Override
    public ProjectProgress recalculateAndSaveProgress(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ProjectProgress progress = findOrCreateProgress(projectId);
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        if (!tasks.isEmpty()) {
            double totalProgressSum = 0;
            for (Task t : tasks) {
                if (t.getProgress() != null) {
                    totalProgressSum += t.getProgress();
                } else {
                    if (t.getStatus() == TaskStatus.COMPLETED) {
                        totalProgressSum += 100;
                    } else if (t.getStatus() == TaskStatus.IN_PROGRESS) {
                        totalProgressSum += 50;
                    }
                }
            }
            int calculatedPercentage = (int) Math.round(totalProgressSum / tasks.size());
            progress.setOverallProgress(Math.min(100, Math.max(0, calculatedPercentage)));
        }

        progress.setLastActivityAt(LocalDateTime.now());
        return projectProgressRepository.save(progress);
    }

    @Override
    public ProjectProgress recordProjectActivity(Long projectId) {
        ProjectProgress progress = findOrCreateProgress(projectId);
        progress.setLastActivityAt(LocalDateTime.now());
        return projectProgressRepository.save(progress);
    }

    @Override
    public ProjectProgress manualUpdateProgress(Long projectId, Integer overallProgress, String reason) {
        ProjectProgress progress = findOrCreateProgress(projectId);
        progress.setOverallProgress(overallProgress);
        progress.setLastActivityAt(LocalDateTime.now());
        return projectProgressRepository.save(progress);
    }

    @Override
    public ProjectProgress findOrCreateProgress(Long projectId) {
        return projectProgressRepository.findByProjectId(projectId)
                .orElseGet(() -> {
                    if (!projectRepository.existsById(projectId)) {
                        throw new ResourceNotFoundException("Project not found with id: " + projectId);
                    }
                    return projectProgressRepository.save(ProjectProgress.builder()
                            .projectId(projectId)
                            .overallProgress(0)
                            .lastActivityAt(LocalDateTime.now())
                            .build());
                });
    }
}
