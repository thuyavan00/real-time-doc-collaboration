package com.costory.docs.service;

import com.costory.docs.dto.DocumentResponse;
import com.costory.docs.entity.DocumentEntity;
import com.costory.docs.entity.DocumentOpEntity;
import com.costory.docs.ot.OtText;
import com.costory.docs.repository.DocumentOpRepository;
import com.costory.docs.repository.DocumentRepository;
import com.costory.docs.ws.dto.ClientOp;
import com.costory.docs.ws.dto.ServerOp;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository docRepo;
    private final DocumentOpRepository opRepo;
    private final ObjectMapper om;  // auto-configured by Spring Boot
    private final AppConfig config;

    @Transactional
    public DocumentEntity create(String title) {
        var doc = new DocumentEntity();
        doc.setTitle(title == null || title.isBlank() ? "Untitled" : title.trim());
        return docRepo.save(doc);
    }

    @Transactional(readOnly = true)
    public DocumentResponse get(UUID id) {
        var doc = docRepo.findById(id).orElseThrow();
        return new DocumentResponse(doc.getId(), doc.getTitle(), doc.getVersion(), doc.getContentSnapshot());
    }

    /** Accept an op, transform if needed, apply, persist, and return broadcast payload. */
    @Transactional
    public ServerOp accept(UUID docId, String author, ClientOp incoming) {
        var doc = docRepo.findById(docId).orElseThrow();

        if (incoming.getBaseVersion() > doc.getVersion())
            throw new MessagingException("Client baseVersion ahead of server");

        // Transform against ops since client's baseVersion
        List<DocumentOpEntity> after = opRepo.findByDocAndBaseVersionGreaterThanOrderByIdAsc(doc, incoming.getBaseVersion());
        ClientOp transformed = incoming;
        for (var e : after) {
            try {
                var accepted = om.readValue(e.getOpJson(), ClientOp.class);
                transformed = OtText.transformAgainst(transformed, accepted);
            } catch (Exception ex) {
                throw new MessagingException("Bad stored op", ex);
            }
        }

        // Apply to snapshot
        String current = doc.getContentSnapshot() == null ? "" : doc.getContentSnapshot();
        String updated = OtText.apply(current, transformed);

        // Persist op
        try {
            String json = om.writeValueAsString(transformed);
            var op = new DocumentOpEntity();
            op.setDoc(doc);
            op.setBaseVersion(doc.getVersion());
            op.setOpJson(json);
            op.setAuthor(author == null ? "anonymous" : author);
            opRepo.save(op);
        } catch (Exception ex) {
            throw new MessagingException("Could not serialize op", ex);
        }

        // Bump version & maybe snapshot
        long newVersion = doc.getVersion() + 1;
        doc.setVersion(newVersion);
        doc.setUpdatedAt(Instant.now());

        long every = config.snapshotEvery();
        if (every <= 1 || (newVersion - doc.getSnapshotVersion()) >= every) {
            doc.setContentSnapshot(updated);
            doc.setSnapshotVersion(newVersion);
        }
        // save doc
        docRepo.save(doc);

        return new ServerOp(newVersion, transformed, author == null ? "anonymous" : author, Instant.now());
    }

    /** tiny config shim */
    @org.springframework.stereotype.Component
    public static class AppConfig {
        @org.springframework.beans.factory.annotation.Value("${app.snapshotEvery:50}")
        private long snapshotEvery;
        public long snapshotEvery(){ return snapshotEvery; }
    }
}
