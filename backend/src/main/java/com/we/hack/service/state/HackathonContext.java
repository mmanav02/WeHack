package com.we.hack.service.state;

import com.we.hack.model.Hackathon;

public class HackathonContext {
    private HackathonState currentState;

    public HackathonContext(HackathonState initialState) {
        this.currentState = initialState;
    }

    public void setState(HackathonState state) {
        this.currentState = state;
    }

    public String getCurrentState() {
        return currentState.getStateName();
    }

    public void publish(Hackathon hackathon) {
        currentState.publish(this, hackathon);
    }

    public void beginJudging(Hackathon hackathon) {
        currentState.beginJudging(this, hackathon);
    }

    public void complete(Hackathon hackathon) {
        currentState.complete(this, hackathon);
    }
}
