# Real-Time Document Collaboration

A backend service for collaborative document editing, built with **Spring Boot**, **WebSockets (STOMP)**, and **PostgreSQL**.  
This project will power a Google Docs–style editor with real-time updates, operational transforms (OT), presence, and version control.

---
LINUX test
## 📂 Project Structure

```
real-time-doc-collaboration/
│
├── server/                     # Backend source
│   └── src/main/java/com/costory/docs/
│       ├── DocsApplication.java
│       ├── config/             # WebSocket, CORS, interceptors
│       ├── controller/         # REST controllers (health, documents)
│       ├── entity/             # JPA entities (Document, DocumentOp)
│       ├── repository/         # Spring Data JPA repositories
│       ├── service/            # Document + OT service layer
│       └── ws/
│           ├── controller/     # WebSocket controllers
│           └── dto/            # WebSocket DTOs (ClientOp, ServerOp, etc.)
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL running locally (`costory_docs` database)
- (Optional) Node.js for frontend later

### 2. Setup Database
```sql
CREATE DATABASE costory_docs;
```

### 3. Configure Application
Edit `server/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/costory_docs
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

### 4. Run the backend
```bash
cd server
./mvnw spring-boot:run
```
Server will start on `http://localhost:8090`.

---

## 🧪 Testing

### Health checks
```bash
curl http://localhost:8090/api/health
curl http://localhost:8090/api/version
```

### Document API
- Create a document:
```bash
curl -X POST http://localhost:8090/api/docs   -H "Content-Type: application/json"   -d '{"title":"My Test Doc"}'
```
- Fetch a document:
```bash
curl http://localhost:8090/api/docs/<UUID>
```

### WebSocket (Docs)
1. Open `http://localhost:8090/doc-test.html`
2. Paste a document UUID
3. Click **Connect** → subscribes to `/topic/doc/{id}`
4. Click **Send Insert Op** → sends to `/app/doc/{id}/op`
5. See server broadcasts (`ServerOp`) instantly

---

## 📡 WebSocket Endpoints

- **Connect:** `/ws` (SockJS enabled)  
- **App Prefix:** `/app` (client → server)  
- **Topic Prefix:** `/topic` (server → client)  

Examples:
- Send op: `/app/doc/{id}/op`
- Subscribe: `/topic/doc/{id}`

---

## 🛠 Tech Stack
- **Spring Boot 3**
- **Spring WebSocket + STOMP**
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**
- **Maven**

---

## 📅 Roadmap
- [x] Hello WebSocket test (Week 1)
- [x] Document entity + persistence (Week 2)
- [x] OT backbone (plain text, Week 2)
- [ ] Presence (user cursors, typing indicators, Week 3)
- [ ] Frontend integration (React + editor, Week 3)
- [ ] JWT auth + ACL (Week 4)
- [ ] Redis broker for scaling (Week 4)
- [ ] Deployment (Render/Heroku/AWS, Week 4)

---

## 📝 License
MIT License
