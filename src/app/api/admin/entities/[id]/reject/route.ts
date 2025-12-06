import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/api-wrapper";
import { requireTenantContext } from "@/lib/tenant-utils";
import { respond } from "@/lib/api-response";
import { entityApprovalService } from "@/services/entities/entity-approval.service";
import { z } from "zod";

const rejectSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
    notes: z.string().optional(),
});

/**
 * POST /api/admin/entities/[id]/reject
 * Reject an entity by ID
 */
export const POST = withAdminAuth(
    async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        try {
            const { userId, tenantId } = requireTenantContext();
            const { id: entityId } = await params;

            if (!entityId) {
                return respond.badRequest("Entity ID is required");
            }

            const body = await request.json();
            const validated = rejectSchema.parse(body);

            const approval = await entityApprovalService.rejectEntity(
                entityId,
                userId as string,
                validated.reason,
                tenantId as string,
                { note: validated.notes }
            );

            return respond.ok({
                success: true,
                message: "Entity rejected",
                approval,
            });
        } catch (error) {
            console.error("Error rejecting entity:", error);

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
