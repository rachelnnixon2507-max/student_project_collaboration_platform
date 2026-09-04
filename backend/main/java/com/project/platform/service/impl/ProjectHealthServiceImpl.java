package com.project.platform.service.impl;

import com.project.platform.dto.response.DelayedProjectResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.ProjectProgress;
import com.project.platform.entity.Task;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.TaskStatus;
import com.project.platform.repository.ProjectProgressRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.TaskRepository;
import com.project.platform.service.ProjectHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectHealthServiceImpl implements ProjectHealthService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectProgressRepository projectProgressRepository;

    @Value("${app.admin.inactivity-threshold-days:7}")
    private int inactivityThresholdDays;

    @Value("${app.admin.delay-grace-days:0}")
    private int delayGraceDays;

    private static final Set<ProjectStatus> ACTIVE_STATUSES =
        Set.of(ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS);

    @Override
    public List<DelayedProjectResponse> getDelayedAndInactiveProjects() {
        LocalDateTime delayCutoff = LocalDateTime.now().minusDays(delayGraceDays);
        LocalDateTime inactivityCutoff = LocalDateTime.now().minusDays(inactivityThresholdDays);

        // Projects with at least one overdue, unfinished task.
        List<Task> overdueTasks = taskRepository.findByStatusNotAndDueDateBefore(TaskStatus.COMPLETED, delayCutoff);

        List<ProjectProgress> staleProgress = projectProgressRepository.findByLastActivityAtBefore(inactivityCutoff);

        List<Project> activeProjects = projectRepository.findAll().stream()
            .filter(p -> ACTIVE_STATUSES.contains(p.getStatus()))
            .collect(Collectors.toList());

        List<DelayedProjectResponse> results = new ArrayList<>();

        for (Project project : activeProjects) {
            List<Task> projectOverdueTasks = overdueTasks.stream()
                .filter(t -> t.getProjectId().equals(project.getId()))
                .toList();

            boolean delayed = !projectOverdueTasks.isEmpty();

            ProjectProgress progress = staleProgress.stream()
                .filter(pp -> pp.getProjectId().equals(project.getId()))
                .findFirst()
                .orElse(null);
            boolean inactive = progress != null;

            if (delayed || inactive) {
                results.add(new DelayedProjectResponse(
                    project.getId(),
                    project.getTitle(),
                    delayed,
                    inactive,
                    projectOverdueTasks.size(),
                    progress != null ? progress.getLastActivityAt() : null,
                    projectOverdueTasks.stream().map(Task::getId).toList()
                ));
            }
        }

        return results;
    }
}
