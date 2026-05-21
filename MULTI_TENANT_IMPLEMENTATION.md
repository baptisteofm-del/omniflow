# Multi-Tenant Posting Architecture Implementation

## ✅ Completed Tasks

### 1. Database Schema (Supabase)
**File:** `supabase/add_integrations.sql`

Created two new tables with proper Row-Level Security:

```sql
-- agency_integrations
- id (UUID, PK)
- agency_id (FK to agencies)
- tool ('adspower' | 'geelark' | 'telegram')
- api_key (encrypted)
- api_url (for AdsPower local instances)
- is_active (boolean)
- unique(agency_id, tool) - one integration per tool per agency

-- model_profiles
- id (UUID, PK)
- model_id (FK to models)
- agency_id (FK to agencies)
- tool ('adspower' | 'geelark')
- profile_id (string, the actual profile ID in the tool)
- platform ('instagram' | 'tiktok' | 'onlyfans')
- profile_name (string)
- is_active (boolean)
```

RLS policies ensure each agency only sees their own integrations and profiles.

### 2. Library Updates

**`src/lib/posting/adspower.ts`** - Refactored to accept parameters
- `listProfiles(apiKey, apiUrl, page?, pageSize?)` - Lists profiles from agency's AdsPower
- `openProfile(apiKey, apiUrl, profileId)` - Opens a browser profile
- `closeProfile(apiKey, apiUrl, profileId)` - Closes a profile
- `isProfileActive(apiKey, apiUrl, profileId)` - Checks if profile is running

**`src/lib/posting/geelark.ts`** - Refactored to accept parameters
- `listProfiles(apiKey)` - Lists profiles from agency's GeeLark
- `startProfile(apiKey, profileId)` - Starts a cloud profile
- `stopProfile(apiKey, profileId)` - Stops a cloud profile
- `postToTikTok(apiKey, profileId, videoUrl, caption)` - Posts to TikTok
- `postToInstagram(apiKey, profileId, mediaUrl, caption)` - Posts to Instagram

### 3. API Endpoints

**`src/app/api/integrations/route.ts`**
- `GET` - Fetch all integrations for the authenticated agency
- `POST` - Save/update an integration (tool + api_key + optional api_url)

**`src/app/api/integrations/test/route.ts`**
- `POST` - Test connection for AdsPower/GeeLark/Telegram
  - Tests AdsPower by calling `/api/v1/user/list`
  - Tests GeeLark by calling `/open/v1/profile/list`
  - Tests Telegram by calling `/getMe`

**`src/app/api/models/route.ts`**
- `GET` - Fetch all models for the agency with their profiles
- `POST` - Create a model with optional profile association

**`src/app/api/models/[id]/route.ts`**
- `DELETE` - Delete a model (cascade deletes associated profiles)

**`src/app/api/accounts/profiles/import/route.ts`**
- `POST` - Import profiles from AdsPower or GeeLark for a specific model
  - Uses stored agency integrations to fetch profiles
  - Returns list of available profiles

### 4. Frontend Pages

**`src/app/(dashboard)/settings/integrations/page.tsx`**
- 🌐 **AdsPower** section with API Key + Local URL fields
- ☁️ **GeeLark** section with API Key field
- 📱 **Telegram Bot** section with Bot Token field
- Status indicators (Connected ✅ / Not Connected ❌)
- Connection test button for each tool
- Auto-save on successful test

**`src/app/(dashboard)/accounts/page.tsx`**
- Model management interface
- Create models with name, platform (OnlyFans/Instagram/TikTok/Telegram)
- Import profiles from connected AdsPower/GeeLark accounts
- Display profiles per model with tool and platform info
- Delete models (with cascade)

**`src/app/(dashboard)/posting/page.tsx`** - Enhanced
- Model dropdown instead of free-text input
- Auto-detect platform and profile from selected model
- Profile and tool info displayed automatically
- Cleaner form interface

### 5. Security Improvements

✅ API keys stored in Supabase (encrypted at rest)
✅ Keys never exposed in API responses (masked as ***)
✅ Row-Level Security on all integration tables
✅ Each agency isolated from others
✅ User must be authenticated to access integrations

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Agency A                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Settings → Integrations                                    │
│  ├── AdsPower: api_key_a, url_local_a                      │
│  └── GeeLark: api_key_a                                    │
│                                                              │
│  Accounts → Models                                          │
│  ├── Leelou (OnlyFans)                                     │
│  │   └── Profile: ADS_001 (AdsPower, Instagram)            │
│  └── Sophie (TikTok)                                       │
│      └── Profile: GEL_002 (GeeLark, TikTok)                │
│                                                              │
│  Posting → Schedule                                         │
│  └── Select Model → Auto-fill Profile & Tool              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Agency B (Isolated)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Settings → Integrations                                    │
│  ├── AdsPower: api_key_b, url_local_b                      │
│  └── Telegram: bot_token_b                                 │
│                                                              │
│  Accounts → Models                                          │
│  └── Julia (OnlyFans)                                      │
│      └── Profile: ADS_003 (AdsPower, OnlyFans)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Next Steps (Future Enhancements)

1. **Webhook Support** - Have AdsPower/GeeLark notify the SaaS when posts complete
2. **Profile Sync** - Periodically sync profiles from integrations to keep them fresh
3. **Analytics** - Track posting success per model/tool
4. **Bulk Operations** - Import multiple profiles at once
5. **API Rate Limiting** - Implement rate limits per agency
6. **Audit Logs** - Log all integration changes for compliance

## Testing Checklist

- [ ] Create agency with AdsPower integration
- [ ] Create agency with GeeLark integration
- [ ] Test connection for each tool
- [ ] Import profiles from AdsPower
- [ ] Import profiles from GeeLark
- [ ] Create models and assign profiles
- [ ] Schedule a post with auto-detected profile
- [ ] Verify RLS (agency B cannot see agency A data)
- [ ] Delete model and verify cascade

## Files Changed

```
supabase/add_integrations.sql                         [NEW] DB schema
src/lib/posting/adspower.ts                          [MODIFIED] Multi-tenant
src/lib/posting/geelark.ts                           [MODIFIED] Multi-tenant
src/app/api/integrations/route.ts                    [NEW] Integration CRUD
src/app/api/integrations/test/route.ts               [NEW] Connection test
src/app/api/models/route.ts                          [NEW] Model CRUD
src/app/api/models/[id]/route.ts                     [NEW] Model delete
src/app/api/accounts/profiles/import/route.ts        [NEW] Profile import
src/app/(dashboard)/settings/integrations/page.tsx   [NEW] Integration UI
src/app/(dashboard)/accounts/page.tsx                [NEW] Model management UI
src/app/(dashboard)/posting/page.tsx                 [MODIFIED] Enhanced UI
```

## Deployment

1. Run the SQL migration in Supabase:
   ```sql
   -- Copy contents of supabase/add_integrations.sql
   ```

2. Deploy Next.js app:
   ```bash
   vercel --token [TOKEN] --yes --prod
   ```

3. Test in production environment

## Git Commit

```
commit: ✨ Multi-tenant posting — each agency connects their own AdsPower/GeeLark
```
