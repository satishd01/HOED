import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { VersionService } from "@/features/versions/services/version-service";
import { createVersionSchema } from "@/features/documents/validators/document-schema";
import { handleApiError, UnauthorizedError, ValidationError } from "@/lib/utils/errors";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/documents/[id]/versions — List all versions for a document.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    const versions = await VersionService.getVersions(id, session.user.id);

    // Strip binary data from list response for efficiency
    const sanitizedVersions = versions.map(({ yjsSnapshot, ...rest }) => rest);
    return Response.json({ versions: sanitizedVersions });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/documents/[id]/versions — Create a new version snapshot.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    const body = await req.json();

    const parsed = createVersionSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return Response.json(
        { error: { message: firstIssue?.message || "Validation failed", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    // The snapshot data comes as a base64-encoded string
    if (!body.yjsSnapshot || typeof body.yjsSnapshot !== "string") {
      throw new ValidationError("yjsSnapshot (base64) is required");
    }

    const snapshotBuffer = Buffer.from(body.yjsSnapshot, "base64");

    // Enforce max payload size (5MB)
    if (snapshotBuffer.length > 5 * 1024 * 1024) {
      throw new ValidationError("Snapshot exceeds maximum size of 5MB");
    }

    const version = await VersionService.createVersion(
      id,
      session.user.id,
      parsed.data.label,
      snapshotBuffer,
      body.contentPreview,
      body.contentHtml
    );

    return Response.json(
      { version: { ...version, yjsSnapshot: undefined } },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
