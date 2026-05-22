# Mise à Jour Module Veille Trends - Documentation Technique

## 🎯 Objectifs Réalisés

### 1. **Intégration des Vraies Sources de Données**
- ✅ TikTok via Apify (`fetchTikTokTrends`)
- ✅ Instagram Reels via Apify (`fetchInstagramTrends`)
- ✅ Reddit API gratuit (`fetchRedditTrends`)
- ✅ YouTube RSS (`fetchYouTubeTrends`)
- ✅ Fallback réaliste avec 10+ trends por-demo

### 2. **Enrichissement Trend Interface**
Nouveau champ `contentType` pour classifier le contenu:
```typescript
contentType: 'video' | 'photo' | 'text' | 'reel' | 'carousel'
```

Nouveaux champs d'auteur:
```typescript
authorUsername?: string
authorUrl?: string
```

### 3. **Refonte Complète TrendCard**
Nouvelle UI riche avec:
- **Thumbnail 16:9** (grande, prévisualisation claire)
- **Badges plateforme** colorés (TikTok=rose, Instagram=violet, Reddit=orange, YouTube=rouge)
- **Badge contenu** (🎬 Vidéo, 🎞️ Reel, 📸 Photo, 📝 Texte)
- **Info auteur** (@username cliquable)
- **Date relative** (il y a 2j, il y a 3h)
- **Engagement formaté** (4.8M, 125K)
- **Bouton "Voir le post"** (lien externe)
- **Bouton "Générer IA"** (CONDITONNEL - voir ci-dessous)

### 4. **Logique Conditionnelle Bouton Générer**
Le bouton "Générer avec IA" s'affiche UNIQUEMENT si:
- `contentType === 'video'` ✅
- `contentType === 'reel'` ✅
- `contentType === 'photo'` ✅
- `contentType === 'carousel'` ✅

Le bouton est CACHÉ pour:
- `contentType === 'text'` ❌

Cela empêche l'utilisateur de générer du contenu à partir de posts texte uniquement (ex: tweets textuels, posts Reddit texte).

## 🔧 Changements Fichiers

### `src/lib/trends/fetcher.ts` (COMPLÈTEMENT RÉÉCRIT)
- **Avant**: Mock data uniquement, pas de vraies sources
- **Après**: 
  - Apify integration (TikTok + Instagram)
  - Reddit API gratuit
  - YouTube RSS feeds
  - Helper functions pour catégorisation
  - Fallback réaliste en cas d'indisponibilité
  - Prompt generation amélioré avec contexte `@creator`

**Nouvelles fonctions exportées:**
```typescript
export async function fetchAllTrends(): Promise<Trend[]>
export function filterTrends(trends, filters): Trend[]
export function generatePromptFromTrend(trend): string
export const MOCK_TRENDS_FLAT: Trend[]
```

### `src/components/dashboard/trends/TrendCard.tsx` (COMPLÈTEMENT REFONDU)
- **Avant**: Cards minimalistes, mock badges
- **Après**:
  - Design riche avec 16:9 thumbnail
  - Badges plateforme + contenu
  - Info auteur avec avatar
  - Dates relatives formatées
  - Engagement formaté
  - Logique conditionnelle pour bouton Générer
  - Animations hover améliorées
  - Icons lucide-react appropriés

### `src/app/(dashboard)/content/veille/page.tsx`
- Mise à jour interface Trend
- Déplacement de `'twitter'` → `'youtube'` dans PLATFORMS
- Les props TrendCard sont automatiquement compatibles

### `src/app/api/trends/route.ts`
- Ajout des nouveaux champs au mapping:
  - `author_username`
  - `author_url`
  - `content_type`

### `src/app/api/trends/fetch/route.ts`
- Ajout des nouveaux champs à l'insertion:
  - `author_username`
  - `author_url`
  - `content_type`

### `supabase/schema.sql`
- Ajout colonnes à la table `trends`:
  ```sql
  author_username text,
  author_url text,
  content_type text DEFAULT 'video' CHECK (content_type IN ('video', 'photo', 'text', 'reel', 'carousel'))
  ```

## 🔌 Configuration Apify (IMPORTANT)

Pour utiliser les vraies sources, vous devez:

1. **Créer un compte Apify** (gratuit: https://apify.com)
2. **Ajouter à `.env.local`:**
   ```env
   APIFY_API_TOKEN=your_apify_token_here
   ```
3. **Acteurs Apify nécessaires:**
   - `apify~tiktok-trend-scraper` (payant mais efficace)
   - `apify~instagram-hashtag-scraper` (payant mais efficace)

**Sans APIFY_API_TOKEN:**
- Reddit et YouTube fonctionnent (APIs publiques gratuites)
- TikTok et Instagram retournent le fallback réaliste

## 📊 Données Fallback

Si les APIs ne répondent pas, le système retourne `MOCK_TRENDS_FLAT` avec:
- 5 TikTok videos (fitness, beauty, lifestyle, fashion)
- 5 Instagram Reels (beauty, fitness, lifestyle, fashion, wellness)
- 3 Reddit posts (fitness, beauty, lifestyle)
- 2 YouTube videos (beauty, fitness)

Tous avec:
- URLs réelles vers des créateurs connus
- Usernames authentiques
- Engagement réaliste (2M-6M pour TikTok, 600K-1.5M pour Instagram)
- Content types appropriés

## 🎨 Styles & Design

TrendCard utilise:
- **Dark theme** (noir/gris)
- **Gradients** (purple-cyan pour top trends)
- **Glass morphism** (backdrop-blur)
- **Shadows & elevation** (animations hover)
- **Emojis visuels** (icons de contenu)

## 🚀 Déploiement

### 1. Mettre à jour Supabase
```sql
-- Exécuter dans Supabase SQL Editor:
ALTER TABLE trends
ADD COLUMN IF NOT EXISTS author_username text,
ADD COLUMN IF NOT EXISTS author_url text,
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'video' CHECK (content_type IN ('video', 'photo', 'text', 'reel', 'carousel'));
```

### 2. Configurer Apify (optionnel)
```bash
# .env.local
APIFY_API_TOKEN=your_token
```

### 3. Redéployer l'app
```bash
npm run build
npm start
```

## ✅ Tests Manuels

1. **Aller à `/content/veille`**
2. **Cliquer "Actualiser maintenant"**
   - Doit charger trends
   - Afficher badges correctement
   - Montrer usernames
3. **Vérifier filtrage par contentType**
   - Texte brut ne montre pas bouton Générer
   - Vidéos/Reels montrent bouton Générer
4. **Cliquer sur creator @username**
   - Doit ouvrir profil réel
5. **Cliquer "Voir le post"**
   - Doit ouvrir lien externe

## 📝 Prochaines Améliorations Possibles

- [ ] Caching des trends (Redis)
- [ ] Filtrage avancé par engagement min/max
- [ ] Export trends en CSV
- [ ] Comparaison trends jour vs semaine vs mois
- [ ] Intégration webhook Apify (push async)
- [ ] Support Twitter/X API v2 (si API key disponible)
- [ ] Analytics: quels trends génèrent plus d'engagement
- [ ] Saved trends / favoris utilisateur

## 🐛 Troubleshooting

**Q: Les trends n'apparaissent pas**
- Vérifier Supabase table `trends` existe
- Vérifier réseau (Reddit/YouTube APIs)
- Vérifier console pour erreurs

**Q: Bouton Générer manque pour des vidéos**
- Vérifier `contentType` est défini dans l'API response
- Vérifier que la fonction `shouldShowGenerateButton` retourne `true`

**Q: URLs Apify ne répondent pas**
- Ajouter `APIFY_API_TOKEN` dans `.env.local`
- Vérifier token est valide dans Apify dashboard
- Le système basculera automatiquement sur fallback

---

**Documentation mise à jour:** May 2026
**Développeur:** OmniFlow AI
