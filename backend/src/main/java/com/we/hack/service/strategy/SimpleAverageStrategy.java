package com.we.hack.service.strategy;

import java.util.List;

public class SimpleAverageStrategy implements ScoringStrategy {


    @Override
    public double calculateScore(List<Double> scores) {
        if (scores.size() != 3) throw new IllegalArgumentException("Three scores required");

        return scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }
}
