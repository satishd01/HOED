# SyncScribe (House of EdTech)

SyncScribe is a highly scalable, local-first real-time collaborative document editor built for the modern web.

## Architecture

This project is divided into two main components:
1. **Next.js Web Application**: Serves the frontend UI, API routes, authentication (NextAuth), and interacts with the PostgreSQL database using Drizzle ORM.
2. **Hocuspocus WebSocket Server**: A standalone Node.js process that handles Yjs CRDT synchronization across clients, providing true real-time collaboration with offline support.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Auth.js (NextAuth v5)
- **Editor**: Tiptap Editor + Yjs + Hocuspocus
- **Styling**: Tailwind CSS + CSS Modules
- **AI Integration**: Vercel AI SDK (Google Gemini)

## Development Setup

1. **Environment Variables**:
   Copy `.env.example` to `.env.local` and configure your credentials.

2. **Database Setup**:
   You can run a local PostgreSQL instance or use the provided `docker-compose.yml`.
   ```bash
   # Run the database using Docker
   docker-compose up -d db
   
   # Push the schema to the database
   npm run db:push
   ```

3. **Start the Application**:
   During development, you need both the Next.js app and the WebSocket server running. We provide a single script to run both concurrently:
   ```bash
   npm run dev:full
   ```
   Or run them separately:
   ```bash
   npm run dev      # Starts Next.js on port 3000
   npm run server   # Starts Hocuspocus on port 1234
   ```

## Production Deployment

For production, it is recommended to deploy the Next.js application on Vercel or a similar edge network, and deploy the WebSocket server (`server/index.ts`) as a long-running Docker container alongside your PostgreSQL database.

A `docker-compose.yml` and `Dockerfile.server` are included to easily spin up the backend infrastructure:

```bash
docker-compose up -d --build
```
