package com.we.hack.service.iterator;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.SubmissionRepository;
import com.we.hack.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CollectionFactory {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    public TeamCollection teams(Hackathon hackathon) {
        List<Team> teams = teamRepository.findByHackathonId(hackathon.getId());
        return new TeamCollection(teams);
    }
    public HackathonCollection hackathons() {
        return new HackathonCollection(hackathonRepository.findAll());
    }

    public SubmissionCollection submissions(Team team, Hackathon hackathon) {
        List<Submission> submissions = submissionRepository.findByHackathonIdAndUserId(hackathon.getId(), team.getId());
        return new SubmissionCollection(submissions);
    }
}

