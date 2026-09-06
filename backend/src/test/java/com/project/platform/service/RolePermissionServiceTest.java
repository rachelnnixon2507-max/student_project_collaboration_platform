package com.project.platform.service;

import com.project.platform.dto.response.RolePermissionDto;
import com.project.platform.entity.RolePermission;
import com.project.platform.entity.enums.Role;
import com.project.platform.repository.RolePermissionRepository;
import com.project.platform.service.impl.RolePermissionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RolePermissionServiceTest {

    @Mock
    private RolePermissionRepository rolePermissionRepository;

    @InjectMocks
    private RolePermissionServiceImpl rolePermissionService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testGetAllRolePermissions() {
        when(rolePermissionRepository.findByRoleAndEnabledTrue(Role.ADMIN))
            .thenReturn(List.of(RolePermission.builder().role(Role.ADMIN).permission("MANAGE_USERS").enabled(true).build()));
        when(rolePermissionRepository.findByRoleAndEnabledTrue(Role.FACULTY))
            .thenReturn(List.of(RolePermission.builder().role(Role.FACULTY).permission("EVALUATE_PROJECTS").enabled(true).build()));
        when(rolePermissionRepository.findByRoleAndEnabledTrue(Role.STUDENT))
            .thenReturn(List.of(RolePermission.builder().role(Role.STUDENT).permission("JOIN_TEAM").enabled(true).build()));

        Map<Role, List<String>> result = rolePermissionService.getAllRolePermissions();
        assertNotNull(result);
        assertEquals(1, result.get(Role.ADMIN).size());
        assertTrue(result.get(Role.ADMIN).contains("MANAGE_USERS"));
    }

    @Test
    void testHasPermissionAdminAlwaysTrue() {
        assertTrue(rolePermissionService.hasPermission(Role.ADMIN, "ANY_PERMISSION"));
    }

    @Test
    void testHasPermissionStudent() {
        when(rolePermissionRepository.existsByRoleAndPermissionAndEnabledTrue(Role.STUDENT, "CREATE_PROJECT"))
            .thenReturn(true);
        assertTrue(rolePermissionService.hasPermission(Role.STUDENT, "CREATE_PROJECT"));

        when(rolePermissionRepository.existsByRoleAndPermissionAndEnabledTrue(Role.STUDENT, "MANAGE_USERS"))
            .thenReturn(false);
        assertFalse(rolePermissionService.hasPermission(Role.STUDENT, "MANAGE_USERS"));
    }

    @Test
    void testUpdateRolePermissions() {
        when(rolePermissionRepository.findByRole(Role.STUDENT)).thenReturn(List.of());
        when(rolePermissionRepository.findByRoleAndEnabledTrue(Role.STUDENT))
            .thenReturn(List.of(RolePermission.builder().role(Role.STUDENT).permission("CREATE_PROJECT").enabled(true).build()));

        RolePermissionDto dto = rolePermissionService.updateRolePermissions(Role.STUDENT, List.of("CREATE_PROJECT"));
        assertNotNull(dto);
        assertEquals(Role.STUDENT, dto.role());
        verify(rolePermissionRepository, atLeastOnce()).save(any(RolePermission.class));
    }
}
