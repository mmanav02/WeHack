package com.we.hack.service.impl;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Team;
import com.we.hack.model.User;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.TeamRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.TeamService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional          // guarantees changes are flushed
public class TeamServiceImpl implements TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional         // good practice when you modify entities
    public Team createTeam(long userId, String name, long hackathonId) {

        Team team = new Team();
        team.setName(name);

        Hackathon hackathon = hackathonRepository.findById((int) hackathonId)
                .orElseThrow(() -> new RuntimeException(
                        "Hackathon " + hackathonId + " not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "User " + userId + " not found"));

        team.setHackathon(hackathon);
        team.getUsers().add(user);

        return teamRepository.save(team);
    }

    @Override
    public Team addMemberToTeam(long teamId, long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new RuntimeException("Team not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "User " + userId + " not found"));
        team.getUsers().add(user);   // managed entity → change tracked
        return team;                 // flush happens on transaction commit
    }
}

