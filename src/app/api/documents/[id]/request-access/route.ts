import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, UnauthorizedError, NotFoundError } from "@/lib/utils/errors";
import { sendAccessRequestEmail } from "@/lib/utils/email";
import { isValidUuid } from "@/lib/utils/sanitize";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    if (!isValidUuid(id)) {
      return Response.json({ error: { message: "Invalid ID" } }, { status: 400 });
    }

    // Bypass DocumentService access checks to find the owner's email
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, id),
      with: {
        owner: { columns: { id: true, name: true, email: true } },
      },
    });

    if (!doc || doc.isDeleted) {
      throw new NotFoundError("Document not found");
    }

    // Send email to owner
    await sendAccessRequestEmail(
      doc.owner.email,
      doc.title,
      session.user.name || "A user",
      session.user.email,
      id
    );

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
