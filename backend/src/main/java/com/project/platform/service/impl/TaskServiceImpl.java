package com.project.platform.service.impl;

import com.project.platform.dto.request.CreateTaskRequest;
import com.project.platform.dto.request.UpdateTaskRequest;
import com.project.platform.dto.request.UpdateTaskStatusRequest;
import com.project.platform.dto.response.TaskResponse;
import com.project.platform.entity.Project;
import com.project.platform.entity.Task;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.TaskStatus;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.TaskRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.ProjectProgressService;
import com.project.platform.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of TaskService.
 * Owned by Member 2 - Team Collaboration.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectProgressService projectProgressService;

    @Override
    public TaskResponse createTask(CreateTaskRequest request, Long currentUserId) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.projectId()));

        if (request.assignedTo() != null) {
            validateUserExists(request.assignedTo());
        }

        TaskStatus status = request.status() != null ? request.status() : TaskStatus.TODO;
        Integer progress = request.progress();
        if (progress == null) {
            progress = (status == TaskStatus.COMPLETED) ? 100 : (status == TaskStatus.IN_PROGRESS ? 50 : 0);
        } else if (status == TaskStatus.COMPLETED) {
            progress = 100;
        }

        Task task = Task.builder()
                .projectId(project.getId())
                .assignedTo(request.assignedTo())
                .title(request.title().trim())
                .description(request.description())
                .status(status)
                .dueDate(request.dueDate())
                .progress(progress)
                .build();

        Task saved = taskRepository.save(task);

        // Sync project progress
        projectProgressService.recalculateAndSaveProgress(saved.getProjectId());

        return mapToResponse(saved, project.getTitle());
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId) {
        Task task = findTaskOrThrow(taskId);
        String projectTitle = projectRepository.findById(task.getProjectId())
                .map(Project::getTitle)
                .orElse("Project #" + task.getProjectId());
        return mapToResponse(task, projectTitle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProjectId(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream()
                .map(t -> mapToResponse(t, project.getTitle()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksAssignedTo(Long studentId) {
        validateUserExists(studentId);
        List<Task> tasks = taskRepository.findByAssignedTo(studentId);

        // Batch resolve project titles
        Map<Long, String> projectTitles = projectRepository.findAllById(
                tasks.stream().map(Task::getProjectId).distinct().toList()
        ).stream().collect(Collectors.toMap(Project::getId, Project::getTitle));

        return tasks.stream()
                .map(t -> mapToResponse(t, projectTitles.getOrDefault(t.getProjectId(), "Project #" + t.getProjectId())))
                .toList();
    }

    @Override
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request, Long currentUserId) {
        Task task = findTaskOrThrow(taskId);

        if (request.assignedTo() != null) {
            validateUserExists(request.assignedTo());
        }

        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setAssignedTo(request.assignedTo());
        task.setDueDate(request.dueDate());

        if (request.status() != null) {
            task.setStatus(request.status());
            if (request.status() == TaskStatus.COMPLETED) {
                task.setProgress(100);
            }
        }

        if (request.progress() != null) {
            task.setProgress(request.progress());
            if (request.progress() == 100) {
                task.setStatus(TaskStatus.COMPLETED);
            } else if (request.progress() > 0 && task.getStatus() == TaskStatus.TODO) {
                task.setStatus(TaskStatus.IN_PROGRESS);
            }
        }

        Task updated = taskRepository.save(task);

        // Sync project progress
        projectProgressService.recalculateAndSaveProgress(updated.getProjectId());

        String projectTitle = projectRepository.findById(updated.getProjectId())
                .map(Project::getTitle)
                .orElse("Project #" + updated.getProjectId());
        return mapToResponse(updated, projectTitle);
    }

    @Override
    public TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request, Long currentUserId) {
        Task task = findTaskOrThrow(taskId);

        task.setStatus(request.status());
        if (request.progress() != null) {
            task.setProgress(request.progress());
        } else if (request.status() == TaskStatus.COMPLETED) {
            task.setProgress(100);
        } else if (request.status() == TaskStatus.TODO && (task.getProgress() == null || task.getProgress() == 100)) {
            task.setProgress(0);
        }

        Task updated = taskRepository.save(task);

        // Sync project progress
        projectProgressService.recalculateAndSaveProgress(updated.getProjectId());

        String projectTitle = projectRepository.findById(updated.getProjectId())
                .map(Project::getTitle)
                .orElse("Project #" + updated.getProjectId());
        return mapToResponse(updated, projectTitle);
    }

    @Override
    public TaskResponse assignTask(Long taskId, Long assignedTo, Long currentUserId) {
        Task task = findTaskOrThrow(taskId);

        if (assignedTo != null) {
            validateUserExists(assignedTo);
        }

        task.setAssignedTo(assignedTo);
        Task updated = taskRepository.save(task);

        projectProgressService.recordProjectActivity(updated.getProjectId());

        String projectTitle = projectRepository.findById(updated.getProjectId())
                .map(Project::getTitle)
                .orElse("Project #" + updated.getProjectId());
        return mapToResponse(updated, projectTitle);
    }

    @Override
    public void deleteTask(Long taskId, Long currentUserId) {
        Task task = findTaskOrThrow(taskId);
        Long projectId = task.getProjectId();
        taskRepository.delete(task);

        // Sync project progress after deletion
        projectProgressService.recalculateAndSaveProgress(projectId);
    }

    private Task findTaskOrThrow(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
    }

    private void validateUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
    }

    private TaskResponse mapToResponse(Task task, String projectTitle) {
        String assigneeName = null;
        String assigneeEmail = null;
        if (task.getAssignedTo() != null) {
            Optional<User> userOpt = userRepository.findById(task.getAssignedTo());
            if (userOpt.isPresent()) {
                assigneeName = userOpt.get().getName();
                assigneeEmail = userOpt.get().getEmail();
            }
        }

        boolean isOverdue = task.getStatus() != TaskStatus.COMPLETED
                && task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDateTime.now());

        return new TaskResponse(
                task.getId(),
                task.getProjectId(),
                projectTitle,
                task.getAssignedTo(),
                assigneeName,
                assigneeEmail,
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDate(),
                task.getProgress(),
                isOverdue,
                task.getUpdatedAt()
        );
    }
}
