package com.project.platform.entity;

import com.project.platform.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

/**
 * Persisted mapping between platform roles and specific permission strings.
 * Owned by Member 4 (Admin & System).
 */
@Entity
@Table(
    name = "role_permissions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"role", "permission"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String permission;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;
}
