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
    
    // Explicit getters to work around Lombok compilation issues
    public Long getSubmissionId() { return submissionId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getProjectUrl() { return projectUrl; }
    public String getFilePath() { return filePath; }
    public Instant getSavedAt() { return savedAt; }
} 