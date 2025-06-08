package com.we.hack.controller;

import com.we.hack.dto.*;
import com.we.hack.mapper.SubmissionMapper;
import com.we.hack.model.Hackathon;
import com.we.hack.dto.EditSubmissionRequest;
import com.we.hack.dto.UndoSubmitProjectRequest;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.TeamRepository;
import com.we.hack.model.Team;
import com.we.hack.model.User;
import com.we.hack.service.SubmissionService;
import com.we.hack.service.builder.Submission.ConcreteSubmissionBuilder;
import com.we.hack.service.builder.Submission.SubmissionBuilder;
import com.we.hack.service.impl.SubmissionServiceImpl;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionServiceImpl submissionService;

    @Autowired
    private CollectionFactory collectionFactory;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private TeamRepository teamRepository;

    // POST /submissions/{hackathonId}/user/{userId}
//    @PostMapping("/{hackathonId}/user/{userId}")

    @PostMapping(value = "/submitProject", consumes = "multipart/form-data")
    public Submission submitProject(
            @RequestParam("hackathonId") int hackathonId,
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("projectUrl") String projectUrl,
            @RequestPart("file") MultipartFile file
    ) {

        SubmissionBuilder builder = new ConcreteSubmissionBuilder()
                .title(title)
                .description(description)
                .projectUrl(projectUrl);
        return submissionService.createFinalSubmission(builder, userId, hackathonId, file);
    }

    @PutMapping("/editSubmission")
    public Submission editSubmission(
            @RequestBody EditSubmissionRequest request
            ) {
        return submissionService.editSubmission(request.getHackathonId(), request.getUserId(), request.getSubmissionId(), request.getTitle(), request.getDescription(), request.getProjectUrl(), request.getFile());
    }

    @GetMapping("/iterator")
    public ResponseEntity<List<SubmissionDto>> listSubmissions(@RequestBody getSubmissionRequest request) {
        return ResponseEntity.ok(submissionService.listSubmissions(request.getHackathon(), request.getTeam()));
    }

    @GetMapping("/hackathon/{hackathonId}")
    public ResponseEntity<List<Submission>> getSubmissionsByHackathon(@PathVariable int hackathonId) {
        List<Submission> submissions = submissionService.findByHackathonId(hackathonId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long submissionId) {
        Submission submission = submissionService.findById(submissionId);
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Submission>> getSubmissionsByUser(@PathVariable Long userId) {
        List<Submission> submissions = submissionService.findByUserId(userId);
        return ResponseEntity.ok(submissions);
    }

    @PostMapping("/{submissionId}/setPrimary")
    public ResponseEntity<Submission> setPrimarySubmission(
            @PathVariable Long submissionId,
            @RequestParam Long userId) {
        try {
            Submission submission = submissionService.setPrimarySubmission(submissionId, userId);
            return ResponseEntity.ok(submission);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/hackathon/{hackathonId}/primary")
    public ResponseEntity<List<Submission>> getPrimarySubmissionsByHackathon(@PathVariable int hackathonId) {
        List<Submission> submissions = submissionService.getPrimarySubmissionsByHackathon(hackathonId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{submissionId}/download")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long submissionId) {
        try {
            Submission submission = submissionService.findById(submissionId);
            if (submission == null || submission.getFilePath() == null) {
                return ResponseEntity.notFound().build();
            }

            // Build the full file path
            String filePath = submission.getFilePath();
            Path path = Paths.get(System.getProperty("user.dir"), filePath);
            
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(path.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Get the original filename from the stored path
                String originalFilename = path.getFileName().toString();
                
                // Remove timestamp prefix if it exists (format: timestamp_originalname)
                if (originalFilename.contains("_")) {
                    originalFilename = originalFilename.substring(originalFilename.indexOf("_") + 1);
                }

                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalFilename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/undoLastEdit")
    public Submission undoLastEdit(@RequestBody UndoSubmitProjectRequest request) {
        return submissionService.undoLastEdit(request.getTeamId(), request.getSubmissionId(), request.getHackathonId());
    }

    @GetMapping("/{submissionId}/file-info")
    public ResponseEntity<Map<String, String>> getSubmissionFileInfo(@PathVariable Long submissionId) {
        try {
            Submission submission = submissionService.findById(submissionId);
            if (submission == null || submission.getFilePath() == null) {
                return ResponseEntity.notFound().build();
            }

            // Build the full file path
            String filePath = submission.getFilePath();
            Path path = Paths.get(System.getProperty("user.dir"), filePath);
            
            Map<String, String> fileInfo = new HashMap<>();
            
            if (Files.exists(path)) {
                String originalFilename = path.getFileName().toString();
                
                // Remove timestamp prefix if it exists
                if (originalFilename.contains("_")) {
                    originalFilename = originalFilename.substring(originalFilename.indexOf("_") + 1);
                }
                
                try {
                    long fileSize = Files.size(path);
                    fileInfo.put("filename", originalFilename);
                    fileInfo.put("size", String.valueOf(fileSize));
                    fileInfo.put("sizeFormatted", formatFileSize(fileSize));
                    fileInfo.put("available", "true");
                } catch (Exception e) {
                    fileInfo.put("filename", originalFilename);
                    fileInfo.put("available", "true");
                    fileInfo.put("size", "unknown");
                }
            } else {
                fileInfo.put("available", "false");
                fileInfo.put("filename", "File not found");
            }
            
            return ResponseEntity.ok(fileInfo);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp-1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

}
