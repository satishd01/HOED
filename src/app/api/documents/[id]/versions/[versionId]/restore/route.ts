import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { VersionService } from "@/features/versions/services/version-service";
import { handleApiError, UnauthorizedError } from "@/lib/utils/errors";

type RouteParams = { params: Promise<{ id: string; versionId: string }> };

/**
 * GET /api/documents/[id]/versions/[versionId]/restore
 * Returns the binary snapshot so the client can apply it as a new CRDT state.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id, versionId } = await params;
    const restoreData = await VersionService.getRestoreData(id, versionId, session.user.id);

    return Response.json({
      version: {
        ...restoreData,
        yjsSnapshot: Buffer.from(restoreData.yjsSnapshot).toString("base64"),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
