package com.recruitment.server.repository;

import com.recruitment.server.model.InterviewPanel;
import com.recruitment.server.model.CandidateInterview;
import com.recruitment.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewPanelRepository extends JpaRepository<InterviewPanel, Long> {
    List<InterviewPanel> findByInterview(CandidateInterview interview);
    
    List<InterviewPanel> findByPanelist(User panelist);
}
