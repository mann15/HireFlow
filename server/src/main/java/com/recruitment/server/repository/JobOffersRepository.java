package com.recruitment.server.repository;

import com.recruitment.server.model.JobOffers;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobOffersRepository extends JpaRepository<JobOffers, Long> {
}
