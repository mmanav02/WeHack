package com.we.hack.service.notification;

/**
 * Observer interface for hackathon notifications
 * Used internally by UnifiedNotificationService
 */
public interface HackathonObserver {
    void update(String message);
} 