package com.we.hack.service.state;

import com.we.hack.model.Hackathon;

public class CompletedState implements HackathonState {

    @Override
    public void publish(HackathonContext context, Hackathon hackathon) {
        System.out.println("Hackathon is already completed.");
    }

    @Override
    public void beginJudging(HackathonContext context, Hackathon hackathon) {
        System.out.println("Cannot judge. Hackathon is completed.");
    }

    @Override
    public void complete(HackathonContext context, Hackathon hackathon) {
        System.out.println("Already completed.");
    }

    @Override
    public String getStateName() {
        return "Completed";
    }
}
