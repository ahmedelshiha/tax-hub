# Prisma Schema Update Instructions - Task 0.7

**File**: `prisma/schema.prisma`  
**Lines to Modify**: Around lines 2334-2377 (Entity model) and enum section

---

## Step 1: Add economicDepartment fields to Entity model

**Location**: Line ~2346 (after `parentEntityId`)

```prisma
model Entity {
  id                    String                @id @default(cuid())
  tenantId              String
  country               String                @db.VarChar(2)
  name                  String                @db.VarChar(255)
  legalForm             String?               @db.VarChar(50)
  status                String                @default(\"ACTIVE\") @db.VarChar(20)
  fiscalYearStart       DateTime?
  registrationCertUrl   String?
  registrationCertHash  String?
  activityCode          String?               @db.VarChar(20)
  parentEntityId        String?
  
  // ✨ ADD THESE TWO LINES:
  economicDepartment    String?               @db.VarChar(100)  // NEW: Economic department/free zone
  economicDepartmentId  String?               // NEW: Optional FK to EconomicDepartment table
  
  metadata              Json?
  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt
  createdBy             String
  updatedBy             String?
  
  // ... rest of relations
}
```

---

## Step 2: Add index for economicDepartment

**Location**: Line ~2376 (in Entity model @@index section)

```prisma
  @@unique([tenantId, name])
  @@index([tenantId, country])
  @@index([tenantId, status])
  @@index([economicDepartment])  // ✨ ADD THIS LINE
  @@index([createdAt])
  @@index([tenantId, createdAt])
  @@map(\"entities\")
```

---

## Step 3: Add EconomicDepartment model

**Location**: After Entity model (line ~2377), before EntityLicense

```prisma
model EconomicDepartment {
  id        String   @id
  name      String   @db.VarChar(200)
  country   String   @db.VarChar(2)
  category  String   @db.VarChar(20) // 'free_zone', 'mainland', 'offshore'
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  entities  Entity[] @relation(\"EntityEconomicDepartment\")
  licenses  EntityLicense[]
  
  @@index([country])
  @@index([country, category])
  @@map(\"economic_departments\")
}
```

---

## Step 4: Add relation in Entity model

**Location**: In Entity model relations section (line ~2352)

```prisma
  tenant                Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  creator               User                  @relation(\"EntityCreatedBy\", fields: [createdBy], references: [id])
  updater               User?                 @relation(\"EntityUpdatedBy\", fields: [updatedBy], references: [id])
  economicDept          EconomicDepartment?   @relation(\"EntityEconomicDepartment\", fields: [economicDepartmentId], references: [id])  // ✨ ADD THIS
  parentEntity          Entity?               @relation(\"ParentEntity\", fields: [parentEntityId], references: [id])
```

---

## Step 5: Add PENDING_VERIFICATION status to enum

**Search for**: `enum EntityApprovalStatus` or similar status enum

**Add PENDING_VERIFICATION** to the appropriate enum (if it doesn't exist, it will be added by migration)

---

## Step 6: Add EntitySetupAuditLog model

**Location**: After EconomicDepartment model

```prisma
model EntitySetupAuditLog {
  id           String   @id @default(cuid())
  entityId     String?
  userId       String
  tenantId     String
  action       String   @db.VarChar(50) // 'CREATED', 'UPDATED', 'VERIFIED', 'REJECTED'
  requestData  Json?
  responseData Json?
  ipAddress    String?  @db.VarChar(45)
  userAgent    String?
  createdAt    DateTime @default(now())
  
  // Relations
  user   User   @relation(\"EntitySetupAuditLogs\", fields: [userId], references: [id])
  tenant Tenant @relation(\"EntitySetupAuditLogs\", fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([entityId])
  @@index([userId])
  @@index([tenantId, createdAt])
  @@index([createdAt])
  @@map(\"entity_setup_audit_logs\")
}
```

---

## Step 7: Add relation to User model

**Search for**: `model User {`  
**Add** to User relations section:

```prisma
  entitySetupAuditLogs  EntitySetupAuditLog[] @relation(\"EntitySetupAuditLogs\")
```

---

## Step 8: Add relation to Tenant model

**Search for**: `model Tenant {`  
**Add** to Tenant relations section:

```prisma
  entitySetupAuditLogs  EntitySetupAuditLog[] @relation(\"EntitySetupAuditLogs\")
```

---

## Verification Commands

After making all changes:

```bash
# 1. Format the schema
npx prisma format

# 2.  Check for syntax errors
npx prisma validate

# 3. Create migration
npx prisma migrate dev --name add_economic_department

# 4. Generate Prisma Client
npx prisma generate

# 5. Verify migration worked
npx prisma migrate status
```

---

## Expected Output

After running migration, you should see:
```
✔ Generated Prisma Client
✔ The migration has been created successfully
```

And in generated types, you should have:
- `Entity.economicDepartment?: string | null`
- `Entity.economicDepartmentId?: string | null`
- New `EconomicDepartment` model type
- New `EntitySetupAuditLog` model type

---

## Rollback (if needed)

```bash
npx prisma migrate reset
# Then re-run migrations
```

---

**Note**: Make these changes carefully as the schema.prisma file is 3,485 lines long. Test in development environment first!
