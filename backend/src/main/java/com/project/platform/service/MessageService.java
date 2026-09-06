package com.project.platform.service;

import com.project.platform.dto.request.SendMessageRequest;
import com.project.platform.dto.response.ConversationSummaryResponse;
import com.project.platform.dto.response.MessageResponse;

import java.util.List;

/**
 * Service for project team chat and direct 1-to-1 messaging.
 * Owned by Member 2 - Team Collaboration.
 */
public interface MessageService {

    MessageResponse sendMessage(SendMessageRequest request, Long currentUserId);

    List<MessageResponse> getProjectMessages(Long projectId, Long currentUserId);

    List<MessageResponse> getDirectMessages(Long otherUserId, Long currentUserId);

    List<ConversationSummaryResponse> getActiveConversations(Long currentUserId);

    void markMessageAsRead(Long messageId, Long currentUserId);

    void markDirectConversationAsRead(Long otherUserId, Long currentUserId);
}
