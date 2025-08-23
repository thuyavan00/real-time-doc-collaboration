package com.costory.docs.controller;

import com.costory.docs.dto.DocumentCreateRequest;
import com.costory.docs.dto.DocumentResponse;
import com.costory.docs.service.DocumentService;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/docs")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService service;

    @PostMapping
    public Map<String, Object> create(@RequestBody DocumentCreateRequest req) {
        var doc = service.create(req.getTitle());
        return Map.of("id", doc.getId(), "title", doc.getTitle(), "version", doc.getVersion());
    }

    @GetMapping("/{id}")
    public DocumentResponse get(@PathVariable UUID id) {
        return service.get(id);
    }
}
