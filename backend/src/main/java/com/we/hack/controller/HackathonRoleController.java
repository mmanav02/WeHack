package com.we.hack.controller;

import com.we.hack.dto.JoinHackathonRequest;
import com.we.hack.model.HackathonRole;
import com.we.hack.service.HackathonRoleService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/hackathons/{hackathonId}/judge-requests")
    public List<HackathonRole> getPendingJudgeRequests(@PathVariable int hackathonId) {
        return hackathonRoleService.getPendingJudgeRequests(hackathonId);
    }

}
