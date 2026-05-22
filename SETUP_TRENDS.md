# ⚙️ Setup Module Veille Trends

## 🔧 Mise en Place Technique

### Prérequis
- Node.js 18+
- Supabase project (gratuit)
- (Optionnel) Apify account pour TikTok/Instagram

### Étape 1: Mettre à Jour la Base de Données

#### Option A: Via Supabase Dashboard (Facile)
1. Va sur https://app.supabase.com
2. Ouvre ton project
3. Va à **"SQL Editor"**
4. Copie-colle le contenu de `supabase/migrations/add_trends_fields.sql`
5. Clique **"Run"**
6. ✅ Colonnes ajoutées!

#### Option B: Via CLI Supabase (Pro)
```bash
# Si tu as Supabase CLI installé
supabase db push

# Ou directement:
psql postgresql://... < supabase/migrations/add_trends_fields.sql
```

### Étape 2: Configuration Environnement

#### A. Redis (Optionnel - pour caching)
```env
# .env.local
REDIS_URL=redis://localhost:6379
```

#### B. Apify Token (Optionnel - pour TikTok/Instagram réels)
```env
# .env.local
APIFY_API_TOKEN=your_apify_token_here
```

Pour obtenir un token:
1. Va sur https://apify.com
2. Crée un compte (gratuit)
3. Va à **Settings → API Tokens**
4. Copy ton token

### Étape 3: Tester Localement

```bash
# Installer dépendances (si pas déjà fait)
npm install

# Démarrer le dev server
npm run dev

# Aller à http://localhost:3000/content/veille
```

### Étape 4: Déployer en Production

```bash
# Build pour production
npm run build

# Déployer (Vercel, Railway, etc.)
npm start

# Ou si tu utilises Vercel:
vercel deploy
```

## 📊 Vérifier que tout fonctionne

### 1. API Trends GET
```bash
curl http://localhost:3000/api/trends
# Doit retourner: { success: true, trends: [...], source: 'demo' ou 'db' }
```

### 2. API Trends FETCH
```bash
curl -X POST http://localhost:3000/api/trends/fetch
# Doit retourner: { success: true, trendsCount: X }
```

### 3. Page Veille
- Ouvre http://localhost:3000/content/veille
- Tu vois: "Veille Contenu" + "Actualiser maintenant"
- Click "Actualiser" → loading spinner → trends apparaissent
- Teste les filtres: ils doivent marcher
- Teste le bouton "Générer IA" sur une vidéo
- Teste "Voir le post" → lien externe

## 🔌 Apify Setup (Optionnel mais Recommandé)

### Pourquoi Apify ?
- ✅ Real-time TikTok trends
- ✅ Real-time Instagram reels
- ❌ Sans Apify → fallback mock data (mais réaliste)

### Coûts
- **Plan gratuit:** 5 credits/mois (insuffisant)
- **Plan pro:** $50/mois + usage basé
- **Alternative:** Utiliser Reddit + YouTube seul (gratuit)

### Setup
1. Crée compte: https://apify.com
2. Va à **Actors → Marketplace**
3. Cherche:
   - `tiktok-trend-scraper` 
   - `instagram-hashtag-scraper`
4. Copy le token depuis **Settings → API Tokens**
5. Ajoute à `.env.local`:
   ```env
   APIFY_API_TOKEN=your_token
   ```

### Test
```bash
# Dans /src/lib/trends/fetcher.ts, décommente:
// const APIFY_API_TOKEN = 'your_test_token'

# Puis teste:
curl http://localhost:3000/api/trends/fetch -X POST
# Doit afficher les logs: "Fetching TikTok trends via Apify..."
```

## 🗄️ Structure Base de Données

La table `trends` a maintenant:

```sql
CREATE TABLE trends (
  id UUID PRIMARY KEY,
  agency_id UUID,              -- Agence propriétaire
  platform TEXT,               -- 'tiktok' | 'instagram' | 'reddit' | 'youtube'
  title TEXT,                  -- Titre du post
  url TEXT,                    -- Lien vers le post
  thumbnail_url TEXT,          -- Image/vidéo preview
  author_username TEXT,        -- @username du créateur
  author_url TEXT,             -- Lien profil du créateur
  content_type TEXT,           -- 'video' | 'reel' | 'photo' | 'text' | 'carousel'
  engagement INT,              -- Vues/likes/upvotes
  category TEXT,               -- 'fitness' | 'beauty' | ...
  tags TEXT[],                 -- Hashtags
  captured_at TIMESTAMPTZ      -- Quand c'est venu dans la DB
);
```

## 🔄 Cron Jobs (Optionnel)

Pour actualiser automatiquement les trends:

### Option 1: Vercel Cron (si hébergé sur Vercel)
```ts
// src/app/api/cron/refresh-trends/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Verify it's actually Vercel calling
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/trends/fetch`, {
      method: 'POST',
    })
    const data = await res.json()
    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
```

Ajoute à `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/refresh-trends",
    "schedule": "0 */6 * * *"
  }]
}
```

### Option 2: External Service (EasyCron, etc.)
```bash
# Chaque 6 heures, appelle:
https://yourapp.com/api/trends/fetch

# Ajoute un header Authorization si tu protèges l'endpoint
```

## 🚨 Troubleshooting

### Issue: "Column author_username does not exist"
**Solution:**
- Exécute la migration SQL (voir Étape 1)
- Ou ajoute manuellement les colonnes dans Supabase UI

### Issue: Trends n'apparaissent pas
**Debugging:**
```bash
# 1. Check logs
npm run dev  # check console

# 2. Test l'API directement
curl http://localhost:3000/api/trends

# 3. Vérifier Supabase
# - Va dans "trends" table
# - Doit avoir au moins 1 row après /api/trends/fetch
```

### Issue: Apify timeouts
**Solution:**
- C'est normal, Apify prend 5-10s
- Increase le timeout dans fetcher.ts: `setTimeout(5000)` → `setTimeout(10000)`

### Issue: Memory leak on development
```bash
# Restart dev server
# Ou augmente Node memory:
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

## 📈 Monitoring & Analytics

Pour tracker les performances:

```ts
// Dans fetcher.ts, ajoute logging:
console.time('fetchAllTrends')
const trends = await fetchAllTrends()
console.timeEnd('fetchAllTrends')
// Logs: "fetchAllTrends: 1234ms"
```

Ou setup Sentry:
```env
SENTRY_AUTH_TOKEN=your_token
```

## ✅ Checklist Déploiement

- [ ] Migrations SQL exécutées
- [ ] `.env.local` mis à jour (APIFY_API_TOKEN optionnel)
- [ ] Build local fonctionne: `npm run build`
- [ ] Tests manuels passent
  - [ ] Page `/content/veille` s'ouvre
  - [ ] Bouton "Actualiser" fonctionne
  - [ ] Trends affichent correctement
  - [ ] Filtres marchent
  - [ ] Bouton "Générer IA" visible sur vidéos
  - [ ] Bouton "Générer IA" caché sur texte
- [ ] Déploiement sur production
- [ ] Vérifier API `/api/trends` en production
- [ ] Vérifier page `/content/veille` en production

---

**Questions ?** Check le TRENDS_UPDATE.md ou GUIDE_VEILLE_TRENDS.md
