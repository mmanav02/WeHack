package com.we.hack.controller;

import com.we.hack.dto.JoinHackathonRequest;
import com.we.hack.dto.JudgeApprovalRequest;
import com.we.hack.dto.LeaveHackathonRequest;
import com.we.hack.model.HackathonRole;
import com.we.hack.service.HackathonRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hackathon-role")
public class HackathonRoleController {

    @Autowired
    private HackathonRoleService hackathonRoleService;

    // ✅ Endpoint: POST /hackathon-role/join
    @PostMapping("/join")
    public HackathonRole joinHackathon(@RequestBody JoinHackathonRequest request) {
        return hackathonRoleService.joinHackathon(
                request.getUserId(),
                request.getHackathonId(),
                request.getRole()
        );
    }

    @PostMapping("/leave")
    public ResponseEntity<String> leave(@RequestBody LeaveHackathonRequest request) {
        hackathonRoleService.leaveHackathon(request.getUserId(), request.getHackathonId());
        return ResponseEntity.ok("Left hackathon successfully");
    }

    @GetMapping("/hackathons/{hackathonId}/judge-requests")
    public List<HackathonRole> getPendingJudgeRequests(@PathVariable int hackathonId) {
        return hackathonRoleService.getPendingJudgeRequests(hackathonId);
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
