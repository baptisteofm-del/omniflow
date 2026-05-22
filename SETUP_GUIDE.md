# OmniFlow Model Avatar Feature - Setup Guide

## Quick Start

This guide will help you deploy the new model avatar and platform branding features.

---

## Step 1: Database Migration

### Option A: Supabase Dashboard (Recommended)

1. Go to your **Supabase Project Dashboard**
2. Navigate to **SQL Editor**
3. Click **+ New Query**
4. Copy the contents of `/supabase/add_model_photo.sql`
5. Paste into the SQL editor
6. Click **RUN**

**Expected Output:**
```
Query executed successfully in 0.5s
```

### Option B: Command Line (if using Supabase CLI)

```bash
cd omniflow
supabase db push --local  # Test locally first
supabase db push          # Deploy to production
```

---

## Step 2: Verify Migration

After running the migration, verify the new columns exist:

```sql
-- In Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'models'
ORDER BY ordinal_position;
```

You should see:
- `avatar_url` (text)
- `bio` (text)
- `linked_integration_id` (uuid)
- `linked_platform` (text)

---

## Step 3: Verify Storage Bucket

Ensure the `avatars` storage bucket exists and is public:

1. Go to **Storage** in Supabase Dashboard
2. Look for bucket named `avatars`
3. If missing, click **+ New Bucket**:
   - Name: `avatars`
   - Public: **ON** (toggle enabled)
4. Click **Create Bucket**

---

## Step 4: Deploy Backend

Redeploy your Next.js application with the new routes:

```bash
# If using Vercel
git push origin main  # Auto-deploys

# If self-hosted
npm run build
npm start
```

**New Routes Added:**
- `POST /api/models/avatar` - Avatar upload
- `GET /api/models/stats` - Model statistics
- `PATCH /api/models/[id]` - Model update
- `GET /api/integrations?tool=onlyfans,mym` - Filtered integrations

---

## Step 5: Test Avatar Upload

1. Navigate to **Comptes Modèles** page
2. Click **Ajouter un modèle** or create a test model
3. On the model card, hover over the avatar area
4. Click the **Upload** icon (⬆️)
5. Select an image file
6. Verify the image displays on the card

**Expected Behavior:**
- Avatar uploads successfully
- Image appears immediately on card
- Persists after page reload

---

## Step 6: Test Platform Navigation

1. On a model card, click any **platform badge**:
   - OnlyFans/MYM → Should navigate to `/chatting/ai`
   - Instagram/TikTok/Telegram/Twitter → Should navigate to `/posting`

2. Click **stats** (Revenus mois / Posts publiés):
   - Revenus mois → Should navigate to `/finance`
   - Posts publiés → Should navigate to `/posting`

**Expected Behavior:**
- Links work correctly
- Navigation is smooth
- Stats show 0 initially (no real data yet)

---

## Step 7: Verify UI Changes

### Platform Logos
- ✅ OnlyFans badge shows cyan circle with OF logo
- ✅ MYM badge shows black circle with "M"
- ✅ Instagram badge shows pink-to-orange gradient
- ✅ TikTok badge shows black circle with "T"
- ✅ Telegram badge shows blue with plane
- ✅ Twitter badge shows black with "X"
- ✅ Reddit is **removed** from network list

### Form Changes
- ✅ Edit modal shows model data
- ✅ Bio field is editable
- ✅ Platform selection works
- ✅ Create/Update buttons work correctly

---

## Troubleshooting

### Avatar Upload Fails

**Error:** "Failed to upload avatar"

**Solutions:**
1. Check Supabase Storage bucket `avatars` exists and is public
2. Verify user is authenticated
3. Check browser console for actual error
4. Ensure image file size < 5MB
5. Check CORS settings in Supabase

### Stats Show 0

**Expected behavior** - Stats show 0 until:
- Transactions are created (for revenue)
- Posts are scheduled (for post count)

**To populate stats:**
1. Create a scheduled post for the model
2. Create a transaction for the model
3. Stats should update within 1 minute

### SVG Logos Not Displaying

**Solution:**
1. Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)
2. Hard refresh page (Ctrl+F5 or Cmd+Shift+R)
3. Check browser console for errors
4. Verify PlatformLogos component is imported correctly

### Links Not Working

**Verify routes exist:**
- `/chatting/ai` - Should exist in dashboard
- `/posting` - Should exist in dashboard
- `/finance` - Should exist in dashboard

If missing, create placeholder pages or update links accordingly.

---

## Configuration Notes

### Image Upload Limits
- Default: 5MB per image
- Modify in `/src/app/api/models/avatar/route.ts` if needed

### Supported Image Formats
- JPEG, PNG, WebP, GIF
- Recommended: PNG or JPEG for avatars

### Storage Path Structure
```
avatars/
  └── {agencyId}/
      ├── {modelId}.jpg
      ├── {modelId}.png
      └── ...
```

---

## Performance Considerations

### Avatar Loading
- Supabase Storage CDN is fast globally
- Images are optimized for web
- Lazy loading is handled by Next.js Image component

### Stats Endpoint
- Returns empty stats for models with no data
- Response time: ~200-500ms depending on model count
- Consider caching if >100 models per agency

### Database Indexes
- `models_linked_integration_id_idx` speeds up integration lookups
- `models_linked_platform_idx` enables fast platform filtering

---

## Rollback Instructions

If you need to rollback:

```sql
-- Remove new columns (data will be lost)
ALTER TABLE models DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE models DROP COLUMN IF EXISTS bio;
ALTER TABLE models DROP COLUMN IF EXISTS linked_integration_id;
ALTER TABLE models DROP COLUMN IF EXISTS linked_platform;

-- Drop indexes
DROP INDEX IF EXISTS models_linked_integration_id_idx;
DROP INDEX IF EXISTS models_linked_platform_idx;
```

**Note:** Rollback will delete all avatar URLs and bio data. Consider backing up first.

---

## Support

For issues or questions:

1. Check **IMPLEMENTATION_SUMMARY.md** for technical details
2. Review **browser console** for JavaScript errors
3. Check **Supabase logs** for API errors
4. Verify **database schema** matches expected columns

---

**Last Updated:** May 22, 2026  
**Version:** 1.0  
**Status:** Production Ready
