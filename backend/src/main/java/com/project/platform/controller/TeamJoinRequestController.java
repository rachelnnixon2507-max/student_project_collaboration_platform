package com.project.platform.controller;

import com.project.platform.dto.request.CreateJoinRequestRequest;
import com.project.platform.dto.request.RespondJoinRequestRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.JoinRequestResponse;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.TeamJoinRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Team Join Requests module (Member 1).
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class TeamJoinRequestController {

    private final TeamJoinRequestService teamJoinRequestService;

    @PostMapping("/{projectId}/join-requests")
    public ApiResponse<JoinRequestResponse> createJoinRequest(
        @PathVariable Long projectId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody(required = false) CreateJoinRequestRequest request
    ) {
        JoinRequestResponse response = teamJoinRequestService.createJoinRequest(projectId, principal.getId(), request);
        return ApiResponse.ok("Join request submitted successfully", response);
    }

    @GetMapping("/{projectId}/join-requests")
    public ApiResponse<List<JoinRequestResponse>> getProjectJoinRequests(
        @PathVariable Long projectId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(teamJoinRequestService.getProjectJoinRequests(projectId, principal.getId()));
    }

    @GetMapping("/join-requests/me")
    public ApiResponse<List<JoinRequestResponse>> getMyJoinRequests(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(teamJoinRequestService.getMyJoinRequests(principal.getId()));
    }

    @PatchMapping("/{projectId}/join-requests/{requestId}")
    public ApiResponse<JoinRequestResponse> respondToJoinRequest(
        @PathVariable Long projectId,
        @PathVariable Long requestId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody RespondJoinRequestRequest request
    ) {
        JoinRequestResponse response = teamJoinRequestService.respondToJoinRequest(projectId, requestId, principal.getId(), request);
        return ApiResponse.ok("Join request updated successfully", response);
    }

    @DeleteMapping("/{projectId}/join-requests/{requestId}")
    public ApiResponse<Void> cancelJoinRequest(
        @PathVariable Long projectId,
        @PathVariable Long requestId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        teamJoinRequestService.cancelJoinRequest(projectId, requestId, principal.getId());
        return ApiResponse.ok("Join request cancelled successfully", null);
    }
}
