package com.project.platform.dto.request;

import com.project.platform.entity.enums.ProjectApprovalDecision;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProjectApprovalRequest {

    @NotNull(message = "Decision is required (APPROVED, REJECTED, NEEDS_REVISION)")
    private ProjectApprovalDecision decision;

    @Size(max = 4000, message = "Comments cannot exceed 4000 characters")
    private String comments;
}
