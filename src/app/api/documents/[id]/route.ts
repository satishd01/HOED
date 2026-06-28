import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { DocumentService } from "@/features/documents/services/document-service";
import { updateDocumentSchema } from "@/features/documents/validators/document-schema";
import { handleApiError, UnauthorizedError } from "@/lib/utils/errors";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/documents/[id] — Get a single document.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    const doc = await DocumentService.getDocument(id, session.user.id);
    return Response.json({ document: doc });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/documents/[id] — Update document metadata.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    const body = await req.json();
    const parsed = updateDocumentSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return Response.json(
        { error: { message: firstIssue?.message || "Validation failed", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const doc = await DocumentService.updateDocument(
      id,
      session.user.id,
      parsed.data
    );

    return Response.json({ document: doc });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/documents/[id] — Soft-delete a document.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    await DocumentService.deleteDocument(id, session.user.id);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
