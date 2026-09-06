package com.project.platform.service.impl;

import com.project.platform.dto.request.SendMessageRequest;
import com.project.platform.dto.response.ConversationSummaryResponse;
import com.project.platform.dto.response.MessageResponse;
import com.project.platform.entity.Message;
import com.project.platform.entity.Project;
import com.project.platform.entity.ProjectMember;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.MessageType;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.ResourceNotFoundException;
import com.project.platform.repository.MessageRepository;
import com.project.platform.repository.ProjectMemberRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.MessageService;
import com.project.platform.service.ProjectProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of MessageService.
 * Owned by Member 2 - Team Collaboration.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectProgressService projectProgressService;

    @Override
    public MessageResponse sendMessage(SendMessageRequest request, Long currentUserId) {
        if (request.projectId() == null && request.receiverId() == null) {
            throw new BadRequestException("Either projectId (for team chat) or receiverId (for direct message) must be specified");
        }

        if (request.content() == null || request.content().trim().isEmpty()) {
            throw new BadRequestException("Message content cannot be blank");
        }

        User sender = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found: " + currentUserId));

        String projectTitle = null;
        String receiverName = null;

        if (request.projectId() != null) {
            Project project = projectRepository.findById(request.projectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.projectId()));
            projectTitle = project.getTitle();
            // Record activity on the project
            projectProgressService.recordProjectActivity(request.projectId());
        }

        if (request.receiverId() != null) {
            User receiver = userRepository.findById(request.receiverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Receiver user not found with id: " + request.receiverId()));
            receiverName = receiver.getName();
        }

        Message message = Message.builder()
                .senderId(currentUserId)
                .projectId(request.projectId())
                .receiverId(request.receiverId())
                .content(request.content().trim())
                .messageType(request.messageType() != null ? request.messageType() : MessageType.TEXT)
                .isRead(false)
                .build();

        Message saved = messageRepository.save(message);

        return new MessageResponse(
                saved.getId(),
                saved.getSenderId(),
                sender.getName(),
                sender.getEmail(),
                sender.getRole().name(),
                saved.getProjectId(),
                projectTitle,
                saved.getReceiverId(),
                receiverName,
                saved.getContent(),
                saved.getMessageType(),
                saved.getIsRead(),
                saved.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getProjectMessages(Long projectId, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<Message> messages = messageRepository.findByProjectIdOrderByCreatedAtAsc(projectId);

        // Preload sender names
        Set<Long> senderIds = messages.stream().map(Message::getSenderId).collect(Collectors.toSet());
        Map<Long, User> users = userRepository.findAllById(senderIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return messages.stream().map(m -> {
            User sender = users.get(m.getSenderId());
            return new MessageResponse(
                    m.getId(),
                    m.getSenderId(),
                    sender != null ? sender.getName() : "Unknown User",
                    sender != null ? sender.getEmail() : "",
                    sender != null ? sender.getRole().name() : "STUDENT",
                    m.getProjectId(),
                    project.getTitle(),
                    null,
                    null,
                    m.getContent(),
                    m.getMessageType(),
                    m.getIsRead(),
                    m.getCreatedAt()
            );
        }).toList();
    }

    @Override
    public List<MessageResponse> getDirectMessages(Long otherUserId, Long currentUserId) {
        userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + otherUserId));

        List<Message> messages = messageRepository.findDirectMessages(currentUserId, otherUserId);

        // Mark incoming unread messages as read
        messageRepository.markDirectMessagesAsRead(otherUserId, currentUserId);

        User currentUser = userRepository.findById(currentUserId).orElse(null);
        User otherUser = userRepository.findById(otherUserId).orElse(null);

        return messages.stream().map(m -> {
            boolean isSenderCurrent = Objects.equals(m.getSenderId(), currentUserId);
            User sender = isSenderCurrent ? currentUser : otherUser;
            User receiver = isSenderCurrent ? otherUser : currentUser;

            return new MessageResponse(
                    m.getId(),
                    m.getSenderId(),
                    sender != null ? sender.getName() : "Unknown",
                    sender != null ? sender.getEmail() : "",
                    sender != null ? sender.getRole().name() : "STUDENT",
                    null,
                    null,
                    m.getReceiverId(),
                    receiver != null ? receiver.getName() : "Unknown",
                    m.getContent(),
                    m.getMessageType(),
                    m.getIsRead(),
                    m.getCreatedAt()
            );
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> getActiveConversations(Long currentUserId) {
        List<ConversationSummaryResponse> conversations = new ArrayList<>();

        // 1. Projects the user is part of (as member or leader/creator)
        Set<Long> userProjectIds = projectMemberRepository.findByStudentId(currentUserId).stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toSet());

        // Also add projects created by the user
        projectRepository.findAll().stream()
                .filter(p -> Objects.equals(p.getCreatedBy(), currentUserId))
                .forEach(p -> userProjectIds.add(p.getId()));

        for (Long pid : userProjectIds) {
            projectRepository.findById(pid).ifPresent(p -> {
                List<Message> pMessages = messageRepository.findByProjectIdOrderByCreatedAtAsc(pid);
                String lastMsg = "No messages yet";
                LocalDateTime lastTime = p.getUpdatedAt() != null ? p.getUpdatedAt() : LocalDateTime.now();
                if (!pMessages.isEmpty()) {
                    Message last = pMessages.get(pMessages.size() - 1);
                    lastMsg = last.getContent();
                    lastTime = last.getCreatedAt();
                }
                conversations.add(new ConversationSummaryResponse(
                        "PROJECT",
                        p.getId(),
                        p.getTitle(),
                        "Team Project • " + p.getStatus().name(),
                        lastMsg,
                        lastTime,
                        0
                ));
            });
        }

        // 2. Direct message conversations
        List<Message> directMsgs = messageRepository.findRecentDirectMessagesForUser(currentUserId);
        Map<Long, List<Message>> directByUser = new HashMap<>();

        for (Message m : directMsgs) {
            if (m.getProjectId() != null) continue;
            Long partnerId = Objects.equals(m.getSenderId(), currentUserId) ? m.getReceiverId() : m.getSenderId();
            if (partnerId != null) {
                directByUser.computeIfAbsent(partnerId, k -> new ArrayList<>()).add(m);
            }
        }

        for (Map.Entry<Long, List<Message>> entry : directByUser.entrySet()) {
            Long partnerId = entry.getKey();
            List<Message> thread = entry.getValue();
            if (thread.isEmpty()) continue;

            Message latest = thread.get(0);
            int unreadCount = (int) thread.stream()
                    .filter(m -> Objects.equals(m.getReceiverId(), currentUserId) && Boolean.FALSE.equals(m.getIsRead()))
                    .count();

            userRepository.findById(partnerId).ifPresent(partner -> {
                conversations.add(new ConversationSummaryResponse(
                        "DIRECT",
                        partner.getId(),
                        partner.getName(),
                        partner.getEmail() + " (" + partner.getRole().name() + ")",
                        latest.getContent(),
                        latest.getCreatedAt(),
                        unreadCount
                ));
            });
        }

        // Sort by lastMessageAt descending
        conversations.sort(Comparator.comparing(ConversationSummaryResponse::lastMessageAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        return conversations;
    }

    @Override
    public void markMessageAsRead(Long messageId, Long currentUserId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        if (Objects.equals(message.getReceiverId(), currentUserId)) {
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }

    @Override
    public void markDirectConversationAsRead(Long otherUserId, Long currentUserId) {
        messageRepository.markDirectMessagesAsRead(otherUserId, currentUserId);
    }
}
