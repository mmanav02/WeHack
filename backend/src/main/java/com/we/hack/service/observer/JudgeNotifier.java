package com.we.hack.service.observer;

public class JudgeNotifier implements HackathonObserver{
    private final String judgeEmail;

    public JudgeNotifier(String judgeEmail) {
        this.judgeEmail = judgeEmail;
    }

    @Override
    public void update(String message) {
        System.out.println("Email to judge " + judgeEmail + ": " + message);
        // email logic here
    }
}
