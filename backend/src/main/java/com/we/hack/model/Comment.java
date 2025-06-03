package com.we.hack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Comment implements CommentComponent{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    @ManyToOne
    private User user;

    @ManyToOne
    private Hackathon hackathon;

    @ManyToOne
    @JsonIgnore
    private Comment parent;


    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();

    // Composite behavior
    @Override
    public List<CommentComponent> getReplies() {
        return new ArrayList<>(replies);
    }

    @Override
    public void addReply(CommentComponent reply){
        if (reply instanceof Comment comment) {
            comment.setParent(this);
            replies.add(comment);
        }
    }


}
