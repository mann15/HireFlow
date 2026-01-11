package com.recruitment.server.repository;

import com.recruitment.server.model.JobOffers;
import com.recruitment.server.model.JobApplication;
import com.recruitment.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobOffersRepository extends JpaRepository<JobOffers, Long> {
    List<JobOffers> findByApplication(JobApplication application);

    List<JobOffers> findByStatus(JobOffers.OfferStatus status);

    // Retrieve offers for a specific candidate user
    List<JobOffers> findByApplicationCandidateUser(User user);
}
