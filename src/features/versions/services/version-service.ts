import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { documentVersions } from "@/lib/db/schema";
import { NotFoundError, ForbiddenError } from "@/lib/utils/errors";
import { DocumentService } from "@/features/documents/services/document-service";

/**
 * Version Service — manages document snapshots for time-travel functionality.
 * Snapshots store full Yjs binary state so documents can be restored
 * deterministically without corrupting the CRDT state.
 */
export class VersionService {
  /**
   * Get all versions for a document, ordered by creation time (newest first).
   */
  static async getVersions(documentId: string, userId: string) {
    // Verify access
    const role = await DocumentService.getUserRole(documentId, userId);
    if (!role) throw new ForbiddenError("You do not have access to this document");

    const versions = await db.query.documentVersions.findMany({
      where: eq(documentVersions.documentId, documentId),
      orderBy: desc(documentVersions.createdAt),
      with: {
        creator: {
          columns: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return versions;
  }

  /**
   * Create a new version snapshot.
   * Captures the current Yjs state from the database.
   */
  static async createVersion(
    documentId: string,
    userId: string,
    label: string,
    yjsSnapshot: Buffer,
    contentPreview?: string,
    contentHtml?: string
  ) {
    // Must be owner or editor to create snapshots
    const role = await DocumentService.getUserRole(documentId, userId);
    if (!role || role === "viewer") {
      throw new ForbiddenError("Viewers cannot create version snapshots");
    }

    // Calculate next version number
    const lastVersion = await db.query.documentVersions.findFirst({
      where: eq(documentVersions.documentId, documentId),
      orderBy: desc(documentVersions.versionNumber),
    });

    const versionNumber = (lastVersion?.versionNumber || 0) + 1;

    const [version] = await db
      .insert(documentVersions)
      .values({
        documentId,
        createdBy: userId,
        versionNumber,
        label,
        yjsSnapshot,
        contentPreview,
        contentHtml,
      })
      .returning();

    return version;
  }

  /**
   * Get a single version by ID.
   */
  static async getVersion(
    documentId: string,
    versionId: string,
    userId: string
  ) {
    const role = await DocumentService.getUserRole(documentId, userId);
    if (!role) throw new ForbiddenError("You do not have access to this document");

    const version = await db.query.documentVersions.findFirst({
      where: and(
        eq(documentVersions.id, versionId),
        eq(documentVersions.documentId, documentId)
      ),
      with: {
        creator: {
          columns: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!version) throw new NotFoundError("Version not found");

    return version;
  }

  /**
   * Restore a document to a previous version.
   *
   * IMPORTANT: This does NOT replace the Y.Doc state directly.
   * Instead, we store the snapshot state in the database and
   * the client applies it as a new set of CRDT operations.
   * This preserves the CRDT invariant for all connected clients.
   */
  static async getRestoreData(
    documentId: string,
    versionId: string,
    userId: string
  ) {
    // Must be owner or editor to restore
    const role = await DocumentService.getUserRole(documentId, userId);
    if (!role || role === "viewer") {
      throw new ForbiddenError("Viewers cannot restore versions");
    }

    const version = await this.getVersion(documentId, versionId, userId);

    // Return the binary snapshot for the client to apply as CRDT operations
    return {
      versionId: version.id,
      versionNumber: version.versionNumber,
      label: version.label,
      yjsSnapshot: version.yjsSnapshot,
    };
  }
}
