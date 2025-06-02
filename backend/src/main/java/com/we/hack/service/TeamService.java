package com.we.hack.service;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Team;
import com.we.hack.model.User;

public interface TeamService {
    Team createTeam(long user, String name, long hackathon);
    Team addMemberToTeam(long teamId, long user);   // << new method
}

