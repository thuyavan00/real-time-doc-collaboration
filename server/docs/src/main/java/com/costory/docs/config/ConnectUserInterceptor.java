package com.costory.docs.config;

import java.security.Principal;
import java.util.UUID;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
public class ConnectUserInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        var accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && accessor.getCommand() == StompCommand.CONNECT) {
            String userId = accessor.getFirstNativeHeader("x-user-id");
            if (userId == null || userId.isBlank()) {
                // fallback to a per-connection random id to ensure uniqueness
                userId = "anon-" + UUID.randomUUID();
            }
            accessor.setUser(new SimplePrincipal(userId));
        }
        return message;
    }

    private static class SimplePrincipal implements Principal {
        private final String name;
        public SimplePrincipal(String name) { this.name = name; }
        @Override public String getName() { return name; }
    }
}