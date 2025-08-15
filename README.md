# Real-Time Document Collaboration

A backend service for collaborative document editing, built with **Spring Boot** and **WebSockets (STOMP)**.  
This project will power a Google Docs–style editor with real-time updates, presence, and version control.

## 📂 Project Structure

```
real-time-doc-collaboration/
│
├── server/                  # Backend source
│   └── src/main/java/com/costory/docs/
│       ├── DocsApplication.java
│       ├── config/          # WebSocket & app config
│       └── ws/
│           ├── controller/  # WebSocket controllers
│           └── dto/         # Message DTOs
│
└── README.md
```

## 🚀 Getting Started

### 1. Prerequisites

- Java 17+
- Maven 3.8+
- (Optional) Node.js for frontend later

### 2. Running the backend

```bash
cd server
./mvnw spring-boot:run
```

Server will start on `http://localhost:8080`.

### 3. Testing WebSockets

Visit:

```
http://localhost:8080/test.html
```

1. Enter a message in the input field.
2. Click **Send**.
3. See the server response instantly in the log area.

### 4. API Endpoints

- `GET /api/health` → Check service status
- `GET /api/version` → Service metadata

### 5. WebSocket Endpoints

- **Connect:** `/ws` (SockJS enabled)
- **App Prefix:** `/app` (messages from client to server)
- **Topic Prefix:** `/topic` (broadcasts from server to clients)

Example:

- Client sends to `/app/hello`
- Server broadcasts to `/topic/hello`

## 🛠 Tech Stack

- **Spring Boot 3**
- **Spring WebSocket + STOMP**
- **SockJS**
- **Lombok**
- **Maven**

## 📅 Roadmap

- [ ] Add Document entity & persistence (PostgreSQL)
- [ ] Implement OT (Operational Transform) for concurrent edits
- [ ] Add presence (user cursors, typing indicators)
- [ ] Authentication & authorization for documents
- [ ] Deployment on cloud (Render/Heroku/AWS)

## 📝 License

MIT License
