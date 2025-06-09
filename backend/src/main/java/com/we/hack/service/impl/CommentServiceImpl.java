package com.we.hack.service.impl;

import com.we.hack.model.Comment;
import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import com.we.hack.repository.CommentRepository;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.CommentService;
import com.we.hack.service.logger.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Comment addComment(int hackathonId, Long userId, String content, Integer parentId) {
        logger.INFO("CommentService.addComment() - Adding comment for hackathon: " + hackathonId + ", user: " + userId);
        logger.DEBUG("Comment details: content length=" + (content != null ? content.length() : 0) + 
                    ", parentId=" + parentId);
        
        try {
            // Validate input
            if (content == null || content.trim().isEmpty()) {
                logger.ERROR("Invalid comment content - content is null or empty");
                throw new RuntimeException("Comment content cannot be empty");
            }
            
            Comment comment = new Comment();
            comment.setContent(content);
            
            // Find and set hackathon
            Hackathon hackathon = hackathonRepository.findById(hackathonId)
                    .orElseThrow(() -> {
                        logger.ERROR("Hackathon not found with ID: " + hackathonId);
                        return new RuntimeException("Hackathon not found");
                    });
            comment.setHackathon(hackathon);
            logger.DEBUG("Found hackathon: " + hackathon.getTitle());
            
            // Find and set user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.ERROR("User not found with ID: " + userId);
                        return new RuntimeException("User not found");
                    });
            comment.setUser(user);
            logger.DEBUG("Found user: " + user.getEmail());

            // Handle parent comment if specified (nested comments)
            if (parentId != null) {
                logger.DEBUG("Setting parent comment with ID: " + parentId);
                Comment parent = commentRepository.findById(parentId)
                        .orElseThrow(() -> {
                            logger.ERROR("Parent comment not found with ID: " + parentId);
                            return new RuntimeException("Parent comment not found");
                        });
                comment.setParent(parent);
                logger.DEBUG("Parent comment found: " + parent.getContent().substring(0, Math.min(50, parent.getContent().length())) + "...");
            } else {
                logger.DEBUG("Creating top-level comment (no parent)");
            }

            Comment savedComment = commentRepository.save(comment);
            logger.INFO("Comment added successfully - commentId: " + savedComment.getId() + 
                       ", hackathonId: " + hackathonId + ", userId: " + userId + 
                       (parentId != null ? ", parentId: " + parentId : ""));
            
            return savedComment;
            
        } catch (Exception e) {
            logger.ERROR("Failed to add comment - hackathonId: " + hackathonId + 
                        ", userId: " + userId + ", parentId: " + parentId + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    @Override
    public List<Comment> getTopLevelComments(int hackathonId) {
        logger.INFO("CommentService.getTopLevelComments() - Getting top-level comments for hackathon: " + hackathonId);
        
        try {
            List<Comment> comments = commentRepository.findByHackathonIdAndParentIsNull(hackathonId);
            logger.INFO("Found " + comments.size() + " top-level comments for hackathon " + hackathonId);
            
            if (logger != null) {
                // Log some details about the comments
                for (Comment comment : comments) {
                    logger.DEBUG("Top-level comment ID: " + comment.getId() + 
                               ", author: " + comment.getUser().getEmail() + 
                               ", content preview: " + comment.getContent().substring(0, Math.min(30, comment.getContent().length())) + "...");
                }
            }
            
            return comments;
            
        } catch (Exception e) {
            logger.ERROR("Failed to get top-level comments for hackathon " + hackathonId + ": " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }
}
