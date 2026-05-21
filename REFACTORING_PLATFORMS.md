# Omniflow — Refactoring: Separate Chatting & Social Networks

**Date:** 2026-05-21  
**Status:** ✅ Complete  
**Commit:** `9c5c36c`

---

## Overview

This refactoring introduces a clear **separation of concerns** between:

1. **Chatting IA Platforms** — Where AI chatbots respond to fan messages
2. **Social Networks** — Where content is posted automatically
3. **Finance & Crypto** — Tracking integrations (unchanged)

---

## Key Changes

### 1. Model Data Structure

#### Before
```typescript
model {
  id: string
  name: string
  platform: string  // Single field, mixed purposes
  status: string
}
```

#### After
```typescript
model {
  id: string
  name: string
  chatting_platforms: string[]    // ['onlyfans', 'mym']
  social_networks: string[]       // ['instagram', 'tiktok', 'telegram', 'twitter', 'reddit']
  status: string
}
```

---

## Detailed Breakdown

### Chatting Platforms (Chatting IA)
These are where the AI handles fan messages and interactions:

| Platform | Emoji | Config Field | Tokens Needed |
|----------|-------|--------------|-----------------|
| OnlyFans | 🔵 | `onlyfans` | userId, authId, sess, bcTokens, userAgent |
| MYM | 🩷 | `mym` | api_key |

**Location in UI:** Settings → Integrations → **💬 Chatting IA**

---

### Social Networks (Content Posting)
These are where content gets posted automatically:

| Platform | Emoji | Config Field | Tool |
|----------|-------|--------------|------|
| Instagram | 📸 | `instagram` | AdsPower / GeeLark |
| TikTok | 🎵 | `tiktok` | AdsPower / GeeLark |
| Telegram | ✈️ | `telegram` | AdsPower / GeeLark |
| Twitter/X | 🐦 | `twitter` | AdsPower / GeeLark |
| Reddit | 🟠 | `reddit` | Reddit API |

**Location in UI:** Settings → Integrations → **📤 Posting**

---

### Finance & Crypto (Unchanged)

| Platform | Emoji |
|----------|-------|
| Binance | 🪙 |
| Coinbase | 🏢 |

**Location in UI:** Settings → Integrations → **💰 Finance & Crypto**

---

## UI/UX Changes

### Accounts Page (`/dashboard/accounts`)

#### Before
- Single "Platforms" section with mixed toggle options
- Confusing which platforms were for chatting vs posting

#### After
- **Section 1: Plateformes pour Chatting IA** 
  - Clear messaging: "Sélectionnez où vos clients discuteront avec l'IA"
  - Only OnlyFans + MYM options
  - Purple accent color

- **Section 2: Réseaux sociaux (pour le posting)**
  - Clear messaging: "Sélectionnez où poster votre contenu via AdsPower/GeeLark"
  - Instagram, TikTok, Telegram, Twitter/X, Reddit options
  - Cyan accent color

#### Model Cards
- **Top section:** Chatting platforms with purple badges
- **Bottom section:** Social networks with cyan badges
- Visual separation with border divider

---

### Integrations Page (`/dashboard/settings/integrations`)

#### Categories (Reorganized)

**1. 💬 Chatting IA - Plateformes Creator**
- OnlyFans (🔵)
- MYM (🩷)
- Description: "Connectez vos comptes creator pour que l'IA réponde aux messages de vos fans"

**2. 📤 Posting - Navigateurs & Réseaux**
- AdsPower (🌐)
- GeeLark (☁️)
- Reddit API (🟠)
- Description: "Connectez vos navigateurs anti-détection pour automatiser le posting sur les réseaux sociaux"

**3. 💰 Finance & Crypto**
- Binance (🪙)
- Coinbase (🏢)
- Description: "Synchronisez vos portefeuilles crypto pour le suivi financier"

---

## Database Changes

### New Columns (models table)

```sql
ALTER TABLE models
ADD COLUMN chatting_platforms text[] DEFAULT '{}',
ADD COLUMN social_networks text[] DEFAULT '{}';
```

### Migration File
`supabase/update_models_platforms.sql` — Non-destructive migration that:
- Adds new columns with default empty arrays
- Creates GIN indexes for fast lookups
- Preserves legacy `platform` column for backward compatibility

### Example Data

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Leelou",
  "chatting_platforms": ["onlyfans", "mym"],
  "social_networks": ["instagram", "tiktok", "reddit"],
  "status": "active"
}
```

---

## API Changes

### POST /api/models

#### Request Body (New)
```typescript
{
  name: string
  chatting_platforms: string[]    // e.g., ['onlyfans', 'mym']
  social_networks: string[]       // e.g., ['instagram', 'tiktok', 'reddit']
}
```

#### Validation
- At least one platform must be selected (from either category)
- Only valid platform IDs are accepted
- Returns 400 error if no platforms provided

---

## Integration Endpoints (No Changes)

These remain unchanged but are now clearly categorized:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/integrations` | Save integration credentials |
| `POST /api/integrations/test` | Test connection |
| `GET /api/integrations` | Get all integrations |

---

## Component Updates

### `/app/(dashboard)/accounts/page.tsx`
- **Removed:** Confusing multi-select platform field
- **Added:** Two distinct section components
  - `chattingPlatforms` array with clear UX
  - `socialNetworks` array with clear UX
- **Updated:** Form validation requires at least one selection
- **Visual:** Purple theme for chatting, cyan for social

### `/app/(dashboard)/settings/integrations/page.tsx`
- **Reorganized:** Categories now match business logic (chatting vs posting)
- **Added:** Reddit integration with full support
- **Improved:** Help text clarifies purpose of each integration category
- **Updated:** Security tips mention separation of credentials

---

## Migration Path for Existing Data

For agencies with existing models using the old `platform` field:

### Option 1: Automatic (Recommended)
```sql
-- OnlyFans/MYM models → chatting_platforms
UPDATE models 
SET chatting_platforms = ARRAY[platform]
WHERE platform IN ('onlyfans', 'mym');

-- Social networks → social_networks
UPDATE models 
SET social_networks = ARRAY[platform]
WHERE platform IN ('instagram', 'tiktok', 'telegram', 'twitter');
```

### Option 2: Manual
Users can re-edit their models in the UI (one-time action) to select platforms correctly.

---

## Future Enhancements

### Reserved Platforms (Not Yet Implemented)
- **Snapchat** (snap) — For future AdsPower integration
- **YouTube** (youtube) — For channel management

These are reserved in the database schema but not exposed in the UI yet.

---

## Testing Checklist

- [ ] Create new model with chatting platforms only
- [ ] Create new model with social networks only
- [ ] Create new model with both platform types
- [ ] Verify model cards display correct badges
- [ ] Test integrations page shows correct categories
- [ ] Verify Reddit integration form shows proper fields
- [ ] Test platform validation (error when none selected)
- [ ] Verify existing models still load (backward compatibility)

---

## Files Modified

```
src/app/(dashboard)/accounts/page.tsx
src/app/(dashboard)/settings/integrations/page.tsx
src/app/api/models/route.ts
supabase/update_models_platforms.sql
```

---

## Benefits

✅ **Clarity** — Users understand which integrations are for chatting vs posting  
✅ **Separation** — Credentials are organized by purpose  
✅ **Scalability** — Easy to add more platforms in each category later  
✅ **UX** — Visual hierarchy makes the dashboard more intuitive  
✅ **Flexibility** — Models can have both chatting and posting capabilities simultaneously  

---

## Rollback Plan

If needed, the changes are backward compatible:
1. The legacy `platform` column remains in the database
2. Frontend still accepts old data format
3. Can revert to single-field UI if needed (not recommended)

To rollback: `git revert 9c5c36c`

---

## Questions?

For implementation questions, refer to:
- Model creation flow: `src/app/(dashboard)/accounts/page.tsx`
- Integration setup: `src/app/(dashboard)/settings/integrations/page.tsx`
- Database schema: `supabase/update_models_platforms.sql`
