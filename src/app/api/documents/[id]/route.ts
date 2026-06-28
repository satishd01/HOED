import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { DocumentService } from "@/features/documents/services/document-service";
import { updateDocumentSchema } from "@/features/documents/validators/document-schema";
import { handleApiError, UnauthorizedError, ValidationError } from "@/lib/utils/errors";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limiter";
import { isValidUuid, sanitizeTitle } from "@/lib/utils/sanitize";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/documents/[id] — Get a single document.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    if (!isValidUuid(id)) throw new ValidationError("Invalid document ID");

    const doc = await DocumentService.getDocument(id, session.user.id);
    return Response.json({ document: doc });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/documents/[id] — Update document metadata.
 * Rate limited: 60/min per IP. Title is sanitized (HTML stripped).
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(`patch-doc:${ip}`, 60, 60_000);
    if (!allowed) {
      return Response.json(
        { error: { message: "Too many requests. Please slow down.", code: "RATE_LIMITED" } },
        { status: 429 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    if (!isValidUuid(id)) throw new ValidationError("Invalid document ID");

    const body = await req.json();

    // Sanitize title: strip HTML and truncate
    if (body.title && typeof body.title === "string") {
      body.title = sanitizeTitle(body.title);
    }

    const parsed = updateDocumentSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return Response.json(
        { error: { message: firstIssue?.message || "Validation failed", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const doc = await DocumentService.updateDocument(id, session.user.id, parsed.data);
    return Response.json({ document: doc });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/documents/[id] — Soft-delete a document.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    if (!isValidUuid(id)) throw new ValidationError("Invalid document ID");

    await DocumentService.deleteDocument(id, session.user.id);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
