package com.costory.docs.ws.controller;

import com.costory.docs.service.PresenceService;
import com.costory.docs.ws.dto.CursorMessage;
import com.costory.docs.ws.dto.PresenceMessage;
import java.security.Principal;
import java.time.Instant;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class PresenceWsController {

    private final PresenceService presence;
    private final SimpMessagingTemplate messaging;

    // client -> /app/doc/{docId}/presence   {type: "join" | "ping" | "leave", display?}
    @MessageMapping("/doc/{docId}/presence")
    public void presence(@DestinationVariable UUID docId, PresenceMessage msg, Principal principal) {
        String user = principal != null ? principal.getName() : "anonymous";
        msg.setUserId(user);
        msg.setTs(Instant.now());

        switch (msg.getType()) {
            case "join" -> {
                var all = presence.join(docId, user, msg.getDisplay());
                // Broadcast the full roster (simple approach for MVP)
                Map<String, Object> payload = new HashMap<>();
                payload.put("type", "roster");
                payload.put("users", all.stream().map(p -> Map.of(
                        "userId", p.userId,
                        "display", p.display,
                        "color", p.color
                )).toList());
                payload.put("ts", Instant.now().toString());
                messaging.convertAndSend("/topic/doc/" + docId + "/presence", payload);
            }
            case "ping" -> {
                presence.touch(docId, user);
                // optional: broadcast lightweight heartbeat if you want; usually not needed
            }
            case "leave" -> {
                presence.leave(docId, user);
                Map<String, Object> payload = Map.of(
                        "type", "left",
                        "userId", user,
                        "ts", Instant.now().toString()
                );
                messaging.convertAndSend("/topic/doc/" + docId + "/presence", payload);
            }
            default -> {}
        }
    }

    // client -> /app/doc/{docId}/cursor   {pos, selFrom?, selTo?}
    @MessageMapping("/doc/{docId}/cursor")
    public void cursor(@DestinationVariable UUID docId, CursorMessage msg, Principal principal) {
        String user = principal != null ? principal.getName() : "anonymous";
        msg.setUserId(user);
        msg.setTs(Instant.now());
        if (!CursorThrottle.allow(docId, user, 40)) return;
        messaging.convertAndSend("/topic/doc/" + docId + "/cursor", msg);
    }

    // Idle eviction every 30s (TTL 60s)
    @Scheduled(fixedRate = 30_000)
    public void evictIdle() {
        // If you track active docIds elsewhere, iterate those. For MVP, skip or wire a small registry.
        // Example (pseudo): for each docId in presence rooms -> presence.evictIdle(docId, Duration.ofSeconds(60)) & broadcast "left".
    }
}
