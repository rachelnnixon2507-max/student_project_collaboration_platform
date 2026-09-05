package com.project.platform.service;

import com.project.platform.dto.response.FacultyAdminResponse;
import com.project.platform.dto.response.StudentAdminResponse;
import com.project.platform.dto.response.UserAdminResponse;
import com.project.platform.entity.enums.AccountStatus;
import com.project.platform.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Feature 1 (Manage Students & Faculty) + Feature 3 (Manage Roles & Permissions).
 */
public interface AdminUserService {

    Page<UserAdminResponse> listUsers(Role role, Pageable pageable);

    Page<StudentAdminResponse> listStudents(Pageable pageable);

    Page<FacultyAdminResponse> listFaculty(Pageable pageable);

    UserAdminResponse getUser(Long userId);

    UserAdminResponse updateAccountStatus(Long userId, AccountStatus newStatus);

    UserAdminResponse updateUserRole(Long userId, Role newRole);

    void deleteUser(Long userId);
}
