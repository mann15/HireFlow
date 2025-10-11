package com.recruitment.server.service;

import com.recruitment.server.dto.CommentRequest;
import com.recruitment.server.model.Notification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobPositionService {

    public void assignReviewer(Long positionId, Long reviewerId) {
        // Logic to assign a reviewer to a position
    }

    public void addComment(Long positionId, CommentRequest commentRequest) {
        // Logic to add a comment to a position
    }

    public void shortlistCandidate(Long positionId, Long candidateId) {
        // Logic to shortlist a candidate for a position
    }

    public List<Notification> getNotifications(Long positionId) {
        // Logic to fetch notifications for a position
        return List.of();
    }
}