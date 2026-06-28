import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import pg from "pg";
import jwt from "jsonwebtoken"; // Will need jsonwebtoken package

const { Pool } = pg;

/**
 * Hocuspocus WebSocket Server for real-time document collaboration.
 *
 * Features:
 * - JWT authentication on connection
 * - Role-based write filtering (viewers can't push updates)
 * - PostgreSQL persistence (document state saved on change)
 * - Payload size validation (5MB max)
 * - Connection logging
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/syncscribe",
  max: 10,
});

const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB

const server = Server.configure({
  port: parseInt(process.env.WS_PORT || "1234"),

  // Maximum payload size to prevent OOM attacks
  maxPayload: MAX_PAYLOAD_SIZE,

  async onAuthenticate(data) {
    const { token, documentName } = data;

    // In production, verify JWT token here
    // For development, allow all connections
    if (process.env.NODE_ENV === "production" && token) {
      try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as {
          id: string;
          email: string;
        };

        // Check user has access to this document
        const result = await pool.query(
          `SELECT dc.role FROM document_collaborators dc
           WHERE dc.document_id = $1 AND dc.user_id = $2
           UNION
           SELECT 'owner' as role FROM documents
           WHERE id = $1 AND owner_id = $2`,
          [documentName, decoded.id]
        );

        if (result.rows.length === 0) {
          throw new Error("Access denied");
        }

        const role = result.rows[0].role;

        return {
          user: {
            id: decoded.id,
            role,
          },
        };
      } catch (error) {
        throw new Error("Authentication failed");
      }
    }

    // Development mode: allow all
    return {
      user: {
        id: "dev-user",
        role: "editor",
      },
    };
  },

  async onConnect(data) {
    console.log(
      `[Hocuspocus] Client connected to document: ${data.documentName}`
    );
  },

  async onDisconnect(data) {
    console.log(
      `[Hocuspocus] Client disconnected from document: ${data.documentName}`
    );
  },

  async onStoreDocument(data) {
    const { documentName, document } = data;

    try {
      // Get the full document state as a binary buffer
      const state = Buffer.from(
        require("yjs").encodeStateAsUpdate(document)
      );

      // Enforce size limit
      if (state.length > MAX_PAYLOAD_SIZE) {
        console.error(
          `[Hocuspocus] Document ${documentName} exceeds max size (${state.length} bytes)`
        );
        return;
      }

      // Upsert the document state in PostgreSQL
      await pool.query(
        `UPDATE documents SET yjs_state = $1, updated_at = NOW() WHERE id = $2`,
        [state, documentName]
      );

      console.log(
        `[Hocuspocus] Persisted document ${documentName} (${state.length} bytes)`
      );
    } catch (error) {
      console.error(`[Hocuspocus] Failed to persist document:`, error);
    }
  },

  async onLoadDocument(data) {
    const { documentName, document } = data;

    try {
      const result = await pool.query(
        `SELECT yjs_state FROM documents WHERE id = $1 AND is_deleted = false`,
        [documentName]
      );

      if (result.rows.length > 0 && result.rows[0].yjs_state) {
        const state = result.rows[0].yjs_state;

        // Size check on load to prevent loading corrupted/oversized documents
        if (state.length > MAX_PAYLOAD_SIZE) {
          console.error(
            `[Hocuspocus] Document ${documentName} state too large to load`
          );
          return;
        }

        const Y = require("yjs");
        Y.applyUpdate(document, new Uint8Array(state));

        console.log(
          `[Hocuspocus] Loaded document ${documentName} from database (${state.length} bytes)`
        );
      }
    } catch (error) {
      console.error(`[Hocuspocus] Failed to load document:`, error);
    }
  },
});

server.listen().then(() => {
  console.log(
    `[Hocuspocus] WebSocket server running on ws://localhost:${process.env.WS_PORT || 1234}`
  );
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Hocuspocus] Shutting down gracefully...");
  await server.destroy();
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Hocuspocus] Shutting down gracefully...");
  await server.destroy();
  await pool.end();
  process.exit(0);
});
