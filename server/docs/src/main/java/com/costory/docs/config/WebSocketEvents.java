package com.costory.docs.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.*;

@Slf4j
@Component
public class WebSocketEvents {

    @EventListener
    public void onConnect(SessionConnectEvent e) {
        log.info("WS CONNECT session={}", StompHeaderAccessor.wrap(e.getMessage()).getSessionId());
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent e) {
        log.info("WS DISCONNECT session={} reason={}", e.getSessionId(), e.getCloseStatus());
        // If you map session -> (docId, userId), remove & broadcast here.
    }
}
