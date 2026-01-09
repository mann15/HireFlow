package com.recruitment.server.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            log.warn("Email not sent: missing recipient. subject={} body={}", subject, body);
            return;
        }

        if (fromEmail == null || fromEmail.isBlank()) {
            log.error("Email not sent: MAIL_USERNAME is not configured in environment variables");
            return;
        }

        if (mailSender == null) {
            log.error("Email not sent: JavaMailSender is not configured. Check your email configuration.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            log.info("Attempting to send email from {} to {} with subject: {}", fromEmail, to, subject);
            mailSender.send(message);
            log.info("Email sent successfully to {} with subject {}", to, subject);
        } catch (org.springframework.mail.MailAuthenticationException ex) {
            log.error("Email authentication failed. Check MAIL_USERNAME and MAIL_PASSWORD. Error: {}", ex.getMessage());
            throw new RuntimeException("Email authentication failed. Please check email configuration.", ex);
        } catch (org.springframework.mail.MailSendException ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
            if (ex.getCause() != null) {
                log.error("Cause: {}", ex.getCause().getMessage());
            }
            throw new RuntimeException("Failed to send email: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("Failed to send email to {} with subject {}", to, subject, ex);
            log.error("Exception type: {}", ex.getClass().getName());
            log.error("Exception details: {}", ex.getMessage());
            if (ex.getCause() != null) {
                log.error("Cause: {}", ex.getCause().getMessage());
            }
            throw new RuntimeException("Failed to send email: " + ex.getMessage(), ex);
        }
    }
}
