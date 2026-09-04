package com.project.platform.entity;

import com.project.platform.entity.enums.ProjectMemberRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * PLACEHOLDER ENTITY - see User.java header comment.
 * Replace with the canonical ProjectMember entity from the shared repo.
 */
@Entity
@Table(name = "project_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectMemberRole role;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        this.joinedAt = LocalDateTime.now();
    }
}
