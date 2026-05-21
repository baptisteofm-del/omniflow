# Visual Guide: Chatting vs Social Networks

## 🎯 The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                    OMNIFLOW MODEL MANAGEMENT                 │
└─────────────────────────────────────────────────────────────┘

    MODEL: "Leelou" 👤
    ├─ Chatting IA: 🔵 OnlyFans, 🩷 MYM
    ├─ Posting: 📸 Instagram, 🎵 TikTok, 🟠 Reddit
    └─ Finance: 🪙 Binance
```

---

## 📱 Frontend Flow

### 1️⃣ Accounts Page - Modal "Ajouter un modèle"

```
┌──────────────────────────────────────────────┐
│  📝 Ajouter un modèle                        │
├──────────────────────────────────────────────┤
│                                              │
│ Nom du modèle: [____________]                │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ 💬 Plateformes pour Chatting IA             │
│ Sélectionnez où vos clients discuteront     │
│                                              │
│ [🔵 OnlyFans]  [🩷 MYM]                     │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ 📤 Réseaux sociaux (pour le posting)        │
│ Sélectionnez où poster votre contenu        │
│                                              │
│ [📸 Instagram]  [🎵 TikTok]                 │
│ [✈️ Telegram]    [🐦 Twitter/X]             │
│ [🟠 Reddit]                                 │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│     [Annuler]          [✓ Créer le modèle] │
│                                              │
└──────────────────────────────────────────────┘
```

### 2️⃣ Accounts Page - Model Cards

```
┌─────────────────────────────────┐
│ Leelou                       [🗑]│
├─────────────────────────────────┤
│                                 │
│ 💰 3.2K Revenus    📊 24 Posts │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💬 CHATTING IA              │ │
│ │ [🔵 ONLYFANS] [🩷 MYM]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📤 RÉSEAUX SOCIAUX          │ │
│ │ [📸 INSTAGRAM] [🎵 TIKTOK]  │ │
│ │ [✈️ TELEGRAM] [🐦 TWITTER]   │ │
│ │ [🟠 REDDIT]                 │ │
│ └─────────────────────────────┘ │
│                                 │
│   [⚙️ Configurer]              │
│                                 │
└─────────────────────────────────┘
```

---

## ⚙️ Integrations Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                      🔧 INTÉGRATIONS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 💬 CHATTING IA - PLATEFORMES CREATOR                        │
│ Connectez vos comptes pour que l'IA réponde aux messages   │
│                                                              │
│ ┌─────────────────────┐  ┌─────────────────────┐           │
│ │ 🔵 OnlyFans         │  │ 🩷 MYM.fans         │           │
│ │ "Connectez vos..."  │  │ "Plateforme FR..."  │           │
│ │ Pas connecté ❌     │  │ Connecté ✅         │           │
│ │                     │  │                     │           │
│ │ [userId input]      │  │ [api_key input]     │           │
│ │ [authId input]      │  │                     │           │
│ │ [sess input]        │  │ [Connecter]         │           │
│ │ [Connecter]         │  └─────────────────────┘           │
│ └─────────────────────┘                                     │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ 📤 POSTING - NAVIGATEURS & RÉSEAUX                          │
│ Connectez vos navigateurs pour automatiser le posting      │
│                                                              │
│ ┌─────────────────────┐  ┌─────────────────────┐           │
│ │ 🌐 AdsPower         │  │ ☁️ GeeLark          │           │
│ │ "Anti-detect..."    │  │ "Navigateur..."     │           │
│ │ Pas connecté ❌     │  │ Pas connecté ❌     │           │
│ │                     │  │                     │           │
│ │ [api_url input]     │  │ [api_key input]     │           │
│ │ [Connecter]         │  │ [Connecter]         │           │
│ └─────────────────────┘  └─────────────────────┘           │
│                                                              │
│ ┌─────────────────────┐                                     │
│ │ 🟠 Reddit API       │                                     │
│ │ "Connectez votre..."│                                     │
│ │ Pas connecté ❌     │                                     │
│ │                     │                                     │
│ │ [client_id input]   │                                     │
│ │ [client_secret]     │                                     │
│ │ [refresh_token]     │                                     │
│ │ [Connecter]         │                                     │
│ └─────────────────────┘                                     │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ 💰 FINANCE & CRYPTO                                         │
│ Synchronisez vos portefeuilles pour le suivi financier    │
│                                                              │
│ [Binance Card]  [Coinbase Card]                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Before (Legacy)
```sql
CREATE TABLE models (
  id UUID PRIMARY KEY,
  agency_id UUID,
  name TEXT,
  platform TEXT,         -- ❌ Single field (confusing!)
  status TEXT,
  ...
);

-- platform could be: 'onlyfans', 'instagram', 'tiktok', etc.
-- Mixed purposes = confusing business logic
```

### After (New)
```sql
CREATE TABLE models (
  id UUID PRIMARY KEY,
  agency_id UUID,
  name TEXT,
  chatting_platforms TEXT[] DEFAULT '{}',  -- ✅ Clear purpose
  social_networks TEXT[] DEFAULT '{}',     -- ✅ Clear purpose
  status TEXT,
  ...
);

-- chatting_platforms: ARRAY of ['onlyfans', 'mym']
-- social_networks: ARRAY of ['instagram', 'tiktok', 'telegram', 'twitter', 'reddit']
```

### Example Records

```json
{
  "id": "model_001",
  "name": "Leelou",
  "chatting_platforms": ["onlyfans", "mym"],
  "social_networks": ["instagram", "tiktok", "reddit"],
  "status": "active"
}

{
  "id": "model_002",
  "name": "Sophie",
  "chatting_platforms": ["onlyfans"],
  "social_networks": ["instagram", "tiktok", "telegram"],
  "status": "active"
}

{
  "id": "model_003",
  "name": "Crypto_Bot",
  "chatting_platforms": [],
  "social_networks": ["reddit", "twitter"],
  "status": "active"
}
```

---

## 🔗 Data Flow Diagram

```
USER CREATES MODEL
        ↓
    [Modal Opens]
        ↓
┌─────────────────────────────┐
│ Select Chatting Platforms   │  ← OnlyFans, MYM
│ Select Social Networks      │  ← Instagram, TikTok, Telegram, Twitter, Reddit
└─────────────────────────────┘
        ↓
   [Create Model]
        ↓
┌─────────────────────────────┐
│ POST /api/models            │
│ Body:                       │
│ {                           │
│   name: "Leelou"            │
│   chatting_platforms: [...]   │
│   social_networks: [...]      │
│ }                           │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│ Database INSERT             │
│ models table                │
└─────────────────────────────┘
        ↓
[Model Card Displays]
  Purple badges: Chatting
  Cyan badges: Social
```

---

## 🛠️ Integration Setup Flow

```
USER VISITS INTEGRATIONS PAGE
        ↓
┌──────────────────────────┐
│ 💬 Chatting IA Category  │
│ - OnlyFans (OAuth)       │
│ - MYM (API Key)          │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ 📤 Posting Category      │
│ - AdsPower (Local URL)   │
│ - GeeLark (Cloud API)    │
│ - Reddit (OAuth)         │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ 💰 Finance Category      │
│ - Binance (API Keys)     │
│ - Coinbase (API Keys)    │
└──────────────────────────┘
        ↓
USER CLICKS "Connecter" on OnlyFans
        ↓
┌──────────────────────────┐
│ Input: userId            │
│ Input: authId            │
│ Input: sess              │
│ Input: bcTokens          │
│ Input: userAgent         │
└──────────────────────────┘
        ↓
POST /api/integrations/test
        ↓
[Connection Test]
        ↓
POST /api/integrations
        ↓
[Saved & Encrypted in DB]
        ↓
User Sees: "OnlyFans connecté ✅"
```

---

## 📊 Comparison Table

| Feature | Before | After |
|---------|--------|-------|
| **Platform Field** | Single `platform` | Two arrays: `chatting_platforms`, `social_networks` |
| **UI Clarity** | Mixed confusing options | Separated with clear intent |
| **OnlyFans** | Platform dropdown option | Chatting section |
| **Instagram** | Platform dropdown option | Social Networks section |
| **Integration Category** | Flat list of all tools | Organized by purpose (Chatting/Posting/Finance) |
| **Reddit Support** | ❌ Not available | ✅ Full support with OAuth |
| **Model Cards** | Single platform badge | Two separate sections |
| **Scalability** | Hard to add multi-platform support | Easy to select multiple platforms |

---

## 🎨 Color Coding

| Component | Color | Usage |
|-----------|-------|-------|
| Chatting Platforms | 🟣 Purple | OnlyFans, MYM, all chatting-related UI |
| Social Networks | 🔵 Cyan | Instagram, TikTok, Reddit, etc., posting-related UI |
| Finance | 🟡 Amber | Binance, Coinbase |
| Accent | 🟤 Gray | Neutral elements |

---

## ✨ Benefits Summary

```
BEFORE                          AFTER
├─ Confusing UI             ├─ Clear separation
├─ Mixed purposes           ├─ Dedicated sections
├─ Hard to scale            ├─ Easy to add platforms
├─ No Reddit support        ├─ Full Reddit support
├─ Hard to explain          └─ Business logic matches UI
├─ Integration chaos
└─ User confusion
```

---

## 🚀 Next Steps (Future)

1. **Snapchat support** → Add to social_networks
2. **YouTube support** → Add to social_networks
3. **WhatsApp Business** → Add to chatting_platforms
4. **Discord** → Add to social_networks
5. **Platform-specific scheduling** → Per-platform posting rules
6. **Credential rotation** → Automatic token refresh for OAuth
7. **Multi-user management** → Team members per platform

---

## 📚 Documentation Links

- Full Details: `REFACTORING_PLATFORMS.md`
- Code Changes: `git show 0f75e3f`
- Database Migration: `supabase/update_models_platforms.sql`
- Accounts Component: `src/app/(dashboard)/accounts/page.tsx`
- Integrations Page: `src/app/(dashboard)/settings/integrations/page.tsx`
- Models API: `src/app/api/models/route.ts`
