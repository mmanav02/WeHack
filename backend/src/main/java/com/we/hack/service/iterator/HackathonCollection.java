package com.we.hack.service.iterator;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Team;

import java.util.List;

public class HackathonCollection implements Aggregate<Hackathon>, Iterable<Hackathon> {
    private final List<Hackathon> hackathons;
    public HackathonCollection(List<Hackathon> hackathons) { this.hackathons = hackathons; }

    @Override
    public Iterator<Hackathon> createIterator() {
        return new ListIterator<>(hackathons);
    }

    @Override
    public java.util.Iterator<Hackathon> iterator() {
        return hackathons.iterator();
    }
}

