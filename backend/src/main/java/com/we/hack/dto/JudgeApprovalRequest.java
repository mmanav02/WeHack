package com.we.hack.dto;

import com.we.hack.model.ApprovalStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JudgeApprovalRequest {
    private int hackathonId;
    private Long userId;
    private ApprovalStatus status;  // APPROVED or REJECTED
}
