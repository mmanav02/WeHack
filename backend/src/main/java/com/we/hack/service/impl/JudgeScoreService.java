package com.we.hack.service.impl;

import com.we.hack.dto.JudgeScoreRequest;
import com.we.hack.model.*;
import com.we.hack.repository.*;
import com.we.hack.service.bridge.JudgeScoreEvaluator;
import com.we.hack.service.bridge.ScoreEvaluator;
import com.we.hack.service.logger.Logger;
import com.we.hack.service.strategy.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class JudgeScoreService {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Autowired
    private JudgeScoreRepository judgeScoreRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    public void submitScore(JudgeScoreRequest request) {
        logger.INFO("JudgeScoreService.submitScore() - Submitting score for submission: " + request.getSubmissionId());
        logger.DEBUG("Score details: judgeId=" + request.getJudgeId() + ", innovation=" + request.getInnovation() + 
                    ", impact=" + request.getImpact() + ", execution=" + request.getExecution());
        
        try {
            Submission submission = submissionRepository.findById(request.getSubmissionId())
                    .orElseThrow(() -> {
                        logger.ERROR("Submission not found with ID: " + request.getSubmissionId());
                        return new RuntimeException("Submission not found");
                    });

            User judge = userRepository.findById(request.getJudgeId())
                    .orElseThrow(() -> {
                        logger.ERROR("Judge not found with ID: " + request.getJudgeId());
                        return new RuntimeException("Judge not found");
                    });

            logger.DEBUG("Found submission: " + submission.getTitle() + " by judge: " + judge.getEmail());

            JudgeScore score = new JudgeScore();
            score.setSubmission(submission);
            score.setJudge(judge);
            score.setInnovation(request.getInnovation());
            score.setImpact(request.getImpact());
            score.setExecution(request.getExecution());

            JudgeScore savedScore = judgeScoreRepository.save(score);
            logger.INFO("Score submitted successfully - scoreId: " + savedScore.getId() + ", submissionId: " + 
                       request.getSubmissionId() + ", judgeId: " + request.getJudgeId());
            
        } catch (Exception e) {
            logger.ERROR("Failed to submit score - submissionId: " + request.getSubmissionId() + 
                        ", judgeId: " + request.getJudgeId() + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    public double calculateFinalScore(Long submissionId) {
        logger.INFO("JudgeScoreService.calculateFinalScore() - Calculating final score for submission: " + submissionId);
        
        try {
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> {
                        logger.ERROR("Submission not found with ID: " + submissionId);
                        return new RuntimeException("Submission not found");
                    });

            Hackathon hackathon = submission.getHackathon();
            logger.DEBUG("Found submission: " + submission.getTitle() + " in hackathon: " + hackathon.getTitle());
            logger.DEBUG("Using scoring method: " + hackathon.getScoringMethod());

            // Get strategy using Strategy pattern
            ScoringStrategy strategy = getStrategy(hackathon.getScoringMethod());

            List<JudgeScore> allScores = judgeScoreRepository.findBySubmission(submission);
            logger.DEBUG("Found " + allScores.size() + " judge scores for submission " + submissionId);

            if (allScores.isEmpty()) {
                logger.WARN("No scores found for submission " + submissionId + " - returning 0.0");
                return 0.0;
            }

            // Use Bridge pattern for score evaluation
            logger.DEBUG("Using Bridge pattern with JudgeScoreEvaluator for final score calculation");
            ScoreEvaluator evaluator = new JudgeScoreEvaluator(strategy);
            double finalScore = evaluator.evaluate(allScores);
            
            logger.INFO("Final score calculated for submission " + submissionId + ": " + finalScore + 
                       " (based on " + allScores.size() + " judge scores)");
            
            return finalScore;
            
        } catch (Exception e) {
            logger.ERROR("Failed to calculate final score for submission " + submissionId + ": " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    private ScoringStrategy getStrategy(ScoringMethod method) {
        logger.DEBUG("JudgeScoreService.getStrategy() - Getting scoring strategy for method: " + method);
        
        try {
            ScoringStrategy strategy = switch (method) {
                case WEIGHTED_AVERAGE -> {
                    logger.DEBUG("Using WeightedAverageStrategy");
                    yield new WeightedAverageStrategy();
                }
                case SIMPLE_AVERAGE -> {
                    logger.DEBUG("Using SimpleAverageStrategy");
                    yield new SimpleAverageStrategy();
                }
                default -> {
                    logger.ERROR("Unknown scoring method: " + method);
                    throw new IllegalArgumentException("Unknown scoring method");
                }
            };
            
            logger.DEBUG("Strategy created successfully: " + strategy.getClass().getSimpleName());
            return strategy;
            
        } catch (Exception e) {
            logger.ERROR("Failed to create scoring strategy for method " + method + ": " + e.getMessage());
            throw e;
        }
    }
}
