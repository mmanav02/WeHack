package com.we.hack.service.notification;

import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import java.util.List;

/**
 * Unified Notification Service that bridges Decorator and Observer patterns
 * Allows notifications to be sent through multiple channels (Email, Slack, etc.)
 * with observer pattern for broadcasting to multiple recipients
 */
public interface NotificationService {
    
    /**
     * Send notification to a single recipient using decorators
     */
    void sendNotification(Hackathon hackathon, User organizer, String recipient, 
                         String subject, String content);
    
    /**
     * Broadcast notification to multiple observers using observer pattern
     * with decorator enhancements
     */
    void broadcastNotification(int hackathonId, Hackathon hackathon, 
                              String subject, String content);
    
    /**
     * Register an observer for hackathon notifications
     */
    void registerObserver(int hackathonId, String observerEmail, User organizer);
    
    /**
     * Get all registered observers for a hackathon
     */
    List<String> getObservers(int hackathonId);
} 