package com.project.platform.dto.response;

import com.project.platform.entity.enums.ProjectApprovalDecision;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectApprovalResponse {
    private Long id;
    private Long projectId;
    private Long facultyId;
    private String facultyName;
    private String facultyEmail;
    private ProjectApprovalDecision decision;
    private String comments;
    private LocalDateTime decidedAt;
}
