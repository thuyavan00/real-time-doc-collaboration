package com.costory.docs.ws.dto;

import java.util.List;
import lombok.Data;

@Data
public class ClientOp {
    private String type = "text";     // future-proof
    private List<Span> ops;           // retain/insert/delete
    private long baseVersion;
    private String clientId;

    @Data
    public static class Span {
        private String action;          // "retain" | "insert" | "delete"
        private Integer count;          // for retain/delete
        private String text;            // for insert
    }
}
