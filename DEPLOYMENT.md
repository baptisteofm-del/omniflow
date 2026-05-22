# OmniFlow Prospection v3 — Deployment Guide

## Overview

**Prospection v3** brings intelligent scraping with Apify, geographic targeting, and a learning system that improves targeting over time.

### New Features

✅ **Mode-based scraping:**
- `keyword` — scrape by bio keywords (mock fallback)
- `followers` — scrape followers of a source account (Apify: instagram-scraper-followers)
- `similar` — scrape accounts similar to source (Apify: instagram-scraper)

✅ **Platform detection:**
- 🟢 `not_on_platform` — clean prospect, not yet on OnlyFans/MYM
- 🟡 `aggregator_detected` — has Linktr.ee or similar (may be monetized elsewhere)
- 🔴 `already_on_platform` — found OnlyFans/MYM/Fansly in bio (skip)

✅ **Geographic targeting:**
- Filter by country (FR, BE, CH, MA, TN, SN, CA, INTL)
- Optional city filtering

✅ **Learning system:**
- Track outcome for each prospect (signed/rejected/no_response)
- Compute success rates by segment (niche + geo + follower_range + platform_status)
- Auto-adjust scores based on historical wins

---

## Deployment Steps

### 1. Database Migration

**In Supabase → SQL Editor:**

```sql
-- Copy-paste content from: supabase/add_prospection_learning.sql
```

This creates:
- `prospection_learnings` — outcome log
- `prospection_scoring_weights` — computed success rates
- `upsert_learning_and_recalculate()` RPC function
- Extended `prospects` table with platform detection fields

**Run in Supabase:**

<a href="https://supabase.com/dashboard/project/jbtljjximpsqasfylrce/sql" target="_blank">Open Supabase SQL Editor</a>

---

### 2. Environment Variables

**In Vercel → Settings → Environment Variables:**

```bash
# Optional: for real Instagram scraping (Apify)
APIFY_API_TOKEN=your_apify_token_here

# Or keep RapidAPI for now (existing setup)
RAPIDAPI_KEY=your_rapidapi_key
```

If neither is set, the scraper falls back to **mock data** (for testing).

---

### 3. Deploy to Vercel

```bash
git add -A
git commit -m "feat: prospection v3 — Apify scraper, geo targeting, learning system"
git push origin clean-main:clean-main

# Deploy with Vercel (use your own token from Vercel dashboard)
VERCEL_TOKEN=your_vercel_token_here \
npx vercel --prod --token your_vercel_token_here --yes
```

---

## API Endpoints

### POST `/api/prospection/scrape`

**Request:**

```json
{
  "mode": "keyword" | "followers" | "similar",
  "sourceAccount": "@account_name",  // for followers/similar
  "keyword": "model paris",           // for keyword
  "platforms": ["Instagram", "TikTok"],
  "geo": {
    "country": "FR",
    "cities": ["Paris", "Lyon"]      // optional
  },
  "followerRange": {
    "min": 5000,
    "max": 50000
  },
  "niche": "fitness",
  "limit": 20
}
```

**Response:**

```json
{
  "success": true,
  "prospects": [
    {
      "id": "uuid",
      "username": "@sofia_123",
      "platform": "Instagram",
      "followers_estimate": 12500,
      "engagement_rate": 0.045,
      "platform_status": "not_on_platform",  // 🟢🟡🔴
      "potential_score": 3.5,
      "niche": "fitness",
      "bio": "Coach perso 💪",
      "geo_country": "FR",
      "scrape_mode": "keyword"
    }
  ],
  "count": 15,
  "source": "apify" | "mock",
  "message": "..."
}
```

---

### POST `/api/prospection/feedback`

Log an outcome for a prospect to train the learning system.

**Request:**

```json
{
  "prospect_id": "uuid",
  "outcome": "signed" | "rejected" | "no_response"
}
```

**Response:**

```json
{
  "success": true,
  "prospect_id": "uuid",
  "outcome": "signed",
  "new_success_rate": 0.65
}
```

This triggers the learning function:
1. Log to `prospection_learnings`
2. Recompute `prospection_scoring_weights` for this segment
3. Future prospects in this segment get boosted score if success rate is high

---

### GET `/api/prospection/feedback`

Fetch learning stats for all segments.

**Response:**

```json
{
  "success": true,
  "weights_count": 12,
  "by_segment": {
    "fitness-FR": [
      {
        "id": "uuid",
        "niche": "fitness",
        "geo_country": "FR",
        "follower_range": "mid",
        "platform_status": "not_on_platform",
        "signed_count": 3,
        "rejected_count": 1,
        "no_response_count": 2,
        "success_rate": 0.6
      }
    ]
  }
}
```

---

## Usage in UI

### Scraping

1. **Click "Scraper des profils"**
2. **Choose mode:**
   - 🔍 **Mot-clé** — search by bio keyword (mock)
   - 👥 **Followers** — scrape followers of @account (Apify)
   - 🤝 **Similaires** — scrape similar accounts (Apify)
3. **Select platforms** (Instagram, TikTok, Twitter)
4. **Select niche** (fitness, beauty, lifestyle, etc.)
5. **Choose geo** (France, Belgium, etc.)
6. **Click "Lancer le scraping"**

→ Profiles appear with badges:
- 🟢 Clean prospect
- 🟡 May be monetized elsewhere
- 🔴 Already on platform (skip)

### Logging Outcomes

When a prospect is contacted/replied/signed:

1. Update status in kanban or outreach tab
2. System auto-logs to `outreach_messages` table
3. Use feedback API to mark as `signed`/`rejected`/`no_response`
4. Learning weights auto-update

---

## Scoring Algorithm

**Base Score (0-5):**

```
score = 3
+ 1 if followers > 50k
+ 1 if engagement_rate > 5%
+ 0.5 if bio contains "model" / "créatrice" / "content creator"
- 1 if aggregator_detected (🟡)
- 2 if already_on_platform (🔴)
```

**Learning Multiplier:**

If a learning weight exists for this segment:

```
final_score = base_score * (success_rate * 2)
```

So if a segment has 60% success rate, scores are multiplied by 1.2x.

---

## Architecture

### Tables

```
prospects
├─ Core: id, agency_id, username, platform, status, created_at
├─ Metrics: followers_estimate, engagement_rate, potential_score
├─ Context: niche, bio, profile_url, avatar_url
├─ v3 NEW:
│  ├─ platform_status (🟢🟡🔴)
│  ├─ source_account (@account for followers mode)
│  ├─ geo_country, geo_cities
│  ├─ scrape_mode (keyword|followers|similar)
│  ├─ potential_score_base, learning_score_weight
│  └─ (+ existing: outreach_count, source, display_name)

prospection_learnings (NEW)
├─ agency_id, prospect_id
├─ niche, geo_country
├─ follower_range (micro|mid|macro)
├─ platform_status (🟢🟡🔴)
└─ outcome (signed|rejected|no_response)

prospection_scoring_weights (NEW)
├─ agency_id
├─ niche, geo_country, follower_range, platform_status
├─ signed_count, rejected_count, no_response_count
└─ success_rate (auto-computed)

outreach_messages (existing v2)
├─ Core: id, agency_id, prospect_id, message, platform
├─ Status: status (pending|sent|replied|...)
└─ Timestamps: sent_at, replied_at, created_at
```

### API Routes

```
POST /api/prospection/scrape
  → Apify + filtering + scoring + insert
  
POST /api/prospection/feedback
  → Log outcome + trigger learning RPC
  
GET /api/prospection/feedback
  → Fetch learning stats by segment
```

---

## Testing Checklist

- [ ] DB migration runs without error
- [ ] Scraper modal loads with new mode dropdown
- [ ] Can select sourceAccount for followers/similar modes
- [ ] Can select geo country
- [ ] Scraping returns profiles with platform_status badges
- [ ] Badges display correctly (🟢🟡🔴)
- [ ] Can log outcome via feedback API
- [ ] Learning weights table populates
- [ ] Scores update when weight changes
- [ ] Deploy to Vercel and test live

---

## Troubleshooting

**Profiles all appear with 🟡 badge?**
- Check bio text parsing in `detectPlatformStatus()`
- Verify aggregator URL list is correct

**Learning weights not updating?**
- Check RPC function syntax in Supabase
- Verify `upsert_learning_and_recalculate` is created
- Check agency_id matches

**Apify scraping returns empty?**
- Verify APIFY_API_TOKEN is set in Vercel
- Check Apify account has credits
- Mock fallback will trigger if API fails

**Scores too low/high?**
- Adjust base score constants in `scoreProfile()`
- Check learning multiplier (should be 1.0-2.0x)
- Review successful segment weights

---

## Next Steps (Post-v3)

- [ ] n8n webhook integration for DM sending
- [ ] Batch outcome logging (bulk feedback API)
- [ ] Learning visualization dashboard
- [ ] A/B testing different scrape modes
- [ ] Campaign performance metrics

---

**Last Updated:** 2025-05-22
**Version:** 3.0.0
