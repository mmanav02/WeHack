package com.we.hack.controller;

import com.we.hack.model.*;
import com.we.hack.repository.*;
import com.we.hack.service.visitor.AnalyticsCollector;
import com.we.hack.service.visitor.AnalyticsVisitor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {
    @Autowired
    private HackathonRepository hackathonRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private JudgeScoreRepository judgeScoreRepository;

    @GetMapping("/overview")
    public Map<String, Integer> getAnalyticsOverview() {
        AnalyticsVisitor collector = new AnalyticsCollector();

        List<Hackathon> hackathons = hackathonRepository.findAll();
        List<User> users = userRepository.findAll();
        List<Team> teams = teamRepository.findAll();
        List<Submission> submissions = submissionRepository.findAll();
        List<JudgeScore> judgeScores = judgeScoreRepository.findAll();

        hackathons.forEach(h -> h.accept(collector));
        users.forEach(user -> user.accept(collector));
        teams.forEach(t -> t.accept(collector));
        submissions.forEach(sub -> sub.accept(collector));
        judgeScores.forEach(j -> j.accept(collector));

        AnalyticsCollector result = (AnalyticsCollector) collector;

        return Map.of(
                "totalHackathons", result.getTotalHackathons(),
                "totalUsers", result.getTotalUsers(),
                "totalTeams", result.getTotalTeams(),
                "totalSubmissions", result.getTotalSubmissions(),
                "totalJudgeScores", result.getTotalJudgeScores()
        );


    }
}
