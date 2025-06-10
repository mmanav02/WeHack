package com.we.hack.service.ObserverNotification;

import com.we.hack.model.User;
import lombok.Getter;

/**
 * Entry class for storing observer information
 * Used in UnifiedNotificationService for observer registration
 */
@Getter
public class ObserverEntry {
    private final String email;
    private final User organizer;
    private final String role;

    public ObserverEntry(String email, User organizer, String role) {
        this.email = email;
        this.organizer = organizer;
        this.role = role;
    }

}