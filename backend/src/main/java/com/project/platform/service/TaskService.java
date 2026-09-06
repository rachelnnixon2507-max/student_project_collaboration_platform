package com.project.platform.service;

import com.project.platform.dto.request.CreateTaskRequest;
import com.project.platform.dto.request.UpdateTaskRequest;
import com.project.platform.dto.request.UpdateTaskStatusRequest;
import com.project.platform.dto.response.TaskResponse;

import java.util.List;

/**
 * Service for managing tasks, assignments, and workflow statuses.
 * Owned by Member 2 - Team Collaboration.
 */
public interface TaskService {

    TaskResponse createTask(CreateTaskRequest request, Long currentUserId);

    TaskResponse getTaskById(Long taskId);

    List<TaskResponse> getTasksByProjectId(Long projectId);

    List<TaskResponse> getTasksAssignedTo(Long studentId);

    TaskResponse updateTask(Long taskId, UpdateTaskRequest request, Long currentUserId);

    TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request, Long currentUserId);

    TaskResponse assignTask(Long taskId, Long assignedTo, Long currentUserId);

    void deleteTask(Long taskId, Long currentUserId);
}
