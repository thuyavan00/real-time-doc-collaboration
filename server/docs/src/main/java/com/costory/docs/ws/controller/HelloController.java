package com.costory.docs.ws.controller;

import java.time.Instant;

import com.costory.docs.ws.dto.HelloMessage;
import com.costory.docs.ws.dto.HelloResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class HelloController {

    private final SimpMessagingTemplate messaging;

    // Client sends to /app/hello
    @MessageMapping("/hello")
    public void onHello(HelloMessage msg) {
        var payload = new HelloResponse("Server received: " + msg.getText(), Instant.now().toEpochMilli());
        // Server broadcasts to /topic/hello
        messaging.convertAndSend("/topic/hello", payload);
    }
}