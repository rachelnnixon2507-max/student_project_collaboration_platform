package com.project.platform.service;

import com.project.platform.dto.request.CreateTaskRequest;
import com.project.platform.dto.request.UpdateTaskStatusRequest;
import com.project.platform.dto.response.ProjectProgressDetailsResponse;
import com.project.platform.dto.response.TaskResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.ProjectProgress;
import com.project.platform.entity.Task;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.Role;
import com.project.platform.entity.enums.TaskStatus;
import com.project.platform.repository.ProjectProgressRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.TaskRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.impl.ProjectProgressServiceImpl;
import com.project.platform.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskAndProgressServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectProgressRepository projectProgressRepository;

    @Mock
    private UserRepository userRepository;

    private ProjectProgressService projectProgressService;
    private TaskService taskService;

    private Project project;
    private User student;

    @BeforeEach
    void setUp() {
        projectProgressService = new ProjectProgressServiceImpl(
                projectProgressRepository, projectRepository, taskRepository, userRepository
        );
        taskService = new TaskServiceImpl(
                taskRepository, projectRepository, userRepository, projectProgressService
        );

        project = Project.builder()
                .id(1L)
                .title("IoT Agriculture Monitor")
                .description("Soil moisture telemetry")
                .status(ProjectStatus.IN_PROGRESS)
                .createdBy(10L)
                .build();

        student = User.builder()
                .id(20L)
                .name("Aditya Verma")
                .email("aditya@college.edu")
                .role(Role.STUDENT)
                .build();
    }

    @Test
    @DisplayName("Create task saves entity, links project and triggers progress calculation")
    void testCreateTask() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.existsById(1L)).thenReturn(true);
        when(userRepository.existsById(20L)).thenReturn(true);
        when(userRepository.findById(20L)).thenReturn(Optional.of(student));

        Task savedTask = Task.builder()
                .id(101L)
                .projectId(1L)
                .assignedTo(20L)
                .title("Calibrate soil moisture sensor")
                .status(TaskStatus.TODO)
                .progress(0)
                .dueDate(LocalDateTime.now().plusDays(5))
                .build();

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);
        when(taskRepository.findByProjectId(1L)).thenReturn(List.of(savedTask));
        when(projectProgressRepository.findByProjectId(1L)).thenReturn(Optional.empty());
        when(projectProgressRepository.save(any(ProjectProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CreateTaskRequest request = new CreateTaskRequest(
                1L, "Calibrate soil moisture sensor", "Use hardware workbench", 20L,
                LocalDateTime.now().plusDays(5), TaskStatus.TODO, 0
        );

        TaskResponse response = taskService.createTask(request, 10L);

        assertNotNull(response);
        assertEquals(101L, response.id());
        assertEquals("Calibrate soil moisture sensor", response.title());
        assertEquals("Aditya Verma", response.assigneeName());
        verify(taskRepository, times(1)).save(any(Task.class));
        verify(projectProgressRepository, atLeastOnce()).save(any(ProjectProgress.class));
    }

    @Test
    @DisplayName("Updating task to COMPLETED sets progress to 100% and updates overall project progress")
    void testUpdateTaskStatusToCompleted() {
        Task task = Task.builder()
                .id(101L)
                .projectId(1L)
                .assignedTo(20L)
                .title("Build MQTT Parser")
                .status(TaskStatus.IN_PROGRESS)
                .progress(50)
                .build();

        when(taskRepository.findById(101L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.existsById(1L)).thenReturn(true);

        // When task becomes completed, average progress should reach 100%
        Task completedTask = Task.builder()
                .id(101L).projectId(1L).status(TaskStatus.COMPLETED).progress(100).build();
        when(taskRepository.findByProjectId(1L)).thenReturn(List.of(completedTask));
        when(projectProgressRepository.findByProjectId(1L)).thenReturn(Optional.empty());
        when(projectProgressRepository.save(any(ProjectProgress.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateTaskStatusRequest req = new UpdateTaskStatusRequest(TaskStatus.COMPLETED, 100);
        TaskResponse res = taskService.updateTaskStatus(101L, req, 20L);

        assertEquals(TaskStatus.COMPLETED, res.status());
        assertEquals(100, res.progress());
    }

    @Test
    @DisplayName("Project progress details calculation handles delayed tasks and member contributions")
    void testGetProjectProgressDetails() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        ProjectProgress progress = ProjectProgress.builder()
                .projectId(1L)
                .overallProgress(70)
                .lastActivityAt(LocalDateTime.now().minusHours(2))
                .build();
        when(projectProgressRepository.findByProjectId(1L)).thenReturn(Optional.of(progress));

        Task t1 = Task.builder()
                .id(1L).projectId(1L).assignedTo(20L).status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(1)).build();
        Task t2 = Task.builder()
                .id(2L).projectId(1L).assignedTo(20L).status(TaskStatus.IN_PROGRESS).progress(40).dueDate(LocalDateTime.now().minusDays(2)).build(); // Overdue

        when(taskRepository.findByProjectId(1L)).thenReturn(List.of(t1, t2));
        when(userRepository.findById(20L)).thenReturn(Optional.of(student));

        ProjectProgressDetailsResponse details = projectProgressService.getProjectProgressDetails(1L);

        assertNotNull(details);
        assertEquals(1L, details.projectId());
        assertEquals(2, details.totalTasks());
        assertEquals(1, details.completedTasks());
        assertEquals(1, details.inProgressTasks());
        assertEquals(1, details.delayedTasks(), "t2 has dueDate in the past, so should be counted as delayed");
        assertEquals("DELAYED", details.healthStatus());
        assertEquals(1, details.memberContributions().size());
        assertEquals("Aditya Verma", details.memberContributions().get(0).studentName());
        assertEquals(2, details.memberContributions().get(0).assignedTasksCount());
        assertEquals(1, details.memberContributions().get(0).completedTasksCount());
    }
}
