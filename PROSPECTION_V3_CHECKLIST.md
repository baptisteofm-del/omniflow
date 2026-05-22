# Prospection v3 — Deployment Checklist

## 🚀 Pre-Deployment (Now)

- [x] Feature fully implemented in code
- [x] TypeScript strict mode (no errors)
- [x] All new routes created:
  - [x] `/src/app/api/prospection/scrape/route.ts` — scraper with Apify + filtering + learning
  - [x] `/src/app/api/prospection/feedback/route.ts` — outcome logging
- [x] UI updated:
  - [x] New search modal fields (mode, source account, geo)
  - [x] Platform status badges (🟢🟡🔴)
- [x] SQL migration created: `supabase/add_prospection_learning.sql`
- [x] Documentation:
  - [x] `DEPLOYMENT.md` — step-by-step guide
  - [x] `IMPLEMENTATION_SUMMARY.md` — full technical spec
- [x] Git commits clean (no secrets exposed)
- [x] Pushed to GitHub: `clean-main` branch

---

## 📋 Deployment Steps (For Admin)

### Step 1: Run Database Migration ✅ READY

**In Supabase Dashboard:**

1. Open: https://supabase.com/dashboard/project/jbtljjximpsqasfylrce/sql
2. Copy entire content from: `/supabase/add_prospection_learning.sql`
3. Paste into SQL Editor
4. Run
5. Expected: No errors, creates:
   - Alter `prospects` table (add 7 new columns)
   - Create `prospection_learnings` table
   - Create `prospection_scoring_weights` table
   - Create `upsert_learning_and_recalculate()` RPC function

**Verify migration:**
```sql
-- Check columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'prospects' 
AND column_name IN ('platform_status', 'source_account', 'geo_country');

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('prospection_learnings', 'prospection_scoring_weights');
```

### Step 2: (Optional) Set Apify API Key

**In Vercel Settings:**
1. Go to: https://vercel.com/dashboard/...
2. Select project: OmniFlow
3. Settings → Environment Variables
4. Add (optional):
   ```
   APIFY_API_TOKEN = your_key_from_apify_com
   ```
5. Save & redeploy

**Without this:** Scraper falls back to mock (still works for testing)

### Step 3: Deploy to Vercel

Vercel auto-deploys on push, but verify:

```bash
# In omniflow directory
git status  # Should be clean
git log -1  # Should show "feat: prospection v3 ..."
```

**Expected in Vercel:**
- Build succeeds (no TypeScript errors)
- New routes appear: `/api/prospection/scrape` and `/api/prospection/feedback`
- UI loads with new search modal fields

### Step 4: Test in Production

#### Test 4.1: Scraping Works

1. Open OmniFlow → Prospection
2. Click "Scraper des profils"
3. Modal appears with new fields:
   - [ ] Mode dropdown (keyword / followers / similar)
   - [ ] Source account field (appears only for followers/similar)
   - [ ] Geo country dropdown (FR, BE, CH, etc.)
   - [ ] Platform checkboxes (Instagram, TikTok, Twitter)
   - [ ] Niche selector
4. Fill form and click "Lancer le scraping"
5. Expected result:
   - [ ] ~20 profiles appear in kanban
   - [ ] Each profile has platform_status badge (🟢, 🟡, or 🔴)
   - [ ] Scores are between 0-5

#### Test 4.2: Platform Detection Works

1. Look at profiles in the results
2. Check badges:
   - [ ] 🟢 profiles = clean (no red flags)
   - [ ] 🟡 profiles = have linktr.ee or similar
   - [ ] 🔴 profiles = have onlyfans.com or mym in bio
3. Hover badge to see tooltip

#### Test 4.3: Geographic Filtering Works

1. Scrape with `geo.country = "FR"` and city "Paris"
2. Check results: profiles should mention Paris or France
3. Try another country (BE, CH) and verify filtering

#### Test 4.4: Learning System Works

1. Scrape 5 prospects
2. Mark 1 as "signed" (update status in kanban)
3. Call feedback API manually:
   ```bash
   curl -X POST http://localhost:3000/api/prospection/feedback \
     -H "Content-Type: application/json" \
     -d '{"prospect_id": "uuid_here", "outcome": "signed"}'
   ```
4. Expected:
   - [ ] Response shows `"success": true`
   - [ ] `new_success_rate` appears in response
   - [ ] Database `prospection_learnings` has new row
   - [ ] Database `prospection_scoring_weights` updated

#### Test 4.5: Learning Affects Scores

1. Create a segment with some successes:
   - [ ] Scrape 5 fitness/FR/mid profiles
   - [ ] Mark 3 as signed, 1 as rejected, 1 as no_response
   - [ ] Success rate for segment = 60%
2. Scrape same segment again
3. Expected:
   - [ ] New profiles in this segment have boosted scores
   - [ ] Score multiplier ≈ 1.2 (60% × 2 = 1.2x)
   - [ ] If base score is 3, final should be ~3.6

---

## 🔍 Testing Matrix

| Feature | Test Method | Expected | Status |
|---------|-------------|----------|--------|
| Mode dropdown | UI modal | Shows keyword/followers/similar | [ ] |
| Source account field | UI modal (mode=followers) | Input appears | [ ] |
| Geo filtering | Scrape with geo | Results match country/city | [ ] |
| Platform detection 🟢 | Look at profiles | Clean profiles have green badge | [ ] |
| Platform detection 🟡 | Look at profiles | Linktr.ee profiles have yellow | [ ] |
| Platform detection 🔴 | Look at profiles | OnlyFans profiles have red | [ ] |
| Scoring (base) | Check scores | 0-5 range, matches logic | [ ] |
| Apify integration | Check logs | Real scraping if key set, else mock | [ ] |
| Feedback API | POST call | Returns success + new_rate | [ ] |
| Learning table | Query DB | prospection_learnings populated | [ ] |
| Weights table | Query DB | prospection_scoring_weights updated | [ ] |
| Score boost | Scrape segment twice | Second batch has higher scores | [ ] |

---

## 🛠️ Troubleshooting

### Issue: Scraper returns empty results

**Solution:**
1. Check if APIFY_API_TOKEN is set in Vercel
2. Fallback should trigger: check for mock data in response
3. If still empty: Check API logs in Vercel dashboard
4. Verify `runApifyActor()` timeout isn't too short

### Issue: Platform badges not showing

**Solution:**
1. Check UI console for errors
2. Verify `platform_status` field in response from API
3. Check `detectPlatformStatus()` function logic
4. Ensure migration added `platform_status` column to `prospects`

### Issue: Learning system not updating weights

**Solution:**
1. Check RPC function exists: `SELECT * FROM information_schema.routines WHERE routine_name = 'upsert_learning_and_recalculate'`
2. Check prospection_learnings table has rows: `SELECT COUNT(*) FROM prospection_learnings`
3. Verify RPC function permissions (should have no schema prefix in call)
4. Check Supabase logs for RPC errors

### Issue: Geo filtering not working

**Solution:**
1. Check `matchesGeo()` function logic
2. Verify country codes mapping (FR → france, paris, etc.)
3. Test with clear text (e.g., "Paris" in bio)
4. Check case-sensitivity (function uses `.toLowerCase()`)

---

## 📊 Success Metrics

After deployment, expect:

- **Scraping:** ~20 profiles per search in <5 seconds (mock) or <60s (real Apify)
- **Detection:** >90% of profiles correctly tagged (🟢🟡🔴)
- **Learning:** Weight updates within 5-10 outcomes per segment
- **Performance:** UI responsive, no slowdown on 1000+ prospects
- **Reliability:** 99%+ uptime (except Apify outages)

---

## 🎓 End-User Guide

After deployment, users can:

1. **Scrape intelligently:**
   - Choose mode (followers, similar, or keyword)
   - Set geographic target
   - Get 20 profiles with smart scoring

2. **See platform status:**
   - 🟢 = Safe bet, not yet on platforms
   - 🟡 = Probably has other links/aggregators
   - 🔴 = Already on OnlyFans/MYM (skip or research)

3. **Improve over time:**
   - Mark outcomes (signed/rejected/no response)
   - System learns which segments work best
   - Future prospects in winning segments get boosted scores

4. **Filter by geography:**
   - Focus on France, Belgium, Switzerland, etc.
   - Optional: drill down to cities (Paris, Lyon)
   - Improves relevance + conversion

---

## 📞 Support

If issues arise:

1. **Code issues:** Check `/src/app/api/prospection/` routes
2. **Database issues:** Check Supabase logs + query prospection_learning tables
3. **Integration issues:** Verify APIFY_API_TOKEN in Vercel + Apify account credits
4. **UI issues:** Check browser console + network tab in DevTools

---

## ✅ Sign-Off

- [ ] Database migration executed successfully
- [ ] Vercel deployment completed
- [ ] All tests in Testing Matrix passed
- [ ] No critical errors in logs
- [ ] Users can access new features
- [ ] Documentation reviewed and understood

---

**Deployed by:** [Admin name]  
**Date:** ____________________  
**Time:** ____________________  
**Status:** ☐ Ready | ☐ In Progress | ☐ Complete
