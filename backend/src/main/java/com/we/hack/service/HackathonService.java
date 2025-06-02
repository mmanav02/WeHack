package com.we.hack.service;

import com.we.hack.model.Hackathon;
import com.we.hack.model.ScoringMethod;
import com.we.hack.model.User;

import java.util.List;

public interface HackathonService {
    Hackathon createHackathon(String title, String description, String date, User organizer, ScoringMethod scoringMethod);
    List<Hackathon> getAllHackathons();
    void deleteHackathon(long hackathonId);
    void publishHackathon(int hackathonId);
    void startJudging(int hackathonId);
    void completeHackathon(int hackathonId);
}
