import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  customType,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Custom type for bytea columns (Yjs binary state)
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

// ─── USERS ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ownedDocuments: many(documents),
  collaborations: many(documentCollaborators),
  createdVersions: many(documentVersions),
}));

// ─── DOCUMENTS ──────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default("Untitled Document"),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  yjsState: bytea("yjs_state"), // Encoded Y.Doc state (binary)
  contentPreview: text("content_preview"), // Plain text for search/display
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, {
    fields: [documents.ownerId],
    references: [users.id],
  }),
  collaborators: many(documentCollaborators),
  versions: many(documentVersions),
}));

// ─── DOCUMENT COLLABORATORS ─────────────────────────────────────────────────

export type DocumentRole = "owner" | "editor" | "viewer";

export const documentCollaborators = pgTable(
  "document_collaborators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<DocumentRole>().notNull().default("viewer"),
    invitedAt: timestamp("invited_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("unique_document_user").on(table.documentId, table.userId),
  ]
);

export const documentCollaboratorsRelations = relations(
  documentCollaborators,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentCollaborators.documentId],
      references: [documents.id],
    }),
    user: one(users, {
      fields: [documentCollaborators.userId],
      references: [users.id],
    }),
  })
);

// ─── DOCUMENT VERSIONS (Snapshots) ──────────────────────────────────────────

export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  label: text("label").notNull().default("Snapshot"),
  yjsSnapshot: bytea("yjs_snapshot").notNull(), // Full binary Y.Doc state
  contentPreview: text("content_preview"), // Plain text preview
  contentHtml: text("content_html"), // HTML preview for rendering
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentVersionsRelations = relations(
  documentVersions,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentVersions.documentId],
      references: [documents.id],
    }),
    creator: one(users, {
      fields: [documentVersions.createdBy],
      references: [users.id],
    }),
  })
);

// ─── TYPE EXPORTS ───────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentCollaborator = typeof documentCollaborators.$inferSelect;
export type NewDocumentCollaborator = typeof documentCollaborators.$inferInsert;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type NewDocumentVersion = typeof documentVersions.$inferInsert;
