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

    @GetMapping("/hackathons/{hackathonId}/participants")
    public List<HackathonRole> getParticipants(@PathVariable int hackathonId) {
        return hackathonService.getParticipants(hackathonId);
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

    @GetMapping("/hackathons/{hackathonId}/teams")
    public ResponseEntity<List<TeamDto>> listTeams(@PathVariable int hackathonId) {
        // Create a hackathon object for the service call
        com.we.hack.model.Hackathon hackathon = new com.we.hack.model.Hackathon();
        hackathon.setId((long) hackathonId);
        return ResponseEntity.ok(hackathonService.listTeams(hackathon));
    }

    // New endpoints for team join functionality
    @PostMapping("/teams/{teamId}/join-request")
    public ResponseEntity<String> requestToJoinTeam(@PathVariable long teamId, @RequestBody long userId) {
        try {
            teamService.addMemberToTeam(teamId, userId);
            return ResponseEntity.ok("Successfully joined team");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to join team: " + e.getMessage());
        }
    }

    @GetMapping("/hackathons/{hackathonId}/available-teams")
    public ResponseEntity<List<TeamDto>> getAvailableTeams(@PathVariable int hackathonId) {
        // Get all teams for the hackathon that are accepting new members
        com.we.hack.model.Hackathon hackathon = new com.we.hack.model.Hackathon();
        hackathon.setId((long) hackathonId);
        return ResponseEntity.ok(hackathonService.listTeams(hackathon));
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
