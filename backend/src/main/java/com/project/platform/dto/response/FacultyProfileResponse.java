package com.project.platform.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FacultyProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String department;
    private String designation;
    private String specialization;
}
