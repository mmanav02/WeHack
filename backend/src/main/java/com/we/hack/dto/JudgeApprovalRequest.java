package com.we.hack.dto;

import com.we.hack.model.ApprovalStatus;
import lombok.Data;

@Data
public class JudgeApprovalRequest {
    private Long hackathonId;
    private Long userId;
    private ApprovalStatus status;  // APPROVED or REJECTED
}
