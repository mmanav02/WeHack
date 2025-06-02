package com.we.hack.service.state;

import com.we.hack.model.Hackathon;

public class PublishedState implements HackathonState {

    @Override
    public void publish(HackathonContext context, Hackathon hackathon) {
        System.out.println("Hackathon is already published.");
    }

    @Override
    public void beginJudging(HackathonContext context, Hackathon hackathon) {
        System.out.println("Judging started.");
        context.setState(new JudgingState());
        hackathon.setStatus("Judging");
    }

    @Override
    public void complete(HackathonContext context, Hackathon hackathon) {
        System.out.println("Cannot complete. Judging not started.");
    }

    @Override
    public String getStateName() {
        return "Published";
    }
}
