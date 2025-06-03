package com.we.hack.model;

import java.util.List;

public interface CommentComponent {
    Long getId();
    String getContent();
    List<CommentComponent> getReplies();
    void addReply(CommentComponent reply);
}
