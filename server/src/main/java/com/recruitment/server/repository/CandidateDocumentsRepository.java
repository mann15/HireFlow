package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateDocuments;
import com.recruitment.server.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateDocumentsRepository extends JpaRepository<CandidateDocuments, Long> {
    List<CandidateDocuments> findByJobApplication(JobApplication jobApplication);
    
    List<CandidateDocuments> findByStatus(CandidateDocuments.Status status);
}
