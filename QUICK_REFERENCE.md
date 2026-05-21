# Quick Reference - Multi-Tenant Posting System

## What Was Done

The posting system has been completely refactored from a single-tenant architecture (global environment variables) to a multi-tenant architecture where **each agency manages its own API keys**.

### Before ❌
```
ADSPOWER_API_KEY=xxx  (global, shared by all agencies)
GEELARK_API_KEY=yyy   (global, shared by all agencies)
```
**Problem:** All agencies using the same keys, security issue, no isolation.

### After ✅
```
Database Table: agency_integrations
├── Agency A
│   ├── AdsPower: api_key_a
│   └── GeeLark: api_key_a
└── Agency B
    ├── AdsPower: api_key_b
    └── Telegram: bot_token_b
```
**Solution:** Each agency has its own keys, stored securely in database with RLS.

## Key Features

### 1. Settings → Integrations Page
**Location:** `/dashboard/settings/integrations`

Users can:
- Connect AdsPower (with local URL option)
- Connect GeeLark
- Connect Telegram Bot
- Test each connection
- Update keys anytime

### 2. Accounts → Model Management
**Location:** `/dashboard/accounts`

Users can:
- Create models (Leelou, Sophie, etc.)
- Import profiles from their connected AdsPower/GeeLark
- Assign profiles to models
- Delete models

### 3. Enhanced Posting UI
**Location:** `/dashboard/posting`

Users can:
- Select a model from dropdown
- Profile and tool auto-populate
- Schedule posts with proper multi-tenant support

## Database Schema

Two new tables in Supabase:

```sql
agency_integrations {
  id, agency_id, tool, api_key, api_url, is_active, created_at
}

model_profiles {
  id, model_id, agency_id, tool, profile_id, platform, profile_name, is_active
}
```

⚠️ **Must run the SQL migration:** `supabase/add_integrations.sql`

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/integrations` | GET | List agency integrations |
| `/api/integrations` | POST | Save/update integration |
| `/api/integrations/test` | POST | Test connection (AdsPower/GeeLark/Telegram) |
| `/api/models` | GET | List models with profiles |
| `/api/models` | POST | Create model |
| `/api/models/[id]` | DELETE | Delete model |
| `/api/accounts/profiles/import` | POST | Import profiles from tool |

## Library Functions Updated

All functions now accept `apiKey` and `apiUrl` as parameters instead of using globals:

```typescript
// AdsPower
listProfiles(apiKey: string, apiUrl: string)
openProfile(apiKey: string, apiUrl: string, profileId: string)
closeProfile(apiKey: string, apiUrl: string, profileId: string)

// GeeLark
listProfiles(apiKey: string)
postToTikTok(apiKey: string, profileId: string, videoUrl: string, caption: string)
postToInstagram(apiKey: string, profileId: string, mediaUrl: string, caption: string)
```

## Security

✅ API keys encrypted at rest in Supabase
✅ Row-Level Security on all integration tables
✅ Keys never returned in API responses
✅ Each agency isolated from others
✅ User authentication required

## Deployment Steps

1. **Run SQL migration:**
   ```bash
   # In Supabase SQL Editor, copy contents of:
   supabase/add_integrations.sql
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --token YOUR_TOKEN --yes --prod
   ```

3. **Test:**
   - Create agency and go to Settings → Integrations
   - Connect AdsPower/GeeLark
   - Go to Accounts and create a model
   - Go to Posting and test scheduling

## Troubleshooting

**"No AdsPower integration found"**
→ User must first configure integration in Settings → Integrations

**"Failed to import profiles"**
→ Check if API key is valid, test connection first

**"Profil not found"**
→ Profile ID might be wrong or the tool API might have changed

## Files to Review

- `MULTI_TENANT_IMPLEMENTATION.md` - Full technical docs
- `supabase/add_integrations.sql` - Database schema
- `src/app/(dashboard)/settings/integrations/page.tsx` - Integration settings UI
- `src/app/(dashboard)/accounts/page.tsx` - Model management UI
- `src/app/api/integrations/*` - Backend endpoints

## Environment Variables

No changes needed! The system no longer relies on global environment variables for API keys.

(Only keep any other env vars you have, like NEXT_PUBLIC_SUPABASE_URL, etc.)

## Git History

```
commit: ✨ Multi-tenant posting — each agency connects their own AdsPower/GeeLark
```

Run: `git log --oneline` to see the commit hash.
