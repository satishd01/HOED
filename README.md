# SyncScribe — Local-First Collaborative Document Editor

> A production-grade collaborative document editor built on **Yjs CRDTs**, **Hocuspocus**, and **Next.js 16** — works fully offline, resolves conflicts deterministically, and never loses your work.

[![CI](https://github.com/your-username/houseofedtech/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/houseofedtech/actions)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Local-First** | All edits write to IndexedDB first. Zero network requests block the UI. |
| **CRDT Sync** | Yjs CRDT algorithm merges offline edits deterministically — no data loss, ever. |
| **Real-Time Collaboration** | Multiple users edit simultaneously via Hocuspocus WebSocket server. |
| **Version History** | Capture Yjs state snapshots; restore any past version without breaking collaborators. |
| **AI Writing Assistant** | Gemini-powered summarize, continue, improve, translate, and brainstorm. |
| **Role-Based Access** | Owner / Editor / Viewer roles enforced at both API and WebSocket level. |
| **Offline Banner** | Visual indicator when offline; auto-syncs edits on reconnect. |
| **Security Hardened** | JWT auth, rate limiting, payload size caps, UUID validation, HTML sanitization. |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              TipTap Editor (React)                      │    │
│  │  ┌─────────────────┐    ┌──────────────────────────┐   │    │
│  │  │   Yjs Y.Doc     │←──→│  IndexedDB Persistence   │   │    │
│  │  │  (CRDT state)   │    │  (offline primary store)  │   │    │
│  │  └────────┬────────┘    └──────────────────────────┘   │    │
│  │           │ Yjs binary update diffs                     │    │
│  └───────────┼─────────────────────────────────────────────┘    │
│              │                                                    │
└──────────────┼────────────────────────────────────────────────────┘
               │ WebSocket (Hocuspocus protocol)
               ▼
┌──────────────────────────────────────────────────────────────────┐
│           Hocuspocus WebSocket Server (Railway/Fly.io)           │
│                                                                  │
│  • JWT authentication before any document state is shared        │
│  • Role-based readOnly enforcement (viewers can't push updates)  │
│  • 5MB hard cap on incoming payloads                             │
│  • Broadcasts Yjs updates to all connected clients               │
│  • Persists merged state to PostgreSQL on every change           │
└─────────────────────────────┬────────────────────────────────────┘
                              │ SQL (pg driver)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                             │
│                                                                  │
│  users • documents • document_collaborators • document_versions  │
│                                                                  │
│  • documents.yjs_state: binary Yjs state (bytea)                 │
│  • document_versions.yjs_snapshot: point-in-time Yjs state       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔀 How Conflict Resolution Works (Yjs CRDT)

SyncScribe uses **Yjs**, which implements the **YATA (Yet Another Transformation Approach)** CRDT algorithm.

### Why CRDTs beat Operational Transforms (OT)
- **No central server required for merge** — any two Yjs documents can merge without a coordinator
- **Commutative**: `merge(A, B) = merge(B, A)` — order doesn't matter
- **Idempotent**: applying the same update twice produces the same result
- **No tombstone explosion**: Yjs compresses deleted elements efficiently

### The Algorithm
Every character insertion in Yjs carries:
1. **Client ID** — globally unique per browser session (UUID)
2. **Lamport clock** — logical timestamp ensuring causal ordering
3. **Left/Right neighbor references** — determines insertion position

When two users type in the same position simultaneously:
- Both operations are deterministically ordered by `(client_id, clock)` pair
- The merge is **always identical** on every client — no "last write wins" ambiguity

### Offline Sync Flow
```
User goes offline → types 500 characters → all ops stored in IndexedDB Y.Doc
User reconnects → HocuspocusProvider sends binary state diff (only the delta)
Server applies Y.applyUpdate() → merges with any concurrent server edits
Result: no data loss, deterministic ordering, all clients converge
```

---

## 🔐 Security Model

### How we prevent OOM attacks

| Layer | Defense |
|---|---|
| **WebSocket Auth** | JWT must authenticate before any document state is shared |
| **Payload cap (WS)** | `onStoreDocument`: 5MB hard limit, payload rejected silently |
| **Payload cap (REST)** | Version snapshots: 4MB limit validated before decoding base64 |
| **Rate limiting** | 60 req/min on most routes, 20/min on snapshot creation |
| **UUID validation** | All route params validated as UUID v4 before DB queries |
| **HTML sanitization** | Document titles stripped of HTML before storage |
| **ORM query scoping** | Every Drizzle query is scoped to the authenticated user's ID |
| **Role enforcement** | Viewers set to `readOnly=true` at WebSocket protocol level |

### Row-Level Security via ORM
All database queries are scoped at the application layer:
```typescript
// Every document query requires the user to be owner OR collaborator
WHERE documents.owner_id = $userId
   OR document_collaborators.user_id = $userId
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- A PostgreSQL database (Supabase recommended)

### Setup

```bash
git clone https://github.com/your-username/houseofedtech
cd houseofedtech
npm install
```

### Environment Variables

Create `.env.local`:

```env
# Supabase PostgreSQL (Transaction Pooler, port 6543)
DATABASE_URL=postgresql://postgres.[project-ref]:%40YourPassword@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# NextAuth
AUTH_SECRET=your-random-secret-min-32-chars
AUTH_URL=http://localhost:3000

# WebSocket server URL
NEXT_PUBLIC_WS_URL=ws://localhost:1234

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Password note**: If your DB password contains `@`, encode it as `%40` in the URL.

### Push database schema
```bash
npm run db:push
```

### Run the app (two terminals)

**Terminal 1 — Next.js:**
```bash
npm run dev
```

**Terminal 2 — Hocuspocus WebSocket server:**
```bash
npm run server
```

Or run both together:
```bash
npm run dev:full
```

Visit `http://localhost:3000`

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Editor | TipTap v3 + Yjs (CRDT) |
| Real-time | Hocuspocus WebSocket server |
| Offline store | IndexedDB via y-indexeddb |
| Database | PostgreSQL (Supabase) via Drizzle ORM |
| Auth | NextAuth.js v5 (credentials + JWT) |
| AI | Google Gemini via @ai-sdk/google |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel (Next.js) + Railway (WS server) |

---

## 📋 API Reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/documents` | List user's documents |
| `POST` | `/api/documents` | Create new document |
| `GET` | `/api/documents/[id]` | Get document with role |
| `PATCH` | `/api/documents/[id]` | Update title |
| `DELETE` | `/api/documents/[id]` | Soft-delete document |
| `POST` | `/api/documents/[id]/collaborators` | Add collaborator |
| `DELETE` | `/api/documents/[id]/collaborators` | Remove collaborator |
| `GET` | `/api/documents/[id]/versions` | List version snapshots |
| `POST` | `/api/documents/[id]/versions` | Create snapshot |
| `GET` | `/api/documents/[id]/versions/[vId]/restore` | Get restore data |
| `POST` | `/api/documents/[id]/collaboration-token` | Issue JWT for WS |
| `POST` | `/api/ai` | Stream AI response (Gemini) |

---

## 🏭 Deployment

### Next.js → Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables
4. Deploy

### Hocuspocus Server → Railway
1. Create new Railway project
2. Connect GitHub repo
3. Set start command: `npx tsx server/index.ts`
4. Add env vars: `DATABASE_URL`, `AUTH_SECRET`, `WS_PORT=1234`
5. Update `NEXT_PUBLIC_WS_URL` in Vercel to the Railway WebSocket URL

---

## 🤔 Design Decisions

### Why not Firestore / Liveblocks / PartyKit?
SyncScribe owns the entire collaboration stack — the Yjs CRDT algorithm, the WebSocket server, the persistence layer. This enables:
- Custom JWT auth with role-based readOnly at protocol level
- No third-party dependency for real-time state
- Full control over payload validation and OOM prevention

### Why IndexedDB over localStorage?
- **Binary support**: Yjs state is `Uint8Array`, localStorage only handles strings
- **50MB+ quota** vs localStorage's 5MB
- **Asynchronous**: never blocks the main thread during rapid typing
- **Survives tab close** and hard refresh

### Why Supabase connection pooler (port 6543)?
Next.js serverless functions spin up many short-lived connections. Direct PostgreSQL (port 5432) would exhaust the connection limit. Port 6543 (PgBouncer transaction pooler) efficiently multiplexes many serverless invocations over a small pool of persistent DB connections.
