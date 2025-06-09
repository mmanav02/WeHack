package com.we.hack.service.factory;

import com.we.hack.dto.MailModes;
import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import com.we.hack.service.adapter.MailServiceAdapter;
import com.we.hack.service.adapter.MailgunAdapter;
import com.we.hack.service.adapter.NullMailServiceAdapter;
import com.we.hack.service.adapter.OrganizerMailAdapter;
import com.we.hack.service.logger.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Factory for creating MailServiceAdapter instances based on hackathon MailMode
 * Implements Factory Pattern to encapsulate adapter creation logic
 */
@Component
public class MailServiceAdapterFactory {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Value("${mailgun.domain}")
    private String mailgunDomain;

    @Value("${mailgun.api.key}")
    private String mailgunApiKey;

    @Value("${mailgun.base.url}")
    private String mailgunBaseUrl;

    @Autowired
    private ApplicationContext applicationContext;

    /**
     * Creates appropriate MailServiceAdapter based on hackathon's MailMode
     * 
     * @param hackathon The hackathon containing the MailMode configuration
     * @return MailServiceAdapter instance appropriate for the hackathon's mail mode
     */
    public MailServiceAdapter createAdapter(Hackathon hackathon) {
        if (logger != null) {
            logger.INFO("MailServiceAdapterFactory.createAdapter() - Creating adapter for MailMode: " + hackathon.getMailMode());
            logger.DEBUG("Hackathon: " + hackathon.getTitle() + " (ID: " + hackathon.getId() + ")");
        }
        
        try {
            MailModes mailMode = hackathon.getMailMode();
            
            switch (mailMode) {
                case MAILGUN:
                    if (logger != null) {
                        logger.DEBUG("Creating MailgunAdapter with domain: " + mailgunDomain);
                    }
                    return new MailgunAdapter(mailgunDomain, mailgunApiKey, mailgunBaseUrl);
                    
                case ORGANIZED:
                    User organizer = hackathon.getOrganizer();
                    if (logger != null) {
                        logger.DEBUG("Creating OrganizerMailAdapter for organizer: " + organizer.getEmail());
                        logger.DEBUG("SMTP password configured: " + (organizer.getSmtpPassword() != null && !organizer.getSmtpPassword().isEmpty()));
                    }
                    return new OrganizerMailAdapter();
                    
                case NONE:
                default:
                    if (logger != null) {
                        logger.DEBUG("Creating NullMailServiceAdapter (email disabled)");
                    }
                    return new NullMailServiceAdapter();
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to create MailServiceAdapter for hackathon " + hackathon.getId() + ": " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            
            // Fallback to null adapter to prevent application failure
            System.err.println("Falling back to NullMailServiceAdapter due to error: " + e.getMessage());
            return new NullMailServiceAdapter();
        }
    }

    /**
     * Creates adapter for a specific MailMode (useful for testing or when hackathon object isn't available)
     * 
     * @param mailMode The mail mode to create adapter for
     * @param organizer The organizer (required for ORGANIZED mode, can be null for others)
     * @return MailServiceAdapter instance for the specified mode
     */
    public MailServiceAdapter createAdapter(MailModes mailMode, User organizer) {
        if (logger != null) {
            logger.INFO("MailServiceAdapterFactory.createAdapter() - Creating adapter for MailMode: " + mailMode);
            logger.DEBUG("Organizer: " + (organizer != null ? organizer.getEmail() : "null"));
        }
        
        try {
            switch (mailMode) {
                case MAILGUN:
                    if (logger != null) {
                        logger.DEBUG("Creating MailgunAdapter with domain: " + mailgunDomain);
                    }
                    return new MailgunAdapter(mailgunDomain, mailgunApiKey, mailgunBaseUrl);
                    
                case ORGANIZED:
                    if (organizer == null) {
                        if (logger != null) {
                            logger.ERROR("Organizer required for ORGANIZED mail mode but was null");
                        }
                        throw new IllegalArgumentException("Organizer required for ORGANIZED mail mode");
                    }
                    if (logger != null) {
                        logger.DEBUG("Creating OrganizerMailAdapter for organizer: " + organizer.getEmail());
                    }
                    return new OrganizerMailAdapter();
                    
                case NONE:
                default:
                    if (logger != null) {
                        logger.DEBUG("Creating NullMailServiceAdapter (email disabled)");
                    }
                    return new NullMailServiceAdapter();
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to create MailServiceAdapter for mode " + mailMode + ": " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            
            // Fallback to null adapter
            System.err.println("Falling back to NullMailServiceAdapter due to error: " + e.getMessage());
            return new NullMailServiceAdapter();
        }
    }
} 