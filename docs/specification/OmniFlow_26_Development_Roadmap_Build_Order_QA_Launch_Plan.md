# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 26 --- DEVELOPMENT ROADMAP, BUILD ORDER, QA & LAUNCH PLAN

## 26.1 --- Objectif

Cette partie transforme le cahier des charges OmniFlow en plan
d'exécution concret pour Claude Code.

Le projet ne doit pas être développé comme une succession de pages
indépendantes.

Il doit être construit par dépendances produit et techniques.

Principe :

# BUILD THE CORE.

# PROVE THE AI.

# CONNECT THE PLATFORM.

# THEN SCALE.

La priorité V1 reste le Chatting.

Les futurs modules Marketing, Recruitment et autres extensions ne
doivent pas détourner le développement du cœur produit.

## 26.2 --- Règle avant tout développement

Avant de coder :

1.  lire l'intégralité du cahier des charges OmniFlow
2.  auditer le repository existant
3.  identifier ce qui peut être conservé
4.  identifier ce qui doit être supprimé/remplacé
5.  documenter la stack actuelle
6.  vérifier Supabase/database
7.  vérifier Vercel/deployment
8.  vérifier auth
9.  vérifier les intégrations existantes
10. créer un plan d'implémentation

Ne pas commencer directement par modifier la landing page.

## 26.3 --- Source de vérité

Le cahier des charges devient la source de vérité produit.

En cas de contradiction :

1.  règles de sécurité
2.  décisions produit les plus récentes
3.  spécifications métier
4.  UX
5.  ancien code

L'ancien produit ne doit jamais être considéré comme la référence
fonctionnelle s'il contredit cette documentation.

## 26.4 --- Documentation de progression

Créer dans le repository :

``` text
/docs/implementation/
```

avec :

``` text
MASTER_PLAN.md
BUILD_STATUS.md
DECISIONS.md
BLOCKERS.md
AI_BENCHMARK.md
LAUNCH_CHECKLIST.md
```

## 26.5 --- BUILD_STATUS

Pour chaque module :

``` text
NOT STARTED
IN PROGRESS
BLOCKED
READY FOR QA
VALIDATED
```

Claude Code doit mettre ce fichier à jour pendant la construction.

## 26.6 --- Ne pas prétendre qu'une feature est terminée

Une fonctionnalité n'est pas `VALIDATED` parce que :

-   la page existe
-   le bouton existe
-   le mockup est beau

Elle est validée lorsque :

-   frontend fonctionne
-   backend fonctionne
-   permissions fonctionnent
-   erreurs gérées
-   tests critiques passent
-   données réelles ou mock réaliste circulent correctement

## 26.7 --- PHASE 0 --- Repository Audit

Objectif :

comprendre l'existant avant reconstruction.

Livrables :

-   architecture actuelle
-   éléments conservés
-   éléments remplacés
-   database state
-   auth state
-   deployment state
-   technical risks

Ne pas modifier production pendant l'audit.

## 26.8 --- PHASE 1 --- Foundation

Construire :

-   project structure
-   design tokens
-   shared components
-   auth foundation
-   Agency workspace
-   memberships
-   permissions
-   creator model
-   database migrations
-   environment setup
-   logging foundation

À la fin :

un utilisateur peut créer/rejoindre une Agency et accéder à un app shell
sécurisé.

## 26.9 --- PHASE 2 --- New Application Shell

Construire depuis zéro :

-   sidebar
-   topbar
-   workspace switcher
-   navigation
-   creator context
-   notifications shell
-   responsive foundation

Ne pas patcher l'ancienne app.

## 26.10 --- PHASE 3 --- Creator & AI Configuration

Construire :

-   Creators
-   Creator Detail
-   Model DNA
-   Agency defaults
-   Creator overrides
-   AI Control Center
-   negotiation settings
-   custom content settings
-   follow-up settings
-   autonomy settings

À la fin :

une agence peut définir précisément comment l'IA doit agir.

## 26.11 --- PHASE 4 --- Media Library

Construire :

-   private storage
-   media upload
-   media metadata
-   tags
-   target price
-   minimum price
-   creator scope
-   permissions
-   media browser

À la fin :

l'IA possède une bibliothèque exploitable.

## 26.12 --- PHASE 5 --- Script Engine

Construire :

-   scripts
-   versions
-   nodes
-   branches
-   purchase path
-   no-purchase path
-   recovery branch
-   media
-   pricing
-   publish validation
-   script analytics events

À la fin :

une agence peut créer un véritable scénario commercial.

## 26.13 --- PHASE 6 --- Mock Platform Connector

Avant d'attendre OnlyFans/MYM :

construire un connecteur simulé.

Il doit permettre :

-   fake fans
-   incoming messages
-   outgoing messages
-   paid offers
-   purchases
-   failed purchases
-   delays
-   platform errors

Objectif :

débloquer tout le développement IA.

## 26.14 --- PHASE 7 --- Conversation Engine

Construire :

-   conversations
-   messages
-   state machine
-   assignments
-   Copilot
-   Full AI state
-   Human Takeover
-   concurrency protection
-   idempotency

À la fin :

une conversation complète fonctionne avec Mock Connector.

## 26.15 --- PHASE 8 --- Memory & Fan Intelligence

Construire :

-   fan profile
-   long-term memory
-   structured memory
-   relationship summary
-   purchase history
-   Purchase Intent
-   Relationship
-   Spending Potential
-   Engagement
-   Churn Risk
-   context builder

Tester les contradictions et corrections manuelles.

## 26.16 --- PHASE 9 --- Decision Engine

Construire le cœur OmniFlow :

``` text
MESSAGE
↓
UNDERSTAND
↓
DECIDE
↓
ACT
↓
OBSERVE
↓
LEARN
```

Actions possibles :

-   reply
-   relationship
-   start script
-   continue script
-   send offer
-   negotiate
-   follow-up
-   wait
-   escalate

## 26.17 --- Model Routing

Implémenter le routing validé :

-   modèle rapide pour tâches simples
-   modèle plus puissant pour décisions complexes
-   modèle premium lorsque la valeur/complexité le justifie

Le modèle exact doit rester configurable.

## 26.18 --- PHASE 10 --- AI BENCHMARK PHASE 1

# STOP DEVELOPMENT FOR QUALITY CHECK.

Dès que :

-   Mock Connector fonctionne
-   conversation pipeline fonctionne
-   memory fonctionne
-   Decision Engine fonctionne

lancer le premier benchmark.

Ne pas attendre la fin du site.

## 26.19 --- Benchmark Phase 1

Tester un dataset contrôlé.

Mesurer :

-   persona consistency
-   context understanding
-   memory
-   sales timing
-   rule compliance
-   pricing compliance
-   naturalness
-   decision quality

Comparer plusieurs configurations/models si nécessaire.

Documenter dans :

``` text
/docs/implementation/AI_BENCHMARK.md
```

## 26.20 --- Gate #1

Ne pas continuer vers Full AI avancé si le benchmark montre des
problèmes critiques sur :

-   pricing
-   memory
-   rule compliance
-   action selection

Corriger d'abord.

## 26.21 --- PHASE 11 --- Copilot UX

Construire l'Inbox Copilot complète :

-   suggestion
-   edit
-   regenerate
-   dismiss
-   send
-   intelligence panel
-   scripts
-   media
-   fan context

Enregistrer les différences entre suggestion et message final.

## 26.22 --- PHASE 12 --- Full AI

Activer le moteur autonome sur Mock Connector.

Inclure :

-   action validator
-   confidence thresholds
-   approvals
-   fail-safe
-   Take Over
-   Return to AI
-   AI Decision Timeline

## 26.23 --- PHASE 13 --- Sales Actions

Finaliser :

-   paid media
-   script execution
-   out-of-script media
-   pricing rules
-   minimum price
-   negotiation
-   custom requests
-   live/custom session workflow selon règles

Toutes les actions commerciales doivent passer par validation backend.

## 26.24 --- PHASE 14 --- Smart Follow-ups

Construire :

-   follow-up detection
-   scheduling
-   approval
-   automatic sending
-   eligibility re-check
-   cancellation if fan replies
-   analytics

## 26.25 --- PHASE 15 --- Analytics & ROI

Construire :

-   revenue
-   sales
-   conversion
-   AOV
-   AI revenue
-   AI vs Human
-   scripts
-   media
-   pricing
-   negotiation
-   follow-ups
-   opportunities
-   alerts
-   ROI

Utiliser des métriques définies et versionnées.

## 26.26 --- PHASE 16 --- Billing

Construire :

-   subscriptions
-   plans
-   entitlements
-   2.5% commission ledger
-   reconciliation
-   invoices
-   failed payment handling
-   upgrade
-   downgrade
-   cancellation flow

Tester uniquement en mode sandbox/test avant production.

## 26.27 --- PHASE 17 --- Team

Finaliser :

-   invitations
-   roles
-   permissions
-   creator scope
-   assignments
-   audit
-   sessions

Tester cross-tenant et privilege escalation.

## 26.28 --- PHASE 18 --- Real Platform Connectors

Lorsque les accès nécessaires sont réellement disponibles :

implémenter :

-   OnlyFans connector
-   MYM connector

selon les capacités autorisées et disponibles.

Ne pas construire une dépendance non officielle fragile en prétendant
qu'elle est stable.

## 26.29 --- Connector Validation

Pour chaque plateforme :

tester séparément :

-   authentication
-   message sync
-   message send
-   transaction sync
-   media
-   paid offer
-   rate limits
-   reconnect
-   expired credentials
-   duplicate events

## 26.30 --- Capability-driven Product

Si une capacité n'existe pas sur une plateforme :

l'UI doit s'adapter.

Exemple :

``` text
Auto Paid Offer
Unavailable on this connection
```

Ne pas laisser un bouton qui échoue silencieusement.

## 26.31 --- PHASE 19 --- AI BENCHMARK PHASE 2

Une fois intégrés :

-   Memory
-   Fan Intelligence
-   Scripts
-   Media
-   Pricing
-   Negotiation
-   Follow-ups

lancer benchmark complet.

Comparer :

-   current AI version
-   previous AI version
-   alternative model configuration

## 26.32 --- Gate #2 --- Pilot Readiness

Avant pilote réel :

aucune régression critique sur :

-   unauthorized actions
-   minimum price
-   memory correctness
-   duplicate sends
-   script transitions
-   platform sync
-   human takeover

## 26.33 --- PHASE 20 --- Landing Page Rebuild

Construire la nouvelle landing selon Partie 23.

Important :

elle peut être développée visuellement plus tôt en parallèle si
nécessaire, mais elle ne doit pas retarder la validation du moteur
principal.

La promesse finale doit correspondre aux fonctionnalités réellement
validées.

## 26.34 --- Landing QA

Tester :

-   desktop
-   tablet
-   mobile
-   interactions
-   3D
-   marquee
-   ROI calculator
-   pricing
-   CTA
-   checkout
-   performance
-   reduced motion
-   accessibility

## 26.35 --- PHASE 21 --- End-to-End Onboarding

Flow complet :

``` text
Landing
↓
Signup
↓
Payment
↓
Agency
↓
Creator
↓
Platform
↓
Model DNA
↓
Scripts
↓
Media
↓
Playground
↓
Copilot / Full AI
```

Supprimer toute friction inutile.

## 26.36 --- AI Playground avant Full AI

Le Playground doit être disponible avant activation Full AI.

Tester :

-   objections
-   relationship
-   purchase intent
-   scripts
-   negotiation
-   pricing
-   memory

L'agence doit pouvoir vérifier le comportement.

## 26.37 --- PHASE 22 --- Internal Alpha

Utilisateurs :

-   équipe OmniFlow
-   comptes démo
-   données fictives

Objectif :

casser le produit avant qu'un client ne le fasse.

## 26.38 --- Internal Alpha Checklist

Tester :

-   onboarding
-   permissions
-   creator
-   conversations
-   scripts
-   media
-   AI
-   follow-ups
-   analytics
-   billing
-   errors
-   disconnects
-   mobile approvals

## 26.39 --- PHASE 23 --- Controlled Agency Pilot

Commencer avec un petit nombre d'agences partenaires.

Full AI doit être supervisé.

Collecter :

-   AI errors
-   edits
-   takeovers
-   conversion
-   response time
-   complaints
-   sales
-   pricing errors
-   memory errors

## 26.40 --- Pilot Mode

Prévoir éventuellement un mode :

# SUPERVISED FULL AI

L'IA prépare les actions mais certaines catégories demandent validation.

Permet d'augmenter progressivement l'autonomie.

## 26.41 --- Autonomy Ladder

Progression possible :

``` text
LEVEL 0 — Copilot
LEVEL 1 — AI replies, sales require approval
LEVEL 2 — AI handles standard sales
LEVEL 3 — AI handles negotiation within rules
LEVEL 4 — Full AI within configured boundaries
```

Cette architecture réduit le risque de passer brutalement de Copilot à
autonomie totale.

## 26.42 --- Pilot Success Metrics

Suivre :

-   AI response acceptance
-   human edit rate
-   takeover rate
-   conversion
-   revenue/conversation
-   AOV
-   follow-up recovery
-   rule violation rate
-   AI error rate
-   cost/conversation

## 26.43 --- Quality \> Automation Rate

Ne pas chercher à maximiser artificiellement le pourcentage de
conversations automatisées.

Priorité :

# PROFITABLE AND RELIABLE AUTOMATION.

Une conversation complexe peut être escaladée à un humain si nécessaire.

## 26.44 --- Feedback Loop

Chaque pilote doit produire :

-   failed cases
-   strong cases
-   edge cases
-   human corrections

Les ajouter au benchmark lorsque pertinents.

## 26.45 --- Golden Set Growth

Le Golden Set doit devenir plus difficile avec le temps.

Ajouter :

-   nouveaux comportements fans
-   nouvelles objections
-   cas ambigus
-   négociations difficiles
-   contradictions mémoire

## 26.46 --- PHASE 24 --- Performance & Security Review

Avant lancement :

-   query performance
-   indexes
-   media security
-   RLS
-   authorization
-   rate limiting
-   secret exposure
-   billing webhooks
-   AI cost limits
-   logging
-   backup
-   rollback

## 26.47 --- Load Testing

Simuler :

-   many concurrent conversations
-   message bursts
-   AI jobs
-   analytics
-   sync jobs

Identifier les goulots.

Pas besoin de dimensionner prématurément pour une échelle irréaliste.

## 26.48 --- AI Cost Test

Simuler plusieurs profils d'agence :

-   small
-   medium
-   high volume

Calculer :

-   calls
-   tokens
-   premium routing %
-   AI cost
-   OmniFlow revenue
-   gross contribution

Vérifier que le pricing reste viable.

## 26.49 --- Unit Economics Gate

Avant scale :

pour chaque segment :

``` text
Subscription Revenue
+
Variable Fee
-
AI Cost
-
Infrastructure
-
Payment Costs
=
Contribution
```

Éviter un plan qui perd de l'argent sur ses meilleurs clients.

## 26.50 --- PHASE 25 --- Pre-launch

Préparer :

-   production domain
-   production database
-   production secrets
-   billing live mode
-   platform production credentials
-   legal pages
-   privacy
-   terms
-   support
-   monitoring
-   analytics
-   email delivery

## 26.51 --- Legal/Product Claims Review

Avant lancement :

vérifier les formulations concernant :

-   platform integrations
-   savings
-   AI autonomy
-   data handling
-   2.5% commission
-   supported actions

Ne pas faire de promesse non démontrable.

## 26.52 --- Launch Checklist

Créer un fichier :

``` text
LAUNCH_CHECKLIST.md
```

avec checkbox pour chaque prérequis.

Le lancement n'a lieu que lorsque les éléments critiques sont validés.

## 26.53 --- PHASE 26 --- Soft Launch

Lancer avec volume limité.

Objectif :

observer le comportement réel.

Surveiller quotidiennement :

-   errors
-   AI quality
-   sales
-   takeovers
-   billing
-   platform health
-   latency
-   cost

## 26.54 --- PHASE 27 --- Public Launch

Après stabilité :

ouvrir progressivement.

Ne pas augmenter acquisition plus vite que la capacité à :

-   supporter les clients
-   corriger l'IA
-   surveiller les intégrations
-   gérer la facturation

## 26.55 --- Post-launch Cadence

Créer une cadence produit.

Exemple :

### Daily

-   critical errors
-   platform health
-   AI incidents

### Weekly

-   conversion
-   AI quality
-   costs
-   churn signals
-   support themes

### Per AI Release

-   benchmark
-   regression
-   staged rollout

## 26.56 --- AI Release Process

Chaque changement majeur :

``` text
Change
↓
Offline Benchmark
↓
Regression Check
↓
Internal Test
↓
Small Pilot
↓
Metrics
↓
Rollout
```

Ne pas modifier directement le prompt production sans évaluation.

## 26.57 --- Feature Release Process

Pour nouvelle feature :

-   spec
-   implementation
-   tests
-   preview
-   QA
-   feature flag
-   rollout
-   analytics

## 26.58 --- Bug Priority

### P0

Security, data leak, unauthorized financial action.

### P1

Full AI sends wrong critical action, platform outage, billing
corruption.

### P2

Major workflow broken.

### P3

Minor bug / UI issue.

P0/P1 peuvent nécessiter suspension immédiate de certaines
automatisations.

## 26.59 --- Kill Switch

Prévoir un kill switch global pour :

-   Full AI
-   automatic offers
-   follow-ups
-   specific connector
-   specific agency

Accessible uniquement à OmniFlow Admin autorisé.

## 26.60 --- Agency-level Pause

Support interne doit pouvoir suspendre une automatisation pour une
agence sans désactiver toute la plateforme.

Toutes les actions doivent être auditées.

## 26.61 --- Product Analytics

Mesurer adoption :

-   onboarding completion
-   creator connected
-   first conversation
-   first Copilot send
-   Full AI activation
-   first sale
-   first follow-up
-   weekly active agencies
-   feature usage

## 26.62 --- Activation Metric

Définir une activation significative.

Exemple :

Agency has:

-   creator configured
-   platform connected/mock completed
-   first AI-assisted conversation
-   first commercial action

Ne pas utiliser uniquement `account_created`.

## 26.63 --- Retention Metrics

Suivre :

-   weekly active agencies
-   Full AI usage
-   conversations processed
-   AI revenue
-   scripts used
-   creator retention
-   cancellation reasons

## 26.64 --- North Star Candidate

Candidate V1 :

# REVENUE SUCCESSFULLY HANDLED BY OMNIFLOW.

À compléter avec métriques qualité.

Ne pas optimiser le revenu traité au détriment de la performance réelle.

## 26.65 --- Core Quality Metrics

Toujours suivre avec North Star :

-   conversion
-   rule violations
-   takeover rate
-   AI error rate
-   client retention

## 26.66 --- Scope Freeze V1

Pendant construction V1 :

ne pas ajouter :

-   Marketing module
-   Recruitment module
-   Marketplace
-   Video editor
-   Social posting
-   VA tracking

sauf nécessité technique liée au Chatting.

Documenter ces idées dans roadmap future.

## 26.67 --- V1 Definition

La V1 est :

# THE BEST AI CHATTING ENGINE OMNIFLOW CAN SHIP RELIABLY.

Elle doit inclure le nécessaire pour :

-   configure
-   understand
-   decide
-   sell
-   remember
-   measure
-   control

## 26.68 --- V1 Core

Core indispensable :

-   Agency workspace
-   Creators
-   Model DNA
-   Copilot
-   Full AI
-   Fan Intelligence
-   Memory
-   Scripts
-   Media
-   Pricing
-   Negotiation
-   Follow-ups
-   Analytics
-   ROI
-   Billing
-   Integrations
-   Team permissions
-   Playground

## 26.69 --- Feature Cut Rule

Si une feature secondaire retarde fortement le lancement :

demander :

**Does the AI chatting engine need this to create measurable value?**

Si non :

déplacer post-V1.

## 26.70 --- Claude Code Working Rule

Claude Code doit travailler par milestone.

À la fin de chaque milestone :

1.  résumer ce qui a été construit
2.  lister fichiers importants
3.  indiquer migrations
4.  indiquer variables env nécessaires
5.  indiquer tests exécutés
6.  signaler les éléments mock
7.  signaler les blockers
8.  demander validation avant étape destructrice majeure

## 26.71 --- Ne pas demander validation pour chaque détail

Claude Code peut prendre des décisions techniques raisonnables conformes
au cahier des charges.

Demander validation uniquement lorsque :

-   choix change le produit
-   coût important
-   action destructive
-   sécurité
-   intégration externe incertaine
-   compromis majeur

## 26.72 --- Definition of Done

Une feature est terminée lorsque :

-   UX finalisée
-   backend relié
-   permissions appliquées
-   validation inputs
-   loading
-   empty state
-   errors
-   analytics events
-   tests
-   responsive si pertinent
-   documentation mise à jour

## 26.73 --- Final V1 E2E Test

Avant lancement :

``` text
Visitor opens OmniFlow
↓
Understands product
↓
Chooses plan
↓
Pays
↓
Creates agency
↓
Adds creator
↓
Connects platform
↓
Configures AI
↓
Adds scripts/media
↓
Tests Playground
↓
Activates Copilot/Full AI
↓
Fan sends message
↓
OmniFlow understands
↓
OmniFlow decides
↓
OmniFlow acts
↓
Sale occurs
↓
Memory updates
↓
Analytics update
↓
2.5% commission is recorded
↓
Agency sees ROI
```

Ce scénario doit fonctionner de bout en bout.

## 26.74 --- Critère de réussite

La roadmap est réussie lorsque :

-   Claude Code sait exactement dans quel ordre construire
-   l'ancien projet est audité avant reconstruction
-   le cœur IA est testé très tôt
-   les intégrations ne bloquent pas le développement
-   Mock Connector permet de construire le produit complet
-   le benchmark possède des gates obligatoires
-   Full AI est déployé progressivement
-   les coûts IA sont mesurés avant scale
-   la sécurité est testée avant lancement
-   la landing reflète le produit réel
-   le scope V1 reste concentré sur Chatting
-   le produit peut être lancé avec un petit nombre d'agences puis
    élargi

# ONE CORE PRODUCT.

# ONE CLEAR BUILD ORDER.

# PROVE PERFORMANCE BEFORE SCALE.

------------------------------------------------------------------------

## PARTIE 26 --- VALIDÉE COMME DEVELOPMENT ROADMAP, BUILD ORDER, QA & LAUNCH PLAN

La suite du cahier des charges commence avec :

# PARTIE 27 --- OMNIFLOW ADMIN, INTERNAL CONTROL CENTER & SUPPORT OPERATIONS
