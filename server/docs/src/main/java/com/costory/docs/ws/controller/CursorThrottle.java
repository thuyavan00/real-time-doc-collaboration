package com.costory.docs.ws.controller;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

final class CursorThrottle {
    private static final Map<String, Instant> last = new ConcurrentHashMap<>();
    static boolean allow(UUID docId, String userId, long minMillis) {
        String key = docId + "|" + userId;
        var now = Instant.now();
        var prev = last.put(key, now);
        return prev == null || (now.toEpochMilli() - prev.toEpochMilli()) >= minMillis;
    }
}
