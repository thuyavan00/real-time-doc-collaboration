package com.costory.docs.config;

import java.security.Principal;
import java.util.Map;
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
            // Username injected into session attrs by JwtHandshakeInterceptor at HTTP upgrade time
            Map<String, Object> attrs = accessor.getSessionAttributes();
            String username = attrs != null ? (String) attrs.get("username") : null;

            if (username == null || username.isBlank()) {
                throw new org.springframework.messaging.MessagingException("WebSocket connection requires authentication");
            }
            accessor.setUser(new SimplePrincipal(username));
        }
        return message;
    }

    private static class SimplePrincipal implements Principal {
        private final String name;
        SimplePrincipal(String name) { this.name = name; }
        @Override public String getName() { return name; }
    }
}
