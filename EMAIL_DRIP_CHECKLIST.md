# Email Drip & SEO — Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Get Resend API key from https://resend.com
- [ ] Add to `.env.local`:
  ```
  RESEND_API_KEY=re_xxxx
  FROM_EMAIL=hello@omniflowapp.ai
  EMAIL_SCHEDULER_SECRET=random_secret_key_min_32_chars
  ```

### Database Migration
- [ ] Run SQL migration in Supabase:
  ```sql
  -- Copy from supabase/add_email_drip.sql
  ```
- [ ] Verify table created: `SELECT * FROM email_drip_log;`

### Email Scheduler Setup
- [ ] **Choose scheduler:**
  - [ ] n8n webhook (recommended if already set up)
  - [ ] Vercel cron (if on Vercel)
  - [ ] External cron service (EasyCron, etc.)
  
- [ ] **Configure cron to:**
  - URL: `POST https://omniflowapp.ai/api/email/scheduled`
  - Header: `Authorization: Bearer {EMAIL_SCHEDULER_SECRET}`
  - Schedule: Daily at 9 AM UTC (or your preferred time)

### Code Review
- [ ] Verify all files created:
  - `src/lib/email/resend.ts`
  - `src/app/api/email/drip/route.ts`
  - `src/app/api/email/scheduled/route.ts`
  - `src/app/sitemap.ts`
  - `src/app/robots.ts`
  
- [ ] Verify modifications:
  - `src/app/layout.tsx` (metadata)
  - `src/app/(auth)/register/page.tsx` (email trigger)
  - `src/app/(marketing)/layout.tsx` (JSON-LD)
  - `src/app/(marketing)/faq/page.tsx` (metadata)
  - `src/app/(marketing)/affiliation/page.tsx` (metadata)

## Deployment

### Build & Deploy
```bash
cd /data/.openclaw/workspace/omniflow

# Build locally to test
npm run build

# If successful, deploy to Vercel
git add .
git commit -m "✨ Email drip Resend + SEO complet (sitemap, robots, meta, schema.org)"
git push origin main
```

- [ ] Build completes without errors
- [ ] Vercel deployment succeeds
- [ ] No errors in Vercel logs

### Post-Deployment Verification

#### Email System
- [ ] Test Day 0 email:
  ```bash
  curl -X POST https://omniflowapp.ai/api/email/drip \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "agencyName": "Test Agency",
      "day": 0
    }'
  ```
  - Check Resend dashboard for delivery
  - Verify email in inbox

- [ ] Test Day 1 email:
  ```bash
  curl -X POST https://omniflowapp.ai/api/email/drip \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "agencyName": "Test Agency",
      "day": 1
    }'
  ```

- [ ] Check email_drip_log table:
  ```sql
  SELECT * FROM email_drip_log ORDER BY sent_at DESC LIMIT 10;
  ```

- [ ] Test scheduled endpoint with auth:
  ```bash
  curl -X POST https://omniflowapp.ai/api/email/scheduled \
    -H "Authorization: Bearer {EMAIL_SCHEDULER_SECRET}"
  ```
  - Should return 200 with processed count

#### SEO Verification
- [ ] Sitemap loads: `https://omniflowapp.ai/sitemap.xml`
  - [ ] Contains home page (priority 1.0)
  - [ ] Contains pricing, FAQ, affiliation (0.9-0.8)
  - [ ] Contains legal pages (0.5)

- [ ] Robots.txt loads: `https://omniflowapp.ai/robots.txt`
  - [ ] Shows correct user-agent rules
  - [ ] Points to sitemap

- [ ] Metadata visible in page source:
  - [ ] Open `https://omniflowapp.ai` in browser
  - [ ] Inspect page source (Ctrl+U / Cmd+U)
  - [ ] Check `<title>` tag
  - [ ] Check `<meta name="description">`
  - [ ] Check `<script type="application/ld+json">`

- [ ] Google Search Console:
  - [ ] Add property for omniflowapp.ai
  - [ ] Verify ownership
  - [ ] Submit sitemap
  - [ ] Check indexing (may take 1-2 days)

- [ ] Social sharing test:
  - [ ] Paste homepage URL in Twitter/LinkedIn
  - [ ] Verify preview shows correct title, description, image

### Live Testing

- [ ] Complete registration at `https://omniflowapp.ai/register`
  - [ ] Welcome email arrives within 1 minute
  - [ ] Check sender: hello@omniflowapp.ai
  - [ ] Verify email content matches template

- [ ] Monitor Resend dashboard:
  - [ ] Check delivery status
  - [ ] Monitor bounce rate (should be <5%)
  - [ ] Check open rate (should be >20% for welcome)

- [ ] Schedule test:
  - [ ] Wait 24 hours
  - [ ] Check if Day 1 email sends automatically
  - [ ] Verify in email_drip_log table

## Rollback Plan

If issues occur:

```bash
# Revert to previous version
git revert HEAD --no-edit
git push origin main

# Or reset to specific commit
git reset --hard origin/clean-main
git push origin clean-main:main --force
```

- [ ] Backup current .env.local
- [ ] Test rollback locally first
- [ ] Verify services restored after revert

## Monitoring (After Deployment)

### Daily (First Week)
- [ ] Check Resend dashboard for delivery issues
- [ ] Monitor error logs in Vercel
- [ ] Verify cron job runs at scheduled time

### Weekly (After First Week)
- [ ] Email open rates (target: >20%)
- [ ] Email click rates (target: >5%)
- [ ] Bounce rate (target: <2%)
- [ ] Google Search Console indexing progress
- [ ] New signups and email delivery success rate

### Monthly
- [ ] Email drip ROI (conversions from Day 7 email)
- [ ] SEO rankings for target keywords
- [ ] Organic traffic from Google
- [ ] Overall conversion funnel impact

## Success Criteria

✅ **Email System:**
- Day 0 email sends within 1 minute of signup
- Day 1, 3, 7 emails send automatically
- No duplicate emails sent
- <2% bounce rate
- >90% delivery rate

✅ **SEO:**
- Sitemap indexed in Google Search Console
- All marketing pages indexed
- Metadata visible in search results
- Rich snippets showing for homepage
- Zero 404 errors on crawl

✅ **Business Impact:**
- Increased signup-to-trial conversion
- Reduced churn after Day 7
- Increased organic traffic
- Better brand visibility in search results

---

**Estimated time to complete:** 30-45 minutes
**Complexity:** Medium
**Risk level:** Low (non-blocking email, no customer data changes)
**Rollback difficulty:** Easy (revert single commit)
