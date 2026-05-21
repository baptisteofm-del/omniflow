# Email Drip & SEO Implementation Guide — Omniflow

## Overview

This implementation includes:
1. **Email Drip System** — Automated welcome + 3 onboarding emails (Day 1, 3, 7)
2. **Complete SEO** — Metadata, sitemap, robots.txt, JSON-LD schema

---

## Part 1: Email Drip System

### What Was Implemented

#### 1. **Resend Integration** (`src/lib/email/resend.ts`)
- `sendWelcomeEmail()` — Day 0: Welcome email on registration
- `sendOnboardingEmail()` — Day 1, 3, 7: Onboarding sequence

**Email Templates:**
- **Day 0 (Welcome):** Introduction to Omniflow, 3-step quick start, dashboard link
- **Day 1:** How to connect AdsPower/GeeLark, 2-minute guide
- **Day 3:** Reminder to schedule first post, benefits of automation
- **Day 7:** Offer to continue after trial ends, recap features

#### 2. **Email Drip API Routes**

**`POST /api/email/drip`**
```json
{
  "email": "contact@agence.com",
  "agencyName": "Mon Agence",
  "day": 0
}
```
- Sends email immediately
- Logs send to `email_drip_log` table
- Prevents duplicate sends

**`POST /api/email/scheduled`** (Cron-triggered)
- Automatically sends Day 1, 3, 7 emails
- Requires `Authorization: Bearer {EMAIL_SCHEDULER_SECRET}`
- Finds agencies created on target dates
- Sends only if not already sent

#### 3. **Database Table** (`supabase/add_email_drip.sql`)

```sql
create table email_drip_log (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  day_number int not null default 0,
  sent_at timestamptz default now(),
  unique(email, day_number)
);
```

**To apply:**
```bash
# In Supabase SQL Editor, run:
psql <your-db> < supabase/add_email_drip.sql
```

#### 4. **Registration Integration**

Modified `src/app/(auth)/register/page.tsx` to:
- Call `/api/email/drip` on successful signup
- Send Day 0 (welcome) email immediately
- Continue even if email fails (non-blocking)

### Setup Instructions

#### 1. **Install Resend**
Already done in `package.json` — resend package installed.

#### 2. **Environment Variables**

Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx  # Get from resend.com
FROM_EMAIL=hello@omniflowapp.ai          # Your sender address
EMAIL_SCHEDULER_SECRET=your_secret_key   # Random secret for cron auth
```

#### 3. **Create Database Table**

Run in Supabase SQL Editor:
```bash
-- Copy contents of supabase/add_email_drip.sql and run
```

#### 4. **Setup Email Scheduler (Cron)**

You have two options:

**Option A: Using n8n** (Already set up at n8n.srv1610420.hstgr.cloud)
1. Create a webhook/cron trigger
2. Set to run daily at your preferred time
3. Call: `POST https://omniflowapp.ai/api/email/scheduled`
4. Header: `Authorization: Bearer {EMAIL_SCHEDULER_SECRET}`

**Option B: Using Vercel Cron Functions**
Create `src/app/api/cron/email-drip/route.ts`:
```typescript
export const runtime = 'nodejs'

export async function GET(request: Request) {
  // Verify secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.EMAIL_SCHEDULER_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const response = await fetch('https://omniflowapp.ai/api/email/scheduled', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.EMAIL_SCHEDULER_SECRET}` }
  })

  return response
}
```
Then configure in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/email-drip",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Option C: Using external cron service** (EasyCron, Zapier, etc.)
- Schedule HTTP POST to `/api/email/scheduled`
- Add auth header

---

## Part 2: SEO Implementation

### What Was Implemented

#### 1. **Root Metadata** (`src/app/layout.tsx`)

Enhanced with:
- Proper title template for subpages
- Comprehensive description
- Industry keywords (onlyfans, automatisation, posting, etc.)
- Canonical URL
- Robots indexing rules
- Enhanced OpenGraph + Twitter cards
- Multiple keywords for search visibility

#### 2. **Sitemap** (`src/app/sitemap.ts`)

Auto-generated sitemap with:
- Home (priority 1.0)
- Pricing (0.9)
- FAQ, Docs, Affiliation (0.8)
- About, Contact (0.7)
- Legal pages (0.5)
- Change frequency hints

Accessible at: `https://omniflowapp.ai/sitemap.xml`

#### 3. **Robots.txt** (`src/app/robots.ts`)

```
User-Agent: *
Allow: /
Disallow: /dashboard, /admin, /api/, /settings
Sitemap: https://omniflowapp.ai/sitemap.xml
```

#### 4. **Page-Specific Metadata**

Updated metadata for:
- `(marketing)/faq/page.tsx` — FAQ keywords
- `(marketing)/affiliation/page.tsx` — Affiliation keywords
- More can be added for pricing, docs, etc.

#### 5. **JSON-LD Schema** (`src/app/(marketing)/layout.tsx`)

Added structured data:
- SoftwareApplication schema
- Feature list
- Pricing offers (Starter, Pro, Agency)
- Aggregate ratings
- Improves Google Rich Snippets

### SEO Impact

This implementation covers:
- ✅ **Title & Description** — Optimized for CTR
- ✅ **Keywords** — Long-tail + industry terms
- ✅ **Sitemap** — Helps indexing
- ✅ **Robots.txt** — Guides crawlers
- ✅ **Structured Data** — Rich snippets
- ✅ **Open Graph** — Social sharing
- ✅ **Mobile-Friendly** — Responsive design (existing)
- ✅ **Page Speed** — Next.js optimized (existing)

**Next steps for SEO:**
1. Create blog section (`/blog`) with content calendar
2. Add FAQ schema for FAQ page
3. Add breadcrumbs for navigation
4. Create comparison pages (vs. competitors)
5. Optimize images with alt text
6. Create internal linking strategy
7. Monitor Google Search Console

---

## Testing

### Email Drip Testing

**Test Day 0 (Welcome) Email:**
```bash
curl -X POST http://localhost:3000/api/email/drip \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "agencyName": "Test Agency",
    "day": 0
  }'
```

**Test Day 1 Email:**
```bash
curl -X POST http://localhost:3000/api/email/drip \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "agencyName": "Test Agency",
    "day": 1
  }'
```

**Check Email Log:**
```sql
SELECT * FROM email_drip_log ORDER BY sent_at DESC;
```

### SEO Testing

**Sitemap:**
- Visit: `https://omniflowapp.ai/sitemap.xml`
- Should list all marketing pages

**Robots.txt:**
- Visit: `https://omniflowapp.ai/robots.txt`
- Should show crawl rules + sitemap

**Schema Validation:**
- Use [Schema.org Validator](https://validator.schema.org/)
- Paste homepage HTML
- Should show SoftwareApplication schema

**Google Search Console:**
1. Add property: `omniflowapp.ai`
2. Verify ownership
3. Submit sitemap
4. Check indexing status

---

## Files Created/Modified

### Created:
- `src/lib/email/resend.ts` — Email templates & functions
- `src/app/api/email/drip/route.ts` — Immediate email endpoint
- `src/app/api/email/scheduled/route.ts` — Scheduled email endpoint
- `src/app/sitemap.ts` — Dynamic sitemap
- `src/app/robots.ts` — Robots.txt
- `supabase/add_email_drip.sql` — Database migration
- `IMPLEMENTATION_GUIDE.md` — This file

### Modified:
- `src/app/layout.tsx` — Enhanced metadata
- `src/app/(auth)/register/page.tsx` — Email trigger on signup
- `src/app/(marketing)/layout.tsx` — Added JSON-LD schema
- `src/app/(marketing)/faq/page.tsx` — Added metadata
- `src/app/(marketing)/affiliation/page.tsx` — Added metadata
- `.env.local.example` — Added email config

---

## Next Steps

### Immediate (Priority 1):
1. Set Resend API key in `.env.local`
2. Create email_drip_log table in Supabase
3. Configure email scheduler (cron)
4. Deploy to production
5. Test with real signup

### Short-term (Priority 2):
1. Create `/pricing` page with metadata
2. Create `/blog` section
3. Add FAQ schema.org to FAQ page
4. Set up Google Search Console
5. Monitor email delivery (Resend dashboard)

### Medium-term (Priority 3):
1. Create content calendar
2. Add email A/B testing
3. Optimize conversion funnel
4. Add customer testimonials/reviews
5. Create case studies

---

## Monitoring

### Email Metrics:
- **Resend Dashboard** — Delivery, opens, clicks
- **Database logs** — Which emails were sent
- **Check bounces** — Failed addresses

### SEO Metrics:
- **Google Search Console** — Indexing, keywords, CTR
- **Google Analytics** — Organic traffic, behavior
- **PageSpeed Insights** — Performance score
- **Lighthouse** — Core Web Vitals

---

## Support

- **Resend Docs:** https://resend.com/docs
- **Next.js Metadata:** https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- **SEO Best Practices:** https://developers.google.com/search/docs
- **Schema.org:** https://schema.org

---

**Status:** ✅ Implementation complete and ready for deployment
**Last Updated:** 2026-05-21
