package com.we.hack.service.memento;

import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SubmissionHistoryManager {

    private final Map<Long, Deque<SubmissionMemento>> history = new ConcurrentHashMap<>();
    private static final int MAX_VERSIONS = 10;   // avoid unbounded memory

    public void push(Long teamId, SubmissionMemento m) {
        history
                .computeIfAbsent(teamId, k -> new ArrayDeque<>())
                .push(m);
        // trim
        if (history.get(teamId).size() > MAX_VERSIONS) {
            history.get(teamId).removeLast();
        }
    }

    public Optional<SubmissionMemento> peek(Long teamId) {
        return Optional.ofNullable(history.get(teamId))
                .filter(d -> !d.isEmpty())
                .map(Deque::peek);
    }

    public Optional<SubmissionMemento> pop(Long teamId) {
        return Optional.ofNullable(history.get(teamId))
                .filter(d -> !d.isEmpty())
                .map(Deque::pop);
    }
}
