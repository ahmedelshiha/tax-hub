import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/api-wrapper";
import { requireTenantContext } from "@/lib/tenant-utils";
import { respond } from "@/lib/api-response";
import { entityApprovalService } from "@/services/entities/entity-approval.service";

/**
 * GET /api/admin/entities/pending
 * Fetch pending entity approvals for admin dashboard
 */
export const GET = withAdminAuth(
    async (request: NextRequest, { params }: any) => {
        try {
            const { tenantId } = requireTenantContext();

            const { searchParams } = new URL(request.url);
            const country = searchParams.get("country");
            const limit = parseInt(searchParams.get("limit") || "50");
            const offset = parseInt(searchParams.get("offset") || "0");

            const result = await entityApprovalService.getPendingApprovals(
                tenantId as string,
                {
                    limit,
                    offset,
                    country: country || undefined,
                }
            );

            return respond.ok(result);
        } catch (error) {
            console.error("Error fetching pending approvals:", error);
            return respond.serverError();
        }
    },
    { requireAuth: true }
);
