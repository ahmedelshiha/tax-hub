# Business Setup - Rollback Procedures

## Quick Reference

| Severity | Action | Time to Rollback |
|----------|--------|------------------|
| ⚠️ Minor | Monitor metrics | N/A |
| 🟡 Moderate | Disable for new users | < 1 minute |
| 🔴 Critical | Full rollback | < 5 minutes |

---

## 1. Immediate Rollback (< 1 minute)

### Disable New Business Setup

Set the feature flag to `false` in your environment:

```bash
# Vercel
vercel env add NEXT_PUBLIC_ENABLE_NEW_BUSINESS_SETUP production
# Enter: false

# Or via Vercel Dashboard
# Settings > Environment Variables > NEXT_PUBLIC_ENABLE_NEW_BUSINESS_SETUP = false
```

**Effect**: Users will see the old 7-step wizard immediately. No redeployment needed.

---

## 2. Gradual Rollback

### Reduce Rollout Percentage

```bash
# Reduce to 10% of users
vercel env add NEXT_PUBLIC_NEW_SETUP_ROLLOUT_PERCENT production
# Enter: 10

# Reduce to 0% (same as disabling)
# Enter: 0
```

---

## 3. Database Rollback (if needed)

### Check Recent Entities

```sql
-- Find entities created with new flow (last 24 hours)
SELECT id, name, created_at, metadata 
FROM entities 
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND metadata->>'setupType' IN ('new', 'existing')
ORDER BY created_at DESC;
```

### Rollback Migration

```bash
# If schema migration needs rollback
npx prisma migrate resolve --rolled-back 20251204183607_add_economic_department
npx prisma db push --force-reset # CAUTION: Only in dev
```

---

## 4. Monitoring Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error rate | > 5% | > 10% | Investigate / Rollback |
| Completion rate | < 70% | < 50% | Investigate |
| Avg completion time | > 2 min | > 5 min | Optimize |
| 429 rate limit hits | > 1% | > 5% | Adjust limits |

### Key Metrics to Monitor

```javascript
// Datadog/NewRelic queries
errors = count(status:error route:/api/portal/entities/setup)
success = count(status:success route:/api/portal/entities/setup)
error_rate = (errors / (errors + success)) * 100

// Completion rate
started = count(action:business_setup_modal_opened)
completed = count(action:business_setup_completed)
completion_rate = (completed / started) * 100
```

---

## 5. Communication

### User-Facing Banner (if major rollback)

```tsx
// Add to PortalLayout.tsx
{isRolledBack && (
  <Alert variant="warning">
    We're temporarily using our previous business setup process 
    while we make improvements. Thank you for your patience.
  </Alert>
)}
```

### Internal Notification

- Slack: #engineering-alerts
- PagerDuty: Trigger P2 incident
- Email: engineering@company.com

---

## 6. Post-Rollback Checklist

- [ ] Confirm feature flag is disabled
- [ ] Verify old wizard is working
- [ ] Check error logs for root cause
- [ ] Document incident timeline
- [ ] Create fix ticket
- [ ] Plan re-rollout after fix

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| On-call Engineer | - | PagerDuty |
| Product Owner | - | Slack |
| Database Admin | - | Slack |
