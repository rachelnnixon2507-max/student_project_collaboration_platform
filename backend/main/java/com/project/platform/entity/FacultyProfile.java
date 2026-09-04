package com.project.platform.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * PLACEHOLDER ENTITY - see User.java header comment.
 * Replace with the canonical FacultyProfile entity from the shared repo.
 */
@Entity
@Table(name = "faculty_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    private String department;

    private String designation;

    private String specialization;
}
