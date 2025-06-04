package com.we.hack.service.iterator;

import java.util.List;

public class ListIterator <T> implements Iterator<T> {
    private final List<T> items;
    private int cursor;

    public ListIterator(List<T> items) {
        this.items = items;
    }

    @Override
    public boolean hasNext() {
        return cursor < items.size();
    }

    @Override
    public T next() {
        return items.get(cursor++);
    }
}
