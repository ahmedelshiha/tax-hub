-- AlterEnum
ALTER TYPE "EntityApprovalStatus" ADD VALUE 'PENDING_VERIFICATION';

-- AlterTable
ALTER TABLE "entities" ADD COLUMN     "economicDepartment" VARCHAR(100),
ADD COLUMN     "economicDepartmentId" TEXT;

-- AlterTable
ALTER TABLE "entity_licenses" ADD COLUMN     "economicDepartmentId" TEXT;

-- CreateTable
CREATE TABLE "economic_departments" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economic_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_setup_audit_logs" (
    "id" TEXT NOT NULL,
    "entityId" TEXT,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "requestData" JSONB,
    "responseData" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_setup_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "economic_departments_country_idx" ON "economic_departments"("country");

-- CreateIndex
CREATE INDEX "economic_departments_country_category_idx" ON "economic_departments"("country", "category");

-- CreateIndex
CREATE INDEX "entity_setup_audit_logs_entityId_idx" ON "entity_setup_audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "entity_setup_audit_logs_userId_idx" ON "entity_setup_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "entity_setup_audit_logs_tenantId_createdAt_idx" ON "entity_setup_audit_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "entity_setup_audit_logs_createdAt_idx" ON "entity_setup_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "entities_economicDepartment_idx" ON "entities"("economicDepartment");

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_economicDepartmentId_fkey" FOREIGN KEY ("economicDepartmentId") REFERENCES "economic_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_setup_audit_logs" ADD CONSTRAINT "entity_setup_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_setup_audit_logs" ADD CONSTRAINT "entity_setup_audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_licenses" ADD CONSTRAINT "entity_licenses_economicDepartmentId_fkey" FOREIGN KEY ("economicDepartmentId") REFERENCES "economic_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
