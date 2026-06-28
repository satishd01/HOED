import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { DocumentService } from "@/features/documents/services/document-service";
import { createDocumentSchema } from "@/features/documents/validators/document-schema";
import { handleApiError, UnauthorizedError } from "@/lib/utils/errors";

/**
 * GET /api/documents — List all documents for the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const docs = await DocumentService.getDocumentsForUser(session.user.id);
    return Response.json({ documents: docs });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/documents — Create a new document.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await req.json();
    const parsed = createDocumentSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return Response.json(
        { error: { message: firstIssue?.message || "Validation failed", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const doc = await DocumentService.createDocument(
      parsed.data.title,
      session.user.id
    );

    return Response.json({ document: doc }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
