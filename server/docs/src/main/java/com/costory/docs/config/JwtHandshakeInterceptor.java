package com.costory.docs.config;

import com.costory.docs.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.*;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

/**
 * Reads the auth_token cookie during the HTTP WebSocket upgrade handshake and
 * puts the authenticated username into WebSocket session attributes so that
 * ConnectUserInterceptor can set it as the STOMP principal.
 */
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            Cookie[] cookies = servletRequest.getServletRequest().getCookies();
            if (cookies != null) {
                for (Cookie c : cookies) {
                    if ("auth_token".equals(c.getName())) {
                        String username = jwtService.extractUsername(c.getValue());
                        if (username != null) {
                            attributes.put("username", username);
                        }
                        break;
                    }
                }
            }
        }
        return true; // always allow upgrade; auth is enforced at the STOMP level
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {}
}
