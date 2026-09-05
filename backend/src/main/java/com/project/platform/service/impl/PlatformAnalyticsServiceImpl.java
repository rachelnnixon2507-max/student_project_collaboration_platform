package com.project.platform.service.impl;

import com.project.platform.dto.response.PlatformAnalyticsResponse;
import com.project.platform.entity.PlatformAnalytics;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.Role;
import com.project.platform.entity.enums.TaskStatus;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.*;
import com.project.platform.service.PlatformAnalyticsService;
import com.project.platform.service.ProjectHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlatformAnalyticsServiceImpl implements PlatformAnalyticsService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final PlatformAnalyticsRepository platformAnalyticsRepository;
    private final ProjectHealthService projectHealthService;

    @Override
    public PlatformAnalyticsResponse getLiveSummary() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalFaculty = userRepository.countByRole(Role.FACULTY);

        long totalProjects = projectRepository.count();
        long openProjects = projectRepository.countByStatus(ProjectStatus.OPEN);
        long inProgressProjects = projectRepository.countByStatus(ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByStatus(ProjectStatus.COMPLETED);

        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED);

        long delayedProjects = projectHealthService.getDelayedAndInactiveProjects().stream()
            .filter(com.project.platform.dto.response.DelayedProjectResponse::delayed).count();
        long inactiveProjects = projectHealthService.getDelayedAndInactiveProjects().stream()
            .filter(com.project.platform.dto.response.DelayedProjectResponse::inactive).count();

        return new PlatformAnalyticsResponse(
            totalUsers, totalStudents, totalFaculty,
            totalProjects, openProjects, inProgressProjects, completedProjects,
            totalTasks, completedTasks,
            delayedProjects, inactiveProjects,
            java.time.LocalDateTime.now()
        );
    }

    @Override
    @Transactional
    public PlatformAnalyticsResponse generateAndSaveSnapshot() {
        PlatformAnalyticsResponse live = getLiveSummary();

        PlatformAnalytics snapshot = PlatformAnalytics.builder()
            .totalUsers(live.totalUsers())
            .totalStudents(live.totalStudents())
            .totalFaculty(live.totalFaculty())
            .totalProjects(live.totalProjects())
            .openProjects(live.openProjects())
            .inProgressProjects(live.inProgressProjects())
            .completedProjects(live.completedProjects())
            .totalTasks(live.totalTasks())
            .completedTasks(live.completedTasks())
            .delayedProjects(live.delayedProjects())
            .inactiveProjects(live.inactiveProjects())
            .build();

        PlatformAnalytics saved = platformAnalyticsRepository.save(snapshot);
        return toResponse(saved);
    }

    @Override
    public PlatformAnalyticsResponse getLatestSnapshot() {
        PlatformAnalytics snapshot = platformAnalyticsRepository.findTopByOrderByGeneratedAtDesc()
            .orElseThrow(() -> new ResourceNotFoundException("No analytics snapshot has been generated yet"));
        return toResponse(snapshot);
    }

    private PlatformAnalyticsResponse toResponse(PlatformAnalytics a) {
        return new PlatformAnalyticsResponse(
            a.getTotalUsers(), a.getTotalStudents(), a.getTotalFaculty(),
            a.getTotalProjects(), a.getOpenProjects(), a.getInProgressProjects(), a.getCompletedProjects(),
            a.getTotalTasks(), a.getCompletedTasks(),
            a.getDelayedProjects(), a.getInactiveProjects(),
            a.getGeneratedAt()
        );
    }
}
