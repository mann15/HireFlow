package com.recruitment.server.repository;

import com.recruitment.server.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Notification> findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    List<Notification> findByRecipientUserIdAndIsReadTrue(Long userId);
    
    Long countByRecipientUserIdAndIsReadFalse(Long userId);
}
