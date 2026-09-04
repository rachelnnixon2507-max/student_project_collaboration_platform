package com.project.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * PLACEHOLDER ENTITY - see User.java header comment.
 * Replace with the canonical ProjectProgress entity from the shared repo.
 * Used here to detect inactivity (last activity timestamp per project).
 */
@Entity
@Table(name = "project_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false, unique = true)
    private Long projectId;

    /** 0-100 overall completion percentage for the project. */
    @Column(name = "overall_progress")
    private Integer overallProgress;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
