package com.costory.docs.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "document_ops")
public class DocumentOpEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_id")
    private DocumentEntity doc;

    @Column(nullable = false)
    private long baseVersion;

    @Lob
    @Column(nullable = false)   // store JSON as text for simplicity
    private String opJson;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
