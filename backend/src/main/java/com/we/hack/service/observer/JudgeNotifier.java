package com.we.hack.service.observer;

import com.we.hack.model.User;
import com.we.hack.service.adapter.MailServiceAdapter;

public class JudgeNotifier implements HackathonObserver{
    private final String judgeEmail;
    private User organizer;           // “from” address & SMTP creds
    private MailServiceAdapter mailer;

    public JudgeNotifier(String judgeEmail, User organizer, MailServiceAdapter mailer) {
        this.judgeEmail = judgeEmail;
        this.organizer = organizer;
        this.mailer = mailer;
    }

    @Override
    public void update(String message) {
        // 1-liner: real mail instead of System.out.println
        mailer.sendMail(
                organizer,
                judgeEmail,
                "Hackathon update – " + organizer.getUsername(),
                message
        );
    }
}
