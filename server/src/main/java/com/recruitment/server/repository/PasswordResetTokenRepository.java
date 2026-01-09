package com.recruitment.server.repository;

import com.recruitment.server.model.PasswordResetToken;
import com.recruitment.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    
    Optional<PasswordResetToken> findByTokenAndUsedFalseAndExpiryDateAfter(String token, LocalDateTime now);
    
    void deleteByUser(User user);
    
    void deleteByExpiryDateBefore(LocalDateTime date);
}
