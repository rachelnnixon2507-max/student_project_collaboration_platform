package com.project.platform.entity;

import com.project.platform.entity.enums.AccountStatus;
import com.project.platform.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ============================================================================
 *  PLACEHOLDER ENTITY - DO NOT TREAT AS FINAL
 * ============================================================================
 * Per team rules, User must NOT be duplicated. This class exists here only
 * because this module was built standalone (no shared repo was available to
 * inspect). Whoever owns the Auth/User module should REPLACE this file with
 * the real, canonical User entity, or (preferred) this file should simply be
 * DELETED once merged into the shared codebase and all references here
 * should point at the real entity instead.
 *
 * Field `accountStatus` is an ADDITION requested by the Admin module (needed
 * for "Manage Students & Faculty" — enable/suspend accounts). This field
 * requires TEAM APPROVAL before being added to the real shared User entity.
 * ============================================================================
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // --- Field requested by Admin module (needs team approval) ---
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.accountStatus == null) {
            this.accountStatus = AccountStatus.ACTIVE;
        }
    }
}
