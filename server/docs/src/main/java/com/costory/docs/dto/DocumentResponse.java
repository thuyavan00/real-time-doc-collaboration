package com.costory.docs.dto;

import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Getter @AllArgsConstructor
public class DocumentResponse {
    private UUID id;
    private String title;
    private long version;
    private String content; // snapshot
    private Instant updatedAt;
    private Instant createdAt;
}
