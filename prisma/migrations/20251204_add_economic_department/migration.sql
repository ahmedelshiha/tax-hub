-- Business Setup Database Schema Enhancements
-- Version: 1.0
-- Date: 2025-12-04
-- Description: Add economicDepartment field and PENDING_VERIFICATION status

-- ============================================================================
-- Add new status to EntityStatus enum
-- ============================================================================

ALTER TYPE "EntityStatus" ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';

-- ============================================================================
-- Add economicDepartment column to Entity table
-- ============================================================================

ALTER TABLE "Entity" 
ADD COLUMN IF NOT EXISTS "economicDepartment" TEXT;

-- ============================================================================
-- Add economicDepartmentId for optional foreign key relationship
-- ============================================================================

ALTER TABLE "Entity"
ADD COLUMN IF NOT EXISTS "economicDepartmentId" TEXT;

-- ============================================================================
-- Create EconomicDepartment reference table (optional but recommended)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "EconomicDepartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "category" TEXT NOT NULL, -- 'free_zone', 'mainland', 'offshore'
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================================================
-- Create index for faster lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS "EconomicDepartment_country_idx" ON "EconomicDepartment"("country");
CREATE INDEX IF NOT EXISTS "Entity_economicDepartment_idx" ON "Entity"("economicDepartment");
CREATE INDEX IF NOT EXISTS "Entity_status_idx" ON "Entity"("status");

-- ============================================================================
-- Add foreign key constraint (optional)
-- ============================================================================

-- Uncomment if you want referential integrity
-- ALTER TABLE "Entity"
-- ADD CONSTRAINT "Entity_economicDepartmentId_fkey"
-- FOREIGN KEY ("economicDepartmentId") REFERENCES "EconomicDepartment"("id")
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- Seed UAE Economic Departments (basic set)
-- ============================================================================

INSERT INTO "EconomicDepartment" ("id", "name", "country", "category", "updatedAt")
VALUES
    ('ada

fps-fz', 'Abu Dhabi Airports Free Zone', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('adgm', 'Abu Dhabi Global Market', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('adgm-fsra', 'ADGM Financial Services', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('ajman-fz', 'Ajman Free Zone', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('ajman-media-fz', 'Ajman Media City Free Zone', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('dafz', 'Dubai Airport Free Zone', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('dafza', 'Dubai Auto Zone', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('dfsa', 'Dubai Financial Services Authority', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('difc', 'Dubai International Financial Centre', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('dmcc', 'Dubai Multi Commodities Centre', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('dso', 'Dubai Silicon Oasis', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('dtec', 'Dubai Technology Entrepreneur Campus', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('jafza', 'Jebel Ali Free Zone', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('shams', 'Sharjah Media City (Shams)', 'AE', 'free_zone', CURRENT_TIMESTAMP),
    ('rakez', 'Ras Al Khaimah Economic Zone', 'AE', 'free_zone', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- Add audit log for entity creation (optional but recommended)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "EntitySetupAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL, -- 'CREATED', 'UPDATED', 'VERIFIED', 'REJECTED'
    "requestData" JSONB,
    "responseData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "EntitySetupAuditLog_entityId_idx" ON "EntitySetupAuditLog"("entityId");
CREATE INDEX IF NOT EXISTS "EntitySetupAuditLog_userId_idx" ON "EntitySetupAuditLog"("userId");
CREATE INDEX IF NOT EXISTS "EntitySetupAuditLog_createdAt_idx" ON "EntitySetupAuditLog"("createdAt");

-- ============================================================================
-- Migration complete
-- ============================================================================
