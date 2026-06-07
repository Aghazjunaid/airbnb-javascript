# Design Real-Time Collaborative Editor (Google Docs)

---

# 1. Functional Requirements

## Core Features

- Create document
- Edit document in real time
- Multiple users can edit simultaneously
- Cursor presence
- User presence
- Version history
- Auto save
- Conflict resolution
- Recover previous versions

---

# 2. Non Functional Requirements

## Scale

- Millions of documents
- Millions of concurrent users

## Availability

- 99.99%

## Latency

- <100ms update propagation

## Durability

- No data loss

## Consistency

- All users eventually see same document state

---

# 3. Core Entities

## User

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP
);
```

---

## Document

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    owner_id UUID,
    title VARCHAR(255),
    current_version BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Document Collaborator

```sql
CREATE TABLE document_collaborators (
    id UUID PRIMARY KEY,
    document_id UUID,
    user_id UUID,
    role VARCHAR(20)
);
```

role:

```text
OWNER
EDITOR
VIEWER
```

---

## Document Version

```sql
CREATE TABLE document_versions (
    id UUID PRIMARY KEY,
    document_id UUID,
    version_number BIGINT,
    snapshot_url TEXT,
    created_at TIMESTAMP
);
```

---

## Operations Log

```sql
CREATE TABLE document_operations (
    id UUID PRIMARY KEY,
    document_id UUID,
    user_id UUID,
    version BIGINT,
    operation_type VARCHAR(20),
    position INT,
    content TEXT,
    created_at TIMESTAMP
);
```

---

# 4. APIs

## Create Document

```http
POST /v1/docs
```

Request

```json
{
  "title":"System Design Notes"
}
```

Response

```json
{
  "documentId":"123"
}
```

---

## Get Document

```http
GET /v1/docs/:id
```

---

## Share Document

```http
POST /v1/docs/:id/share
```

---

## Get Versions

```http
GET /v1/docs/:id/versions
```

---

## Restore Version

```http
POST /v1/docs/:id/restore
```

---

# 5. WebSocket Events

## Join Document

```json
{
  "event":"JOIN_DOC",
  "documentId":"123"
}
```

---

## Leave Document

```json
{
  "event":"LEAVE_DOC",
  "documentId":"123"
}
```

---

## Edit

```json
{
  "event":"EDIT",
  "documentId":"123",
  "version":101,
  "operation":"INSERT",
  "position":20,
  "value":"A"
}
```

---

## Cursor Update

```json
{
  "event":"CURSOR",
  "position":50
}
```

---

# 6. High Level Design

```text
               Load Balancer
                      |
                      |
      -----------------------------------
      |                                 |
      |                                 |
 Metadata Service               Editor Service
      |                                 |
      |                                 |
 PostgreSQL                        Redis
      |                                 |
      |                                 |
      -------- Kafka -------- S3 --------
```

---

# 7. Document Open Flow

User opens document

```text
GET /document/123
```

Metadata Service:

```sql
SELECT *
FROM documents
WHERE id='123';
```

Returns:

```text
snapshot_url
latest_version
```

---

Client loads snapshot from S3.

Then:

```text
JOIN_DOC
```

through WebSocket.

---

# 8. Why Redis?

Document editing needs:

```text
Sub-ms reads
Active users
Current state
Current version
```

Redis stores:

```text
Current document state
Current version
Participants
Cursor positions
```

---

Example:

Key

```text
doc:123
```

Value

```json
{
  "content":"Hello World",
  "version":102
}
```

---

# 9. Why Kafka?

Never directly save every keystroke to DB.

Imagine:

```text
10,000 users
10 keys/sec
```

= 100,000 writes/sec

DB dies.

---

Instead:

```text
Editor Service
      |
      |
    Kafka
      |
      |
Consumers
      |
      |
 PostgreSQL
```

---

Benefits:

```text
Buffering
Durability
Replay
Scalability
```

---

# 10. Snapshot Strategy

Never store entire document on every key press.

Bad:

```text
Version1
Version2
Version3
Version4
```

Huge storage.

---

Instead:

Store operations.

```text
Insert A
Insert B
Delete C
```

---

Periodically:

```text
Every 100 operations
```

create snapshot.

Store:

```text
S3
```

Example:

```text
s3://docs/123/version100.json
```

---

# 11. WebSocket Registry

Definition:

```text
Database stores data.

WebSocket Registry stores connections.
```

---

Purpose:

```text
User -> Socket
Socket -> User
Document -> Users
Room -> Connections
```

---

# User Mapping

Redis

Key

```text
ws:user:101
```

Value

```json
{
  "socketId":"abc123",
  "serverId":"ws-1"
}
```

---

# Socket Mapping

```text
ws:socket:abc123
```

```json
{
  "userId":"101",
  "serverId":"ws-1"
}
```

---

# Document Mapping

```text
doc:123
```

```json
[
  "socket1",
  "socket2",
  "socket3"
]
```

Meaning:

```text
User A
User B
User C
```

are editing same document.

---

# 12. Multi Server Problem

Suppose:

```text
WS-1
WS-2
WS-3
```

User A connected to:

```text
WS-1
```

User B:

```text
WS-2
```

User C:

```text
WS-3
```

All editing same document.

Question:

```text
How does WS-1 notify WS-2 and WS-3?
```

---

Solution:

Redis Pub/Sub

or

Kafka

---

# Broadcast Flow

```text
User A
   |
Insert X
   |
WS-1
   |
Redis Publish
   |
-------------------------
|           |           |
WS-1       WS-2       WS-3
```

All servers receive update.

---

# 13. Operational Transformation (OT)

Used by:

```text
Google Docs
```

---

Initial

```text
ABC
```

User A:

```text
Insert X at position 1
```

User B:

```text
Insert Y at position 1
```

---

Without OT

```text
AXBC
AYBC
```

Conflict.

---

With OT

Transform second operation.

```text
ABC
 ↓
AXBC
 ↓
AXYBC
```

All users see:

```text
AXYBC
```

---

Interview Answer:

```text
OT transforms incoming operations against already
applied operations before merging them.
```

---

# 14. CRDT

Used by:

```text
Figma
Yjs
Automerge
```

---

Each character gets unique ID.

Example:

```text
A(id1)
B(id2)
C(id3)
```

User A inserts:

```text
X(id100)
```

User B inserts:

```text
Y(id200)
```

---

System automatically determines ordering.

Final:

```text
AXYBC
```

or

```text
AYXBC
```

but every replica converges to same state.

---

# 15. OT vs CRDT

| Feature | OT | CRDT |
|----------|---------|---------|
| Google Docs | Yes | No |
| Figma | No | Yes |
| Central Server | Required | Optional |
| Offline Editing | Limited | Excellent |
| Memory Usage | Low | High |
| Complexity | High | Medium |

---

# 16. Interview Questions

## How do you support multiple users editing same document?

Answer:

- WebSockets
- Redis document state
- OT/CRDT conflict resolution
- Kafka for durability
- S3 snapshots

---

## Why not save directly to DB?

Answer:

Millions of writes.

Use:

```text
Redis
Kafka
Batch persistence
```

---

## Why Kafka?

Answer:

```text
Durability
Replay
Scaling
Backpressure
```

---

## Why Redis?

Answer:

```text
Low latency
Current state
Active users
Presence
```

---

## How do you know which users should receive updates?

Answer:

WebSocket Registry.

```text
documentId -> socketIds
```

Lookup active connections and broadcast.

---

## How do you scale WebSockets?

Answer:

```text
Multiple WS servers
Redis Registry
Redis Pub/Sub
Kafka
```

---

## How do you recover after crash?

Answer:

```text
Load snapshot from S3
Replay Kafka operations
Restore latest state
```
