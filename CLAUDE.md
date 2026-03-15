# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time collaborative document editor (Google Docs-style) with:
- **Backend**: Spring Boot 3.5 + STOMP WebSocket + PostgreSQL + JPA
- **Frontend**: React 19 + TypeScript + Vite + `@stomp/stompjs` + SockJS

## Commands

### Backend (from `server/docs/`)
```bash
./mvnw spring-boot:run        # Run server (port 8090)
./mvnw test                   # Run all tests
./mvnw test -Dtest=ClassName  # Run a single test class
./mvnw package -DskipTests    # Build JAR
```

### Frontend (from `client/`)
```bash
npm install       # Install deps
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build (tsc + vite)
npm run lint      # ESLint
```

### Database setup (PostgreSQL required)
```sql
CREATE DATABASE costory_docs;
```
Default credentials in `application.yml`: `postgres` / `root` on port `5432`.

## Architecture

### Real-Time Editing Flow (OT)
1. Client sends `ClientOp` (retain/insert/delete spans) to `/app/doc/{id}/op`
2. `DocWsController` calls `DocumentService.accept()`
3. Server fetches all ops since `clientOp.baseVersion` from `DocumentOpEntity` table
4. `OtText.transformAgainst()` transforms incoming op against each newer accepted op
5. Transformed op is applied to `contentSnapshot`, version bumped, op persisted
6. `ServerOp` (new version + transformed op) broadcast to `/topic/doc/{id}`

### Presence & Cursor
- Client sends join/ping/leave to `/app/doc/{id}/presence` → `PresenceWsController` → `PresenceService` → broadcasts roster to `/topic/doc/{id}/presence`
- Cursor positions sent to `/app/doc/{id}/cursor` → throttled by `CursorThrottle` → broadcast to `/topic/doc/{id}/cursor`

### WebSocket Config
- STOMP endpoint: `/ws` (SockJS enabled)
- App prefix: `/app` (client → server)
- Topic prefix: `/topic` (server → client, simple in-memory broker — swap for Redis to scale)
- `ConnectUserInterceptor` extracts `x-user-id` from STOMP CONNECT headers and sets it as `Principal`
- `StompLoggingInterceptor` logs all inbound STOMP frames

### Snapshotting
Controlled by `app.snapshotEvery` (default 50, currently set to 1 in `application.yml`). The `contentSnapshot` column on `DocumentEntity` is updated every N ops; raw ops in `DocumentOpEntity` are always persisted for OT replay.

### Client
- `client/src/lib/ws.ts`: creates the STOMP client, generates a random `userId` sent as `x-user-id` header
- Vite dev server proxies `/api` and `/ws` to `http://localhost:8090`
- `global: 'window'` and `buffer` alias defined in `vite.config.ts` for SockJS/Buffer compatibility

### Static test pages
The backend serves HTML test pages at:
- `http://localhost:8090/doc-test.html` — WebSocket op testing
- `http://localhost:8090/doc-presence.html` — Presence testing
