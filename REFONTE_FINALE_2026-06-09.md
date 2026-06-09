# Omniflow — Refonte Finale (2026-06-09)

## ✅ Statut : Build propre, prêt à déployer

---

## 1. Plans mis à jour

### 🔹 Starter — 99€/mois (79€/an)
- 2 modèles
- 2 bots Telegram
- 30 veilles Instagram/mois (1/jour automatique)
- **5 trends par veille**
- 2 membres d'équipe
- Pas de génération IA
- Pas de Chatting IA

### 🔹 Pro — 199€/mois (159€/an) ⭐ Popular
- 5 modèles
- 5 bots Telegram
- 30 veilles Instagram/mois (1/jour automatique)
- **10 trends par veille**
- 100 générations IA/mois
- 3 membres d'équipe
- RUN supplémentaires disponibles (9€/RUN)
- Pas de Chatting IA

### 🔹 Agency — 349€/mois (279€/an)
- 10 modèles
- 5 bots Telegram
- 30 veilles Instagram/mois (1/jour automatique)
- **20 trends par veille**
- 250 générations IA/mois
- 5 membres d'équipe
- **Chatting IA illimité (Claude Haiku)**
- RUN supplémentaires disponibles (9€/RUN)

---

## 2. Système RUN (uniforme)

```
1 RUN = 10 unités
Prix  = 9€
Usage = générations IA OU trends Instagram supplémentaires
Durée = 30 jours
```

---

## 3. Trends — Instagram uniquement

- ❌ Supprimé : TikTok, Reddit, YouTube
- ✅ Uniquement : Instagram (via Apify)
- Fallback automatique sur seed data si Apify indisponible

### Volume par plan :
| Plan    | Trends/jour (auto) | RUNs manuels/mois |
|---------|--------------------|-------------------|
| Starter | 5                  | 30                |
| Pro     | 10                 | 30                |
| Agency  | 20                 | 30                |

### Génération manuelle :
- 1 RUN = 10 nouvelles trends Instagram
- Prix si quota épuisé : 9€

---

## 4. Système Feedback (like/dislike)

Chaque TrendCard dispose désormais de boutons 👍/👎 :
- **Like** → Le système apprend à proposer plus de ce type
- **Dislike** → Moins de ce type dans les prochaines veilles
- Toggle : recliquer sur le même feedback l'annule
- Données stockées dans `trend_feedback` (Supabase)
- Préférences catégorie enregistrées dans `agency_preferences`

---

## 5. Chatting IA — Agency uniquement

- Modèle : Claude Haiku
- Illimité (messages/mois = -1)
- Aucun coût supplémentaire
- Plans Starter/Pro : fonctionnalité désactivée

---

## 6. Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/lib/plans.ts` | Plans redessinés, RUN_PACK uniforme (9€/10u), suppression KLING/TREND_PACKS |
| `src/types/index.ts` | PlanLimits + dailyTrendsCount, PlanId inclut 'trial' |
| `src/lib/trends/fetcher.ts` | Instagram uniquement, suppression TikTok/Reddit/YouTube |
| `src/components/dashboard/trends/TrendCard.tsx` | Boutons like/dislike intégrés |
| `src/components/dashboard/trends/TrendFilters.tsx` | Simplifié (catégorie seulement, plus de filtre plateforme) |
| `src/app/(dashboard)/content/veille/page.tsx` | Refonte complète — Instagram, RUN system, feedback |
| `src/components/marketing/pricing/PricingSection.tsx` | Pricing simplifié, section Veille Instagram, bloc RUN |
| `src/app/api/trends/route.ts` | Instagram forcé, enrichissement feedback |
| `src/app/api/trends/fetch/route.ts` | Instagram forcé, système RUN, quota mensuel |
| `src/app/api/trends/feedback/route.ts` | **Nouveau** — endpoint POST/GET feedback |
| `src/app/api/usage/trends/route.ts` | dailyTrendsCount par plan, quota mensuel |
| `src/app/api/usage/overuse/route.ts` | Tarification uniforme RUN = 9€/10u |
| `src/lib/plans/limits.ts` | trendRuns mensuel (plus journalier), +dailyTrendsCount |
| `supabase/add_trend_feedback.sql` | **Nouvelle migration** — trend_feedback + agency_preferences |

---

## 7. Migration SQL à exécuter

```
supabase/add_trend_feedback.sql
```

Crée :
- `trend_feedback` (like/dislike par trend par agence)
- `agency_preferences` (préférences catégories)
- Colonne `has_feedback` sur `trends`

---

## 8. Vérification économique

| Item | Coût réel | Prix facturé | Marge |
|------|-----------|-------------|-------|
| RUN générations IA (10x) | ~1.50€ | 9€ | **6x** |
| RUN trends Instagram (10x) | ~0.30€ | 9€ | **30x** |
| Chatting IA Agency (Haiku, illimité) | ~12€/mois estim. | inclus 349€ | ✅ |
| Plan Starter | coût ~2€/mois | 99€ | ✅ |
| Plan Pro | coût ~18€/mois | 199€ | ✅ |
| Plan Agency | coût ~35€/mois | 349€ | ✅ |

---

## 9. Déploiement

1. Vérifier `.env.local` : `APIFY_API_TOKEN` pour Instagram
2. Exécuter `supabase/add_trend_feedback.sql` sur Supabase
3. `npm run build` → ✅ OK (testé)
4. Deploy Vercel : `vercel --prod`
