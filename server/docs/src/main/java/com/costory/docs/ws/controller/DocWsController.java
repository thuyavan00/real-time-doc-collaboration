package com.costory.docs.ws.controller;

import com.costory.docs.service.DocumentService;
import com.costory.docs.ws.dto.ClientOp;
import com.costory.docs.ws.dto.ServerOp;
import java.security.Principal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class DocWsController {

    private final DocumentService service;
    private final SimpMessagingTemplate messaging;

    @MessageMapping("/doc/{docId}/op")
    public void onOp(@DestinationVariable UUID docId, ClientOp clientOp, Principal principal) {
        String user = principal != null ? principal.getName() : "anonymous";
        ServerOp result = service.accept(docId, user, clientOp);
        messaging.convertAndSend("/topic/doc/" + docId, result);
    }
}
