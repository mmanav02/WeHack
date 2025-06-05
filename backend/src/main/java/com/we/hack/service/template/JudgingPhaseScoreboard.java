package com.we.hack.service.template;

import com.we.hack.model.*;
import com.we.hack.repository.*;
import com.we.hack.service.bridge.JudgeScoreEvaluator;
import com.we.hack.service.bridge.ScoreEvaluator;
import com.we.hack.service.strategy.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class JudgingPhaseScoreboard extends ScoreboardTemplate {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private JudgeScoreRepository judgeScoreRepository;

    @Autowired
    private HackathonRepository hackathonRepository;


    @Override
    protected boolean shouldShowLeaderboard(Long hackathonId) {
        String status = hackathonRepository.findById(hackathonId.intValue())
                .orElseThrow()
                .getStatus();
        return status.equals("Judging") || status.equals("Completed");
    }

    @Override
    protected List<Submission> getSubmissions(Long hackathonId) {
        return submissionRepository.findByHackathonId(hackathonId.intValue());
    }

    @Override
    protected List<Submission> getSortedSubmissions(List<Submission> submissions) {
        return submissions.stream()
                .sorted(Comparator.comparingDouble(this::getFinalScore).reversed())
                .toList();
    }

    private double getFinalScore(Submission submission) {
        List<JudgeScore> allScores = judgeScoreRepository.findBySubmission(submission);
        ScoringStrategy strategy = switch (submission.getHackathon().getScoringMethod()) {
            case SIMPLE_AVERAGE -> new SimpleAverageStrategy();
            case WEIGHTED_AVERAGE -> new WeightedAverageStrategy();
        };
        ScoreEvaluator evaluator = new JudgeScoreEvaluator(strategy);
        return evaluator.evaluate(allScores);
    }
}
