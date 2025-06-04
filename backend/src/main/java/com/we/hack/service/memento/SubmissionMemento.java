package com.we.hack.service.memento;

import lombok.Value;
import java.time.Instant;

@Value
public class SubmissionMemento {
    Long   submissionId;
    String title;
    String description;
    String projectUrl;
    String filePath;
    Instant savedAt;
}
