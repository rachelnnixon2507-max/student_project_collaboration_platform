package com.project.platform.repository;

import com.project.platform.entity.RolePermission;
import com.project.platform.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRole(Role role);
    Optional<RolePermission> findByRoleAndPermission(Role role, String permission);
    List<RolePermission> findByRoleAndEnabledTrue(Role role);
    boolean existsByRoleAndPermissionAndEnabledTrue(Role role, String permission);
}
