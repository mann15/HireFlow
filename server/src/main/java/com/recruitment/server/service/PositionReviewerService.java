package com.recruitment.server.service;

import com.recruitment.server.dto.PositionReviewerDTO;
import com.recruitment.server.model.JobPosition;
import com.recruitment.server.model.PositionReviewer;
import com.recruitment.server.model.User;
import com.recruitment.server.repository.JobRepository;
import com.recruitment.server.repository.PositionReviewerRepository;
import com.recruitment.server.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PositionReviewerService {
    private final PositionReviewerRepository positionReviewerRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public PositionReviewerDTO assignReviewer(PositionReviewerDTO reviewerDTO) {
        JobPosition position = jobRepository.findById(reviewerDTO.getPositionId())
                .orElseThrow(() -> new RuntimeException("Position not found with id: " + reviewerDTO.getPositionId()));

        User reviewer = userRepository.findById(reviewerDTO.getReviewerId())
                .orElseThrow(() -> new RuntimeException("Reviewer not found with id: " + reviewerDTO.getReviewerId()));

        User assignedBy = userRepository.findById(reviewerDTO.getAssignedById())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + reviewerDTO.getAssignedById()));

        // Check if the reviewer is already assigned to this position
        if (positionReviewerRepository.existsByPositionAndReviewer(position, reviewer)) {
            throw new RuntimeException("Reviewer is already assigned to this position");
        }

        PositionReviewer positionReviewer = PositionReviewer.builder()
                .position(position)
                .reviewer(reviewer)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .build();

        return mapToDTO(positionReviewerRepository.save(positionReviewer));
    }

    @Transactional
    public void removeReviewer(Long positionId, Long reviewerId) {
        JobPosition position = jobRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found with id: " + positionId));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found with id: " + reviewerId));

        positionReviewerRepository.deleteByPositionAndReviewer(position, reviewer);
    }

    @Transactional(readOnly = true)
    public List<PositionReviewerDTO> getReviewersByPositionId(Long positionId) {
        List<PositionReviewer> reviewers = positionReviewerRepository.findByPositionPositionId(positionId);
        return reviewers.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PositionReviewerDTO> getPositionsByReviewerId(Long reviewerId) {
        List<PositionReviewer> positions = positionReviewerRepository.findByReviewerUserId(reviewerId);
        return positions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private PositionReviewerDTO mapToDTO(PositionReviewer positionReviewer) {
        return PositionReviewerDTO.builder()
                .id(positionReviewer.getId())
                .positionId(positionReviewer.getPosition().getPositionId())
                .positionTitle(positionReviewer.getPosition().getJobTitle())
                .reviewerId(positionReviewer.getReviewer().getUserId())
                .reviewerName(positionReviewer.getReviewer().getFirstName() + " "
                        + positionReviewer.getReviewer().getLastName())
                .reviewerEmail(positionReviewer.getReviewer().getEmail())
                .assignedById(positionReviewer.getAssignedBy().getUserId())
                .assignedByName(positionReviewer.getAssignedBy().getFirstName() + " "
                        + positionReviewer.getAssignedBy().getLastName())
                .assignedAt(positionReviewer.getAssignedAt().format(formatter))
                .build();
    }
}