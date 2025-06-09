package com.we.hack.service.notification;

import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import com.we.hack.service.adapter.MailServiceAdapter;
import com.we.hack.service.decorator.EmailNotifier;
import com.we.hack.service.decorator.Notifier;
import com.we.hack.service.decorator.SlackNotifierDecorator;
import com.we.hack.service.logger.Logger;
import com.we.hack.service.observer.HackathonObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Unified Notification Service Implementation
 * Combines Decorator Pattern (for multi-channel notifications) 
 * with Observer Pattern (for broadcasting to multiple recipients)
 */
@Service
public class UnifiedNotificationService implements NotificationService {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Autowired
    private MailServiceAdapter mailServiceAdapter;
    
    @Autowired
    private ApplicationContext applicationContext;
    
    // Observer registry: hackathonId -> List of (observerEmail, organizer) pairs
    private final Map<Integer, List<ObserverEntry>> observerRegistry = new ConcurrentHashMap<>();
    
    /**
     * Inner class to store observer details
     */
    private static class ObserverEntry {
        final String email;
        final User organizer;
        
        ObserverEntry(String email, User organizer) {
            this.email = email;
            this.organizer = organizer;
        }
    }
    
    /**
     * Enhanced Observer that uses Decorator Pattern for notifications
     */
    private class DecoratorEnhancedObserver implements HackathonObserver {
        private final String email;
        private final User organizer;
        private final Hackathon hackathon;
        
        public DecoratorEnhancedObserver(String email, User organizer, Hackathon hackathon) {
            this.email = email;
            this.organizer = organizer;
            this.hackathon = hackathon;
            logger.DEBUG("Created DecoratorEnhancedObserver for email: " + email + ", hackathon: " + hackathon.getTitle());
        }
        
        @Override
        public void update(String message) {
            logger.DEBUG("DecoratorEnhancedObserver.update() - Sending notification to: " + email);
            // Use decorator pattern to send notification through multiple channels
            sendNotification(hackathon, organizer, email, "Hackathon Update", message);
        }
    }

    @Override
    public void sendNotification(Hackathon hackathon, User organizer, String recipient, 
                                String subject, String content) {
        logger.INFO("UnifiedNotificationService.sendNotification() - Sending notification to: " + recipient);
        logger.DEBUG("Parameters: hackathon=" + hackathon.getTitle() + ", subject=" + subject + ", organizer=" + organizer.getEmail());
        logger.DEBUG("Slack enabled: " + hackathon.isSlackEnabled());
        
        try {
            // Start with base email notifier
            logger.DEBUG("Creating base EmailNotifier");
            Notifier notifier = new EmailNotifier(mailServiceAdapter);
            
            // Apply Slack decorator if enabled for this hackathon
            if (hackathon.isSlackEnabled()) {
                try {
                    logger.DEBUG("Applying Slack decorator - Slack notifications enabled for hackathon: " + hackathon.getTitle());
                    SlackNotifierDecorator slackDecorator = applicationContext.getBean(SlackNotifierDecorator.class);
                    slackDecorator.setWrappee(notifier);
                    notifier = slackDecorator;
                    logger.INFO("Slack decorator applied successfully for hackathon: " + hackathon.getTitle());
                } catch (Exception e) {
                    logger.ERROR("Failed to initialize Slack decorator: " + e.getMessage());
                    logger.WARN("Continuing with email-only notification");
                    // Continue with email-only notification
                }
            } else {
                logger.DEBUG("Slack notifications disabled for hackathon: " + hackathon.getTitle());
            }
            
            // Send notification through the decorator chain
            logger.DEBUG("Sending notification through decorator chain");
            notifier.notify(organizer, recipient, subject, content);
            logger.INFO("Notification sent successfully to: " + recipient + " for hackathon: " + hackathon.getTitle());
            
        } catch (Exception e) {
            logger.ERROR("Failed to send notification - recipient: " + recipient + ", hackathon: " + hackathon.getId() + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    @Override
    public void broadcastNotification(int hackathonId, Hackathon hackathon, 
                                     String subject, String content) {
        logger.INFO("UnifiedNotificationService.broadcastNotification() - Broadcasting to observers for hackathon: " + hackathonId);
        logger.DEBUG("Parameters: subject=" + subject + ", hackathon=" + hackathon.getTitle());
        
        try {
            List<ObserverEntry> observers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList());
            
            if (observers.isEmpty()) {
                logger.WARN("No observers registered for hackathon " + hackathonId + " - skipping broadcast");
                return;
            }
            
            logger.INFO("Broadcasting to " + observers.size() + " observers for hackathon: " + hackathon.getTitle());
            
            // Create enhanced observers that use decorator pattern
            int successCount = 0;
            for (ObserverEntry entry : observers) {
                try {
                    logger.DEBUG("Creating DecoratorEnhancedObserver for: " + entry.email);
                    DecoratorEnhancedObserver observer = new DecoratorEnhancedObserver(
                        entry.email, entry.organizer, hackathon);
                    observer.update(content);
                    successCount++;
                } catch (Exception e) {
                    logger.ERROR("Failed to notify observer: " + entry.email + ", error: " + e.getMessage());
                    // Continue with other observers
                }
            }
            
            logger.INFO("Broadcast complete for hackathon " + hackathonId + " - " + successCount + "/" + observers.size() + " notifications sent successfully");
            
        } catch (Exception e) {
            logger.ERROR("Failed to broadcast notification - hackathonId: " + hackathonId + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    @Override
    public void registerObserver(int hackathonId, String observerEmail, User organizer) {
        logger.INFO("UnifiedNotificationService.registerObserver() - Registering observer: " + observerEmail + " for hackathon: " + hackathonId);
        logger.DEBUG("Organizer: " + organizer.getEmail());
        
        try {
            // Check if observer is already registered
            List<ObserverEntry> existingObservers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList());
            boolean alreadyRegistered = existingObservers.stream()
                    .anyMatch(entry -> entry.email.equals(observerEmail));
            
            if (alreadyRegistered) {
                logger.WARN("Observer " + observerEmail + " is already registered for hackathon " + hackathonId);
                return;
            }
            
            observerRegistry.computeIfAbsent(hackathonId, k -> new ArrayList<>())
                           .add(new ObserverEntry(observerEmail, organizer));
            
            int totalObservers = observerRegistry.get(hackathonId).size();
            logger.INFO("Observer " + observerEmail + " registered successfully for hackathon " + hackathonId + " (total: " + totalObservers + ")");
            
        } catch (Exception e) {
            logger.ERROR("Failed to register observer - email: " + observerEmail + ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<String> getObservers(int hackathonId) {
        logger.DEBUG("UnifiedNotificationService.getObservers() - Getting observers for hackathon: " + hackathonId);
        
        try {
            List<String> observers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList())
                                  .stream()
                                  .map(entry -> entry.email)
                                  .toList();
            
            logger.DEBUG("Found " + observers.size() + " observers for hackathon " + hackathonId);
            return observers;
            
        } catch (Exception e) {
            logger.ERROR("Failed to get observers for hackathon " + hackathonId + ": " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * Clear observers for a hackathon (useful for cleanup)
     */
    public void clearObservers(int hackathonId) {
        logger.INFO("UnifiedNotificationService.clearObservers() - Clearing observers for hackathon: " + hackathonId);
        
        try {
            List<ObserverEntry> removed = observerRegistry.remove(hackathonId);
            int removedCount = removed != null ? removed.size() : 0;
            logger.INFO("Cleared " + removedCount + " observers for hackathon " + hackathonId);
            
        } catch (Exception e) {
            logger.ERROR("Failed to clear observers for hackathon " + hackathonId + ": " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * Get observer count for a hackathon
     */
    public int getObserverCount(int hackathonId) {
        logger.DEBUG("UnifiedNotificationService.getObserverCount() - Getting observer count for hackathon: " + hackathonId);
        
        try {
            int count = observerRegistry.getOrDefault(hackathonId, Collections.emptyList()).size();
            logger.DEBUG("Observer count for hackathon " + hackathonId + ": " + count);
            return count;
            
        } catch (Exception e) {
            logger.ERROR("Failed to get observer count for hackathon " + hackathonId + ": " + e.getMessage());
            throw e;
        }
    }
} 