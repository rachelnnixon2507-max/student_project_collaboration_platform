package com.project.platform.dto.request;

public record UpdateStudentProfileRequest(
    String department,
    String skills,
    String bio,
    String githubUrl,
    String linkedinUrl
) {}
