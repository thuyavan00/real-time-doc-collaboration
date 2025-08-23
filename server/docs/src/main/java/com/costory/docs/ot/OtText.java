package com.costory.docs.ot;

import com.costory.docs.ws.dto.ClientOp;
import java.util.ArrayList;
import java.util.List;

/** Minimal OT for retain/insert/delete on plain text. */
public final class OtText {

    /** Apply op to text. */
    public static String apply(String text, ClientOp op) {
        StringBuilder out = new StringBuilder();
        int idx = 0;
        for (ClientOp.Span s : op.getOps()) {
            switch (s.getAction()) {
                case "retain" -> {
                    int n = s.getCount();
                    out.append(text, idx, Math.min(idx + n, text.length()));
                    idx += n;
                }
                case "insert" -> out.append(s.getText());
                case "delete" -> {
                    int n = s.getCount();
                    idx += n; // skip n chars
                }
                default -> throw new IllegalArgumentException("Unknown action: " + s.getAction());
            }
        }
        // append any tail (if retains undershot)
        if (idx < text.length()) out.append(text.substring(idx));
        return out.toString();
    }

    /** Transform opA against opB (B already accepted). Very minimal, happy path. */
    public static ClientOp transformAgainst(ClientOp a, ClientOp b) {
        List<ClientOp.Span> out = new ArrayList<>();
        var itA = new Cursor(a.getOps());
        var itB = new Cursor(b.getOps());

        while (itA.has() || itB.has()) {
            var sB = itB.peek();

            // if B inserts, A must be shifted right -> keep A as-is but consume B insert by emitting an equivalent retain shift
            if (sB != null && "insert".equals(sB.getAction())) {
                // shift A's coordinate space
                out.add(span("retain", sB.getText().length(), null));
                itB.next();
                continue;
            }

            var sA = itA.peek();

            if (sA == null) break;

            switch (sA.getAction()) {
                case "insert" -> { out.add(sA); itA.next(); }
                case "retain" -> {
                    int need = sA.getCount();
                    int eatenByDeletes = 0;

                    // eat deletes from B while we retain
                    while (need > 0 && itB.has() && "delete".equals(itB.peek().getAction())) {
                        int d = Math.min(need, itB.peek().getCount());
                        eatenByDeletes += d;
                        itB.consume(d);
                        need -= d;
                    }
                    // after deletes, the remaining retains
                    if (need > 0) out.add(span("retain", need, null));
                    itA.consume(sA.getCount());
                }
                case "delete" -> {
                    // deletes remain deletes (they delete at A's positions)
                    out.add(sA);
                    itA.next();
                }
                default -> throw new IllegalArgumentException("Unknown A: " + sA.getAction());
            }
        }

        ClientOp r = new ClientOp();
        r.setType(a.getType());
        r.setBaseVersion(a.getBaseVersion());
        r.setClientId(a.getClientId());
        r.setOps(out);
        return r;
    }

    /* helpers */
    private static ClientOp.Span span(String action, Integer count, String text) {
        var s = new ClientOp.Span();
        s.setAction(action);
        s.setCount(count);
        s.setText(text);
        return s;
    }

    private static final class Cursor {
        final List<ClientOp.Span> list; int i=0; int carry=0;
        Cursor(List<ClientOp.Span> list){this.list=list;}
        boolean has(){return i<list.size();}
        ClientOp.Span peek(){return has()? list.get(i): null;}
        void next(){i++; carry=0;}
        void consume(int n){
            var s = list.get(i);
            int left = (s.getCount()!=null? s.getCount(): (s.getText()!=null? s.getText().length():0)) - carry - n;
            if (left==0){ next(); }
            else { carry += n; s.setCount(carry < 0 ? null : s.getCount()); } // minimal; enough for our use
        }
    }
}
