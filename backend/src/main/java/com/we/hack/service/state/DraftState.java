package com.we.hack.service.state;

import com.we.hack.model.Hackathon;

public class DraftState implements HackathonState {

    @Override
    public void publish(HackathonContext context, Hackathon hackathon) {
        System.out.println("Hackathon published.");
        context.setState(new PublishedState());
        hackathon.setStatus("Published");
    }

    @Override
    public void beginJudging(HackathonContext context, Hackathon hackathon) {
        System.out.println("Cannot begin judging. Hackathon is still in Draft.");
    }

    @Override
    public void complete(HackathonContext context, Hackathon hackathon) {
        System.out.println("Cannot complete. Hackathon is still in Draft.");
    }

    @Override
    public String getStateName() {
        return "Draft";
    }
}
