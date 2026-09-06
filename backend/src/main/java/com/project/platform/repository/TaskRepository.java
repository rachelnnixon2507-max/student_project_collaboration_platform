package com.project.platform.repository;

import com.project.platform.entity.Task;
import com.project.platform.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedTo(Long assignedTo);
    List<Task> findByProjectIdAndAssignedTo(Long projectId, Long assignedTo);
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);
    long countByStatus(TaskStatus status);
    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);
    List<Task> findByStatusNotAndDueDateBefore(TaskStatus status, LocalDateTime cutoff);
}
