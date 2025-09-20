package com.costory.docs.ws.dto;

import java.time.Instant;
import lombok.Data;

@Data
public class PresenceMessage {
    // type: "join", "ping", "leave"
    private String type;
    private String userId;     // filled on server from Principal if not provided
    private String display;    // optional display name
    private String color;      // server assigns on join
    private Instant ts;        // server time
}