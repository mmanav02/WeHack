package com.we.hack.service.observer;

public interface HackathonSubject {
    void registerObserver(HackathonObserver observer);
    void removeObserver(HackathonObserver observer);
    void notifyObservers(int hackathonId, String message);
}
