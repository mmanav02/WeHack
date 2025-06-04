package com.we.hack.service.decorator;

import com.we.hack.model.User;
import com.we.hack.service.adapter.MailServiceAdapter;

public class EmailNotifier implements Notifier {

    private final MailServiceAdapter mailServiceAdapter;

    public EmailNotifier(MailServiceAdapter adapter) {
        this.mailServiceAdapter = adapter;
    }

    @Override
    public void notify(User organizer, String recipient, String subject, String content) {
        mailServiceAdapter.sendMail(organizer, recipient, subject, content);
    }
}
