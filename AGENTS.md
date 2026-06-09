# OmniFlow — Instructions pour les agents IA

## Règles ABSOLUES

### 🚨 Ne jamais faire ça
- Ne PAS marquer une tâche "✅ Complete" ou "Verified & Complete" si tu n'as fait AUCUNE modification de fichier
- Ne PAS committer si tu n'as rien changé (git diff doit montrer des changements)
- Ne PAS dire "c'est déjà correct" sans avoir vérifié visuellement le comportement

### ✅ Toujours faire ça
1. **Lire le fichier** avec `read` ou `exec cat` avant toute modification
2. **Modifier réellement** avec `edit` ou `write`
3. **Vérifier le diff** avec `git diff` avant de committer
4. **TypeScript check** : `npx tsc --noEmit` avant commit
5. **Committer** uniquement si git diff non vide
6. **Pusher** sur `origin/clean-main`

---

## Stack technique
- Next.js 14 (App Router)
- TypeScript strict
- Supabase (auth + DB)
- Tailwind CSS
- Framer Motion pour les animations
- Lucide React pour les icônes

## Conventions
- Dark theme : bg principal `#080810` ou `#0c0b18`
- Glass effect : classe `glass`
- Gradient texte : classe `gradient-text`
- Plans : `starter`, `pro`, `agency`

## Structure des fichiers importants
```
src/
  app/
    (marketing)/        → landing page publique
      page.tsx          → home (Hero + Features + Demos + Pricing)
    (dashboard)/        → espace membre connecté
      content/veille/   → Veille Trends
      telegram/         → Bot Telegram
    api/                → routes API
  components/
    marketing/
      demos/            → composants démos landing page
      pricing/          → section pricing
      hero/             → hero section
    dashboard/
      trends/           → TrendCard, TrendFilters
  lib/
    plans.ts            → définition plans + features
```

## Plans et features
- **Starter (99€/mois)** : Dashboard Financier, Rapport Chatting, Édition & Spoof, Auto-Posting, Banque de Médias, Bot Telegram
- **Pro (199€/mois)** : Starter + Veille Trends + Génération IA
- **Agency (349€/mois)** : Tout inclus (+ Prospection de Modèles + Chatting IA)

## Contexte projet
OmniFlow est un SaaS B2B pour les agences OnlyFans.
L'utilisateur est Baptiste, fondateur.
Il veut du code fonctionnel et visible — pas des audits.
