package com.we.hack.service.decorator;

import com.we.hack.model.User;

public abstract class NotifierDecorator implements Notifier {
    protected Notifier wrappee;

    public NotifierDecorator(Notifier wrappee) {
        this.wrappee = wrappee;
    }

    @Override
    public void notify(User organizer, String recipient, String subject, String content) {
        wrappee.notify(organizer, recipient, subject, content);
    }
}

