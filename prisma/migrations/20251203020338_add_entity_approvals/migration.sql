-- CreateEnum
CREATE TYPE "EntityApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES');

-- CreateTable
CREATE TABLE "entity_approvals" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "status" "EntityApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "entity_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "threadId" TEXT,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" VARCHAR(255),
    "body" TEXT NOT NULL,
    "attachments" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "readAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entity_approvals_entityId_key" ON "entity_approvals"("entityId");

-- CreateIndex
CREATE INDEX "entity_approvals_status_submittedAt_idx" ON "entity_approvals"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "entity_approvals_reviewedBy_idx" ON "entity_approvals"("reviewedBy");

-- CreateIndex
CREATE INDEX "entity_approvals_requestedBy_idx" ON "entity_approvals"("requestedBy");

-- CreateIndex
CREATE INDEX "messages_tenantId_recipientId_status_idx" ON "messages"("tenantId", "recipientId", "status");

-- CreateIndex
CREATE INDEX "messages_threadId_idx" ON "messages"("threadId");

-- CreateIndex
CREATE INDEX "messages_tenantId_createdAt_idx" ON "messages"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_tenantId_senderId_idx" ON "messages"("tenantId", "senderId");

-- CreateIndex
CREATE INDEX "Attachment_uploaderId_idx" ON "Attachment"("uploaderId");

-- CreateIndex
CREATE INDEX "Attachment_entityId_idx" ON "Attachment"("entityId");

-- CreateIndex
CREATE INDEX "DocumentVersion_uploaderId_idx" ON "DocumentVersion"("uploaderId");

-- CreateIndex
CREATE INDEX "ServiceRequest_assignedBy_idx" ON "ServiceRequest"("assignedBy");

-- CreateIndex
CREATE INDEX "TaskComment_authorId_idx" ON "TaskComment"("authorId");

-- CreateIndex
CREATE INDEX "TaskComment_parentId_idx" ON "TaskComment"("parentId");

-- CreateIndex
CREATE INDEX "WorkOrder_serviceId_idx" ON "WorkOrder"("serviceId");

-- CreateIndex
CREATE INDEX "WorkOrder_serviceRequestId_idx" ON "WorkOrder"("serviceRequestId");

-- CreateIndex
CREATE INDEX "WorkOrder_bookingId_idx" ON "WorkOrder"("bookingId");

-- CreateIndex
CREATE INDEX "approvals_requesterId_idx" ON "approvals"("requesterId");

-- CreateIndex
CREATE INDEX "approvals_decisionBy_idx" ON "approvals"("decisionBy");

-- CreateIndex
CREATE INDEX "bulk_operation_history_changedBy_idx" ON "bulk_operation_history"("changedBy");

-- CreateIndex
CREATE INDEX "bulk_operations_approvedBy_idx" ON "bulk_operations"("approvedBy");

-- CreateIndex
CREATE INDEX "entities_createdBy_idx" ON "entities"("createdBy");

-- CreateIndex
CREATE INDEX "entities_updatedBy_idx" ON "entities"("updatedBy");

-- CreateIndex
CREATE INDEX "entities_parentEntityId_idx" ON "entities"("parentEntityId");

-- CreateIndex
CREATE INDEX "entity_licenses_economicZoneId_idx" ON "entity_licenses"("economicZoneId");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- AddForeignKey
ALTER TABLE "entity_approvals" ADD CONSTRAINT "entity_approvals_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_approvals" ADD CONSTRAINT "entity_approvals_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_approvals" ADD CONSTRAINT "entity_approvals_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
