package com.we.hack.service.adapter;

import com.we.hack.model.User;

public interface MailServiceAdapter {
    void sendMail(User organizer, String recipient, String subject, String body);
}



