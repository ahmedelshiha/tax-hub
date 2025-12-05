# Business Setup Deployment Checklist

## Pre-Deployment

- [x] All TypeScript errors resolved
- [x] All tests passing (32/32)
- [x] Security hardening complete (rate limiting, CSRF, XSS)
- [x] Error boundaries implemented
- [x] Mobile optimization complete
- [x] API endpoints tested (setup, license lookup)
- [x] Database migrations applied

## Environment Variables

Add these to your production environment:

```bash
# Feature flag (set to 'false' to disable new flow)
NEXT_PUBLIC_ENABLE_NEW_BUSINESS_SETUP=true

# Rollout percentage (0-100, default: 100)
NEXT_PUBLIC_NEW_SETUP_ROLLOUT_PERCENT=100

# Encryption key for localStorage (generate a secure random string)
NEXT_PUBLIC_ENCRYPT_KEY=your-secure-random-key-here

# Rate limiting (default: enabled)
NEXT_PUBLIC_ENABLE_RATE_LIMITING=true

# Audit logging (default: enabled)
NEXT_PUBLIC_ENABLE_AUDIT_LOGGING=true
```

## Deployment Steps

### 1. Staging Deployment

```bash
# Deploy to staging
vercel --env staging

# Run smoke tests
npm run test:e2e -- --grep "business-setup"
```

### 2. Production Deployment (Gradual Rollout)

```bash
# Start with 10% rollout
vercel env add NEXT_PUBLIC_NEW_SETUP_ROLLOUT_PERCENT production
# Enter: 10

# Deploy to production
vercel --prod

# Monitor for 24 hours, then increase
# 10% -> 25% -> 50% -> 100%
```

### 3. Full Rollout

```bash
# After successful monitoring, set to 100%
vercel env add NEXT_PUBLIC_NEW_SETUP_ROLLOUT_PERCENT production
# Enter: 100
```

## Monitoring Setup

### Metrics to Track

1. **Error Rate**: `/api/portal/entities/setup` status codes
2. **Completion Rate**: Modal open → Submit success
3. **Response Time**: API latency p50, p95, p99
4. **Rate Limit Hits**: 429 responses

### Alerts to Configure

```yaml
# Example Datadog alert
alert:
  name: "Business Setup Error Rate High"
  query: "avg(last_5m):sum:errors{route:/api/portal/entities/setup} / sum:requests{route:/api/portal/entities/setup} > 0.05"
  message: "Error rate > 5% on business setup API"
  priority: P2
```

## Post-Deployment

- [ ] Verify feature flag is working
- [ ] Check logs for any errors
- [ ] Confirm rate limiting is active
- [ ] Test license lookup with mock data
- [ ] Test entity creation end-to-end
- [ ] Monitor completion rates

## Rollback

If issues arise, see: [BUSINESS_SETUP_ROLLBACK.md](./BUSINESS_SETUP_ROLLBACK.md)

Quick rollback:
```bash
vercel env add NEXT_PUBLIC_ENABLE_NEW_BUSINESS_SETUP production
# Enter: false
```

---

## Summary

| Phase | Status |
|-------|--------|
| Phase 0: Foundation | ✅ Complete |
| Phase 1: UI Components | ✅ Complete |
| Phase 2: Security | ✅ Complete |
| Phase 3: Testing | ✅ Complete |
| Phase 4: Deployment | ✅ Ready |

**Total Development Time**: ~8 hours
**Test Coverage**: 32 tests passing
**Files Changed**: 25+ files
