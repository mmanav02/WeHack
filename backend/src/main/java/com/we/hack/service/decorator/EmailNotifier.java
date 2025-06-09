package com.we.hack.service.decorator;

import com.we.hack.model.User;
import com.we.hack.service.adapter.MailServiceAdapter;
import com.we.hack.service.logger.Logger;

import java.io.IOException;

public class EmailNotifier implements Notifier {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    private final MailServiceAdapter mailServiceAdapter;

    public EmailNotifier(MailServiceAdapter adapter) {
        this.mailServiceAdapter = adapter;
        logger.DEBUG("EmailNotifier created with adapter: " + adapter.getClass().getSimpleName());
    }

    @Override
    public void notify(User organizer, String recipient, String subject, String content) {
        logger.INFO("EmailNotifier.notify() - Sending email notification");
        logger.DEBUG("Email details: organizer=" + organizer.getEmail() + ", recipient=" + recipient + 
                    ", subject=" + subject + ", contentLength=" + (content != null ? content.length() : 0));
        
        try {
            System.out.println("EmailNotifier: sending email to " + recipient);
            mailServiceAdapter.sendMail(organizer, recipient, subject, content);
            logger.INFO("Email notification sent successfully to: " + recipient);
            
        } catch (Exception e) {
            logger.ERROR("Failed to send email notification - recipient: " + recipient + 
                        ", organizer: " + organizer.getEmail() + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }
}
