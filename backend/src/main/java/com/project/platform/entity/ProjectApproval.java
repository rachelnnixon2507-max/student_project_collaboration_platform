package com.project.platform.entity;

import com.project.platform.entity.enums.ProjectApprovalDecision;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ProjectApproval entity recording faculty approval / rejection milestones.
 * OWNED by Member 3 - Faculty Module.
 */
@Entity
@Table(name = "project_approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "faculty_id", nullable = false)
    private Long facultyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectApprovalDecision decision;

    @Column(length = 4000)
    private String comments;

    @Column(name = "decided_at", updatable = false)
    private LocalDateTime decidedAt;

    @PrePersist
    protected void onCreate() {
        this.decidedAt = LocalDateTime.now();
    }
}
