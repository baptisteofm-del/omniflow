# Platform Configuration Reference Card

**Quick lookup for all platform configurations in Omniflow**

---

## 🔵 CHATTING PLATFORMS

### OnlyFans
```typescript
Platform: 'onlyfans'
Category: Chatting IA
Integration Type: Cookie-based
Required Credentials:
  - userId: (string) User account ID
  - authId: (string) auth_id cookie value
  - sess: (string) sess cookie value
  - bcTokens: (string) bc-tokens-p11 cookie value
  - userAgent: (string) Browser user agent

How to Get:
  1. Open OnlyFans.com
  2. Login to your account
  3. Press F12 (DevTools)
  4. Go to Application tab
  5. Find Cookies under onlyfans.com
  6. Copy values for each field

Component: /app/(dashboard)/accounts/page.tsx
Integration: /app/(dashboard)/settings/integrations/page.tsx
API Route: POST /api/integrations
```

### MYM (MYM.fans)
```typescript
Platform: 'mym'
Category: Chatting IA
Integration Type: API Key
Required Credentials:
  - api_key: (string) Bearer token from MYM dashboard

How to Get:
  1. Log in to MYM.fans
  2. Go to Developer Settings
  3. Create new API application
  4. Copy the API key/Bearer token

Component: /app/(dashboard)/accounts/page.tsx
Integration: /app/(dashboard)/settings/integrations/page.tsx
API Route: POST /api/integrations
```

---

## 🟠 SOCIAL NETWORKS (Posting)

### Instagram
```typescript
Platform: 'instagram'
Category: Social Networks
Integration Type: AdsPower/GeeLark
Posting Tool: AdsPower or GeeLark browser
Requirements:
  - AdsPower running locally OR
  - GeeLark cloud account configured

How to Setup:
  1. Install AdsPower on your PC
  2. OR create GeeLark cloud account
  3. Configure in Settings > Integrations
  4. Select 'Instagram' in model config

Component: /app/(dashboard)/accounts/page.tsx
Posting Flow: Uses configured AdsPower/GeeLark
API Route: /api/posting/schedule (future)
```

### TikTok
```typescript
Platform: 'tiktok'
Category: Social Networks
Integration Type: AdsPower/GeeLark
Posting Tool: AdsPower or GeeLark browser
Requirements:
  - AdsPower running locally OR
  - GeeLark cloud account configured

How to Setup:
  1. Install AdsPower on your PC
  2. OR create GeeLark cloud account
  3. Configure in Settings > Integrations
  4. Select 'TikTok' in model config

Component: /app/(dashboard)/accounts/page.tsx
Posting Flow: Uses configured AdsPower/GeeLark
API Route: /api/posting/schedule (future)
```

### Telegram
```typescript
Platform: 'telegram'
Category: Social Networks
Integration Type: AdsPower/GeeLark
Posting Tool: AdsPower or GeeLark browser
Requirements:
  - AdsPower running locally OR
  - GeeLark cloud account configured

How to Setup:
  1. Install AdsPower on your PC
  2. OR create GeeLark cloud account
  3. Configure in Settings > Integrations
  4. Select 'Telegram' in model config

Component: /app/(dashboard)/accounts/page.tsx
Posting Flow: Uses configured AdsPower/GeeLark
API Route: /api/posting/schedule (future)
```

### Twitter/X
```typescript
Platform: 'twitter'
Category: Social Networks
Integration Type: AdsPower/GeeLark
Posting Tool: AdsPower or GeeLark browser
Requirements:
  - AdsPower running locally OR
  - GeeLark cloud account configured

How to Setup:
  1. Install AdsPower on your PC
  2. OR create GeeLark cloud account
  3. Configure in Settings > Integrations
  4. Select 'Twitter' in model config

Component: /app/(dashboard)/accounts/page.tsx
Posting Flow: Uses configured AdsPower/GeeLark
API Route: /api/posting/schedule (future)
```

### Reddit 🟠 **NEW**
```typescript
Platform: 'reddit'
Category: Social Networks
Integration Type: OAuth 2.0
Required Credentials:
  - client_id: (string) Reddit app client ID
  - client_secret: (string) Reddit app secret
  - refresh_token: (string) OAuth refresh token

How to Get:
  1. Go to https://www.reddit.com/prefs/apps
  2. Create new "script" application
  3. Copy the client_id from app details
  4. Copy the client_secret from app details
  5. Generate refresh_token via OAuth flow
  6. Copy values to integration form

Component: /app/(dashboard)/accounts/page.tsx
Integration: /app/(dashboard)/settings/integrations/page.tsx
API Route: POST /api/integrations
Auth Flow: OAuth 2.0 with token refresh
```

---

## 💰 FINANCE & CRYPTO

### Binance
```typescript
Platform: 'binance'
Category: Finance & Crypto
Integration Type: API Keys
Required Credentials:
  - api_key: (string) Binance API key
  - secret_key: (string) Binance secret key

How to Get:
  1. Log in to Binance
  2. Go to Account > API Management
  3. Create new API key
  4. Set to "Read Only" (important!)
  5. Copy API Key and Secret Key

Component: /app/(dashboard)/settings/integrations/page.tsx
API Route: POST /api/integrations
Permissions: Read-only recommended
Security: Never share secret key
```

### Coinbase
```typescript
Platform: 'coinbase'
Category: Finance & Crypto
Integration Type: API Key
Required Credentials:
  - api_key: (string) Coinbase API key

How to Get:
  1. Log in to Coinbase
  2. Go to Settings > API
  3. Create new API key
  4. Copy the API key
  5. Paste in integration form

Component: /app/(dashboard)/settings/integrations/page.tsx
API Route: POST /api/integrations
Scopes: Account read
Security: Keep key confidential
```

---

## 🔌 ANTI-DETECT BROWSERS (for Posting)

### AdsPower
```typescript
Tool: 'adspower'
Category: Posting Infrastructure
Type: Local Anti-detect Browser
Required Config:
  - api_url: (string) Local URL (default: http://local.adspower.net:50325)

How to Setup:
  1. Download AdsPower from adspower.net
  2. Install on your PC
  3. Run AdsPower service
  4. Get local API URL (usually http://local.adspower.net:50325)
  5. Enter in integrations form
  6. Select in model config

Component: /app/(dashboard)/settings/integrations/page.tsx
API Route: POST /api/integrations
Profiles: Managed in AdsPower desktop app
Posting: Uses profiles configured in AdsPower
```

### GeeLark
```typescript
Tool: 'geelark'
Category: Posting Infrastructure
Type: Cloud Anti-detect Browser
Required Config:
  - api_key: (string) GeeLark API key

How to Setup:
  1. Sign up at geelark.com
  2. Create account
  3. Get API key from dashboard
  4. Enter in integrations form
  5. Select in model config

Component: /app/(dashboard)/settings/integrations/page.tsx
API Route: POST /api/integrations
Profiles: Managed in GeeLark cloud
Posting: Uses cloud profiles configured in GeeLark
Cloud: No local setup required
```

---

## 📊 Data Structure Reference

### Model Configuration (Database)
```typescript
type Model = {
  id: UUID
  agency_id: UUID
  name: string                    // e.g., "Leelou"
  chatting_platforms: string[]    // e.g., ["onlyfans", "mym"]
  social_networks: string[]       // e.g., ["instagram", "tiktok", "reddit"]
  status: 'active' | 'inactive'
  created_at: timestamp
  updated_at: timestamp
}
```

### Valid Platform Values
```typescript
// Chatting Platforms
const chatting = ['onlyfans', 'mym']

// Social Networks
const social = ['instagram', 'tiktok', 'telegram', 'twitter', 'reddit']

// Reserved (future)
const reserved = ['snapchat', 'youtube']

// Finance
const finance = ['binance', 'coinbase']

// Posting Tools
const tools = ['adspower', 'geelark', 'reddit']
```

### API Request Example
```typescript
// POST /api/models
{
  name: "Leelou",
  chatting_platforms: ["onlyfans", "mym"],
  social_networks: ["instagram", "tiktok", "reddit"]
}
```

### API Response Example
```typescript
{
  success: true,
  model: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    agency_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Leelou",
    chatting_platforms: ["onlyfans", "mym"],
    social_networks: ["instagram", "tiktok", "reddit"],
    status: "active",
    created_at: "2026-05-21T21:59:00Z"
  }
}
```

---

## 🔗 File Locations

| Component | Path |
|-----------|------|
| Accounts Page | `/src/app/(dashboard)/accounts/page.tsx` |
| Integrations Page | `/src/app/(dashboard)/settings/integrations/page.tsx` |
| Models API | `/src/app/api/models/route.ts` |
| Integrations API | `/src/app/api/integrations/route.ts` |
| Integration Test | `/src/app/api/integrations/test/route.ts` |
| DB Migration | `/supabase/update_models_platforms.sql` |

---

## 🧪 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/models` | Create new model |
| GET | `/api/models` | Get user's models |
| DELETE | `/api/models/:id` | Delete model |
| POST | `/api/integrations` | Save integration |
| GET | `/api/integrations` | Get user's integrations |
| POST | `/api/integrations/test` | Test connection |

---

## 🚀 Quick Start for New Platform

To add a new platform (e.g., Snapchat):

1. **Update accounts page:**
   ```typescript
   socialNetworks.push({ id: 'snapchat', label: '👻 Snapchat', icon: '👻' })
   ```

2. **Update integrations page:**
   ```typescript
   integrations.push({
     id: 'snapchat',
     name: 'Snapchat',
     category: 'posting',
     fields: ['api_key', 'api_secret']
   })
   ```

3. **Update database:**
   ```sql
   COMMENT ON COLUMN models.social_networks IS 'Array of social networks (instagram, tiktok, telegram, twitter, reddit, snapchat)';
   ```

4. **Test & deploy**

---

## ⚠️ Important Security Notes

🔒 **Never:**
- Share API keys in public repositories
- Log credential values
- Send credentials in plain text
- Commit `.env.local` to git

✅ **Always:**
- Use environment variables for secrets
- Encrypt credentials at rest
- Use HTTPS for API calls
- Rotate tokens regularly
- Use read-only permissions when available

---

## 📞 Troubleshooting

**AdsPower not connecting?**
- Check service is running: `http://local.adspower.net:50325`
- Verify firewall allows connection
- Check API URL format in settings

**OnlyFans cookies not working?**
- Cookies may have expired, re-extract from browser
- Ensure all fields filled correctly
- Check user agent matches browser

**Reddit OAuth failing?**
- Verify client_id and client_secret correct
- Check refresh_token not expired
- Ensure app is configured as "script" type

**Binance API error?**
- Confirm API key is "Read-only"
- Check IP whitelist includes server
- Verify secret key not exposed

---

## 📚 Additional Resources

- **Full Docs:** `REFACTORING_PLATFORMS.md`
- **Visual Guide:** `PLATFORMS_VISUAL_GUIDE.md`
- **Summary:** `REFACTORING_SUMMARY.md`
- **Git Commit:** `5acd8a9`

---

**Last Updated:** 2026-05-21  
**Version:** 1.0  
**Status:** ✅ Production Ready
