package com.recruitment.server.repository;

import com.recruitment.server.model.JobOffers;
import com.recruitment.server.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobOffersRepository extends JpaRepository<JobOffers, Long> {
    List<JobOffers> findByApplication(JobApplication application);
    
    List<JobOffers> findByStatus(JobOffers.OfferStatus status);
}
