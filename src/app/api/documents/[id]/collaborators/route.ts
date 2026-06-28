import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { DocumentService } from "@/features/documents/services/document-service";
import { addCollaboratorSchema } from "@/features/documents/validators/document-schema";
import { handleApiError, UnauthorizedError } from "@/lib/utils/errors";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/documents/[id]/collaborators — Add a collaborator.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    const body = await req.json();
    const parsed = addCollaboratorSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return Response.json(
        { error: { message: firstIssue?.message || "Validation failed", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const collab = await DocumentService.addCollaborator(
      id,
      session.user.id,
      parsed.data.email,
      parsed.data.role
    );

    return Response.json({ collaborator: collab }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/documents/[id]/collaborators — Remove a collaborator.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const collaboratorId = searchParams.get("collaboratorId");

    if (!collaboratorId) {
      return Response.json(
        { error: { message: "collaboratorId is required", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    await DocumentService.removeCollaborator(id, session.user.id, collaboratorId);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
