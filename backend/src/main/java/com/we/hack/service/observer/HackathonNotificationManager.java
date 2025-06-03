package com.we.hack.service.observer;

import java.util.ArrayList;
import java.util.List;

public class HackathonNotificationManager implements HackathonSubject{
    private final List<HackathonObserver> observers = new ArrayList<>();

    @Override
    public void registerObserver(HackathonObserver observer) {
        observers.add(observer);
    }

    @Override
    public void removeObserver(HackathonObserver observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(int hackathonId, String message){
        for (HackathonObserver observer : HackathonObserverRegistry.getObservers(hackathonId)) {
            observer.update(message);
        }
    }
}
