import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/api-wrapper";
import { requireTenantContext } from "@/lib/tenant-utils";
import { respond } from "@/lib/api-response";
import { entityApprovalService } from "@/services/entities/entity-approval.service";
import { z } from "zod";

const approveSchema = z.object({
    entityId: z.string(),
    note: z.string().optional(),
});

const rejectSchema = z.object({
    entityId: z.string(),
    reason: z.string().min(1, "Reason is required"),
    note: z.string().optional(),
});

/**
 * POST /api/admin/entities/approve
 * Approve, reject, or request changes for entity submissions
 */
export const POST = withAdminAuth(
    async (request: NextRequest, { params }: any) => {
        try {
            const { userId, tenantId } = requireTenantContext();

            const body = await request.json();
            const action = body.action; // "approve" | "reject" | "request_changes"

            if (action === "approve") {
                const validated = approveSchema.parse(body);
                const approval = await entityApprovalService.approveEntity(
                    validated.entityId,
                    userId as string,
                    tenantId as string,
                    { note: validated.note }
                );

                return respond.ok({
                    success: true,
                    approval,
                });
            } else if (action === "reject") {
                const validated = rejectSchema.parse(body);
                const approval = await entityApprovalService.rejectEntity(
                    validated.entityId,
                    userId as string,
                    validated.reason,
                    tenantId as string,
                    { note: validated.note }
                );

                return respond.ok({
                    success: true,
                    approval,
                });
            } else if (action === "request_changes") {
                const validated = rejectSchema.parse(body);
                const approval = await entityApprovalService.requestChanges(
                    validated.entityId,
                    userId as string,
                    validated.reason,
                    tenantId as string,
                    { note: validated.note }
                );

                return respond.ok({
                    success: true,
                    approval,
                });
            } else {
                return respond.badRequest("Invalid action");
            }
        } catch (error) {
            console.error("Error processing approval action:", error);

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
