package com.project.platform.service.impl;

import com.project.platform.dto.response.RolePermissionDto;
import com.project.platform.entity.RolePermission;
import com.project.platform.entity.enums.Role;
import com.project.platform.repository.RolePermissionRepository;
import com.project.platform.service.RolePermissionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class RolePermissionServiceImpl implements RolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;

    public static final List<String> ALL_AVAILABLE_PERMISSIONS = List.of(
        "MANAGE_USERS",
        "MANAGE_PROJECTS",
        "MANAGE_ROLES",
        "VIEW_ANALYTICS",
        "SEND_ANNOUNCEMENTS",
        "MANAGE_REVIEWS",
        "EVALUATE_PROJECTS",
        "CREATE_PROJECT",
        "JOIN_TEAM",
        "MANAGE_TASKS",
        "SEND_MESSAGES"
    );

    private static final Map<Role, List<String>> DEFAULT_PERMISSIONS = Map.of(
        Role.ADMIN, List.of(
            "MANAGE_USERS", "MANAGE_PROJECTS", "MANAGE_ROLES", "VIEW_ANALYTICS",
            "SEND_ANNOUNCEMENTS", "MANAGE_REVIEWS"
        ),
        Role.FACULTY, List.of(
            "VIEW_PROJECTS", "EVALUATE_PROJECTS", "SEND_FEEDBACK"
        ),
        Role.STUDENT, List.of(
            "CREATE_PROJECT", "JOIN_TEAM", "MANAGE_TASKS", "SEND_MESSAGES"
        )
    );

    @PostConstruct
    public void initDefaults() {
        if (rolePermissionRepository.count() == 0) {
            for (Map.Entry<Role, List<String>> entry : DEFAULT_PERMISSIONS.entrySet()) {
                Role role = entry.getKey();
                for (String perm : entry.getValue()) {
                    rolePermissionRepository.save(
                        RolePermission.builder()
                            .role(role)
                            .permission(perm)
                            .enabled(true)
                            .build()
                    );
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Role, List<String>> getAllRolePermissions() {
        Map<Role, List<String>> result = new EnumMap<>(Role.class);
        for (Role role : Role.values()) {
            List<String> perms = rolePermissionRepository.findByRoleAndEnabledTrue(role)
                .stream()
                .map(RolePermission::getPermission)
                .toList();
            result.put(role, perms);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public RolePermissionDto getPermissionsForRole(Role role) {
        List<String> perms = rolePermissionRepository.findByRoleAndEnabledTrue(role)
            .stream()
            .map(RolePermission::getPermission)
            .toList();
        return new RolePermissionDto(role, perms);
    }

    @Override
    public RolePermissionDto updateRolePermissions(Role role, List<String> permissions) {
        Set<String> newPermSet = new HashSet<>(permissions != null ? permissions : Collections.emptyList());

        // Retain existing records or update enabled flag
        List<RolePermission> existing = rolePermissionRepository.findByRole(role);
        Map<String, RolePermission> existingMap = new HashMap<>();
        for (RolePermission rp : existing) {
            existingMap.put(rp.getPermission(), rp);
        }

        // Set state for all updated permissions
        for (String perm : ALL_AVAILABLE_PERMISSIONS) {
            boolean shouldBeEnabled = newPermSet.contains(perm);
            RolePermission rp = existingMap.get(perm);
            if (rp != null) {
                rp.setEnabled(shouldBeEnabled);
                rolePermissionRepository.save(rp);
            } else if (shouldBeEnabled) {
                rolePermissionRepository.save(
                    RolePermission.builder()
                        .role(role)
                        .permission(perm)
                        .enabled(true)
                        .build()
                );
            }
        }

        return getPermissionsForRole(role);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(Role role, String permission) {
        if (role == Role.ADMIN) {
            return true; // ADMIN always retains full administrative access
        }
        return rolePermissionRepository.existsByRoleAndPermissionAndEnabledTrue(role, permission);
    }
}
