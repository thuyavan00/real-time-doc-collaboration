package com.costory.docs.controller;

import com.costory.docs.dto.DocumentCreateRequest;
import com.costory.docs.dto.DocumentResponse;
import com.costory.docs.service.DocumentService;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/docs")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService service;

    @GetMapping
    public List<DocumentResponse> list() {
        return service.list();
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody DocumentCreateRequest req) {
        var doc = service.create(req.getTitle());
        return Map.of("id", doc.getId(), "title", doc.getTitle(), "version", doc.getVersion());
    }

    @GetMapping("/{id}")
    public DocumentResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PatchMapping("/{id}")
    public DocumentResponse rename(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return service.rename(id, body.get("title"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
