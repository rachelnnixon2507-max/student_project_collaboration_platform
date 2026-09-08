package com.project.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ProjectEvaluation entity recording formal academic grading and rubric evaluations.
 * OWNED by Member 3 - Faculty Module.
 */
@Entity
@Table(name = "project_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "evaluator_id", nullable = false)
    private Long evaluatorId;

    /** Technical execution score (0 - 100). */
    @Column(name = "technical_score")
    private Double technicalScore;

    /** Innovation & novelty score (0 - 100). */
    @Column(name = "innovation_score")
    private Double innovationScore;

    /** Implementation & code quality score (0 - 100). */
    @Column(name = "execution_score")
    private Double executionScore;

    /** Documentation & presentation score (0 - 100). */
    @Column(name = "presentation_score")
    private Double presentationScore;

    /** Computed composite total score (0 - 100). */
    @Column(name = "total_score")
    private Double totalScore;

    /** Academic letter grade (e.g. A+, A, B+, B, C, F). */
    @Column(length = 10)
    private String grade;

    @Column(length = 4000)
    private String remarks;

    @Column(name = "evaluated_at", updatable = false)
    private LocalDateTime evaluatedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.evaluatedAt = LocalDateTime.now();
        this.updatedAt = this.evaluatedAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
