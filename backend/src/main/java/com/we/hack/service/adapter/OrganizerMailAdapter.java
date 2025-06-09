package com.we.hack.service.adapter;

import com.we.hack.model.User;
import com.we.hack.service.adapter.MailSender;
import com.we.hack.service.logger.Logger;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@ConditionalOnProperty(name = "notifications.email.provider", havingValue = "organizer")
public class OrganizerMailAdapter implements MailServiceAdapter {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    public OrganizerMailAdapter() {
        if (logger != null) {
            logger.INFO("OrganizerMailAdapter initialized - using organizer SMTP credentials");
        }
    }

    @Override
    public void sendMail(User organizer, String recipient, String subject, String body) {
        if (logger != null) {
            logger.INFO("OrganizerMailAdapter.sendMail() - Sending email via organizer SMTP");
            logger.DEBUG("Email details: organizer=" + organizer.getEmail() + ", recipient=" + recipient + 
                        ", subject=" + subject + ", bodyLength=" + (body != null ? body.length() : 0));
        }
        
        try {
            // Validate organizer has SMTP password configured
            if (organizer.getSmtpPassword() == null || organizer.getSmtpPassword().trim().isEmpty()) {
                if (logger != null) {
                    logger.ERROR("Organizer SMTP password not configured for: " + organizer.getEmail());
                }
                throw new RuntimeException("Organizer SMTP password not configured");
            }
            
            if (logger != null) {
                logger.DEBUG("SMTP password configured for organizer: " + organizer.getEmail());
            }
            
            // Validate inputs
            if (recipient == null || recipient.trim().isEmpty()) {
                if (logger != null) {
                    logger.ERROR("Invalid recipient - recipient is null or empty");
                }
                throw new RuntimeException("Recipient email cannot be empty");
            }
            
            if (subject == null || subject.trim().isEmpty()) {
                if (logger != null) {
                    logger.WARN("Email subject is empty");
                }
            }
            
            if (body == null) {
                body = "";
                if (logger != null) {
                    logger.WARN("Email body is null - using empty string");
                }
            }
            
            // Create JavaMailSender using organizer's SMTP credentials
            if (logger != null) {
                logger.DEBUG("Creating JavaMailSender with organizer's SMTP settings");
            }
            JavaMailSender sender = MailSender.createSender(
                    organizer.getEmail(),
                    organizer.getSmtpPassword()
            );

            // Prepare email message
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(organizer.getEmail());
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);
            
            if (logger != null) {
                logger.DEBUG("Email message prepared - sending via organizer's SMTP server");
            }

            // Send email
            sender.send(message);
            
            if (logger != null) {
                logger.INFO("Email sent successfully via organizer SMTP - recipient: " + recipient + 
                           ", organizer: " + organizer.getEmail());
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to send email via organizer SMTP - recipient: " + recipient + 
                            ", organizer: " + organizer.getEmail() + ", error: " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            throw e;
        }
    }
}
