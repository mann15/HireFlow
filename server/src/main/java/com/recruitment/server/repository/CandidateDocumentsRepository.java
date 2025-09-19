package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateDocuments;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateDocumentsRepository extends JpaRepository<CandidateDocuments, Long> {
}
