package com.we.hack.service.bridge;

import com.we.hack.model.JudgeScore;
import com.we.hack.service.strategy.ScoringStrategy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class JudgeScoreEvaluator extends ScoreEvaluator {

    public JudgeScoreEvaluator(ScoringStrategy strategy) {
        super(strategy);
    }

    @Override
    public double evaluate(List<JudgeScore> scores) {
        List<Double> perJudgeAverages = new ArrayList<>();

        for (JudgeScore score : scores) {
            List<Integer> criteria = Arrays.asList(
                    score.getInnovation(),
                    score.getImpact(),
                    score.getExecution()
            );
            perJudgeAverages.add(strategy.calculateScore(criteria));
        }

        return perJudgeAverages.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }
}

