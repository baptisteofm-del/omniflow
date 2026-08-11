# OmniFlow — Instructions pour les agents IA

## Contexte projet
OmniFlow est un SaaS B2B pour les agences gérant des créatrices OnlyFans/MYM.
Reconstruction complète pilotée par le cahier des charges en 48 parties dans
`docs/specification/`. L'utilisateur est Baptiste, fondateur, non-technique.

Ce dépôt contient aussi l'ancienne version de l'app (avant reconstruction) au
moment de la rédaction de ce fichier — elle a été retirée du dépôt le jour où
ce fichier a été réécrit. Si du code, une route ou un composant semble ne
correspondre à rien dans `docs/specification/`, ce n'est probablement pas
censé exister : vérifier avant de s'appuyer dessus.

## Règles absolues
- Ne jamais réutiliser, stocker ou committer un secret réel (clé API, clé de
  chiffrement, token de session) collé dans la conversation.
- Ne jamais modifier une partie du code sans lien avec la tâche en cours sans
  le signaler d'abord.
- Construire par petites étapes : livrer le code → donner le SQL exact à
  appliquer → attendre un retour réel du propriétaire → corriger/avancer.
- Tenir à jour `docs/implementation/BUILD_PROGRESS.md` et
  `docs/implementation/TECH_DEBT.md` après chaque phase ou correctif.
- La commission OmniFlow est fixée à 2.5% (verrouillée).
- OnlyFans interdit l'envoi de DM Full AI autonome — seul le Copilot (assisté
  humain) est autorisé sur cette plateforme.

## Stack technique
- Next.js (App Router, Turbopack), React, TypeScript strict
- Supabase (Auth + Postgres + RLS + Storage + Realtime)
- Tailwind CSS v4
- Vercel (Preview = staging sur la branche de travail ; Production = ancienne
  app, ne pas y toucher sans consigne explicite)

## Conventions
- Design tokens dans `src/app/globals.css` : dégradé signature
  violet/bleu/cyan, classes `.glass`, `.gradient-bg-signature`,
  `.gradient-text`, `.glow`.
- Toute requête métier doit être filtrée par `agency_id`, jamais fait
  confiance à une valeur envoyée par le client — RLS via `is_agency_member()`
  et `has_permission()` (`supabase/migrations/0001_foundation.sql`) côté DB,
  et les mêmes vérifications côté code applicatif
  (`src/lib/permissions/check.ts`).

## Structure des fichiers importants
```
src/
  app/
    (marketing)/        → landing page publique
    (auth)/              → login / register / join (invitation)
    (app)/                → espace de travail connecté (créatrices, inbox,
                             scripts, médias, analytics, paramètres)
  lib/
    platforms/            → adaptateurs plateformes (MYM réel, etc.)
    permissions/           → vérifications de permissions (RLS + code)
    ai/                     → moteur IA (Copilot, Full AI, scoring)
docs/
  specification/           → cahier des charges source (48 parties)
  implementation/           → suivi réel (BUILD_PROGRESS, TECH_DEBT,
                              REQUIREMENTS_MATRIX)
```

## Git
- Développer sur la branche de travail en cours, jamais directement sur
  `main`/production sans consigne explicite.
- Toujours lancer `npx tsc --noEmit -p tsconfig.json` et `npx next build`
  avant de considérer une tâche terminée.
