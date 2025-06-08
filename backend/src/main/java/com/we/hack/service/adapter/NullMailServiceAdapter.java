package com.we.hack.service.adapter;

import com.we.hack.model.User;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "notifications.email.provider", havingValue = "null", matchIfMissing = true)
public class NullMailServiceAdapter implements MailServiceAdapter {

    @Override
    public void sendMail(User organizer, String recipient, String subject, String body) {
        // Null Object — do nothing
        System.out.printf("[NullMailServiceAdapter] Email to %s suppressed (email disabled).%n", recipient);
    }
}