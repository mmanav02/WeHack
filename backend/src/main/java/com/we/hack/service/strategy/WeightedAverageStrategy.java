package com.we.hack.service.strategy;

import java.util.List;

public class WeightedAverageStrategy implements ScoringStrategy {

    @Override
    public double calculateScore(List<Integer> scores) {
        if (scores.size() != 3) throw new IllegalArgumentException("Three scores required");

        // Innovation: 40%, Impact: 35%, Execution: 25%
        return scores.get(0) * 0.4 + scores.get(1) * 0.35 + scores.get(2) * 0.25;
    }
}
