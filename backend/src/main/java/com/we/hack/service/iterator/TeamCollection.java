package com.we.hack.service.iterator;

import com.we.hack.model.Team;

import java.util.List;
import java.util.Optional;

public class TeamCollection implements Aggregate<Team>, Iterable<Team> {
    private final List<Team> teams;
    public TeamCollection(List<Team> teams) { this.teams = teams; }

    @Override
    public Iterator<Team> createIterator() {
        return new ListIterator<>(teams);
    }

    @Override
    public java.util.Iterator<Team> iterator() {
        return teams.iterator();
    }
}
