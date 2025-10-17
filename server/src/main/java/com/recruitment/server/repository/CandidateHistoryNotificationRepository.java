package com.recruitment.server.repository;

import com.recruitment.server.model.CandidateHistoryNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CandidateHistoryNotificationRepository extends JpaRepository<CandidateHistoryNotification, Long> {
    List<CandidateHistoryNotification> findByCurrentApplicationApplicationId(Long applicationId);

    List<CandidateHistoryNotification> findByCurrentApplicationApplicationIdAndViewed(Long applicationId,
            Boolean viewed);

    @Query("SELECT COUNT(n) > 0 FROM CandidateHistoryNotification n WHERE n.currentApplication.applicationId = :applicationId AND n.notificationType = :type")
    boolean existsByApplicationIdAndType(@Param("applicationId") Long applicationId, @Param("type") String type);
}