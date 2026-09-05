package com.project.platform.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * PLACEHOLDER ENTITY - see User.java header comment.
 * Replace with the canonical StudentProfile entity from the shared repo.
 */
@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    private String department;

    private String skills;

    @Column(length = 2000)
    private String bio;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;
}
