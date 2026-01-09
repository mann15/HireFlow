package com.recruitment.server.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
@Slf4j
public class MailConfig {

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        // Enable debug for troubleshooting (set to false in production)
        props.put("mail.debug", "true");

        // Log configuration (without password)
        log.info("Mail configuration initialized:");
        log.info("  Host: {}", host);
        log.info("  Port: {}", port);
        log.info("  Username: {}", username != null && !username.isEmpty() ? username : "NOT SET");
        log.info("  Password: {}", password != null && !password.isEmpty() ? "***SET***" : "NOT SET");

        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
            log.warn("WARNING: MAIL_USERNAME or MAIL_PASSWORD is not set. Email functionality will not work.");
            log.warn("Please set MAIL_USERNAME and MAIL_PASSWORD in your .env file or environment variables.");
        }

        return mailSender;
    }
}
