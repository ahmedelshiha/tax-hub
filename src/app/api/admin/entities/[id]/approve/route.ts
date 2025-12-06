import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/api-wrapper";
import { requireTenantContext } from "@/lib/tenant-utils";
import { respond } from "@/lib/api-response";
import { entityApprovalService } from "@/services/entities/entity-approval.service";
import { z } from "zod";

const approveSchema = z.object({
    notes: z.string().optional(),
});

/**
 * POST /api/admin/entities/[id]/approve
 * Approve an entity by ID
 */
export const POST = withAdminAuth(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        try {
            const { userId, tenantId } = requireTenantContext();
            const { id: entityId } = await params;

            if (!entityId) {
                return respond.badRequest("Entity ID is required");
            }

            const body = await request.json().catch(() => ({}));
            const validated = approveSchema.parse(body);

            const approval = await entityApprovalService.approveEntity(
                entityId,
                userId as string,
                tenantId as string,
                { note: validated.notes }
            );

            return respond.ok({
                success: true,
                message: "Entity approved successfully",
                approval,
            });
        } catch (error) {
            console.error("Error approving entity:", error);

            if (error instanceof z.ZodError) {
                return respond.badRequest(
                    "Validation error: " + error.errors.map((e) => e.message).join(", ")
                );
            }

            if (error instanceof Error) {
                return respond.badRequest(error.message);
            }

            return respond.serverError();
        }
    },
    { requireAuth: true }
);
