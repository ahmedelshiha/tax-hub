import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/api-wrapper";
import { requireTenantContext } from "@/lib/tenant-utils";
import { respond } from "@/lib/api-response";
import { entityApprovalService } from "@/services/entities/entity-approval.service";

/**
 * GET /api/admin/stats/entities
 * Get entity approval statistics for admin dashboard
 */
export const GET = withAdminAuth(
    async (request: NextRequest, { params }: any) => {
        try {
            const { tenantId } = requireTenantContext();

            const stats = await entityApprovalService.getApprovalStats(tenantId as string);

            return respond.ok(stats);
        } catch (error) {
            console.error("Error fetching approval stats:", error);
            return respond.serverError();
        }
    },
    { requireAuth: true }
);
