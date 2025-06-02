package com.we.hack.service.strategy;
import java.util.List;

public interface ScoringStrategy {
    double calculateScore(List<Double> scores);
}
