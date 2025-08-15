package com.costory.docs.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class HealthController {

    @GetMapping("/api/health")
    Map<String, Object> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/api/version")
    Map<String, Object> version() {
        return Map.of(
                "name", "costory-docs",
                "version", "0.0.1",
                "wsEndpoint", "/ws",
                "topicsPrefix", "/topic",
                "appPrefix", "/app"
        );
    }
}