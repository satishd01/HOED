import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth/auth";
import { DocumentService } from "@/features/documents/services/document-service";
import { handleApiError, UnauthorizedError, ForbiddenError } from "@/lib/utils/errors";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/documents/[id]/collaboration-token
 * Issues a short-lived JWT for the collaboration websocket.
 */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id } = await params;
    const role = await DocumentService.getUserRole(id, session.user.id);
    if (!role) throw new ForbiddenError("You do not have access to this document");

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      throw new Error("AUTH_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: session.user.id,
        documentId: id,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );

    return Response.json({
      token,
      role,
      readOnly: role === "viewer",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
