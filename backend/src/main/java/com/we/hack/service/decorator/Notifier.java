package com.we.hack.service.decorator;

import com.we.hack.model.User;

public interface Notifier {
    void notify(User organizer, String recipient, String subject, String content);
}
