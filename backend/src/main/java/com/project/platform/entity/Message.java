package com.project.platform.entity;

import com.project.platform.entity.enums.MessageType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Message entity for team project chats and direct 1-to-1 messaging.
 * OWNED by Member 2 - Team Collaboration.
 */
@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    /** Nullable: populated if this message belongs to a project team chat channel. */
    @Column(name = "project_id")
    private Long projectId;

    /** Nullable: populated if this message is a direct 1-to-1 message to another user. */
    @Column(name = "receiver_id")
    private Long receiverId;

    @Column(nullable = false, length = 4000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    @Builder.Default
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.messageType == null) {
            this.messageType = MessageType.TEXT;
        }
        if (this.isRead == null) {
            this.isRead = false;
        }
    }
}
