package com.we.hack.service.state;

import com.we.hack.model.Hackathon;

public class JudgingState implements HackathonState {

    @Override
    public void publish(HackathonContext context, Hackathon hackathon) {
        System.out.println("Cannot publish. Judging already started.");
    }

    @Override
    public void beginJudging(HackathonContext context, Hackathon hackathon) {
        System.out.println("Already in judging state.");
    }

    @Override
    public void complete(HackathonContext context, Hackathon hackathon) {
        System.out.println("Hackathon completed.");
        context.setState(new CompletedState());
        hackathon.setStatus("Completed");
    }

    @Override
    public String getStateName() {
        return "Judging";
    }
}
