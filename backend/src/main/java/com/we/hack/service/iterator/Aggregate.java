package com.we.hack.service.iterator;

public interface Aggregate<T> {
    Iterator<T> createIterator();
}
