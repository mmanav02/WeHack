package com.we.hack.service.observer;

import java.util.*;

public class HackathonObserverRegistry {
    private static final Map<Integer, List<HackathonObserver>> observerMap = new HashMap<>();

    public static void registerObserver(int hackathonId, HackathonObserver observer) {
        observerMap.computeIfAbsent(hackathonId, k -> new ArrayList<>()).add(observer);
    }

    public static List<HackathonObserver> getObservers(int hackathonId) {
        return observerMap.getOrDefault(hackathonId, Collections.emptyList());
    }

    public static void clearObservers(int hackathonId) {
        observerMap.remove(hackathonId);
    }
}
