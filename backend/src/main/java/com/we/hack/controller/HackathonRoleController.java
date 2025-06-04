package com.we.hack.controller;

import com.we.hack.dto.*;
import com.we.hack.mapper.TeamMapper;
import com.we.hack.model.HackathonRole;
import com.we.hack.model.Team;
import com.we.hack.model.User;
import com.we.hack.service.HackathonService;
import com.we.hack.service.TeamService;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/hackathon-role")
public class HackathonRoleController {

    @Autowired
    private HackathonService hackathonService;

    @Autowired
    private TeamService teamService;

    @Autowired
    private CollectionFactory collectionFactory;

    // ✅ Endpoint: POST /hackathon-role/join
    @PostMapping("/join")
    public HackathonRole joinHackathon(@RequestBody JoinHackathonRequest request) {
        return hackathonService.joinHackathon(
                request.getUserId(),
                request.getHackathonId(),
                request.getRole()
        );
    }

    @DeleteMapping("/leave")
    public ResponseEntity<String> leaveHackathon(@RequestBody LeaveHackathonRequest request) {
        hackathonService.leaveHackathon(request.getUserId(), request.getHackathonId());
        return ResponseEntity.ok("Left hackathon successfully");
    }

    @GetMapping("/hackathons/{hackathonId}/judge-requests")
    public List<HackathonRole> getPendingJudgeRequests(@PathVariable int hackathonId) {
        return hackathonService.getPendingJudgeRequests(hackathonId);
    }

    @PostMapping("/create-team")
    public Team createTeam(@RequestBody TeamRequest request) {
        return teamService.createTeam(request.getUserId(), request.getName(), request.getHackathonId());
    }

    @PostMapping("/teams/{teamId}/add-member")
    public Team addMember(@PathVariable long teamId,
                          @RequestBody long userId) {
        return teamService.addMemberToTeam(teamId, userId);
    }

    @GetMapping("/iterator")
    public ResponseEntity<List<TeamDto>> streamTeams(@RequestBody getSubmissionRequest request) {
        return ResponseEntity.ok(hackathonService.listTeams(request.getHackathon()));
    }


    @PostMapping("/update-status")
    public HackathonRole updateJudgeStatus(@RequestBody JudgeApprovalRequest request) {
        return hackathonService.updateJudgeStatus(
                request.getHackathonId(),
                request.getUserId(),
                request.getStatus()
        );
    }


}
