import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { VersionService } from "@/features/versions/services/version-service";
import { handleApiError, UnauthorizedError, ValidationError } from "@/lib/utils/errors";
import { isValidUuid } from "@/lib/utils/sanitize";

type RouteParams = { params: Promise<{ id: string; versionId: string }> };

/**
 * GET /api/documents/[id]/versions/[versionId] — Get a single version snapshot, including binary state.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { id, versionId } = await params;
    if (!isValidUuid(id) || !isValidUuid(versionId)) {
      throw new ValidationError("Invalid document or version ID");
    }

    const version = await VersionService.getVersion(id, versionId, session.user.id);

    // Convert Buffer to base64 for JSON serialization
    const yjsSnapshotBase64 = version.yjsSnapshot ? version.yjsSnapshot.toString("base64") : null;

    return Response.json({
      version: {
        ...version,
        yjsSnapshot: yjsSnapshotBase64,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
