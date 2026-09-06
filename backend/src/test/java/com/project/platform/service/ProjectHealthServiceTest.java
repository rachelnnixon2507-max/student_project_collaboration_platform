package com.project.platform.service;

import com.project.platform.dto.response.DelayedProjectResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.ProjectProgress;
import com.project.platform.entity.Task;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.TaskStatus;
import com.project.platform.repository.ProjectProgressRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.TaskRepository;
import com.project.platform.service.impl.ProjectHealthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectHealthServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectProgressRepository projectProgressRepository;

    @InjectMocks
    private ProjectHealthServiceImpl projectHealthService;

    @Test
    void testGetDelayedAndInactiveProjects() {
        Project project = Project.builder()
            .id(1L)
            .title("Test Project")
            .status(ProjectStatus.IN_PROGRESS)
            .createdAt(LocalDateTime.now().minusDays(10))
            .build();

        Task overdueTask = Task.builder()
            .id(101L)
            .projectId(1L)
            .title("Overdue Task")
            .status(TaskStatus.TODO)
            .dueDate(LocalDateTime.now().minusDays(2))
            .build();

        ProjectProgress progress = ProjectProgress.builder()
            .projectId(1L)
            .lastActivityAt(LocalDateTime.now().minusDays(8))
            .build();

        when(projectRepository.findAll()).thenReturn(List.of(project));
        when(taskRepository.findByStatusNotAndDueDateBefore(eq(TaskStatus.COMPLETED), any())).thenReturn(List.of(overdueTask));
        when(projectProgressRepository.findByProjectId(1L)).thenReturn(Optional.of(progress));

        List<DelayedProjectResponse> flagged = projectHealthService.getDelayedAndInactiveProjects();

        assertEquals(1, flagged.size());
        DelayedProjectResponse res = flagged.get(0);
        assertEquals(1L, res.projectId());
        assertEquals("Test Project", res.projectTitle());
        assertTrue(res.delayed());
        assertTrue(res.inactive());
        assertEquals(1, res.delayedTaskCount());
    }
}
