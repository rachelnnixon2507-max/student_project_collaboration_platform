package com.project.platform.service.impl;

import com.project.platform.dto.response.FacultyAdminResponse;
import com.project.platform.dto.response.StudentAdminResponse;
import com.project.platform.dto.response.UserAdminResponse;
import com.project.platform.entity.FacultyProfile;
import com.project.platform.entity.StudentProfile;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.AccountStatus;
import com.project.platform.entity.enums.Role;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.FacultyProfileRepository;
import com.project.platform.repository.StudentProfileRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;

    @Override
    public Page<UserAdminResponse> listUsers(Role role, Pageable pageable) {
        Page<User> page = (role != null)
            ? userRepository.findByRole(role, pageable)
            : userRepository.findAll(pageable);
        return page.map(this::toUserResponse);
    }

    @Override
    public Page<StudentAdminResponse> listStudents(Pageable pageable) {
        return userRepository.findByRole(Role.STUDENT, pageable)
            .map(user -> {
                StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
                return toStudentResponse(user, profile);
            });
    }

    @Override
    public Page<FacultyAdminResponse> listFaculty(Pageable pageable) {
        return userRepository.findByRole(Role.FACULTY, pageable)
            .map(user -> {
                FacultyProfile profile = facultyProfileRepository.findByUserId(user.getId()).orElse(null);
                return toFacultyResponse(user, profile);
            });
    }

    @Override
    public UserAdminResponse getUser(Long userId) {
        return toUserResponse(findUserOrThrow(userId));
    }

    @Override
    @Transactional
    public UserAdminResponse updateAccountStatus(Long userId, AccountStatus newStatus) {
        User user = findUserOrThrow(userId);
        user.setAccountStatus(newStatus);
        return toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserAdminResponse updateUserRole(Long userId, Role newRole) {
        User user = findUserOrThrow(userId);
        user.setRole(newRole);
        return toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = findUserOrThrow(userId);
        userRepository.delete(user);
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private UserAdminResponse toUserResponse(User user) {
        return new UserAdminResponse(
            user.getId(), user.getName(), user.getEmail(),
            user.getRole(), user.getAccountStatus(), user.getCreatedAt()
        );
    }

    private StudentAdminResponse toStudentResponse(User user, StudentProfile profile) {
        return new StudentAdminResponse(
            user.getId(), user.getName(), user.getEmail(), user.getAccountStatus(),
            profile != null ? profile.getDepartment() : null,
            profile != null ? profile.getSkills() : null,
            profile != null ? profile.getGithubUrl() : null,
            profile != null ? profile.getLinkedinUrl() : null
        );
    }

    private FacultyAdminResponse toFacultyResponse(User user, FacultyProfile profile) {
        return new FacultyAdminResponse(
            user.getId(), user.getName(), user.getEmail(), user.getAccountStatus(),
            profile != null ? profile.getDepartment() : null,
            profile != null ? profile.getDesignation() : null,
            profile != null ? profile.getSpecialization() : null
        );
    }
}
