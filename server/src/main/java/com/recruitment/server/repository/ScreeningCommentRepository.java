package com.recruitment.server.repository;

import com.recruitment.server.model.ScreeningComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreeningCommentRepository extends JpaRepository<ScreeningComment, Long> {
    List<ScreeningComment> findByApplicationApplicationIdOrderByCreatedAtDesc(Long applicationId);
}