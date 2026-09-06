package com.project.platform.repository;

import com.project.platform.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Message entity.
 * Owned by Member 2 - Team Collaboration.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {


    List<Message> findByProjectIdOrderByCreatedAtAsc(Long projectId);

    @Query("SELECT m FROM Message m WHERE (m.senderId = :u1 AND m.receiverId = :u2) OR (m.senderId = :u2 AND m.receiverId = :u1) ORDER BY m.createdAt ASC")
    List<Message> findDirectMessages(@Param("u1") Long user1, @Param("u2") Long user2);

    @Query("SELECT m FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId ORDER BY m.createdAt DESC")
    List<Message> findRecentDirectMessagesForUser(@Param("userId") Long userId);

    long countByReceiverIdAndIsReadFalse(Long receiverId);

    long countByProjectIdAndSenderIdNot(Long projectId, Long senderId);

    List<Message> findBySenderIdAndReceiverIdAndIsReadFalse(Long senderId, Long receiverId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.senderId = :senderId AND m.receiverId = :receiverId AND m.isRead = false")
    int markDirectMessagesAsRead(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}
