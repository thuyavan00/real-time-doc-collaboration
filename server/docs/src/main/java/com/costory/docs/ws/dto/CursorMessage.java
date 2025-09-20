package com.costory.docs.ws.dto;

import java.time.Instant;
import lombok.Data;

@Data
public class CursorMessage {
    private String userId;         // server fills if missing
    private Integer pos;           // caret index
    private Integer selFrom;       // optional selection start
    private Integer selTo;         // optional selection end
    private Instant ts;            // server time
}