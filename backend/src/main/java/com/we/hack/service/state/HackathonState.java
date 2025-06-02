package com.we.hack.service.state;

import com.we.hack.model.Hackathon;

public interface HackathonState {
    void publish(HackathonContext context, Hackathon hackathon);
    void beginJudging(HackathonContext context, Hackathon hackathon);
    void complete(HackathonContext context, Hackathon hackathon);
    String getStateName();
}
