package com.we.hack.service.impl;

import com.we.hack.dto.JudgeScoreRequest;
import com.we.hack.model.*;
import com.we.hack.repository.*;
import com.we.hack.service.strategy.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JudgeScoreService {

    @Autowired
    private JudgeScoreRepository judgeScoreRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    public void submitScore(JudgeScoreRequest request) {
        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        User judge = userRepository.findById(request.getJudgeId())
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        JudgeScore score = new JudgeScore();
        score.setSubmission(submission);
        score.setJudge(judge);
        score.setInnovation(request.getInnovation());
        score.setImpact(request.getImpact());
        score.setExecution(request.getExecution());

        judgeScoreRepository.save(score);
    }

    public double calculateFinalScore(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Hackathon hackathon = submission.getHackathon();

        ScoringStrategy strategy = getStrategy(hackathon.getScoringMethod());

        List<JudgeScore> allScores = judgeScoreRepository.findBySubmission(submission);

        // For simplicity, average the scores from each judge first, then apply strategy
        List<Double> perJudgeAverages = new ArrayList<>();
        for (JudgeScore score : allScores) {
            List<Double> criteria = List.of(
                score.getInnovation(), score.getImpact(), score.getExecution()
            );
            perJudgeAverages.add(strategy.calculateScore(criteria));
        }

        return perJudgeAverages.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    private ScoringStrategy getStrategy(ScoringMethod method) {
        return switch (method) {
            case WEIGHTED_AVERAGE -> new WeightedAverageStrategy();
            case SIMPLE_AVERAGE -> new SimpleAverageStrategy();
            default -> throw new IllegalArgumentException("Unknown scoring method");
        };
    }
}
