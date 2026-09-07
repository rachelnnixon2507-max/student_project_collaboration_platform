package com.project.platform.service;

import com.project.platform.dto.request.CreateJoinRequestRequest;
import com.project.platform.dto.request.RespondJoinRequestRequest;
import com.project.platform.dto.response.JoinRequestResponse;

import java.util.List;

public interface TeamJoinRequestService {

    JoinRequestResponse createJoinRequest(Long projectId, Long studentId, CreateJoinRequestRequest request);

    List<JoinRequestResponse> getProjectJoinRequests(Long projectId, Long userId);

    List<JoinRequestResponse> getMyJoinRequests(Long studentId);

    JoinRequestResponse respondToJoinRequest(Long projectId, Long requestId, Long leaderUserId, RespondJoinRequestRequest request);

    void cancelJoinRequest(Long projectId, Long requestId, Long studentId);
}
