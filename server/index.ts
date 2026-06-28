import {
  Server,
  onAuthenticatePayload,
  onConnectPayload,
  onDisconnectPayload,
  onStoreDocumentPayload,
  onLoadDocumentPayload,
} from "@hocuspocus/server";
import { Pool } from "pg";
import * as jwt from "jsonwebtoken";
import * as Y from "yjs";

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
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/syncforge",
  max: 10,
});

const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB

const server = new Server({
  port: parseInt(process.env.WS_PORT || "1234"),

  async onAuthenticate(
    data: onAuthenticatePayload,
    setContext?: (context: Record<string, unknown>) => void
  ) {
    const { token, documentName } = data;

    try {
      const secret = process.env.AUTH_SECRET;
      if (!secret) {
        throw new Error("AUTH_SECRET is not configured");
      }

      const decoded = jwt.verify(token, secret) as {
        userId: string;
        documentId: string;
      };

      if (!decoded?.userId || !decoded?.documentId || decoded.documentId !== documentName) {
        throw new Error("Access denied");
      }

      const result = await pool.query(
        `SELECT role FROM (
          SELECT 'owner'::text AS role
          FROM documents
          WHERE id = $1 AND owner_id = $2 AND is_deleted = false
          UNION
          SELECT dc.role
          FROM document_collaborators dc
          WHERE dc.document_id = $1 AND dc.user_id = $2
        ) access
        LIMIT 1`,
        [documentName, decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error("Access denied");
      }

      const role = result.rows[0].role as "owner" | "editor" | "viewer";

      data.connectionConfig.readOnly = role === "viewer";
      data.connectionConfig.isAuthenticated = true;
      setContext?.({
        userId: decoded.userId,
        documentId: decoded.documentId,
        role,
      });
    } catch {
      throw new Error("Authentication failed");
    }
  },

  async onConnect(data: onConnectPayload) {
    console.log(
      `[Hocuspocus] Client connected to document: ${data.documentName}`
    );
  },

  async onDisconnect(data: onDisconnectPayload) {
    console.log(
      `[Hocuspocus] Client disconnected from document: ${data.documentName}`
    );
  },

  async onStoreDocument(data: onStoreDocumentPayload) {
    const { documentName, document } = data;

    try {
      // Get the full document state as a binary buffer
      const state = Buffer.from(Y.encodeStateAsUpdate(document));

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

  async onLoadDocument(data: onLoadDocumentPayload) {
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
