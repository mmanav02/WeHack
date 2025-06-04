package com.we.hack.visitor;

import com.we.hack.model.*;

import javax.security.auth.Subject;

public interface AnalyticsVisitor {
    void visit(Hackathon hackathon);
    void visit(User user);
    void visit(Team team);
    void visit(Submission submission);
    void visit(JudgeScore judgeScore);
}
