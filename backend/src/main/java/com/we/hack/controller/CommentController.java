package com.we.hack.controller;

import com.we.hack.model.Comment;
import com.we.hack.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public Comment createComment(@RequestParam int hackathonId,
                                 @RequestParam Long userId,
                                 @RequestParam String content,
                                 @RequestParam(required = false) Integer parentId) {
        return commentService.addComment(hackathonId, userId, content, parentId);
    }

    @GetMapping("/{hackathonId}")
    public List<Comment> getComments(@PathVariable int hackathonId) {
        return commentService.getTopLevelComments(hackathonId);
    }
}
