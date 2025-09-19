package com.recruitment.server.repository;

import com.recruitment.server.model.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
}
