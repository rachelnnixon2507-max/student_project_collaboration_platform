package com.project.platform.service;

import com.project.platform.dto.request.SendMessageRequest;
import com.project.platform.dto.response.ConversationSummaryResponse;
import com.project.platform.dto.response.MessageResponse;
import com.project.platform.entity.Message;
import com.project.platform.entity.Project;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.MessageType;
import com.project.platform.entity.enums.ProjectStatus;
import com.project.platform.entity.enums.Role;
import com.project.platform.repository.MessageRepository;
import com.project.platform.repository.ProjectMemberRepository;
import com.project.platform.repository.ProjectRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.service.impl.MessageServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectProgressService projectProgressService;

    @InjectMocks
    private MessageServiceImpl messageService;

    private User sender;
    private User receiver;
    private Project project;

    @BeforeEach
    void setUp() {
        sender = User.builder().id(10L).name("Priya Sen").email("priya@college.edu").role(Role.STUDENT).build();
        receiver = User.builder().id(20L).name("Rohan Roy").email("rohan@college.edu").role(Role.STUDENT).build();
        project = Project.builder().id(1L).title("AI Drone Project").status(ProjectStatus.IN_PROGRESS).build();
    }

    @Test
    @DisplayName("Send project message stores message, records project activity and returns DTO")
    void testSendProjectMessage() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sender));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        Message saved = Message.builder()
                .id(100L)
                .senderId(10L)
                .projectId(1L)
                .content("Initial CAD design uploaded")
                .messageType(MessageType.TEXT)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        when(messageRepository.save(any(Message.class))).thenReturn(saved);

        SendMessageRequest request = new SendMessageRequest(1L, null, "Initial CAD design uploaded", MessageType.TEXT);
        MessageResponse response = messageService.sendMessage(request, 10L);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals("Priya Sen", response.senderName());
        assertEquals("AI Drone Project", response.projectTitle());
        assertEquals("Initial CAD design uploaded", response.content());
        verify(projectProgressService, times(1)).recordProjectActivity(1L);
    }

    @Test
    @DisplayName("Send direct message stores receiver and links correctly")
    void testSendDirectMessage() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(20L)).thenReturn(Optional.of(receiver));

        Message saved = Message.builder()
                .id(101L)
                .senderId(10L)
                .receiverId(20L)
                .content("Are you available for a sync call?")
                .messageType(MessageType.TEXT)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        when(messageRepository.save(any(Message.class))).thenReturn(saved);

        SendMessageRequest request = new SendMessageRequest(null, 20L, "Are you available for a sync call?", MessageType.TEXT);
        MessageResponse response = messageService.sendMessage(request, 10L);

        assertNotNull(response);
        assertEquals("Rohan Roy", response.receiverName());
        assertEquals(20L, response.receiverId());
    }

    @Test
    @DisplayName("Direct messages marks unread incoming messages as read")
    void testGetDirectMessagesMarksAsRead() {
        when(userRepository.findById(20L)).thenReturn(Optional.of(receiver));
        when(userRepository.findById(10L)).thenReturn(Optional.of(sender));

        Message m1 = Message.builder()
                .id(1L).senderId(20L).receiverId(10L).content("Hey!").isRead(false).createdAt(LocalDateTime.now()).build();
        when(messageRepository.findDirectMessages(10L, 20L)).thenReturn(List.of(m1));

        List<MessageResponse> responses = messageService.getDirectMessages(20L, 10L);

        assertEquals(1, responses.size());
        verify(messageRepository, times(1)).markDirectMessagesAsRead(20L, 10L);
    }
}
