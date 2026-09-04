package com.project.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * OWNED BY MEMBER 4 (Admin & System).
 *
 * Stores periodic point-in-time snapshots of platform-wide metrics so
 * analytics can be viewed historically (e.g. "signups over time"), in
 * addition to the live/on-demand dashboard computed directly from the
 * other tables (see PlatformAnalyticsService.getLiveSummary()).
 */
@Entity
@Table(name = "platform_analytics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long totalUsers;
    private Long totalStudents;
    private Long totalFaculty;

    private Long totalProjects;
    private Long openProjects;
    private Long inProgressProjects;
    private Long completedProjects;

    private Long totalTasks;
    private Long completedTasks;

    private Long delayedProjects;
    private Long inactiveProjects;

    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        this.generatedAt = LocalDateTime.now();
    }
}
