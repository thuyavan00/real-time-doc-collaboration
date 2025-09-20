package com.costory.docs.service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import lombok.Getter;
import org.springframework.stereotype.Service;

@Service
public class PresenceService {
    @Getter
    public static class Presence {
        public final String userId;
        public String display;
        public String color;
        public Instant lastSeen = Instant.now();
        public Presence(String userId, String display, String color) {
            this.userId = userId; this.display = display; this.color = color;
        }
    }

    // docId -> userId -> presence
    private final Map<UUID, Map<String, Presence>> rooms = new ConcurrentHashMap<>();

    private static final String[] PALETTE = {
            "#ef4444","#f59e0b","#10b981","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#22c55e"
    };

    public Collection<Presence> join(UUID docId, String userId, String display) {
        var room = rooms.computeIfAbsent(docId, k -> new ConcurrentHashMap<>());
        var pres = room.get(userId);
        if (pres == null) {
            String color = PALETTE[ThreadLocalRandom.current().nextInt(PALETTE.length)];
            pres = new Presence(userId, display != null ? display : userId, color);
            room.put(userId, pres);
        }
        pres.lastSeen = Instant.now();
        return room.values();
    }

    public Optional<Presence> touch(UUID docId, String userId) {
        var room = rooms.get(docId);
        if (room == null) return Optional.empty();
        var p = room.get(userId);
        if (p != null) p.lastSeen = Instant.now();
        return Optional.ofNullable(p);
    }

    public Optional<Presence> leave(UUID docId, String userId) {
        var room = rooms.get(docId);
        if (room == null) return Optional.empty();
        var removed = room.remove(userId);
        if (room.isEmpty()) rooms.remove(docId);
        return Optional.ofNullable(removed);
    }

    public Collection<Presence> list(UUID docId) {
        var room = rooms.get(docId);
        return room != null ? room.values() : List.of();
    }

    /** Evict users idle longer than ttl. Returns list of (userIds) evicted. */
    public List<String> evictIdle(UUID docId, Duration ttl) {
        var room = rooms.get(docId);
        if (room == null) return List.of();
        var now = Instant.now();
        List<String> gone = new ArrayList<>();
        room.values().removeIf(p -> {
            boolean evict = Duration.between(p.lastSeen, now).compareTo(ttl) > 0;
            if (evict) gone.add(p.userId);
            return evict;
        });
        if (room.isEmpty()) rooms.remove(docId);
        return gone;
    }
}
