package com.costory.docs.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StompLoggingInterceptor implements ChannelInterceptor {
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        var accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;
        var cmd = accessor.getCommand();
        if (cmd == StompCommand.CONNECT)  log.info("WS CONNECT");
        if (cmd == StompCommand.SUBSCRIBE) log.info("WS SUBSCRIBE dest={}", accessor.getDestination());
        if (cmd == StompCommand.SEND)      log.info("WS SEND dest={}", accessor.getDestination());
        if (cmd == StompCommand.DISCONNECT)log.info("WS DISCONNECT");
        return message;
    }
}