package com.we.hack.service.adapter;

import com.we.hack.model.User;
import com.we.hack.service.logger.Logger;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@ConditionalOnProperty(name = "notifications.email.provider", havingValue = "null", matchIfMissing = true)
public class NullMailServiceAdapter implements MailServiceAdapter {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    public NullMailServiceAdapter() {
        logger.INFO("NullMailServiceAdapter initialized - email notifications disabled");
    }

    @Override
    public void sendMail(User organizer, String recipient, String subject, String body) {
        logger.DEBUG("NullMailServiceAdapter.sendMail() - Email suppressed (email disabled)");
        logger.DEBUG("Suppressed email details: organizer=" + organizer.getEmail() + 
                    ", recipient=" + recipient + ", subject=" + subject);
        
        // Null Object — do nothing
        System.out.printf("[NullMailServiceAdapter] Email to %s suppressed (email disabled).%n", recipient);
        
        logger.INFO("Email notification suppressed for recipient: " + recipient + " (email provider disabled)");
    }
}