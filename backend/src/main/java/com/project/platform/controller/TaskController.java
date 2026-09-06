package com.project.platform.controller;

import com.project.platform.dto.request.AssignTaskRequest;
import com.project.platform.dto.request.CreateTaskRequest;
import com.project.platform.dto.request.UpdateTaskRequest;
import com.project.platform.dto.request.UpdateTaskStatusRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.TaskResponse;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Task Creation & Assignment.
 * Owned by Member 2 - Team Collaboration.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskResponse response = taskService.createTask(request, principal != null ? principal.getId() : null);
        return ApiResponse.ok("Task created successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<TaskResponse> getTaskById(@PathVariable Long id) {
        TaskResponse response = taskService.getTaskById(id);
        return ApiResponse.ok(response);
    }

    @GetMapping("/project/{projectId}")
    public ApiResponse<List<TaskResponse>> getTasksByProject(@PathVariable Long projectId) {
        List<TaskResponse> tasks = taskService.getTasksByProjectId(projectId);
        return ApiResponse.ok(tasks);
    }

    @GetMapping("/my-tasks")
    public ApiResponse<List<TaskResponse>> getMyTasks(@AuthenticationPrincipal UserPrincipal principal) {
        Long userId = (principal != null) ? principal.getId() : 1L;
        List<TaskResponse> tasks = taskService.getTasksAssignedTo(userId);
        return ApiResponse.ok(tasks);
    }

    @GetMapping("/assigned/{studentId}")
    public ApiResponse<List<TaskResponse>> getTasksAssignedTo(@PathVariable Long studentId) {
        List<TaskResponse> tasks = taskService.getTasksAssignedTo(studentId);
        return ApiResponse.ok(tasks);
    }

    @PutMapping("/{id}")
    public ApiResponse<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskResponse response = taskService.updateTask(id, request, principal != null ? principal.getId() : null);
        return ApiResponse.ok("Task updated successfully", response);
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskResponse response = taskService.updateTaskStatus(id, request, principal != null ? principal.getId() : null);
        return ApiResponse.ok("Task status updated", response);
    }

    @PatchMapping("/{id}/assign")
    public ApiResponse<TaskResponse> assignTask(
            @PathVariable Long id,
            @Valid @RequestBody AssignTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskResponse response = taskService.assignTask(id, request.assignedTo(), principal != null ? principal.getId() : null);
        return ApiResponse.ok("Task assigned successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        taskService.deleteTask(id, principal != null ? principal.getId() : null);
        return ApiResponse.ok("Task deleted successfully", null);
    }
}
