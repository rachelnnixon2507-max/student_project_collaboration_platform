package com.project.platform.controller;

import com.project.platform.dto.request.SendMessageRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.ConversationSummaryResponse;
import com.project.platform.dto.response.MessageResponse;
import com.project.platform.security.UserPrincipal;
import com.project.platform.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Team Chat & Direct Messaging.
 * Owned by Member 2 - Team Collaboration.
 */
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        MessageResponse response = messageService.sendMessage(request, currentUserId);
        return ApiResponse.ok("Message sent", response);
    }

    @GetMapping("/project/{projectId}")
    public ApiResponse<List<MessageResponse>> getProjectMessages(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        List<MessageResponse> messages = messageService.getProjectMessages(projectId, currentUserId);
        return ApiResponse.ok(messages);
    }

    @GetMapping("/direct/{userId}")
    public ApiResponse<List<MessageResponse>> getDirectMessages(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        List<MessageResponse> messages = messageService.getDirectMessages(userId, currentUserId);
        return ApiResponse.ok(messages);
    }

    @GetMapping("/conversations")
    public ApiResponse<List<ConversationSummaryResponse>> getActiveConversations(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        List<ConversationSummaryResponse> conversations = messageService.getActiveConversations(currentUserId);
        return ApiResponse.ok(conversations);
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markMessageAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        messageService.markMessageAsRead(id, currentUserId);
        return ApiResponse.ok("Message marked as read", null);
    }

    @PatchMapping("/direct/{userId}/read")
    public ApiResponse<Void> markDirectConversationAsRead(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : 1L;
        messageService.markDirectConversationAsRead(userId, currentUserId);
        return ApiResponse.ok("Conversation marked as read", null);
    }
}
