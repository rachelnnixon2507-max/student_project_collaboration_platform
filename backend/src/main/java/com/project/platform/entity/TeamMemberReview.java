package com.project.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * OWNED BY MEMBER 4 (Admin & System).
 *
 * A rating/review one team member gives another for their contribution
 * to a shared project. (reviewerId, revieweeId, projectId) is unique —
 * one review per pair per project.
 */
@Entity
@Table(
    name = "team_member_reviews",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_review_project_reviewer_reviewee",
        columnNames = {"project_id", "reviewer_id", "reviewee_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMemberReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    /** References User.id (or StudentProfile) of the student giving the review. */
    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;

    /** References User.id (or StudentProfile) of the student being reviewed. */
    @Column(name = "reviewee_id", nullable = false)
    private Long revieweeId;

    /** 1-5 star rating. */
    @Column(nullable = false)
    private Integer rating;

    @Column(length = 2000)
    private String comments;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
