package com.we.hack.service.visitor;

import com.we.hack.model.*;

public class AnalyticsCollector implements AnalyticsVisitor{
    private int totalHackathons = 0;
    private int totalUsers = 0;
    private int totalTeams = 0;

    public int getTotalSubmissions() {
        return totalSubmissions;
    }

    public int getTotalHackathons() {
        return totalHackathons;
    }

    public int getTotalUsers() {
        return totalUsers;
    }

    public int getTotalTeams() {
        return totalTeams;
    }

    public int getTotalJudgeScores() {
        return totalJudgeScores;
    }

    private int totalSubmissions = 0;
    private int totalJudgeScores = 0;

    @Override
    public void visit(Hackathon hackathon) {
        totalHackathons++;
    }

    @Override
    public void visit(User user) {
        totalUsers++;
    }

    @Override
    public void visit(Team team) {
        totalTeams++;
    }

    @Override
    public void visit(JudgeScore judgeScore) {
        totalJudgeScores++;
    }

    @Override
    public void visit(Submission submission) {
        totalSubmissions++;
    }
}
