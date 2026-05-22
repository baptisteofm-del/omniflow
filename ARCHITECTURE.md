# Architecture Overview - Model Avatar & Platform Branding

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS FRONTEND                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Pages                                                        │  │
│  │ ┌──────────────────────────────────────────────────────────┐│  │
│  │ │ /accounts/page.tsx (Client Component)                   ││  │
│  │ │  - Model listing & grid                                 ││  │
│  │ │  - Avatar upload (with progress)                        ││  │
│  │ │  - Create/Edit modal form                               ││  │
│  │ │  - Platform selection UI                                ││  │
│  │ │  - Clickable stats & badges                             ││  │
│  │ └──────────────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Components                                                   │  │
│  │ ┌──────────────────────────────────────────────────────────┐│  │
│  │ │ /components/PlatformLogos.tsx                            ││  │
│  │ │  - OnlyFansLogo (SVG)                                    ││  │
│  │ │  - MYMLogo (SVG)                                         ││  │
│  │ │  - InstagramLogo (SVG gradient)                          ││  │
│  │ │  - TikTokLogo (SVG)                                      ││  │
│  │ │  - TelegramLogo (SVG)                                    ││  │
│  │ │  - TwitterLogo (SVG)                                     ││  │
│  │ │  - PlatformLogo (universal selector)                     ││  │
│  │ └──────────────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ State Management                                             │  │
│  │  - models: Model[]                                           │  │
│  │  - modelStats: Record<id, {revenue_month, posts_count}>      │  │
│  │  - uploadingAvatar: Record<id, boolean>                      │  │
│  │  - form: {name, bio, platforms...}                           │  │
│  │  - showForm, editingModel, loading flags                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓ HTTP Requests
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /api/models/route.ts                                         │  │
│  │  GET  - List all models for agency                           │  │
│  │  POST - Create new model                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /api/models/[id]/route.ts                                    │  │
│  │  PATCH - Update model (NEW)                                  │  │
│  │  DELETE - Delete model                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /api/models/avatar/route.ts (NEW)                            │  │
│  │  POST - Upload avatar image                                  │  │
│  │         - Validate file type                                 │  │
│  │         - Upload to Supabase Storage                         │  │
│  │         - Return public URL                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /api/models/stats/route.ts (NEW)                             │  │
│  │  GET - Get revenue & post count per model                    │  │
│  │        - Query transactions table (current month)            │  │
│  │        - Query scheduled_posts table                         │  │
│  │        - Aggregate by model_id                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /api/integrations/route.ts (ENHANCED)                        │  │
│  │  GET - List integrations with optional filters               │  │
│  │        - ?tool=onlyfans,mym                                  │  │
│  │        - ?is_active=true                                     │  │
│  │  POST - Create/update integration                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /api/dashboard/stats/route.ts (ENHANCED)                     │  │
│  │  GET - Dashboard statistics                                  │  │
│  │        - Check for active integrations                       │  │
│  │        - Return 0 stats if no integrations                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓ SQL Queries
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                          │  │
│  │                                                              │  │
│  │ models table (UPDATED)                                       │  │
│  │  ├─ id (uuid) [PRIMARY KEY]                                 │  │
│  │  ├─ agency_id (uuid) [FOREIGN KEY]                          │  │
│  │  ├─ name (text)                                             │  │
│  │  ├─ avatar_url (text) ★ NEW                                 │  │
│  │  ├─ bio (text) ★ NEW                                        │  │
│  │  ├─ chatting_platforms (text[])                             │  │
│  │  ├─ social_networks (text[])                                │  │
│  │  ├─ linked_integration_id (uuid) ★ NEW                      │  │
│  │  ├─ linked_platform (text) ★ NEW                            │  │
│  │  ├─ status (text)                                           │  │
│  │  └─ created_at (timestamptz)                                │  │
│  │                                                              │  │
│  │ Indexes Created: ★ NEW                                       │  │
│  │  ├─ models_linked_integration_id_idx                        │  │
│  │  └─ models_linked_platform_idx                              │  │
│  │                                                              │  │
│  │ Related Tables (queries from):                               │  │
│  │  ├─ transactions (for revenue stats)                        │  │
│  │  ├─ scheduled_posts (for post counts)                       │  │
│  │  ├─ agencies (for ownership)                                │  │
│  │  └─ agency_integrations (for filtering)                     │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Storage (S3-compatible)                                      │  │
│  │                                                              │  │
│  │ Bucket: avatars (public)                                     │  │
│  │  ├─ {agencyId}/                                             │  │
│  │  │   ├─ {modelId}.jpg                                       │  │
│  │  │   ├─ {modelId}.png                                       │  │
│  │  │   └─ {modelId}.webp                                      │  │
│  │  └─ [CDN served via Cloudflare/AWS]                         │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Authentication (Supabase Auth)                               │  │
│  │  ├─ User verification via JWT                               │  │
│  │  ├─ Row-level security (RLS) policies                       │  │
│  │  └─ Agency isolation                                        │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Avatar Upload Flow

```
User Interface                  API Route                Storage
─────────────────              ─────────────            ─────────
   [Click Upload]
        ↓
   [Select Image]
        ↓
   [Validate File] ──→ /api/models/avatar ─→ Validate MIME type
        ↓                      ↓                      ↓
   [Disable Button]        [Parse FormData]    [Check size < 5MB]
        ↓                      ↓                      ↓
   [Show Spinner] ──→ [Get agency/model info] ←── [Verify ownership]
        ↓                      ↓
   [Waiting...]       [Upload to Storage]
        ↓                      ↓
                    [Get Public URL]
        ↓                      ↓
   [Update State] ← ← ← [Update DB record]
        ↓                      ↓
   [Display Avatar]   [Return avatar_url]
        ↓
   [Save Successful] ← ← ← ← ← ← ← ← ← [Toast: Success]
```

### 2. Model Stats Loading Flow

```
Page Load                  API Route              Database
─────────────             ─────────────           ────────────
[Render Page]
     ↓
[useEffect fires]
     ↓
[Load Models] ──→ GET /api/models ──→ Query models table
     ↓                                       ↓
[setState(models)]  ← ← ← Return models ← ← ← 
     ↓
[Load Stats] ──→ GET /api/models/stats ──→ Get all model IDs
     ↓                                     ↓
     ↓                      For each model:
     ↓                      ├─ Sum transactions (revenue_month)
     ↓                      ├─ Count scheduled_posts (posts_count)
     ↓                      ↓
[setState(stats)]  ← ← ← Return stats ← ← ←
     ↓
[Rerender Cards]
     ↓
[Display Stats]
     ↓
[Stats merged by model_id]
```

### 3. Model Edit Flow

```
User Action              Frontend               Backend           DB
─────────────           ─────────────          ─────────         ────
[Click Settings]
     ↓
[Modal Opens]
     ↓
[setForm(model)] ←── Load current values
     ↓
[User edits]
     ↓
[Click Save] ────→ POST/PATCH /api/models/[id]
     ↓                  ↓
                   Validate auth
                        ↓
                   Verify ownership  
                        ↓
                   Build update object
                        ↓
                   UPDATE models table ──→ [Update record]
                        ↓                        ↓
                   Return updated model ← ← ← ← 
     ↓                  ↓
[Close Modal]  ← ← ← Success response
     ↓
[Reload Models] ──→ Fetch fresh data
     ↓
[Display Changes]
```

### 4. Navigation Flow

```
User Click          Target                  Destination
──────────         ──────                  ────────────
[OnlyFans Badge] ──→ Link component ──→ /chatting/ai
[MYM Badge]      ──→ Link component ──→ /chatting/ai
[Instagram Badge]──→ Link component ──→ /posting
[TikTok Badge]   ──→ Link component ──→ /posting
[Telegram Badge] ──→ Link component ──→ /posting
[Twitter Badge]  ──→ Link component ──→ /posting

[Revenus Stat]   ──→ Link component ──→ /finance
[Posts Stat]     ──→ Link component ──→ /posting
```

## Component Hierarchy

```
<AccountsPage> (Client Component)
  │
  ├─ State Management
  │   ├─ models: Model[]
  │   ├─ modelStats: Stats
  │   ├─ form: FormData
  │   ├─ editingModel: Model | null
  │   └─ uploadingAvatar: Record<id, bool>
  │
  ├─ Effects
  │   └─ useEffect: loadModels() & loadStats()
  │
  ├─ Event Handlers
  │   ├─ handleAvatarUpload()
  │   ├─ handleCreateModel()
  │   ├─ handleDeleteModel()
  │   ├─ openEditForm()
  │   └─ handleSelectProfile()
  │
  └─ Render
      ├─ Header
      │   ├─ Title & Description
      │   └─ Add Model Button
      ├─ Loading State (Loader2 spinner)
      ├─ Empty State (when no models)
      └─ Grid: Model Cards
          └─ <ModelCard>
              ├─ Avatar Section
              │   ├─ Image or Initial
              │   └─ Upload Button (with <PlatformLogo>)
              ├─ Stats Section (clickable)
              │   ├─ Revenue Stat → Link to /finance
              │   └─ Posts Stat → Link to /posting
              ├─ Chatting Platforms
              │   └─ Badge[] (with <PlatformLogo>, clickable)
              ├─ Social Networks
              │   └─ Badge[] (with <PlatformLogo>, clickable)
              ├─ Config Button
              └─ Actions (Edit, Delete on hover)
      └─ Modal: Create/Edit Form
          ├─ Name Input
          ├─ Bio Textarea
          ├─ Chatting Platforms (Toggle buttons)
          ├─ Social Networks (Toggle buttons)
          └─ Submit/Cancel Buttons
```

## API Endpoint Specifications

### Avatar Upload
```
POST /api/models/avatar

Request:
  FormData {
    file: File (image),
    modelId: string
  }

Response (200):
  {
    success: true,
    avatar_url: "https://..."
  }

Errors:
  401 - Unauthorized
  400 - Missing fields or invalid file
  404 - Model not found or doesn't belong to agency
  500 - Server error
```

### Model Stats
```
GET /api/models/stats

Request:
  None

Response (200):
  {
    stats: {
      "model-id-1": {
        revenue_month: 3200,
        posts_count: 24
      },
      "model-id-2": {
        revenue_month: 0,
        posts_count: 0
      }
    }
  }

Notes:
  - Returns 0 for models with no data
  - Month is current calendar month
```

### Model PATCH (Update)
```
PATCH /api/models/[id]

Request:
  {
    name?: string,
    bio?: string,
    avatar_url?: string,
    chatting_platforms?: string[],
    social_networks?: string[],
    linked_integration_id?: uuid,
    linked_platform?: string
  }

Response (200):
  {
    success: true,
    model: {
      id: string,
      name: string,
      bio: string,
      avatar_url: string,
      chatting_platforms: string[],
      social_networks: string[],
      ...
    }
  }

Errors:
  401 - Unauthorized
  404 - Model not found
  500 - Server error
```

### Integrations (Enhanced)
```
GET /api/integrations?tool=onlyfans,mym&is_active=true

Query Parameters:
  tool: string (comma-separated, optional)
    Valid: onlyfans, mym, adspower, geelark, etc.
  is_active: boolean (optional)

Response (200):
  {
    integrations: [
      {
        id: uuid,
        agency_id: uuid,
        tool: string,
        api_key: string (encrypted/masked),
        is_active: boolean,
        ...
      }
    ]
  }

Notes:
  - All filters are optional
  - API key is masked in response
```

## Database Query Patterns

### Get Model with Avatar
```sql
SELECT id, name, avatar_url, bio, 
       chatting_platforms, social_networks
FROM models
WHERE agency_id = $1 AND id = $2;
```

### Get Monthly Revenue per Model
```sql
SELECT model_id, SUM(amount) as revenue_month
FROM transactions
WHERE agency_id = $1 
  AND type = 'income'
  AND date >= date_trunc('month', NOW())
GROUP BY model_id;
```

### Get Monthly Post Count per Model
```sql
SELECT model_id, COUNT(*) as posts_count
FROM scheduled_posts
WHERE agency_id = $1
  AND created_at >= date_trunc('month', NOW()::timestamptz)
GROUP BY model_id;
```

### Check Active Integrations
```sql
SELECT COUNT(*) as active_count
FROM agency_integrations
WHERE agency_id = $1 AND is_active = true;
```

## Security Architecture

```
Request
  ↓
[CORS Check] ──→ Verify origin
  ↓
[Auth Check] ──→ JWT token validation
  ↓
[Agency Check] ──→ User belongs to agency
  ↓
[Ownership Check] ──→ Resource belongs to agency
  ↓
[Input Validation] ──→ Type & size checks
  ↓
[Rate Limiting] ──→ Prevent abuse (integrations: 5/min)
  ↓
[Execute] ──→ Database operation
  ↓
[Audit Log] ──→ Log important actions
  ↓
Response ──→ [Mask sensitive data]
```

## Deployment Architecture

```
GitHub
  ↓
  └─→ [Push to main branch]
       ↓
       Vercel Build
       ├─ Install dependencies
       ├─ Type check (tsc)
       ├─ Build Next.js
       └─ Generate static assets
       ↓
       Vercel Deploy
       ├─ Deploy to CDN
       ├─ Route traffic
       └─ Invalidate caches
       ↓
Supabase
  ├─ Database migrations (manual or CLI)
  ├─ Storage buckets (pre-created)
  └─ RLS policies (pre-configured)
```

## Monitoring & Observability

```
Frontend Metrics
  ├─ Page load time
  ├─ Avatar upload success rate
  ├─ Form submission rate
  └─ Navigation click tracking

Backend Metrics
  ├─ API response times
  ├─ Error rates (by endpoint)
  ├─ File upload sizes/counts
  ├─ Database query times
  └─ Rate limit hits

Database Metrics
  ├─ Query performance
  ├─ Connection pool usage
  ├─ Storage usage
  └─ Backup status

Storage Metrics
  ├─ Upload success rate
  ├─ Average file size
  ├─ Bandwidth usage
  └─ CDN cache hit rate
```

---

**Architecture Version:** 1.0  
**Last Updated:** May 22, 2026  
**Status:** Production Ready
