# 🗂️ OMNIFLOW — STATUS BOARD
> Mis à jour : 2026-06-09

---

## ✅ CE QUI EST FAIT (code écrit, prêt à déployer)

### Système Plans & Pricing
- [x] Plans redessinés : Starter 99€ / Pro 199€ / Agency 349€
- [x] `src/lib/plans.ts` — limites par plan (modèles, bots, trends, générations)
- [x] `src/types/index.ts` — types PlanLimits + PlanId mis à jour
- [x] Page pricing marketing mise à jour

### Système RUN (crédits unifiés)
- [x] `src/lib/credits.ts` — getBalance, consumeCredits, addCredits, auto top-up
- [x] `src/lib/promos.ts` — validatePromoCode, applyPromoCode, createPromoCode
- [x] API `/api/credits/balance` — GET solde
- [x] API `/api/credits/buy` — POST achat crédit (NOWPayments)
- [x] API `/api/credits/consume` — POST déduire crédits
- [x] API `/api/credits/auto-topup` — POST config rechargement auto
- [x] API `/api/credits/transactions` — GET historique
- [x] API `/api/promos/validate` — POST vérifier un code promo
- [x] API `/api/promos/apply` — POST appliquer un code promo
- [x] API `/api/admin/promos` — GET/POST/PATCH/DELETE gestion admin
- [x] Composant `CreditsWidget` (sidebar)
- [x] Composant `CreditsSection` (page billing)
- [x] Composant `PromoCodeInput` (réutilisable)
- [x] Composant `OveruseModal` mis à jour (redirige vers crédits)

### Veille Trends (Instagram uniquement)
- [x] TikTok/YouTube/Reddit supprimés — Instagram uniquement via Apify
- [x] Volume par plan : Starter 5/j · Pro 10/j · Agency 20/j
- [x] Système feedback like/dislike sur les TrendCards
- [x] API `/api/trends/feedback` — enregistrement préférences

### Chatting IA
- [x] Claude Haiku — Agency uniquement, illimité
- [x] Plans Starter/Pro : feature désactivée

---

## ❌ CE QUI BLOQUE — SQL À EXÉCUTER EN PREMIER

> **Tu n'as pas encore exécuté les migrations SQL dans Supabase.**
> Rien ne fonctionnera tant que les tables n'existent pas.

### Migration 1 — Système Crédits
**Fichier :** `supabase/add_credits_system_v2.sql`
⚠️ Utilise **v2** (pas v1) — v1 plante si l'extension uuid-ossp n'est pas activée ou si tu la relances une 2ème fois.

**Ce que ça crée :**
- Table `agency_credits` — solde de crédits par agence
- Table `credit_transactions` — historique achats/consommations
- Table `promo_codes` — codes promo
- Table `promo_code_uses` — qui a utilisé quoi
- Table `credit_orders` — commandes NOWPayments
- RLS + Index sur tout

**Comment l'exécuter :**
1. Va sur [Supabase](https://supabase.com/dashboard) → ton projet
2. Clique **SQL Editor**
3. Copie-colle le contenu de `supabase/add_credits_system_v2.sql`
4. Clique **Run**

---

### Migration 2 — Trends Feedback
**Fichier :** `supabase/add_trend_feedback.sql`

**Ce que ça crée :**
- Table `trend_feedback` — like/dislike par trend par agence
- Table `agency_preferences` — préférences de catégories
- Colonne `has_feedback` sur la table `trends`

**Même procédure** que migration 1.

---

## ⏳ CE QUI RESTE À FAIRE APRÈS LES SQL

| # | Quoi | Détail |
|---|------|--------|
| 1 | **Exécuter SQL v2 crédits** | `supabase/add_credits_system_v2.sql` |
| 2 | **Exécuter SQL trends feedback** | `supabase/add_trend_feedback.sql` |
| 3 | **Tester les endpoints** | `GET /api/credits/balance` doit répondre |
| 4 | **Vérifier env var Apify** | `APIFY_API_TOKEN` dans `.env.local` |
| 5 | **Déployer sur Vercel** | `git push` → Vercel auto-deploy |
| 6 | **Tester en prod** | Créer une agence test, acheter des crédits |

---

## ❓ POURQUOI LE SQL V1 PLANTE

Le SQL v1 (`add_credits_system.sql`) échoue pour 2 raisons :
1. Il appelle `uuid_generate_v4()` sans d'abord activer l'extension `uuid-ossp`
2. Si tu le relances, `CREATE POLICY` plante avec "policy already exists"

Le v2 corrige les deux :
- Ajoute `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` en tête
- Ajoute `DROP POLICY IF EXISTS` avant chaque `CREATE POLICY`

**→ Utilise toujours v2.**

---

## 💡 RÉSUMÉ EN 2 LIGNES

Le code est 100% prêt. Zéro erreur TypeScript.
Il manque juste **2 exécutions SQL** dans Supabase, puis un `git push`.
