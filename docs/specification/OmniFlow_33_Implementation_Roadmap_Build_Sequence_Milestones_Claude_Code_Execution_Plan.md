# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 33 --- IMPLEMENTATION ROADMAP, BUILD SEQUENCE, MILESTONES & CLAUDE CODE EXECUTION PLAN

## 33.1 --- Objectif

Cette partie transforme le cahier des charges OmniFlow en ordre
d'exécution concret.

Claude Code ne doit pas essayer de construire toutes les fonctionnalités
simultanément.

Principe :

# BUILD THE FOUNDATION FIRST.

# PROVE THE CORE LOOP.

# THEN ADD AUTONOMY.

Le projet existant doit être considéré comme une base technique à
auditer, et non comme un produit à conserver visuellement ou
fonctionnellement.

La nouvelle V1 repart sur :

-   nouvelle landing page
-   nouvelle application connectée
-   nouvelle architecture fonctionnelle
-   nouvelle expérience utilisateur
-   nouveau design system
-   nouveau moteur AI Chatting

Les éléments existants ne sont conservés que s'ils sont techniquement
utiles après audit.

## 33.2 --- Règle fondamentale pour Claude Code

Avant de modifier le code :

1.  lire l'intégralité du cahier des charges disponible
2.  auditer le repository
3.  auditer la database
4.  auditer l'authentification
5.  auditer les intégrations existantes
6.  identifier ce qui peut être réutilisé
7.  identifier ce qui doit être supprimé/reconstruit
8.  proposer le plan d'implémentation réel

Ne pas commencer par modifier aléatoirement des composants existants.

## 33.3 --- Source of Truth

Créer :

``` text
/docs/implementation/MASTER_PLAN.md
```

Ce document devient la source opérationnelle de l'implémentation.

Il doit contenir :

-   phases
-   milestones
-   dependencies
-   status
-   blockers
-   validation gates

## 33.4 --- Status Convention

Chaque tâche :

``` text
NOT_STARTED
IN_PROGRESS
BLOCKED
READY_FOR_REVIEW
DONE
```

## 33.5 --- Priority Convention

``` text
P0 — Critical
P1 — Core
P2 — Important
P3 — Later
```

## 33.6 --- Architecture Target

Pour V1 :

# MODULAR MONOLITH

avec séparation claire des domaines :

``` text
auth
agencies
creators
fans
conversations
ai
scripts
media
sales
followups
analytics
integrations
billing
admin
```

Ne pas introduire des microservices prématurément.

## 33.7 --- PHASE 0 --- Repository Audit

Objectif :

comprendre exactement l'état actuel.

Analyser :

-   framework
-   routes
-   components
-   database client
-   Supabase
-   auth
-   Vercel
-   environment variables
-   existing APIs
-   existing UI
-   old OmniFlow logic

## 33.8 --- Phase 0 Deliverable

Créer :

``` text
/docs/implementation/CURRENT_STATE_AUDIT.md
```

Avec :

``` text
KEEP
REFACTOR
REMOVE
REBUILD
UNKNOWN
```

## 33.9 --- PHASE 0 --- Database Audit

Lister :

-   tables
-   policies
-   migrations
-   indexes
-   storage buckets
-   functions/triggers
-   obsolete schema

Comparer au blueprint Partie 28.

## 33.10 --- PHASE 0 --- Security Audit

Vérifier immédiatement :

-   exposed secrets
-   weak RLS
-   public storage
-   unsafe server/client boundaries
-   legacy endpoints

Les problèmes critiques doivent être corrigés avant de bâtir dessus.

## 33.11 --- PHASE 0 --- Backup

Avant migration destructive :

-   backup database
-   backup required assets
-   preserve current production state if necessary

## 33.12 --- MILESTONE 0

# AUDIT COMPLETE

Gate :

``` text
[ ] Repository understood
[ ] Database understood
[ ] Security risks identified
[ ] Reuse decisions documented
[ ] Backup available
[ ] Implementation plan updated
```

## 33.13 --- PHASE 1 --- Project Foundation

Construire/nettoyer :

-   folder architecture
-   shared types
-   validation schemas
-   environment validation
-   error handling
-   logger
-   request IDs
-   feature flags foundation

## 33.14 --- PHASE 1 --- Design System

Créer le nouveau langage OmniFlow :

-   premium
-   AI
-   fluid
-   dark/modern if retained by final design
-   interactive
-   dynamic

Composants :

-   buttons
-   cards
-   inputs
-   modals
-   tabs
-   badges
-   tables
-   charts
-   navigation

## 33.15 --- PHASE 1 --- Landing Foundation

Reconstruire la landing page depuis zéro.

Préparer :

-   header
-   hero
-   product sections
-   animations
-   pricing
-   CTA
-   footer

## 33.16 --- Dynamic Landing

Implémenter avec performance :

-   hover interactions
-   subtle 3D effects
-   horizontal moving strip/ticker where useful
-   AI-inspired motion
-   premium transitions

Respecter :

-   reduced motion
-   responsive
-   accessibility
-   performance

## 33.17 --- PHASE 1 --- Application Shell

Reconstruire la partie connectée.

Créer :

-   sidebar
-   top navigation
-   workspace selector if required
-   creator selector
-   global search placeholder
-   notifications
-   account/settings

## 33.18 --- PHASE 1 --- Auth

Finaliser :

-   signup
-   login
-   logout
-   password reset
-   protected routes
-   onboarding

## 33.19 --- PHASE 1 --- Agency Workspace

Créer :

-   agency
-   membership
-   roles foundation
-   settings
-   plan/entitlement foundation

## 33.20 --- MILESTONE 1

# NEW OMNIFLOW SHELL READY

Gate :

``` text
[ ] New landing foundation
[ ] New authenticated app
[ ] Auth works
[ ] Agency isolation foundation
[ ] Design system
[ ] Old UI no longer dictates architecture
```

## 33.21 --- PHASE 2 --- Core Data Model

Implémenter progressivement les migrations Partie 28.

Priorité :

1.  agencies
2.  users/memberships
3.  roles/permissions
4.  creators
5.  platform abstractions
6.  fans
7.  conversations
8.  messages

## 33.22 --- PHASE 2 --- RLS

Ajouter policies dès création des tables.

Ne pas attendre la fin.

## 33.23 --- PHASE 2 --- Creator Management

UI :

-   list creators
-   create creator
-   edit creator
-   archive creator

## 33.24 --- PHASE 2 --- Creator AI Profile

Créer le Model DNA.

Paramètres :

-   tone
-   vocabulary
-   length
-   emojis
-   punctuation
-   warmth
-   flirt
-   directness
-   commercial aggressiveness
-   custom instructions

## 33.25 --- PHASE 2 --- Commercial Settings

Créer :

-   negotiation enabled
-   max discount
-   custom content
-   live session
-   minimum prices
-   follow-up
-   proactive messaging

## 33.26 --- PHASE 2 --- Mock Platform

Construire le Mock Connector avant de dépendre d'une plateforme réelle.

Il doit permettre :

-   fake fan
-   inbound message
-   outbound message
-   paid offer
-   purchase
-   failure
-   delay

## 33.27 --- PHASE 2 --- Inbox

Créer première Inbox fonctionnelle :

-   conversations
-   messages
-   fan identity
-   creator
-   status
-   filters
-   manual reply

## 33.28 --- MILESTONE 2

# MANUAL CHATTING CORE READY

Gate :

``` text
[ ] Creator configured
[ ] Mock platform connected
[ ] Fan exists
[ ] Conversation created
[ ] Message received
[ ] Human can reply
[ ] Agency isolation tested
```

## 33.29 --- PHASE 3 --- AI Foundation

Implémenter :

-   AI provider abstraction
-   model registry
-   model router
-   prompt registry
-   structured outputs
-   AI logging

## 33.30 --- PHASE 3 --- Multi-model Strategy

Ne pas coder les modèles en dur dans les features.

Utiliser aliases :

``` text
FAST_MODEL
BALANCED_MODEL
PREMIUM_MODEL
```

Le routing décide selon la tâche.

## 33.31 --- PHASE 3 --- Context Builder

Construire le contexte depuis :

-   agency settings
-   creator DNA
-   recent messages
-   fan profile
-   relevant memory
-   commercial state

## 33.32 --- PHASE 3 --- Copilot

Première vraie feature IA utilisateur.

Workflow :

``` text
Fan message
↓
Generate suggestion
↓
Chatter reviews
↓
Edit/regenerate/send
```

## 33.33 --- PHASE 3 --- Feedback

Ajouter :

-   good
-   bad reply
-   wrong strategy
-   wrong memory
-   bad timing

## 33.34 --- PHASE 3 --- AI Cost Tracking

Dès le début :

-   tokens
-   model
-   latency
-   estimated cost

## 33.35 --- MILESTONE 3

# COPILOT ALPHA READY

Gate :

``` text
[ ] AI suggestion works
[ ] Model routing works
[ ] Structured output validated
[ ] Feedback recorded
[ ] AI cost visible internally
[ ] Human remains in control
```

## 33.36 --- PHASE 4 --- Long-term Memory

Implémenter :

-   memory extraction
-   structured memories
-   confidence
-   correction
-   retrieval
-   contradiction handling

## 33.37 --- PHASE 4 --- Fan Profile

Afficher :

-   personal information
-   relationship state
-   purchase history
-   preferences
-   notes/memories

## 33.38 --- PHASE 4 --- Fan Scores

Implémenter :

``` text
Purchase Intent
Relationship
Spending Potential
Engagement
Churn Risk
```

## 33.39 --- PHASE 4 --- Score Explanation

L'UI doit pouvoir expliquer les facteurs principaux.

Ne pas afficher un score opaque uniquement.

## 33.40 --- MILESTONE 4

# FAN INTELLIGENCE READY

Gate :

``` text
[ ] Memory persists
[ ] Relevant memory retrieved
[ ] Corrections win
[ ] Scores update
[ ] Fan profile useful
[ ] Cross-fan contamination tested
```

## 33.41 --- PHASE 5 --- Media Library

Implémenter :

-   secure upload
-   folders/tags
-   creator ownership
-   description
-   target price
-   minimum price
-   archive

## 33.42 --- PHASE 5 --- AI Media Search

Permettre à l'IA de trouver des médias adaptés selon :

-   creator
-   request
-   tags
-   script
-   price
-   availability

## 33.43 --- PHASE 5 --- Scripts

Construire :

-   script list
-   builder
-   nodes
-   branches
-   paid steps
-   recovery paths
-   versioning
-   validation
-   publish

## 33.44 --- PHASE 5 --- Script Runtime

Le runtime doit suivre :

-   current node
-   purchase
-   no purchase
-   objection
-   recovery
-   completion

## 33.45 --- PHASE 5 --- Script Analytics Foundation

Capturer :

-   node entered
-   offer sent
-   purchase
-   drop-off

## 33.46 --- MILESTONE 5

# SALES ENGINE READY

Gate :

``` text
[ ] Media can be sold
[ ] Scripts branch correctly
[ ] Purchases advance scripts
[ ] No-purchase branch works
[ ] Versioning works
[ ] Analytics events captured
```

## 33.47 --- PHASE 6 --- Offer Engine

Créer l'entité Offer.

Support :

-   script media
-   out-of-script media
-   custom request
-   live session

## 33.48 --- PHASE 6 --- Pricing Engine

Centraliser :

-   target price
-   minimum price
-   discount
-   negotiation permission

## 33.49 --- PHASE 6 --- Negotiation Engine

L'IA peut :

-   accept
-   counter
-   refuse

dans les limites définies.

## 33.50 --- PHASE 6 --- Action Validator

Construire avant Full AI.

Valider :

-   mode
-   price
-   media
-   script
-   negotiation
-   permissions
-   platform capability

## 33.51 --- PHASE 6 --- AI Decision Engine

Passer du simple "reply generator" à :

``` text
UNDERSTAND
↓
DECIDE
↓
ACT
```

Output structuré :

-   objective
-   strategy
-   action
-   parameters

## 33.52 --- MILESTONE 6

# AI SALES DECISION ENGINE READY

Gate :

``` text
[ ] AI chooses action
[ ] Pricing cannot be bypassed
[ ] Negotiation obeys settings
[ ] Media selection controlled
[ ] Validator blocks invalid action
```

## 33.53 --- PHASE 7 --- Benchmark Phase 1

À ce moment précis, Claude Code doit rappeler au propriétaire du projet
:

# RUN THE FIRST MAJOR AI BENCHMARK.

Préconditions :

-   Mock Connector
-   Memory
-   Decision Engine
-   Scripts
-   Pricing

fonctionnels.

## 33.54 --- Benchmark Deliverable

Exécuter :

``` text
npm run benchmark:ai
```

si cette commande a été réellement implémentée.

Générer le rapport Partie 30.

## 33.55 --- Benchmark Gate

Ne pas poursuivre aveuglément vers Full AI si :

-   pricing failures
-   script failures
-   major memory failures
-   poor sales timing

## 33.56 --- PHASE 8 --- Full AI

Après benchmark acceptable.

Créer mode :

``` text
FULL_AI
```

Workflow :

``` text
Message
↓
Context
↓
Decision
↓
Validator
↓
Execute
↓
Observe
```

## 33.57 --- PHASE 8 --- Autonomy Controls

Ajouter :

-   enable/disable
-   approval thresholds
-   action permissions
-   human takeover
-   global kill switch

## 33.58 --- PHASE 8 --- Full AI Queue

Les actions autonomes doivent être :

-   idempotent
-   cancellable where possible
-   revalidated
-   observable

## 33.59 --- PHASE 8 --- Human Takeover

Bouton évident dans Inbox.

Le takeover doit stopper les nouvelles actions autonomes.

## 33.60 --- MILESTONE 7

# FULL AI INTERNAL ALPHA READY

Gate :

``` text
[ ] Full AI works on Mock Connector
[ ] Kill switch tested
[ ] Human takeover tested
[ ] Pricing validator tested
[ ] Audit trail complete
[ ] No critical benchmark failure
```

## 33.61 --- PHASE 9 --- Follow-ups

Construire :

-   AI suggested follow-up
-   scheduled follow-up
-   approval
-   automatic follow-up if enabled
-   revalidation

## 33.62 --- PHASE 9 --- Proactive AI

Seulement après contrôles.

L'IA peut identifier :

-   fan online/re-engaged if platform data permits
-   conversation worth relaunching
-   abandoned offer
-   high-intent fan

Les capacités réelles dépendent du connecteur plateforme.

## 33.63 --- PHASE 9 --- Follow-up Analytics

Mesurer :

-   sent
-   response
-   purchase
-   revenue
-   recovery conversion

## 33.64 --- MILESTONE 8

# PROACTIVE SALES LOOP READY

## 33.65 --- PHASE 10 --- Transactions

Implémenter source financière :

-   ingestion
-   deduplication
-   status
-   attribution

## 33.66 --- PHASE 10 --- Commission 2.5%

Implémenter :

``` text
eligible sale
×
2.5%
=
OmniFlow commission
```

avec rate snapshot.

## 33.67 --- PHASE 10 --- Commission Ledger

Append-only autant que possible.

Ajouter adjustments séparés.

## 33.68 --- PHASE 10 --- Subscription Billing

Implémenter les plans OmniFlow.

L'abonnement fixe et la commission variable doivent être clairement
séparés dans le modèle financier.

## 33.69 --- PHASE 10 --- Reconciliation

Créer processus permettant de comparer :

-   platform transactions
-   OmniFlow transactions
-   commission ledger
-   billed variable amount

## 33.70 --- MILESTONE 9

# MONETIZATION ENGINE READY

Gate :

``` text
[ ] Subscription works
[ ] Commission works
[ ] Duplicate transaction safe
[ ] Ledger auditable
[ ] Reconciliation works
[ ] Billing tests pass
```

## 33.71 --- PHASE 11 --- Analytics Dashboard

Construire les métriques utilisateur.

Priorité :

-   revenue
-   AI revenue
-   conversion
-   average sale
-   fan scores
-   scripts
-   media
-   follow-ups

## 33.72 --- PHASE 11 --- Script Diagnostics

Afficher :

-   conversion by step
-   drop-off
-   revenue
-   potential issue

## 33.73 --- PHASE 11 --- AI Diagnostics

Afficher :

-   Copilot usage
-   Full AI usage
-   takeovers
-   AI sales
-   conversion
-   response performance

## 33.74 --- PHASE 11 --- Recommendations

V1 peut commencer avec recommandations simples :

``` text
Step 1 conversion is below baseline.
Consider testing price or media.
```

Ne pas modifier automatiquement les paramètres.

## 33.75 --- MILESTONE 10

# AGENCY PERFORMANCE DASHBOARD READY

## 33.76 --- PHASE 12 --- Team & Permissions

Finaliser :

-   invitations
-   roles
-   custom permissions if in scope
-   creator access
-   chatter restrictions

## 33.77 --- PHASE 12 --- Admin Control Center

Finaliser l'espace interne :

-   agencies
-   subscriptions
-   AI status
-   incidents
-   jobs
-   connectors
-   feature flags
-   support

## 33.78 --- PHASE 12 --- Observability

Finaliser :

-   dashboards
-   alerts
-   runbooks
-   dependency health
-   backup monitoring

## 33.79 --- MILESTONE 11

# OPERATIONS READY

## 33.80 --- PHASE 13 --- Real Platform Integration

Only after the platform provides a legitimate and technically viable
integration method.

Target platforms:

-   OnlyFans
-   MYM

OmniFlow must be designed for both from the start, but implementation
depends on actual authorized capabilities.

## 33.81 --- Platform Integration Rule

Do not build the core product around unsupported assumptions.

For each platform, document:

``` text
AUTH
READ MESSAGES
SEND MESSAGES
SEND MEDIA
PAID MEDIA
TRANSACTIONS
ONLINE STATUS
WEBHOOKS
RATE LIMITS
```

as:

``` text
SUPPORTED
UNSUPPORTED
UNKNOWN
```

## 33.82 --- Connector Capability Flags

Example:

``` text
canReadMessages
canSendMessages
canSendPaidMedia
canReadTransactions
canReadOnlineStatus
```

The product UI adapts accordingly.

## 33.83 --- MILESTONE 12

# FIRST REAL CONNECTOR READY

Gate:

``` text
[ ] Authorized integration method
[ ] Contract suite passes
[ ] Security reviewed
[ ] Rate limits handled
[ ] Idempotency tested
[ ] Pilot scope only
```

## 33.84 --- PHASE 14 --- Benchmark Phase 2

Before real Full AI pilot:

run complete benchmark including:

-   negotiation
-   media selection
-   follow-ups
-   action validator
-   Full AI

## 33.85 --- PHASE 14 --- Shadow Mode

Run candidate AI without executing its actions where appropriate.

Compare against:

-   human decisions
-   production Copilot
-   controlled expected behavior

## 33.86 --- PHASE 14 --- Pilot Agencies

Activate a small controlled cohort.

Use feature flags.

## 33.87 --- Pilot Limits

Initially limit:

-   creators per agency
-   Full AI access
-   proactive actions
-   high-risk custom actions

## 33.88 --- Pilot Monitoring

Daily:

-   AI quality
-   revenue
-   conversion
-   takeovers
-   errors
-   costs
-   platform failures
-   support feedback

## 33.89 --- MILESTONE 13

# CONTROLLED PILOT VALIDATED

Gate:

``` text
[ ] No critical security issue
[ ] No critical pricing violation
[ ] No duplicate paid action issue
[ ] AI quality acceptable
[ ] Unit economics acceptable
[ ] Agencies see value
[ ] Operations manageable
```

## 33.90 --- PHASE 15 --- Landing Finalization

Only after product proof is sufficiently clear, finalize marketing
claims.

Landing must emphasize:

-   AI Chatting
-   memory
-   sales intelligence
-   Copilot
-   Full AI
-   cost reduction
-   agency control

## 33.91 --- Pricing Presentation

Display:

-   subscription plans
-   2.5% commission on sales according to final contractual scope

Explain the economic advantage versus traditional chatter commissions.

Do not hide the commission.

## 33.92 --- Economic Comparison

Marketing can illustrate conceptually:

``` text
Traditional chatter:
~10% or more of sales

OmniFlow:
subscription
+
2.5% eligible sales commission
```

Any precise savings claim must match actual assumptions and
legal/marketing review.

## 33.93 --- PHASE 16 --- Production Readiness Review

Review all previous gates.

No launch because "the site looks finished."

## 33.94 --- Production Readiness Areas

``` text
PRODUCT
AI
SECURITY
DATABASE
BILLING
INTEGRATIONS
OBSERVABILITY
SUPPORT
LEGAL
```

## 33.95 --- Legal/Commercial Review

Before broad launch, review:

-   Terms
-   Privacy
-   commission disclosure
-   billing authorization
-   platform compliance
-   data processing
-   AI disclosures where applicable

## 33.96 --- MILESTONE 14

# OMNIFLOW V1 PRODUCTION READY

## 33.97 --- Build Dependency Map

``` text
Foundation
↓
Manual Chatting
↓
Copilot
↓
Memory
↓
Scripts + Media
↓
Decision Engine
↓
Benchmark
↓
Full AI
↓
Follow-ups
↓
Transactions + Billing
↓
Analytics
↓
Operations
↓
Real Connector
↓
Pilot
↓
Launch
```

## 33.98 --- What NOT to Build First

Do not prioritize before core Chatting proves value:

-   Marketing module
-   Recruitment module
-   Marketplace
-   video editor
-   social posting
-   VA tracking
-   content scraping

These remain future OmniFlow pillars.

## 33.99 --- Product Focus Rule

Question before every feature:

# DOES THIS MAKE THE AI CHATTING PRODUCT MORE VALUABLE OR MORE RELIABLE?

If no:

move it to later roadmap.

## 33.100 --- Future Pillar 2

# MARKETING

Potential later scope:

-   connected social accounts
-   account analytics
-   winning content detection
-   trend intelligence
-   content calendar
-   VA assignments
-   publishing
-   content library
-   video editing/variation workflows where compliant and technically
    viable

## 33.101 --- Future Pillar 3

# RECRUITMENT

Potential later scope:

-   profile discovery
-   lead scoring
-   outreach
-   scripts
-   pipeline
-   AI recruitment assistant

## 33.102 --- Future Pillar 4

# AGENCY OPERATIONS

Potential later scope:

-   team productivity
-   VA task verification
-   reporting
-   automations
-   operational alerts

## 33.103 --- Future Marketplace

Marketplace is separate future initiative.

Do not contaminate V1 data model or UX with premature marketplace logic.

## 33.104 --- Claude Code Session Rule

At the beginning of a major implementation session:

Claude Code should read:

``` text
MASTER_PLAN.md
CURRENT_STATE_AUDIT.md
relevant specification parts
```

Then state:

-   current milestone
-   next task
-   dependencies
-   expected files changed

## 33.105 --- Small Implementation Batches

Prefer:

``` text
1 domain
1 coherent change
tests
review
commit
```

rather than enormous unreviewable rewrites.

## 33.106 --- Before Each Major Phase

Claude Code must check:

``` text
Are previous milestone gates complete?
```

If no:

identify the blocker before continuing.

## 33.107 --- After Each Major Phase

Update:

``` text
MASTER_PLAN.md
```

with:

-   completed
-   pending
-   decisions
-   technical debt
-   next phase

## 33.108 --- Decision Log

Create:

``` text
/docs/implementation/DECISIONS.md
```

For important decisions:

``` text
Date
Decision
Reason
Alternatives
Impact
```

## 33.109 --- Blocker Log

Create:

``` text
/docs/implementation/BLOCKERS.md
```

Examples:

-   platform API unavailable
-   billing provider decision
-   legal review
-   missing credential

## 33.110 --- Technical Debt Log

Create:

``` text
/docs/implementation/TECH_DEBT.md
```

Do not hide shortcuts.

## 33.111 --- No Silent Scope Change

Claude Code must not silently remove a requirement because
implementation is difficult.

Instead:

-   mark blocker
-   propose alternative
-   document decision

## 33.112 --- No Fake Integration

If OnlyFans/MYM integration is unavailable:

do not simulate it in Production while presenting it as real.

Use Mock Connector until legitimate integration exists.

## 33.113 --- No Fake Metrics

Dashboard must not display invented business metrics.

If data unavailable:

show empty state or unavailable state.

## 33.114 --- No Fake AI Learning

Do not claim the AI "learns automatically" unless the actual improvement
pipeline exists.

V1 learning is controlled via:

-   memory
-   settings
-   feedback
-   benchmarks
-   releases

## 33.115 --- First Usable Internal Product

The first genuinely usable internal OmniFlow version is reached at:

# MILESTONE 3 --- COPILOT ALPHA.

At that stage, manual testing with synthetic/mock conversations can
begin.

## 33.116 --- First Commercially Interesting Product

Reached around:

# MILESTONE 6 --- AI SALES DECISION ENGINE.

Because OmniFlow can begin demonstrating sales intelligence rather than
simple AI replies.

## 33.117 --- First Major Differentiation

Reached at:

# MILESTONE 7 --- FULL AI INTERNAL ALPHA.

This is where OmniFlow begins to become the product originally
envisioned.

## 33.118 --- First Monetizable Pilot

Reached after:

-   Full AI
-   transactions
-   billing
-   analytics
-   first legitimate connector

and required validation gates.

## 33.119 --- Owner Actions Required

Claude Code must clearly flag when human action is required.

Examples:

``` text
OWNER ACTION REQUIRED:
Run AI benchmark.

OWNER ACTION REQUIRED:
Provide platform integration credentials.

OWNER ACTION REQUIRED:
Validate pricing page.

OWNER ACTION REQUIRED:
Review pilot results.
```

## 33.120 --- Benchmark Reminder

Mandatory owner reminders at:

### Gate A

Before Full AI development progresses beyond internal controlled
testing.

### Gate B

Before real platform Full AI pilot.

### Gate C

Before major AI release.

## 33.121 --- Documentation Discipline

Code and documentation must evolve together.

A completed feature without updated documentation is incomplete when the
specification requires documentation.

## 33.122 --- Definition of Done

For a task:

``` text
Code
+
Validation
+
Tests
+
Permissions
+
Observability
+
Documentation
```

where applicable.

## 33.123 --- Final Execution Philosophy

OmniFlow should not be built as:

``` text
Landing Page
+
Random AI Chat
+
Many Features
```

It must be built as:

``` text
Reliable Conversation Infrastructure
+
Fan Intelligence
+
Sales Decision Engine
+
Controlled Autonomy
+
Measurable Revenue System
```

## 33.124 --- Critère de réussite

Cette roadmap est réussie lorsque :

-   Claude Code sait exactement par quoi commencer
-   l'ancien produit ne limite pas la nouvelle architecture
-   le nouveau frontend est reconstruit proprement
-   le Mock Connector débloque le développement
-   Copilot est construit avant Full AI
-   memory précède les décisions complexes
-   pricing et scripts précèdent l'autonomie
-   benchmark arrive au bon moment
-   Full AI n'est activé qu'après validation
-   billing arrive avant commercialisation
-   real connectors sont isolés derrière une abstraction
-   le pilote précède le lancement large
-   les futurs modules Marketing/Recrutement restent hors du scope V1
-   chaque milestone possède un gate mesurable

# ONE PRODUCT.

# ONE CORE LOOP.

# ONE MILESTONE AT A TIME.

------------------------------------------------------------------------

## PARTIE 33 --- VALIDÉE COMME IMPLEMENTATION ROADMAP, BUILD SEQUENCE, MILESTONES & CLAUDE CODE EXECUTION PLAN

La suite du cahier des charges commence avec :

# PARTIE 34 --- FINAL V1 SCOPE, OUT-OF-SCOPE, ACCEPTANCE SUMMARY & MASTER HANDOFF TO CLAUDE CODE
