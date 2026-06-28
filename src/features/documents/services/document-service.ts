import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  documents,
  documentCollaborators,
  users,
  type DocumentRole,
} from "@/lib/db/schema";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "@/lib/utils/errors";

/**
 * Document Service — business logic for document CRUD and access control.
 * All methods enforce tenant isolation by requiring userId.
 */
export class DocumentService {
  /**
   * Get all documents accessible to a user (owned + collaborated).
   */
  static async getDocumentsForUser(userId: string) {
    const ownedDocs = await db.query.documents.findMany({
      where: and(eq(documents.ownerId, userId), eq(documents.isDeleted, false)),
      orderBy: desc(documents.updatedAt),
      with: {
        owner: { columns: { id: true, name: true, email: true, avatarUrl: true } },
        collaborators: {
          with: {
            user: { columns: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    const collabDocs = await db.query.documentCollaborators.findMany({
      where: eq(documentCollaborators.userId, userId),
      with: {
        document: {
          with: {
            owner: { columns: { id: true, name: true, email: true, avatarUrl: true } },
            collaborators: {
              with: {
                user: { columns: { id: true, name: true, email: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    const collabDocuments = collabDocs
      .filter((c) => c.document && !c.document.isDeleted)
      .map((c) => c.document);

    // Merge and deduplicate
    const allDocs = [...ownedDocs, ...collabDocuments];
    const seen = new Set<string>();
    return allDocs.filter((doc) => {
      if (seen.has(doc.id)) return false;
      seen.add(doc.id);
      return true;
    });
  }

  /**
   * Get a single document by ID with access check.
   */
  static async getDocument(documentId: string, userId: string) {
    const doc = await db.query.documents.findFirst({
      where: and(eq(documents.id, documentId), eq(documents.isDeleted, false)),
      with: {
        owner: { columns: { id: true, name: true, email: true, avatarUrl: true } },
        collaborators: {
          with: {
            user: { columns: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!doc) throw new NotFoundError("Document not found");

    // Check access: must be owner or collaborator
    const hasAccess =
      doc.ownerId === userId ||
      doc.collaborators.some((c) => c.userId === userId);

    if (!hasAccess) throw new ForbiddenError("You do not have access to this document");

    // Determine user's role
    const role: DocumentRole =
      doc.ownerId === userId
        ? "owner"
        : (doc.collaborators.find((c) => c.userId === userId)?.role as DocumentRole) || "viewer";

    return { ...doc, currentUserRole: role };
  }

  /**
   * Create a new document.
   */
  static async createDocument(title: string, userId: string) {
    const [doc] = await db
      .insert(documents)
      .values({ title, ownerId: userId })
      .returning();

    // Also add owner as collaborator for uniform access patterns
    await db.insert(documentCollaborators).values({
      documentId: doc.id,
      userId,
      role: "owner",
      acceptedAt: new Date(),
    });

    return doc;
  }

  /**
   * Update document metadata (title, etc.).
   * Only owners and editors can update.
   */
  static async updateDocument(
    documentId: string,
    userId: string,
    data: { title?: string; contentPreview?: string }
  ) {
    await this.assertRole(documentId, userId, ["owner", "editor"]);

    const [updated] = await db
      .update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, documentId))
      .returning();

    return updated;
  }

  /**
   * Soft-delete a document. Only the owner can delete.
   */
  static async deleteDocument(documentId: string, userId: string) {
    await this.assertRole(documentId, userId, ["owner"]);

    await db
      .update(documents)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(documents.id, documentId));
  }

  /**
   * Add a collaborator to a document.
   */
  static async addCollaborator(
    documentId: string,
    userId: string,
    targetEmail: string,
    role: "editor" | "viewer"
  ) {
    await this.assertRole(documentId, userId, ["owner"]);

    // Find the target user
    const targetUser = await db.query.users.findFirst({
      where: eq(users.email, targetEmail.toLowerCase()),
    });

    if (!targetUser) throw new NotFoundError("User not found with that email");

    // Check if already a collaborator
    const existing = await db.query.documentCollaborators.findFirst({
      where: and(
        eq(documentCollaborators.documentId, documentId),
        eq(documentCollaborators.userId, targetUser.id)
      ),
    });

    if (existing) throw new ConflictError("User is already a collaborator");

    const [collab] = await db
      .insert(documentCollaborators)
      .values({
        documentId,
        userId: targetUser.id,
        role,
        acceptedAt: new Date(),
      })
      .returning();

    return collab;
  }

  /**
   * Remove a collaborator from a document.
   */
  static async removeCollaborator(
    documentId: string,
    userId: string,
    collaboratorId: string
  ) {
    await this.assertRole(documentId, userId, ["owner"]);

    // Cannot remove the owner collaborator entry
    const collab = await db.query.documentCollaborators.findFirst({
      where: eq(documentCollaborators.id, collaboratorId),
    });

    if (!collab) throw new NotFoundError("Collaborator not found");
    if (collab.role === "owner") throw new ForbiddenError("Cannot remove the document owner");

    await db
      .delete(documentCollaborators)
      .where(eq(documentCollaborators.id, collaboratorId));
  }

  /**
   * Update a collaborator's role.
   */
  static async updateCollaboratorRole(
    documentId: string,
    userId: string,
    collaboratorId: string,
    newRole: "editor" | "viewer"
  ) {
    await this.assertRole(documentId, userId, ["owner"]);

    const collab = await db.query.documentCollaborators.findFirst({
      where: eq(documentCollaborators.id, collaboratorId),
    });

    if (!collab) throw new NotFoundError("Collaborator not found");
    if (collab.role === "owner") throw new ForbiddenError("Cannot change the owner's role");

    const [updated] = await db
      .update(documentCollaborators)
      .set({ role: newRole })
      .where(eq(documentCollaborators.id, collaboratorId))
      .returning();

    return updated;
  }

  /**
   * Get the user's role for a document.
   */
  static async getUserRole(
    documentId: string,
    userId: string
  ): Promise<DocumentRole | null> {
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });

    if (!doc) return null;
    if (doc.ownerId === userId) return "owner";

    const collab = await db.query.documentCollaborators.findFirst({
      where: and(
        eq(documentCollaborators.documentId, documentId),
        eq(documentCollaborators.userId, userId)
      ),
    });

    return (collab?.role as DocumentRole) || null;
  }

  /**
   * Assert the user has one of the required roles.
   * Throws ForbiddenError if not.
   */
  private static async assertRole(
    documentId: string,
    userId: string,
    allowedRoles: DocumentRole[]
  ) {
    const role = await this.getUserRole(documentId, userId);
    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenError("You do not have permission to perform this action");
    }
  }
}
