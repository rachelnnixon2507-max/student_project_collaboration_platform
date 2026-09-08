package com.project.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * FacultyFeedback entity representing mentorship comments and reviews given to a project or task.
 * OWNED by Member 3 - Faculty Module.
 */
@Entity
@Table(name = "faculty_feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "faculty_id", nullable = false)
    private Long facultyId;

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "feedback_text", length = 4000, nullable = false)
    private String feedbackText;

    /** Rating from 1 to 5 (optional). */
    private Integer rating;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
