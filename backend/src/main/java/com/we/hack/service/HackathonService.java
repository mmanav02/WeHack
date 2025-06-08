package com.we.hack.service;

import com.we.hack.dto.HackathonDto;
import com.we.hack.dto.MailModes;
import com.we.hack.dto.TeamDto;
import com.we.hack.dto.getSubmissionRequest;
import com.we.hack.model.*;

import java.time.Instant;
import java.util.List;

public interface HackathonService {
    Hackathon createHackathon(String title, String description, Instant startDate, Instant endDate, User organizer, ScoringMethod scoringMethod, String smtpPassword, MailModes mailMode, boolean slackEnabled);
    List<Hackathon> getAllHackathons();
    void deleteHackathon(long hackathonId);

    List<TeamDto> listTeams(Hackathon hackathon);

    void publishHackathon(int hackathonId);
    void startJudging(int hackathonId);
    void completeHackathon(int hackathonId);

    List<HackathonDto> listHackathons();

    // Role
    HackathonRole joinHackathon(Long userId, int hackathonId, Role role);

    void leaveHackathon(long userId, long hackathonId);

    List<HackathonRole> getPendingJudgeRequests(int hackathonId);
    List<HackathonRole> getParticipants(int hackathonId);
    HackathonRole updateJudgeStatus(Long hackathonId, Long userId, ApprovalStatus status);

    List<Submission> getLeaderboard(Long hackathonId);
}
