package com.costory.docs.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "documents")
public class DocumentEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id = UUID.randomUUID();

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(name = "content_snapshot")
    private String contentSnapshot = "";

    @Column(nullable = false)
    private long version = 0L;

    @Column(name = "snapshot_version")
    private long snapshotVersion = 0L;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
