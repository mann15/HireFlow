package com.recruitment.server.repository;

import com.recruitment.server.model.InterviewFeedback;
import com.recruitment.server.model.CandidateInterview;
import com.recruitment.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
    List<InterviewFeedback> findByInterview(CandidateInterview interview);
    
    List<InterviewFeedback> findByPanelist(User panelist);
    
    List<InterviewFeedback> findByInterviewAndPanelist(CandidateInterview interview, User panelist);
}
