package com.we.hack.controller;

import com.we.hack.dto.JoinHackathonRequest;
import com.we.hack.dto.JudgeApprovalRequest;
import com.we.hack.dto.LeaveHackathonRequest;
import com.we.hack.dto.TeamRequest;
import com.we.hack.model.HackathonRole;
import com.we.hack.model.Team;
import com.we.hack.model.User;
import com.we.hack.service.HackathonRoleService;
import com.we.hack.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hackathon-role")
public class HackathonRoleController {

    @Autowired
    private HackathonRoleService hackathonRoleService;

    @Autowired
    private TeamService teamService;

    // ✅ Endpoint: POST /hackathon-role/join
    @PostMapping("/join")
    public HackathonRole joinHackathon(@RequestBody JoinHackathonRequest request) {
        return hackathonRoleService.joinHackathon(
                request.getUserId(),
                request.getHackathonId(),
                request.getRole()
        );
    }

    @DeleteMapping("/leave")
    public ResponseEntity<String> leaveHackathon(@RequestBody LeaveHackathonRequest request) {
        hackathonRoleService.leaveHackathon(request.getUserId(), request.getHackathonId());
        return ResponseEntity.ok("Left hackathon successfully");
    }

    @GetMapping("/hackathons/{hackathonId}/judge-requests")
    public List<HackathonRole> getPendingJudgeRequests(@PathVariable int hackathonId) {
        return hackathonRoleService.getPendingJudgeRequests(hackathonId);
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


    @PostMapping("/update-status")
    public HackathonRole updateJudgeStatus(@RequestBody JudgeApprovalRequest request) {
        return hackathonRoleService.updateJudgeStatus(
                request.getHackathonId(),
                request.getUserId(),
                request.getStatus()
        );
    }


}
