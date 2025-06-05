package com.we.hack.service.adapter;

import com.we.hack.model.User;
import org.springframework.stereotype.Service;

@Service
public class NullMailServiceAdapter implements MailServiceAdapter {

    @Override
    public void sendMail(User organizer, String recipient, String subject, String body) {
        // Null Object — do nothing
        System.out.printf("[NullMailServiceAdapter] Email to %s suppressed (mail mode: NONE).%n", recipient);
    }
}