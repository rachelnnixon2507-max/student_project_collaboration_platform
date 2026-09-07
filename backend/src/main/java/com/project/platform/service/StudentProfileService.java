package com.project.platform.service;

import com.project.platform.dto.request.UpdateStudentProfileRequest;
import com.project.platform.dto.response.StudentProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudentProfileService {

    StudentProfileResponse getProfileByUserId(Long userId);

    StudentProfileResponse getMyProfile(Long userId);

    StudentProfileResponse updateMyProfile(Long userId, UpdateStudentProfileRequest request);

    Page<StudentProfileResponse> searchStudents(String skill, String department, Pageable pageable);
}
