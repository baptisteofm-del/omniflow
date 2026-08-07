# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 35 --- CLAUDE CODE MASTER STARTUP INSTRUCTIONS, DOCUMENT INDEX & FIRST EXECUTION PROMPT

## 35.1 --- Objectif

Cette partie est le point d'entrée opérationnel final pour Claude Code.

Elle ne remplace aucune des 34 parties précédentes.

Elle explique comment utiliser l'ensemble du cahier des charges pour
commencer la reconstruction d'OmniFlow proprement, sans perdre les
décisions produit déjà prises.

Principe :

# READ FIRST. AUDIT SECOND. PLAN THIRD. CODE FOURTH.

------------------------------------------------------------------------

# 35.2 --- Instruction générale

Claude Code doit considérer l'ensemble des documents OmniFlow comme une
spécification unique découpée en plusieurs fichiers.

Les fichiers ne sont pas des alternatives.

Ils sont complémentaires.

------------------------------------------------------------------------

# 35.3 --- Ordre documentaire

Les documents doivent être lus dans leur ordre numérique :

``` text
OmniFlow_01
OmniFlow_02
OmniFlow_03
...
OmniFlow_35
```

Les parties récentes peuvent préciser, compléter ou corriger des
décisions plus anciennes.

------------------------------------------------------------------------

# 35.4 --- Priorité en cas de contradiction

Si deux exigences sont réellement incompatibles :

``` text
1. Explicit later correction
2. Security / legal constraint
3. Financial integrity
4. Core V1 product scope
5. Architecture
6. UX preference
```

Ne pas arbitrer silencieusement un conflit produit majeur.

Le documenter et demander validation.

------------------------------------------------------------------------

# 35.5 --- Vision à retenir

OmniFlow vise à terme une plateforme complète pour agences.

Mais la V1 doit rester concentrée sur :

# AI CHATTING.

Le produit doit être suffisamment fort pour qu'une agence puisse vouloir
payer même si aucun module Marketing ou Recruitment n'existe encore.

------------------------------------------------------------------------

# 35.6 --- Core Promise

OmniFlow doit transformer le chatting en système intelligent capable de
:

``` text
Understand
Remember
Decide
Sell
Act
Observe
Improve
```

------------------------------------------------------------------------

# 35.7 --- Product Modes

Deux modes principaux :

``` text
COPILOT
FULL AI
```

Copilot assiste l'humain.

Full AI peut agir de manière autonome dans les limites définies par
l'agence et par les règles système.

------------------------------------------------------------------------

# 35.8 --- Product Differentiation

Le produit ne doit pas être réduit à :

``` text
LLM + Chat UI
```

Le différentiel vient de :

-   Creator DNA
-   Fan Memory
-   Fan Intelligence
-   Sales Decision Engine
-   Scripts
-   Media Intelligence
-   Pricing
-   Negotiation
-   Follow-ups
-   Analytics
-   Controlled Autonomy
-   Continuous Evaluation

------------------------------------------------------------------------

# 35.9 --- Existing Product Warning

Une ancienne version d'OmniFlow existe déjà.

Elle ne doit pas contraindre la nouvelle vision.

La demande est :

# REBUILD THE PRODUCT EXPERIENCE.

Cela inclut :

-   landing page
-   authenticated application
-   product architecture
-   UI
-   UX
-   core workflows

------------------------------------------------------------------------

# 35.10 --- What May Be Reused

Après audit seulement :

-   auth
-   Supabase configuration
-   deployment configuration
-   useful database structures
-   valid backend utilities
-   infrastructure
-   reusable components

------------------------------------------------------------------------

# 35.11 --- What Must Not Be Preserved by Default

Ne pas conserver uniquement parce que cela existe :

-   old landing design
-   old dashboard
-   old navigation
-   old feature structure
-   obsolete database assumptions
-   old product positioning

------------------------------------------------------------------------

# 35.12 --- No Destructive Start

Ne pas supprimer immédiatement l'ancien système.

Avant toute destruction :

-   audit
-   backup
-   migration plan
-   explicit decision

------------------------------------------------------------------------

# 35.13 --- First Mission

La première mission de Claude Code n'est PAS :

``` text
Build OmniFlow.
```

La première mission est :

# UNDERSTAND THE CURRENT REPOSITORY AND PRODUCE THE IMPLEMENTATION PLAN.

------------------------------------------------------------------------

# 35.14 --- Required Initial Documents

Avant reconstruction majeure, créer :

``` text
/docs/implementation/CURRENT_STATE_AUDIT.md
/docs/implementation/MASTER_PLAN.md
/docs/implementation/DECISIONS.md
/docs/implementation/BLOCKERS.md
/docs/implementation/TECH_DEBT.md
```

------------------------------------------------------------------------

# 35.15 --- CURRENT_STATE_AUDIT.md

Analyser :

``` text
Repository
Framework
Dependencies
Routes
Components
Database
Supabase
Authentication
RLS
Storage
API
Integrations
Environment
Vercel
Existing AI
Existing Billing
Existing Tests
Security
```

------------------------------------------------------------------------

# 35.16 --- Audit Classification

Pour chaque partie :

``` text
KEEP
REFACTOR
REMOVE
REBUILD
INVESTIGATE
```

Ajouter la justification.

------------------------------------------------------------------------

# 35.17 --- MASTER_PLAN.md

Transformer la Partie 33 en plan correspondant au repository réel.

Chaque milestone doit contenir :

-   tasks
-   dependencies
-   files/modules
-   tests
-   acceptance gate
-   status

------------------------------------------------------------------------

# 35.18 --- DECISIONS.md

Enregistrer les décisions techniques importantes.

Format :

``` text
Date
Decision
Context
Reason
Alternatives
Impact
```

------------------------------------------------------------------------

# 35.19 --- BLOCKERS.md

Enregistrer les éléments empêchant l'avancement.

Exemples :

``` text
OnlyFans API access unknown
MYM integration unknown
Billing configuration missing
Missing credentials
Legal validation required
```

------------------------------------------------------------------------

# 35.20 --- TECH_DEBT.md

Tout raccourci accepté doit être visible.

Ne pas cacher de dette technique dans le code.

------------------------------------------------------------------------

# 35.21 --- Specification Storage

Créer si nécessaire :

``` text
/docs/specification/
```

et y placer/conserver les 35 parties du cahier des charges.

Les documents source ne doivent pas être silencieusement réécrits par
Claude Code.

------------------------------------------------------------------------

# 35.22 --- Documentation Index

Créer :

``` text
/docs/specification/README.md
```

avec l'index de toutes les parties réellement présentes.

------------------------------------------------------------------------

# 35.23 --- Index Format

Exemple :

``` text
01 — [Actual title]
02 — [Actual title]
...
35 — Claude Code Master Startup Instructions, Document Index & First Execution Prompt
```

Claude Code doit utiliser les noms réels des fichiers.

------------------------------------------------------------------------

# 35.24 --- Do Not Invent Missing Parts

Si certains fichiers ne sont pas présents dans le repository :

les signaler.

Ne pas recréer leur contenu de mémoire ou l'inventer.

------------------------------------------------------------------------

# 35.25 --- Key Reference Parts

Parmi les documents finaux :

``` text
Part 28 — Database / data architecture reference
Part 29 — API Contracts / Service Layer / Event System
Part 30 — AI Evaluation / Benchmark
Part 31 — Observability / Incident Response
Part 32 — Testing / QA / Release Acceptance
Part 33 — Implementation Roadmap
Part 34 — Final V1 Scope / Master Handoff
Part 35 — Startup Instructions
```

Les parties 1--27 contiennent les décisions produit, UX, IA,
commerciales et techniques qui restent indispensables.

------------------------------------------------------------------------

# 35.26 --- First Technical Principle

Ne pas construire Full AI en premier.

Ordre général :

``` text
Foundation
↓
Manual Chatting
↓
Copilot
↓
Memory
↓
Fan Intelligence
↓
Scripts + Media
↓
Sales Decision Engine
↓
Benchmark
↓
Full AI
```

------------------------------------------------------------------------

# 35.27 --- Mock Connector First

Ne pas bloquer le développement sur OnlyFans ou MYM.

Créer/utiliser le Mock Connector pour prouver le système.

------------------------------------------------------------------------

# 35.28 --- Real Connector Rule

OnlyFans/MYM ne doivent être intégrés que via une méthode :

-   autorisée
-   stable
-   techniquement vérifiée

Aucune capacité plateforme ne doit être inventée.

------------------------------------------------------------------------

# 35.29 --- Capability Matrix

Pour chaque connecteur réel, documenter :

``` text
Authentication
Read Messages
Send Messages
Send Media
Paid Media
Transactions
Online Status
Webhooks
Rate Limits
```

------------------------------------------------------------------------

# 35.30 --- AI Architecture Rule

Les features ne doivent pas appeler directement un modèle spécifique.

Passer par :

``` text
AI Service
↓
Model Router
↓
Provider Adapter
```

------------------------------------------------------------------------

# 35.31 --- AI Model Aliases

Utiliser conceptuellement :

``` text
FAST_MODEL
BALANCED_MODEL
PREMIUM_MODEL
```

Les modèles réels sont configurables.

------------------------------------------------------------------------

# 35.32 --- Decision Architecture

Ne pas demander au LLM de faire tout dans une seule réponse opaque.

Séparer autant que nécessaire :

``` text
Understand
↓
Retrieve
↓
Decide
↓
Validate
↓
Execute
```

------------------------------------------------------------------------

# 35.33 --- Structured Outputs

Les décisions importantes doivent être structurées et validées par
schéma.

Ne pas parser des phrases libres pour déclencher des actions
financières.

------------------------------------------------------------------------

# 35.34 --- Pricing Hard Rule

Aucune IA ne peut contourner :

-   minimum price
-   negotiation permission
-   discount limit

------------------------------------------------------------------------

# 35.35 --- Full AI Hard Rule

Aucune action autonome importante sans :

``` text
Validator
Audit
Observability
Kill Switch
Human Takeover
```

------------------------------------------------------------------------

# 35.36 --- Memory Rule

Les memories sont scopées au fan/créatrice/agence appropriés.

Aucune contamination entre tenants.

------------------------------------------------------------------------

# 35.37 --- Historical Conversation Rule

Les conversations importées servent à comprendre.

Elles ne sont pas automatiquement des démonstrations de qualité.

Les settings actuels de l'agence ont priorité.

------------------------------------------------------------------------

# 35.38 --- Learning Rule

V1 n'utilise pas un système autonome qui réécrit ses propres règles de
production.

Amélioration :

``` text
Feedback
→ Benchmark
→ Controlled Change
→ Validation
→ Release
```

------------------------------------------------------------------------

# 35.39 --- Benchmark Gate

Claude Code doit rappeler au propriétaire de lancer le benchmark aux
étapes définies.

Ne pas considérer cela comme une documentation facultative.

------------------------------------------------------------------------

# 35.40 --- Benchmark Command

Si implémenté :

``` bash
npm run benchmark:ai
```

Sinon créer la commande dans le cadre de la Partie 30.

------------------------------------------------------------------------

# 35.41 --- AI Benchmark Output

Le rapport doit indiquer au minimum :

-   candidate version
-   current version
-   dataset version
-   quality
-   critical failures
-   cost
-   latency
-   release recommendation

------------------------------------------------------------------------

# 35.42 --- Billing Model

Business model retenu :

``` text
Subscription
+
2.5% commission
```

sur les ventes éligibles définies.

------------------------------------------------------------------------

# 35.43 --- Commission Rule

Ne pas calculer la commission uniquement dans le frontend.

La logique doit être backend/database fiable et auditable.

------------------------------------------------------------------------

# 35.44 --- Commission Snapshot

Le taux appliqué à une transaction doit être conservé.

Une modification future du pricing ne doit pas changer l'historique.

------------------------------------------------------------------------

# 35.45 --- Billing Transparency

Ne pas cacher la commission dans l'UX commerciale finale.

Le produit doit expliquer sa proposition de valeur économique.

------------------------------------------------------------------------

# 35.46 --- Analytics Rule

Les dashboards doivent utiliser des données réelles.

Aucun fake KPI.

------------------------------------------------------------------------

# 35.47 --- Landing Direction

Reconstruction complète.

Style :

``` text
PREMIUM
AI
FLOW
DYNAMIC
```

------------------------------------------------------------------------

# 35.48 --- Landing Interactions

Utiliser avec mesure :

-   hover
-   3D
-   animated UI
-   ticker
-   smooth transitions

Performance et conversion restent prioritaires.

------------------------------------------------------------------------

# 35.49 --- Application Direction

L'application connectée doit être :

-   premium
-   rapide
-   dense mais lisible
-   orientée opérations
-   cohérente avec la landing

------------------------------------------------------------------------

# 35.50 --- Scope Lock

Ne pas commencer les piliers futurs pendant la V1 Chatting.

------------------------------------------------------------------------

# 35.51 --- Explicitly Out of Scope

``` text
Marketing Suite
Social Media Management
Content Scraping
Video Editing
VA Monitoring
Recruitment Suite
Model Outreach
Marketplace
```

sauf décision produit ultérieure explicite.

------------------------------------------------------------------------

# 35.52 --- Future Compatibility

L'architecture peut prévoir l'extension future.

Mais :

# DO NOT BUILD FUTURE MODULES NOW.

------------------------------------------------------------------------

# 35.53 --- Testing Rule

Chaque feature critique doit inclure ses tests.

Ne pas repousser tous les tests à la fin.

------------------------------------------------------------------------

# 35.54 --- Security Rule

Permissions au backend/database.

Le frontend ne constitue pas une barrière de sécurité.

------------------------------------------------------------------------

# 35.55 --- Observability Rule

Toute action critique doit être traçable.

------------------------------------------------------------------------

# 35.56 --- Error Handling Rule

Ne pas masquer les erreurs externes.

Si une plateforme n'a pas envoyé un message :

l'UI ne doit pas afficher "Sent".

------------------------------------------------------------------------

# 35.57 --- Idempotency Rule

Protéger particulièrement :

-   messages
-   offers
-   transactions
-   commissions
-   billing webhooks

------------------------------------------------------------------------

# 35.58 --- Migration Rule

Toute migration importante :

``` text
Backup
↓
Staging
↓
Validation
↓
Production
```

------------------------------------------------------------------------

# 35.59 --- Feature Flags

Utiliser pour les fonctionnalités à risque :

-   Full AI
-   proactive AI
-   negotiation
-   new model version
-   real connector

------------------------------------------------------------------------

# 35.60 --- Claude Code Working Method

Pour chaque tâche :

``` text
1. Read relevant specification
2. Inspect existing code
3. State implementation approach
4. Implement
5. Test
6. Update docs
7. Report result
```

------------------------------------------------------------------------

# 35.61 --- Avoid Giant Rewrites

Même si le produit est reconstruit :

procéder par domaines cohérents.

Ne pas produire une modification de centaines de fichiers impossible à
vérifier si elle peut être découpée.

------------------------------------------------------------------------

# 35.62 --- No Silent Failure

Si une demande n'est pas possible :

Claude Code doit écrire clairement :

``` text
BLOCKED
```

et expliquer pourquoi.

------------------------------------------------------------------------

# 35.63 --- No Silent Substitution

Ne pas remplacer une feature demandée par une version plus simple sans
le signaler.

------------------------------------------------------------------------

# 35.64 --- Owner Action Format

Lorsqu'une action humaine est nécessaire :

``` text
OWNER ACTION REQUIRED

Action:
Reason:
Blocking:
Next step after completion:
```

------------------------------------------------------------------------

# 35.65 --- First Owner Gate

Après l'audit initial :

Claude Code doit présenter :

-   ce qu'il conserve
-   ce qu'il supprime
-   ce qu'il reconstruit
-   risques
-   ordre d'exécution

avant reconstruction majeure.

------------------------------------------------------------------------

# 35.66 --- Development Progress Reporting

À la fin de chaque session importante :

``` text
Completed
In Progress
Blocked
Tests
Files Changed
Next Recommended Step
```

------------------------------------------------------------------------

# 35.67 --- Milestone Reporting

Utiliser les milestones de la Partie 33.

Ne pas dire simplement :

``` text
OmniFlow is 70% complete.
```

sans base.

Préférer :

``` text
Milestone 3 complete.
Milestone 4 in progress.
```

------------------------------------------------------------------------

# 35.68 --- Definition of Done

Une feature critique est terminée lorsque applicable :

``` text
UI
Backend
Database
Permissions
Validation
Tests
Observability
Documentation
```

sont prêts.

------------------------------------------------------------------------

# 35.69 --- V1 Completion

Se référer à la Partie 34 pour la définition complète.

------------------------------------------------------------------------

# 35.70 --- First Execution Prompt

Le bloc suivant est destiné à être utilisé comme premier ordre donné à
Claude Code après avoir placé les documents dans le repository.

------------------------------------------------------------------------

# 35.71 --- MASTER STARTUP PROMPT

``` text
You are taking over the reconstruction of OmniFlow.

OmniFlow already has an existing codebase, but the product is being fundamentally redesigned.

The complete product specification is stored in the OmniFlow specification documents provided with this repository.

IMPORTANT:

Do not start rebuilding the application immediately.

Your first mission is to understand the specification and the current codebase, then create a concrete implementation plan.

STEP 1 — READ THE SPECIFICATION

Read all OmniFlow specification files in numerical order.

Treat them as one complete specification.

Pay particular attention to the final parts covering:

- database architecture
- API/service architecture
- AI evaluation
- observability
- testing
- implementation roadmap
- final V1 scope
- Claude Code startup instructions

Do not ignore the earlier product specification documents, because they contain the detailed product, AI, UX, sales, pricing, memory, script and dashboard requirements.

STEP 2 — AUDIT THE CURRENT PROJECT

Inspect the existing repository completely.

Analyze:

- framework
- folder structure
- routes
- components
- dependencies
- authentication
- Supabase
- database schema
- RLS
- storage
- APIs
- AI implementation
- integrations
- billing
- Vercel/deployment configuration
- environment variables
- tests
- security risks

Do not assume the existing product architecture should be preserved.

STEP 3 — CLASSIFY THE EXISTING SYSTEM

For each important system or module classify it as:

KEEP
REFACTOR
REMOVE
REBUILD
INVESTIGATE

Explain why.

STEP 4 — PROTECT EXISTING DATA

Before proposing destructive database or infrastructure changes:

- identify what data currently exists
- identify what must be backed up
- identify migration requirements
- identify rollback/recovery requirements

Do not delete production data.

STEP 5 — CREATE THE IMPLEMENTATION DOCUMENTS

Create:

/docs/implementation/CURRENT_STATE_AUDIT.md
/docs/implementation/MASTER_PLAN.md
/docs/implementation/DECISIONS.md
/docs/implementation/BLOCKERS.md
/docs/implementation/TECH_DEBT.md

CURRENT_STATE_AUDIT.md must document the current technical state and the KEEP/REFACTOR/REMOVE/REBUILD/INVESTIGATE decisions.

MASTER_PLAN.md must adapt the implementation roadmap from the specification to the actual repository.

Do not simply copy the roadmap. Convert it into concrete tasks based on the real codebase.

STEP 6 — VERIFY THE SPECIFICATION INDEX

Create or update:

/docs/specification/README.md

List every OmniFlow specification file actually available in the repository in numerical order.

If any part is missing, report it instead of inventing it.

STEP 7 — IDENTIFY BLOCKERS

Explicitly identify anything requiring owner action.

Examples:

- platform API access
- OnlyFans integration
- MYM integration
- missing credentials
- billing configuration
- legal/commercial validation

Use:

OWNER ACTION REQUIRED

when owner input is genuinely required.

STEP 8 — DO NOT BUILD FUTURE PILLARS

The current V1 is AI Chatting.

Do not begin:

- Marketing Suite
- Recruitment Suite
- Marketplace
- VA monitoring
- social media management
- video editing

The core product must prove value first.

STEP 9 — RESPECT THE IMPLEMENTATION ORDER

The high-level sequence is:

Foundation
→ Manual Chatting
→ Copilot
→ Memory
→ Fan Intelligence
→ Media + Scripts
→ Sales Decision Engine
→ AI Benchmark
→ Full AI
→ Follow-ups
→ Transactions + Commission + Billing
→ Analytics
→ Operations
→ Real Platform Connector
→ Pilot
→ Production

Use the detailed roadmap in the specification.

STEP 10 — STOP AFTER THE AUDIT AND PLAN

For this first task, do NOT proceed into the major reconstruction after creating the audit and implementation plan.

Present your findings to the owner.

Your final report must include:

1. Current architecture summary
2. What should be kept
3. What should be rebuilt
4. What should be removed
5. Database/migration risks
6. Security risks
7. External integration blockers
8. Proposed implementation sequence
9. First milestone
10. Owner actions required
11. Exact recommended next coding task

The objective of this first execution is not to write the most code.

The objective is to make sure OmniFlow is rebuilt correctly.
```

------------------------------------------------------------------------

# 35.72 --- After First Claude Code Response

Le propriétaire doit vérifier particulièrement :

-   Claude a-t-il réellement lu les documents ?
-   comprend-il que la V1 = Chatting ?
-   comprend-il que l'ancien frontend doit être reconstruit ?
-   a-t-il identifié les données à préserver ?
-   a-t-il identifié les risques ?
-   son plan respecte-t-il la Partie 33 ?
-   a-t-il évité de coder immédiatement ?

------------------------------------------------------------------------

# 35.73 --- Second Prompt Principle

Après validation de l'audit :

le prochain ordre doit concerner uniquement :

# MILESTONE 1 / FOUNDATION.

Ne pas lui demander :

``` text
Now build the entire SaaS.
```

------------------------------------------------------------------------

# 35.74 --- Claude Code Autonomy

Une fois le plan validé, Claude Code peut avancer de manière importante
techniquement.

Mais il doit respecter les gates.

------------------------------------------------------------------------

# 35.75 --- When Claude Must Stop

Claude Code doit demander validation avant :

-   destructive migration
-   major architecture deviation
-   product scope change
-   real billing activation
-   real platform integration activation
-   Full AI pilot
-   production launch

------------------------------------------------------------------------

# 35.76 --- When Claude Should Not Stop

Il n'a pas besoin de demander validation pour chaque :

-   component
-   helper
-   test
-   type
-   migration detail non destructive
-   refactor interne raisonnable

si cela respecte le plan validé.

------------------------------------------------------------------------

# 35.77 --- Product Owner Role

Le propriétaire garde la décision sur :

-   produit
-   pricing
-   business model
-   branding
-   commercial strategy
-   scope

Claude Code pilote l'exécution technique dans ce cadre.

------------------------------------------------------------------------

# 35.78 --- Technical Quality Standard

Ne pas optimiser pour :

# FASTEST POSSIBLE DEMO.

Optimiser pour :

# FASTEST RELIABLE PATH TO A REAL PILOT.

------------------------------------------------------------------------

# 35.79 --- Final Development Rule

Chaque nouvelle fonctionnalité doit répondre à l'une des questions :

-   améliore-t-elle la qualité du chatting ?
-   améliore-t-elle la conversion ?
-   améliore-t-elle la mémoire ?
-   améliore-t-elle le contrôle agence ?
-   améliore-t-elle la fiabilité ?
-   améliore-t-elle la mesure ?

Sinon, elle n'est probablement pas prioritaire.

------------------------------------------------------------------------

# 35.80 --- Final Documentation Status

Avec cette partie, le cahier des charges principal OmniFlow V1 est
considéré comme :

# COMPLETE.

Les prochaines documentations ne doivent plus être des extensions
automatiques du scope.

Elles doivent être créées uniquement si nécessaires pendant
l'implémentation.

------------------------------------------------------------------------

# 35.81 --- Documents futurs possibles

Exemples seulement si nécessaires :

``` text
CHANGE_REQUESTS.md
PLATFORM_ONLYFANS_INTEGRATION.md
PLATFORM_MYM_INTEGRATION.md
PILOT_REPORT.md
AI_BENCHMARK_RESULTS.md
RELEASE_NOTES.md
```

------------------------------------------------------------------------

# 35.82 --- Final Handoff

OmniFlow dispose maintenant :

-   d'une vision
-   d'un scope V1
-   d'une architecture
-   d'une architecture AI
-   d'une stratégie de mémoire
-   d'un moteur commercial
-   d'un système de scripts
-   d'une stratégie média
-   d'un modèle de pricing
-   d'un modèle de commission
-   d'un système de permissions
-   d'une base data
-   d'une architecture API
-   d'un benchmark
-   d'une stratégie d'observabilité
-   d'une stratégie QA
-   d'une roadmap
-   d'un handoff Claude Code
-   d'un premier prompt d'exécution

La prochaine étape n'est plus de brainstormer le produit.

La prochaine étape est :

# AUDIT THE CODEBASE AND START BUILDING.

------------------------------------------------------------------------

## PARTIE 35 --- VALIDÉE COMME CLAUDE CODE MASTER STARTUP INSTRUCTIONS, DOCUMENT INDEX & FIRST EXECUTION PROMPT

# FIN DU CAHIER DES CHARGES PRINCIPAL OMNIFLOW V1
