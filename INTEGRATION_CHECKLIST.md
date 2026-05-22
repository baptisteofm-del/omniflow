# ✅ Integration Checklist - Veille Trends Module

## Phase 1: Préparation (5 min)

- [ ] Lire `TRENDS_UPDATE.md` - comprendre les changements
- [ ] Lire `SETUP_TRENDS.md` - installation guide
- [ ] Backup de la DB Supabase (https://app.supabase.com → Project → Backups)
- [ ] S'assurer que personne utilise l'app pendant la migration

## Phase 2: Database Migration (10 min)

### Option A: Supabase Dashboard (Facile)

- [ ] Aller sur https://app.supabase.com
- [ ] Sélectionner le project
- [ ] Cliquer **SQL Editor**
- [ ] Copier-coller le contenu de `supabase/migrations/add_trends_fields.sql`
- [ ] Cliquer **Run**
- [ ] Attendre le succès (ne devrait pas être instant)
- [ ] Vérifier: aller à **Table Editor → trends** → voir colonnes `author_username`, `author_url`, `content_type`

### Option B: CLI Supabase (Pro)

```bash
cd omniflow
supabase db push
# Ou:
supabase migrations up
```

### Option C: Directement en SQL (Emergency)

```bash
# Si tu as accès direct à PostgreSQL:
psql postgresql://... < supabase/migrations/add_trends_fields.sql
```

**✅ Verification:**
```sql
-- Dans Supabase SQL Editor:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trends';

-- Doit voir:
-- author_username | text
-- author_url | text
-- content_type | text
```

## Phase 3: Code Deployment (10 min)

- [ ] Les fichiers suivants sont déjà modifiés dans le commit:
  - [x] `src/lib/trends/fetcher.ts` (rewritten)
  - [x] `src/components/dashboard/trends/TrendCard.tsx` (refounded)
  - [x] `src/app/(dashboard)/content/veille/page.tsx` (updated)
  - [x] `src/app/api/trends/route.ts` (updated)
  - [x] `src/app/api/trends/fetch/route.ts` (updated)
  - [x] `supabase/schema.sql` (updated)

**Rien à faire ici** - les fichiers TypeScript/React sont à jour

## Phase 4: Configuration (5 min)

- [ ] **Optionnel:** Si tu veux TikTok/Instagram réels:
  - [ ] Créer compte Apify: https://apify.com
  - [ ] Copier ton API token
  - [ ] Ajouter à `.env.local`:
    ```env
    APIFY_API_TOKEN=your_token_here
    ```
  - [ ] **Sans token:** Reddit + YouTube marchent (gratuit)

## Phase 5: Local Testing (15 min)

```bash
# 1. Install / Update dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Aller à http://localhost:3000/content/veille
```

**Tester chaque feature:**

### ✅ Basic Page Loading
- [ ] Page charge sans erreur
- [ ] Vois "Veille Contenu" header
- [ ] Vois "Actualiser maintenant" button
- [ ] Vois filtres à gauche
- [ ] Console: pas d'erreurs TypeScript

### ✅ Fetch Trends
- [ ] Click "Actualiser maintenant"
- [ ] Voir spinner de loading
- [ ] Attendre 5-10 secondes
- [ ] Trends s'affichent
- [ ] Console: log "✅ Fetched X trends" ou "⚠️ Using fallback"

### ✅ Trend Cards Affichent Correctement
- [ ] Voir thumbnail grande (16:9)
- [ ] Voir badge plateforme (TikTok/Instagram/Reddit/YouTube)
- [ ] Voir badge contenu (🎬 Vidéo, 📸 Photo, 📝 Texte, etc.)
- [ ] Voir auteur @username
- [ ] Voir date relative (il y a 2j)
- [ ] Voir engagement (4.8M, 125K)
- [ ] Voir category tag

### ✅ Boutons Fonctionnent
- [ ] Click "Voir le post" → ouvre lien externe en nouvel onglet
- [ ] Click sur @username → ouvre profil creator en nouvel onglet

### ✅ Logique Conditionnelle Générer
**Pour une vidéo/reel/photo:**
- [ ] Voir bouton "Générer IA"
- [ ] Click → va à `/content/ai-generation?trend=...`
- [ ] Prompt est pré-rempli avec titre trend

**Pour un post texte (Reddit):**
- [ ] Ne PAS voir bouton "Générer IA"
- [ ] Voir texte "Texte brut" grisé

### ✅ Filtres Marchent
- [ ] Filtrer par plateforme TikTok → ne voir que TikTok
- [ ] Filtrer par plateforme Instagram → ne voir que Instagram
- [ ] Filtrer par catégorie Fitness → ne voir que fitness
- [ ] Combiner plateforme + catégorie → fonctionne
- [ ] Réinitialiser filtres → voir tout

### ✅ API Endpoints
```bash
# Terminal 1: npm run dev

# Terminal 2: Test l'API
curl http://localhost:3000/api/trends
# Doit retourner: { success: true, trends: [...], source: '...' }

curl -X POST http://localhost:3000/api/trends/fetch
# Doit retourner: { success: true, trendsCount: X }
```

## Phase 6: Production Deployment

### Sur Vercel (Recommandé)

```bash
# 1. Push vers ton repo (GitHub/GitLab)
git add .
git commit -m "feat: Major Veille Trends refactor - real data sources, content classification"
git push origin main

# 2. Vercel auto-deploy (si connecté)
# Ou manually:
vercel deploy --prod

# 3. Attendre le build (~3-5 min)
```

### Sur Railway / Autre Host

```bash
# 1. Push code
git push origin main

# 2. Host pull le code + npm run build
# 3. Start: npm start
```

### Sur Self-Hosted / VPS

```bash
# 1. SSH to server
ssh user@host

# 2. Pull latest code
cd /path/to/omniflow
git pull origin main

# 3. Install
npm install

# 4. Build
npm run build

# 5. Restart service
systemctl restart omniflow
# Ou si using PM2:
pm2 restart omniflow
```

## Phase 7: Post-Deployment Testing

- [ ] Aller à https://yourapp.com/content/veille
- [ ] Tester toutes les features (same as Phase 5)
- [ ] Check /api/trends endpoint
- [ ] Check logs pour erreurs

## Phase 8: Monitoring (Ongoing)

### Logs à Watcher

```bash
# En développement:
npm run dev | grep -i "trend"

# En production (si utilisant Vercel):
# Vercel Dashboard → Project → Deployments → Logs

# Ou si self-hosted:
tail -f /var/log/omniflow.log | grep trend
```

### Metrics à Track

```
- Fetch time: < 10s ✅
- Fallback rate: < 5% ✅  
- API errors: < 0.1% ✅
- Page load: < 2s ✅
```

### Erreurs Communes à Regarder

- `Column author_username does not exist` → Migration pas exécutée
- `APIFY_API_TOKEN not found` → Apify désactivé (OK, Reddit/YouTube marchent)
- `Timeout fetching Reddit` → Rate limit Reddit (auto-retry)
- `Contenttype mismatch` → Bug dans filleur (créer issue)

## Phase 9: Utilisateurs Communication

Envoyer un message aux utilisateurs:

```
🚀 Mise à jour Module Veille Trends !

Nouveautés:
✨ Vraies données TikTok, Instagram, Reddit, YouTube (pas juste mock)
📸 Nouveau design riche: thumbnails 16:9, badges, info créateurs
🎬 Bouton "Générer IA" intelligent (vidéos oui, texte non)
⚡ Plus rapide, plus visuels, meilleur UX

Mode d'emploi: Lire GUIDE_VEILLE_TRENDS.md

Questions? Support@omniflow.io
```

## Phase 10: Documentation Actualisée

- [ ] README.md mentioner les features trends
- [ ] Ajouter link vers GUIDE_VEILLE_TRENDS.md dans l'app
- [ ] Mettre à jour CHANGELOG.md du project

## 🎉 Done!

Si tout passe ✅, l'integration est complète!

---

## 🚨 Rollback Plan (Si Problème)

Si quelque chose casse:

```bash
# 1. Revert le code
git revert HEAD~1
git push origin main

# 2. Supabase migration peut pas être revertée facilement
#    Mais c'est OK - les nouvelles colonnes sont juste vides
#    L'app fonctionnera quand même (fallback mock)

# 3. Si vraiment besoin de nettoyer:
#    - Contacter Supabase support pour DROP colonnes
#    - Ou: créer nouveau branch, fix, redeploy
```

---

## Support & FAQ

**Q: Je vois "Table trends non trouvée"**
A: La migration SQL n'a pas été exécutée. Faire Phase 2 manuellement.

**Q: Les trends affichent pas les @username**
A: Vérifier que API retourne `author_username`. Check fetcher.ts logs.

**Q: Bouton "Générer IA" caché partout**
A: Vérifier que `contentType` est bien défini dans l'API response. Check /api/trends.

**Q: Apify fail, Reddit/YouTube OK?**
A: Normal! Apify est optionnel. Reddit + YouTube sont gratuits et fonctionnent.

**Q: Besoin de rollback?**
A: Voir "Rollback Plan" ci-dessus.

---

**Checklist créé:** May 2026
**Status:** Ready for Integration
**Estimated Time:** ~1 hour total
