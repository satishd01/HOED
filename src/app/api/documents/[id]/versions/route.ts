import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { VersionService } from "@/features/versions/services/version-service";
import { createVersionSchema } from "@/features/documents/validators/document-schema";
import { handleApiError, UnauthorizedError, ValidationError } from "@/lib/utils/errors";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limiter";
import { isValidUuid, validateSnapshotSize } from "@/lib/utils/sanitize";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/documents/[id]/versions — List all versions for a document.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    if (!isValidUuid(id)) throw new ValidationError("Invalid document ID");

    const versions = await VersionService.getVersions(id, session.user.id);

    // Strip binary data from list response — only send previews, not full Yjs state
    const sanitizedVersions = versions.map(({ yjsSnapshot, ...rest }) => rest);
    return Response.json({ versions: sanitizedVersions });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/documents/[id]/versions — Create a new version snapshot.
 *
 * Security measures:
 * - Rate limited: 20 snapshots/min per IP (snapshot creation is expensive)
 * - Snapshot payload capped at 4MB decoded to prevent OOM
 * - UUID param validated
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Rate limit snapshot creation — more restrictive than general API
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(`create-version:${ip}`, 20, 60_000);
    if (!allowed) {
      return Response.json(
        { error: { message: "Too many snapshot requests. Please wait a moment.", code: "RATE_LIMITED" } },
        { status: 429 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    if (!isValidUuid(id)) throw new ValidationError("Invalid document ID");

    const body = await req.json();

    const parsed = createVersionSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return Response.json(
        { error: { message: firstIssue?.message || "Validation failed", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    if (!body.yjsSnapshot || typeof body.yjsSnapshot !== "string") {
      throw new ValidationError("yjsSnapshot (base64) is required");
    }

    // Validate snapshot size BEFORE decoding to prevent OOM
    const { valid, byteSize } = validateSnapshotSize(body.yjsSnapshot);
    if (!valid) {
      throw new ValidationError(
        `Snapshot size (${Math.round(byteSize / 1024)}KB) exceeds the 4MB limit`
      );
    }

    const snapshotBuffer = Buffer.from(body.yjsSnapshot, "base64");

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
