package com.project.platform.entity;

import com.project.platform.entity.enums.AnnouncementScope;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * OWNED BY MEMBER 4 (Admin & System).
 * Announcements broadcast by an admin (or faculty, in future) to
 * students, faculty, everyone, or a specific project's members.
 */
@Entity
@Table(name = "announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementScope scope;

    /** Required only when scope == PROJECT, references Project.id. */
    @Column(name = "project_id")
    private Long projectId;

    /** References User.id of the admin who created this announcement. */
    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
