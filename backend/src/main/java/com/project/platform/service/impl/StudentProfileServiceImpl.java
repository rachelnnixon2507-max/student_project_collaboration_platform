package com.project.platform.service.impl;

import com.project.platform.dto.request.UpdateStudentProfileRequest;
import com.project.platform.dto.response.StudentProfileResponse;
import com.project.platform.entity.StudentProfile;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.Role;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.StudentProfileRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    @Override
    public StudentProfileResponse getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
            .orElse(null);

        return toResponse(user, profile);
    }

    @Override
    @Transactional
    public StudentProfileResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
            .orElseGet(() -> {
                StudentProfile newProfile = StudentProfile.builder()
                    .userId(userId)
                    .build();
                return studentProfileRepository.save(newProfile);
            });

        return toResponse(user, profile);
    }

    @Override
    @Transactional
    public StudentProfileResponse updateMyProfile(Long userId, UpdateStudentProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
            .orElseGet(() -> StudentProfile.builder().userId(userId).build());

        if (request.department() != null) {
            profile.setDepartment(request.department().trim());
        }
        if (request.skills() != null) {
            profile.setSkills(request.skills().trim());
        }
        if (request.bio() != null) {
            profile.setBio(request.bio().trim());
        }
        if (request.githubUrl() != null) {
            profile.setGithubUrl(request.githubUrl().trim());
        }
        if (request.linkedinUrl() != null) {
            profile.setLinkedinUrl(request.linkedinUrl().trim());
        }

        StudentProfile saved = studentProfileRepository.save(profile);
        return toResponse(user, saved);
    }

    @Override
    public Page<StudentProfileResponse> searchStudents(String skill, String department, Pageable pageable) {
        Page<StudentProfile> page;
        boolean hasSkill = skill != null && !skill.trim().isEmpty();
        boolean hasDept = department != null && !department.trim().isEmpty();

        if (hasSkill && hasDept) {
            page = studentProfileRepository.findByDepartmentIgnoreCaseAndSkillsContainingIgnoreCase(
                department.trim(), skill.trim(), pageable);
        } else if (hasSkill) {
            page = studentProfileRepository.findBySkillsContainingIgnoreCase(skill.trim(), pageable);
        } else if (hasDept) {
            page = studentProfileRepository.findByDepartmentIgnoreCase(department.trim(), pageable);
        } else {
            page = studentProfileRepository.findAll(pageable);
        }

        return page.map(profile -> {
            User user = userRepository.findById(profile.getUserId()).orElse(null);
            return toResponse(user, profile);
        });
    }

    private StudentProfileResponse toResponse(User user, StudentProfile profile) {
        Long id = profile != null ? profile.getId() : null;
        Long userId = user != null ? user.getId() : (profile != null ? profile.getUserId() : null);
        String name = user != null ? user.getName() : "Unknown";
        String email = user != null ? user.getEmail() : "Unknown";
        String department = profile != null ? profile.getDepartment() : null;
        String skills = profile != null ? profile.getSkills() : null;
        String bio = profile != null ? profile.getBio() : null;
        String githubUrl = profile != null ? profile.getGithubUrl() : null;
        String linkedinUrl = profile != null ? profile.getLinkedinUrl() : null;
        java.time.LocalDateTime createdAt = profile != null ? profile.getCreatedAt() : null;
        java.time.LocalDateTime updatedAt = profile != null ? profile.getUpdatedAt() : null;

        return new StudentProfileResponse(
            id, userId, name, email, department, skills, bio, githubUrl, linkedinUrl, createdAt, updatedAt
        );
    }
}
