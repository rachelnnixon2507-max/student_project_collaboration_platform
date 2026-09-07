package com.project.platform.controller;

import com.project.platform.dto.request.UpdateStudentProfileRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.StudentProfileResponse;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Student Profile module (Member 1).
 */
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @GetMapping("/me")
    public ApiResponse<StudentProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Student profile retrieved", studentProfileService.getMyProfile(principal.getId()));
    }

    @PutMapping("/me")
    public ApiResponse<StudentProfileResponse> updateMyProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody UpdateStudentProfileRequest request
    ) {
        return ApiResponse.ok("Student profile updated successfully", studentProfileService.updateMyProfile(principal.getId(), request));
    }

    @GetMapping("/{userId}")
    public ApiResponse<StudentProfileResponse> getProfileByUserId(@PathVariable Long userId) {
        return ApiResponse.ok("Student profile retrieved", studentProfileService.getProfileByUserId(userId));
    }

    @GetMapping
    public ApiResponse<Page<StudentProfileResponse>> searchStudents(
        @RequestParam(required = false) String skill,
        @RequestParam(required = false) String department,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.ok(studentProfileService.searchStudents(skill, department, pageable));
    }
}
