package com.recruitment.server.service;

import com.recruitment.server.model.Notification;
import com.recruitment.server.model.User;
import com.recruitment.server.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(User recipient, String message, 
            Notification.NotificationType type, 
            Notification.NotificationCategory category, 
            Long relatedEntityId) {
        
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .category(category)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    public void createNotificationForMultipleRecipients(List<User> recipients, String message,
            Notification.NotificationType type, 
            Notification.NotificationCategory category,
            Long relatedEntityId) {
        
        for (User recipient : recipients) {
            createNotification(recipient, message, type, category, relatedEntityId);
        }
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public Long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByRecipientUserIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotificationsByUser(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}
