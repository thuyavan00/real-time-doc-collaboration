package com.costory.docs.ws.dto;

import java.time.Instant;
import lombok.*;

@Getter @AllArgsConstructor
public class ServerOp {
    private long newVersion;
    private ClientOp op;     // transformed op that got applied
    private String author;
    private Instant ts;
}
