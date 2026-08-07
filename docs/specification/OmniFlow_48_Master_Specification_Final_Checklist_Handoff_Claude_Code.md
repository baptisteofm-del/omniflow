# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 48 --- MASTER SPECIFICATION, FINAL CHECKLIST & HANDOFF TO CLAUDE CODE

## 48.1 --- Objectif

Cette partie clôt le cahier des charges OmniFlow V1.

Les Parties 1 à 47 constituent ensemble la spécification du produit.

Cette Partie 48 sert de :

``` text
MASTER HANDOFF
FINAL CONTROL LAYER
IMPLEMENTATION ENTRY POINT
PROJECT COMPLETION CHECKLIST
```

Claude Code doit utiliser l'ensemble du cahier des charges comme source
de vérité produit, puis confronter ces exigences à l'état réel du
repository avant toute reconstruction.

------------------------------------------------------------------------

# SECTION A --- MASTER PRODUCT DEFINITION

## 48.2 --- Produit

Nom :

# OMNIFLOW

OmniFlow est un SaaS B2B destiné aux agences de créateurs.

La V1 est centrée sur :

# AI-POWERED CHATTING.

------------------------------------------------------------------------

## 48.3 --- Problème principal

Les agences doivent gérer à grande échelle :

-   conversations
-   relation fan
-   vente
-   scripts
-   médias
-   suivi commercial
-   équipe de chatting
-   performance

avec une qualité et une cohérence difficiles à maintenir manuellement.

------------------------------------------------------------------------

## 48.4 --- Proposition de valeur

OmniFlow doit permettre de centraliser et d'améliorer le chatting grâce
à une intelligence artificielle capable de comprendre :

``` text
WHO IS THE CREATOR?
WHO IS THE FAN?
WHAT HAS HAPPENED?
WHAT IS THE COMMERCIAL CONTEXT?
WHAT SHOULD HAPPEN NEXT?
```

------------------------------------------------------------------------

## 48.5 --- Deux modes fondamentaux

### Copilot

L'IA :

-   analyse
-   recommande
-   rédige

L'humain garde le contrôle de l'envoi.

### Full AI

L'IA peut :

-   répondre
-   attendre
-   proposer
-   suivre
-   escalader

dans les limites définies par l'agence.

------------------------------------------------------------------------

## 48.6 --- Positionnement

OmniFlow ne doit pas être présenté comme :

``` text
JUST AN AI CHATBOT
```

mais comme :

``` text
AN AI OPERATING LAYER FOR CREATOR AGENCY CHATTING.
```

------------------------------------------------------------------------

## 48.7 --- Vision long terme

À terme, OmniFlow peut devenir un operating system plus large pour
agences :

``` text
CHATTING
+
MARKETING
+
RECRUITMENT
+
ANALYTICS
+
OPERATIONS
```

Mais la V1 doit rester concentrée.

------------------------------------------------------------------------

# SECTION B --- LOCKED PRODUCT DECISIONS

## 48.8 --- Rebuild

Décision définitive :

# REBUILD EVERYTHING FROM A CLEAN BASE.

Cela inclut :

-   landing page
-   user area
-   dashboard
-   chatting UI
-   settings
-   architecture fonctionnelle

L'ancien projet peut fournir des références/infrastructures utiles, mais
ne dicte pas la nouvelle UX.

------------------------------------------------------------------------

## 48.9 --- Design

Direction :

``` text
PREMIUM
CLASSY
AI
DYNAMIC
FLOW
FUTURISTIC
CONTROLLED
```

------------------------------------------------------------------------

## 48.10 --- Landing

La landing doit être vivante et moderne.

Elle peut inclure :

-   hover interactions
-   motion
-   horizontal moving strip
-   depth
-   3D-inspired elements
-   interactive product demonstrations
-   smooth transitions

sans sacrifier performance ou lisibilité.

------------------------------------------------------------------------

## 48.11 --- Core V1

Le cœur V1 est :

# CHATTING.

Marketing et recrutement restent des extensions futures sauf éléments
explicitement nécessaires.

------------------------------------------------------------------------

## 48.12 --- Platforms

Cibles :

``` text
ONLYFANS
MYM
```

uniquement via méthodes techniques autorisées et validées.

------------------------------------------------------------------------

## 48.13 --- Business Model

Architecture commerciale :

``` text
SUBSCRIPTION
+
2.5% COMMISSION ON ELIGIBLE SALES
```

selon définition contractuelle/finale des ventes éligibles.

------------------------------------------------------------------------

## 48.14 --- AI Architecture

Décision :

# USE CLOUD AI MODELS ACCORDING TO THE TASK.

Ne pas dépendre d'un modèle unique.

------------------------------------------------------------------------

## 48.15 --- AI Personalization

La personnalisation repose principalement sur :

-   Creator DNA
-   fan memory
-   fan scoring
-   conversation context
-   scripts
-   commercial rules

------------------------------------------------------------------------

## 48.16 --- Script Logic

Les scripts doivent être structurés et capables de brancher :

``` text
PURCHASED
→ NEXT STEP

NOT PURCHASED
→ RECOVERY / FOLLOW-UP LOGIC
```

------------------------------------------------------------------------

## 48.17 --- Human Control

Full AI doit toujours disposer de :

-   permissions
-   limits
-   escalation
-   takeover
-   kill switch

------------------------------------------------------------------------

## 48.18 --- Benchmark

Le benchmark IA complet est un gate obligatoire avant pilote Full AI
réel.

------------------------------------------------------------------------

# SECTION C --- CORE SYSTEM MAP

## 48.19 --- Main Product Layers

``` text
LANDING / ACQUISITION
        ↓
AUTH / AGENCY
        ↓
CREATOR CONFIGURATION
        ↓
PLATFORM DATA
        ↓
FAN + CONVERSATION
        ↓
MEMORY + SCORING
        ↓
AI ORCHESTRATION
        ↓
COMMERCIAL DECISION ENGINE
        ↓
COPILOT / FULL AI
        ↓
SCRIPTS + MEDIA + OFFERS
        ↓
PURCHASE EVENTS
        ↓
ANALYTICS
        ↓
BILLING + COMMISSION
        ↓
LEARNING LOOP
```

------------------------------------------------------------------------

## 48.20 --- Agency Layer

Doit gérer :

-   agency
-   users
-   roles
-   permissions
-   creators
-   billing
-   integrations
-   settings

------------------------------------------------------------------------

## 48.21 --- Creator Layer

Doit gérer :

-   identity
-   tone
-   personality
-   vocabulary
-   boundaries
-   commercial style
-   pricing rules
-   scripts
-   media

------------------------------------------------------------------------

## 48.22 --- Fan Layer

Doit gérer :

-   identity/context
-   history
-   purchases
-   memory
-   scores
-   current state
-   script state

------------------------------------------------------------------------

## 48.23 --- AI Layer

Doit gérer :

-   task routing
-   context construction
-   structured reasoning/decision
-   generation
-   fallback
-   observability
-   cost

------------------------------------------------------------------------

## 48.24 --- Commercial Layer

Doit gérer :

-   intent
-   timing
-   offer
-   price
-   negotiation
-   script
-   follow-up
-   escalation

------------------------------------------------------------------------

## 48.25 --- Measurement Layer

Doit gérer :

-   revenue
-   conversion
-   AI attribution
-   scripts
-   creators
-   fans
-   AI quality
-   cost
-   billing

------------------------------------------------------------------------

# SECTION D --- DATA & SECURITY MASTER RULES

## 48.26 --- Multi-Tenant

Toutes les données doivent être isolées par agence.

------------------------------------------------------------------------

## 48.27 --- No Cross-Fan Memory

La mémoire d'un fan ne doit jamais contaminer un autre fan.

------------------------------------------------------------------------

## 48.28 --- No Cross-Creator Context

Une réponse ne doit jamais utiliser l'identité ou les médias de la
mauvaise créatrice.

------------------------------------------------------------------------

## 48.29 --- No Cross-Agency Context

Aucune donnée privée ne doit passer d'une agence à une autre.

------------------------------------------------------------------------

## 48.30 --- RBAC

Toutes les actions sensibles doivent respecter les permissions backend.

------------------------------------------------------------------------

## 48.31 --- Secrets

Aucun secret dans :

-   frontend
-   repository
-   prompts
-   public logs

------------------------------------------------------------------------

## 48.32 --- Audit

Les actions critiques doivent être auditables.

------------------------------------------------------------------------

## 48.33 --- Data Governance

Pour chaque donnée importante, OmniFlow doit pouvoir répondre :

``` text
WHY?
WHERE?
WHO?
HOW LONG?
```

------------------------------------------------------------------------

# SECTION E --- AI MASTER RULES

## 48.34 --- AI Is Not Authority

Le LLM ne doit pas être l'autorité finale pour les règles déterministes.

------------------------------------------------------------------------

## 48.35 --- Deterministic Guardrails

Le code doit contrôler lorsque possible :

-   min price
-   max discount
-   permission
-   script state
-   media eligibility
-   autonomous capability

------------------------------------------------------------------------

## 48.36 --- Context

L'IA doit recevoir uniquement le contexte utile.

------------------------------------------------------------------------

## 48.37 --- Memory

La mémoire doit être :

-   structured
-   scoped
-   correctable
-   deletable
-   auditable when necessary

------------------------------------------------------------------------

## 48.38 --- Scores

Les scores sont des aides décisionnelles.

Ils ne doivent pas être présentés comme certitudes psychologiques.

------------------------------------------------------------------------

## 48.39 --- AI Observability

Chaque appel important doit pouvoir être analysé selon :

-   task
-   model
-   version
-   latency
-   cost
-   result

------------------------------------------------------------------------

## 48.40 --- AI Versioning

Versionner :

-   prompts
-   models
-   routing
-   important configuration

------------------------------------------------------------------------

## 48.41 --- AI Failure

En cas d'incertitude critique :

# ESCALATE.

Ne pas inventer.

------------------------------------------------------------------------

# SECTION F --- BUSINESS MASTER RULES

## 48.42 --- Revenue Source

Les transactions sources doivent rester traçables.

------------------------------------------------------------------------

## 48.43 --- Commission

Commission actuelle :

# 2.5%.

Elle doit être calculée de manière déterministe et auditée.

------------------------------------------------------------------------

## 48.44 --- Commission Snapshot

Une transaction doit conserver le taux applicable si nécessaire pour
empêcher qu'un changement futur modifie l'historique.

------------------------------------------------------------------------

## 48.45 --- Commission Ledger

Les ajustements doivent être explicites.

Ne pas modifier silencieusement l'historique financier.

------------------------------------------------------------------------

## 48.46 --- Subscription

Le système doit supporter les plans d'abonnement définis
commercialement.

------------------------------------------------------------------------

## 48.47 --- Pricing Configuration

Les prix d'abonnement doivent rester configurables tant que la grille
finale n'est pas verrouillée.

------------------------------------------------------------------------

## 48.48 --- Financial Reconciliation

Les dashboards et commissions doivent être réconciliables avec les
transactions sources.

------------------------------------------------------------------------

# SECTION G --- PLATFORM MASTER RULES

## 48.49 --- Adapter Architecture

Les plateformes doivent passer par des adapters.

------------------------------------------------------------------------

## 48.50 --- Mock First

Le développement ne doit pas être bloqué par OnlyFans/MYM.

Utiliser le mock adapter jusqu'à accès réel validé.

------------------------------------------------------------------------

## 48.51 --- Authorized Access

Avant production :

# CONFIRM AUTHORIZED INTEGRATION METHOD.

------------------------------------------------------------------------

## 48.52 --- Platform Blocker

Si non disponible :

``` text
PLATFORM INTEGRATION BLOCKED — AUTHORIZED ACCESS REQUIRED
```

------------------------------------------------------------------------

## 48.53 --- No Shortcut

Ne pas contourner les protections ou règles de plateforme pour simuler
une intégration production-ready.

------------------------------------------------------------------------

# SECTION H --- UX MASTER RULES

## 48.54 --- Premium

Chaque écran doit donner une impression de :

-   control
-   clarity
-   intelligence
-   quality

------------------------------------------------------------------------

## 48.55 --- Flow

Le nom OmniFlow doit se ressentir dans l'expérience :

-   transitions fluides
-   information structurée
-   faible friction
-   continuité des workflows

------------------------------------------------------------------------

## 48.56 --- No Visual Noise

L'IA/futurisme ne doit pas devenir une surcharge graphique.

------------------------------------------------------------------------

## 48.57 --- Chat First

L'interface Chatting doit être extrêmement rapide à comprendre.

------------------------------------------------------------------------

## 48.58 --- AI Visibility

Toujours rendre clair :

-   human message
-   AI suggestion
-   Full AI action
-   system event

------------------------------------------------------------------------

## 48.59 --- Full AI Status

L'utilisateur doit toujours savoir si Full AI est actif.

------------------------------------------------------------------------

## 48.60 --- Critical Actions

Les actions risquées doivent avoir un état/feedback explicite.

------------------------------------------------------------------------

# SECTION I --- ANALYTICS MASTER RULES

## 48.61 --- One Metric Definition

Un KPI = une définition centrale.

------------------------------------------------------------------------

## 48.62 --- No Fake Data

Ne jamais afficher de métrique inventée pour remplir une interface.

------------------------------------------------------------------------

## 48.63 --- Unavailable

Si la donnée n'existe pas :

``` text
UNAVAILABLE
```

------------------------------------------------------------------------

## 48.64 --- AI Attribution

L'attribution IA doit être documentée et prudente.

------------------------------------------------------------------------

## 48.65 --- Causality

Ne pas présenter une corrélation comme cause certaine.

------------------------------------------------------------------------

## 48.66 --- Actionable Analytics

Le dashboard doit progressivement répondre :

``` text
WHAT CHANGED?
WHERE?
WHAT SHOULD I INVESTIGATE?
```

------------------------------------------------------------------------

# SECTION J --- LEARNING MASTER RULES

## 48.67 --- No Blind Learning

Les conversations réelles ne doivent pas être automatiquement
transformées en vérité d'entraînement.

------------------------------------------------------------------------

## 48.68 --- Feedback

Collecter :

-   accept
-   edit
-   regenerate
-   takeover
-   feedback
-   outcome

------------------------------------------------------------------------

## 48.69 --- Review

Les cas importants doivent pouvoir être revus.

------------------------------------------------------------------------

## 48.70 --- Benchmark Admission

Un cas devient benchmark après validation appropriée.

------------------------------------------------------------------------

## 48.71 --- Improvement

Ordre préféré :

``` text
DATA
CONFIG
CONTEXT
RULES
PROMPT
MODEL
FINE-TUNING
```

------------------------------------------------------------------------

## 48.72 --- Reversible Improvement

Toute modification IA importante doit être rollbackable.

------------------------------------------------------------------------

# SECTION K --- IMPLEMENTATION MASTER ORDER

## 48.73 --- Build Sequence

Ordre par défaut :

``` text
AUDIT EXISTING REPO
↓
BACKUP / CHECKPOINT
↓
REQUIREMENTS MATRIX
↓
FOUNDATIONS
↓
DESIGN SYSTEM
↓
LANDING
↓
APP SHELL
↓
CREATOR DNA
↓
COMMERCIAL CONFIG
↓
CONVERSATION DOMAIN
↓
MOCK ADAPTER
↓
MEMORY
↓
SCORING
↓
AI GATEWAY
↓
COPILOT
↓
SCRIPTS
↓
BRANCHING
↓
MEDIA
↓
OFFERS
↓
FULL AI
↓
ANALYTICS
↓
BILLING
↓
COMMISSION
↓
REAL PLATFORM ADAPTERS
↓
SUPPORT / ADMIN
↓
FULL BENCHMARK
↓
RELEASE READINESS
↓
PILOT
↓
PRODUCTION
↓
OPTIMIZATION
```

------------------------------------------------------------------------

## 48.74 --- Do Not Reorder Without Reason

Claude Code peut adapter l'ordre pour dépendances techniques réelles,
mais doit documenter toute modification importante.

------------------------------------------------------------------------

# SECTION L --- CLAUDE CODE MASTER HANDOFF

## 48.75 --- How to Read This Specification

Claude Code doit considérer :

``` text
PARTS 1–48 = ONE SPECIFICATION
```

et non 48 projets indépendants.

------------------------------------------------------------------------

## 48.76 --- No File Overwrite

Les fichiers du cahier des charges fournis par le propriétaire sont des
documents de référence.

Claude Code ne doit pas les écraser.

------------------------------------------------------------------------

## 48.77 --- Project Documentation

Les documents générés par Claude Code doivent aller dans :

``` text
/docs/
```

selon les chemins définis dans les différentes parties.

------------------------------------------------------------------------

## 48.78 --- First Claude Code Command

Instruction recommandée au démarrage :

``` text
Read the complete OmniFlow V1 specification before making destructive changes.

Treat Parts 1–48 as one product specification.

First audit the existing repository and create:
- CURRENT_STATE_AUDIT.md
- REBUILD_PLAN.md
- REQUIREMENTS_MATRIX.md
- DECISION_LOG.md
- OPEN_QUESTIONS.md
- BUILD_PROGRESS.md

Do not rebuild or delete anything until the audit and rebuild plan are complete.

The product must be rebuilt from a clean base, while preserving useful infrastructure where appropriate.

Do not reinterpret locked product decisions unless the specification contains a real unresolved conflict.
```

------------------------------------------------------------------------

## 48.79 --- Second Claude Code Instruction

Après audit :

``` text
Execute the implementation roadmap phase by phase.

Before each phase:
1. read the relevant specification sections;
2. inspect current code;
3. plan;
4. identify migrations;
5. identify tests.

After each phase:
1. run tests;
2. run build;
3. update documentation;
4. update requirements matrix;
5. update build progress;
6. list blockers;
7. stop for owner checkpoint when required.
```

------------------------------------------------------------------------

## 48.80 --- Claude Code Must Not

Claude Code ne doit pas :

-   inventer une API OnlyFans/MYM
-   contourner une plateforme
-   supprimer sans checkpoint
-   modifier une décision business verrouillée sans raison
-   présenter mock comme production
-   déclarer tests réussis sans les exécuter
-   déclarer benchmark réussi sans rapport
-   activer Full AI sans contrôles
-   stocker secrets dans le code
-   ignorer tenant isolation

------------------------------------------------------------------------

## 48.81 --- Claude Code Must

Claude Code doit :

-   inspecter
-   planifier
-   construire progressivement
-   tester
-   documenter
-   signaler les blockers
-   conserver la traçabilité
-   demander uniquement les décisions réellement nécessaires

------------------------------------------------------------------------

# SECTION M --- OWNER CHECKPOINTS

## 48.82 --- Checkpoint A

Après audit :

# VALIDATE WHAT IS KEPT / REPLACED.

------------------------------------------------------------------------

## 48.83 --- Checkpoint B

Après landing + app shell :

# VALIDATE DESIGN.

------------------------------------------------------------------------

## 48.84 --- Checkpoint C

Après Creator DNA :

# VALIDATE PERSONALIZATION.

------------------------------------------------------------------------

## 48.85 --- Checkpoint D

Après Copilot :

# TEST AI ASSISTANCE.

------------------------------------------------------------------------

## 48.86 --- Checkpoint E

Après commercial engine :

# TEST SALES FLOWS.

------------------------------------------------------------------------

## 48.87 --- Checkpoint F

Après Full AI core :

# VALIDATE AUTONOMY CONTROLS.

------------------------------------------------------------------------

## 48.88 --- Checkpoint G

À Milestone I :

# RUN FULL AI BENCHMARK.

------------------------------------------------------------------------

## 48.89 --- Checkpoint H

Avant pilote :

# RELEASE READINESS.

------------------------------------------------------------------------

## 48.90 --- Checkpoint I

Après pilote :

# GO / NO-GO PRODUCTION.

------------------------------------------------------------------------

# SECTION N --- FINAL PRE-BENCHMARK CHECKLIST

## 48.91 --- Core

``` text
[ ] Creator DNA works
[ ] Fan memory works
[ ] Fan scoring works
[ ] Conversation context works
[ ] AI routing works
[ ] Copilot works
[ ] Scripts work
[ ] Purchased branch works
[ ] Not-purchased branch works
[ ] Media selection works
[ ] Pricing rules work
[ ] Negotiation limits work
[ ] Full AI decision engine works
[ ] Escalation works
[ ] Human takeover works
[ ] Kill switch works
```

------------------------------------------------------------------------

## 48.92 --- Benchmark Trigger

Lorsque cette checklist est validée :

# STOP BUILDING NEW CORE FEATURES.

Puis :

# RUN THE FIRST FULL AI BENCHMARK.

------------------------------------------------------------------------

# SECTION O --- FINAL PRE-PILOT CHECKLIST

## 48.93 --- Technical

``` text
[ ] Build passes
[ ] Tests pass
[ ] Staging works
[ ] Tenant isolation tested
[ ] RBAC tested
[ ] Audit works
[ ] Monitoring works
[ ] Alerts work
[ ] Rollback exists
```

------------------------------------------------------------------------

## 48.94 --- AI

``` text
[ ] Benchmark completed
[ ] Critical failures reviewed
[ ] Copilot quality acceptable
[ ] Full AI quality acceptable for intended pilot scope
[ ] Costs measured
[ ] Latency measured
```

------------------------------------------------------------------------

## 48.95 --- Business

``` text
[ ] Subscription works
[ ] 2.5% commission works
[ ] Commission ledger works
[ ] Reconciliation works
[ ] Pricing disclosure correct
```

------------------------------------------------------------------------

## 48.96 --- Platform

``` text
[ ] Authorized platform method confirmed
[ ] Adapter tested
[ ] Send tested
[ ] Purchase tracking tested
[ ] Failure behavior tested
```

If not:

pilot scope must remain mock/test or otherwise limited to capabilities
legitimately available.

------------------------------------------------------------------------

## 48.97 --- Legal / Privacy

``` text
[ ] Privacy review
[ ] Terms review
[ ] Platform review
[ ] AI provider review
[ ] Data retention
[ ] Data deletion
[ ] Internal access
[ ] Incident process
```

------------------------------------------------------------------------

## 48.98 --- Operations

``` text
[ ] Support ready
[ ] Admin ready
[ ] Full AI kill switch accessible
[ ] Incident owner known
[ ] Pilot monitoring dashboard ready
```

------------------------------------------------------------------------

# SECTION P --- FINAL PRE-PRODUCTION CHECKLIST

## 48.99 --- Pilot Evidence

``` text
[ ] Real pilot completed
[ ] Major bugs fixed
[ ] AI regressions addressed
[ ] Costs understood
[ ] Support load understood
[ ] Billing verified
[ ] Platform reliability understood
```

------------------------------------------------------------------------

## 48.100 --- Production Decision

Document :

``` text
GO
NO-GO
GO WITH KNOWN RISKS
```

------------------------------------------------------------------------

## 48.101 --- Known Risks

Aucun risque majeur accepté ne doit rester uniquement dans une
conversation.

L'écrire.

------------------------------------------------------------------------

# SECTION Q --- V1 SUCCESS DEFINITION

## 48.102 --- Product Success

OmniFlow V1 réussit si une agence peut :

``` text
CREATE ACCOUNT
↓
CREATE / CONFIGURE CREATOR
↓
CONNECT OR USE SUPPORTED PLATFORM FLOW
↓
SEE FAN CONVERSATIONS
↓
USE COPILOT
↓
USE STRUCTURED SCRIPTS
↓
SELL WITH CONTROLLED PRICING
↓
TRACK PURCHASES
↓
ENABLE FULL AI WHEN APPROPRIATE
↓
TAKE OVER WHEN NEEDED
↓
MEASURE RESULTS
↓
UNDERSTAND BILLING
```

------------------------------------------------------------------------

## 48.103 --- AI Success

L'IA doit être :

-   contextual
-   creator-consistent
-   commercially intelligent
-   controlled
-   measurable
-   improvable

------------------------------------------------------------------------

## 48.104 --- UX Success

Le produit doit paraître :

``` text
PREMIUM
FAST
CLEAR
MODERN
AI-NATIVE
```

------------------------------------------------------------------------

## 48.105 --- Business Success

Le modèle doit être compréhensible :

``` text
SUBSCRIPTION
+
2.5% COMMISSION
```

et économiquement mesurable.

------------------------------------------------------------------------

## 48.106 --- Technical Success

Le système doit être :

-   multi-tenant
-   secure
-   observable
-   testable
-   reversible
-   scalable enough for pilot and controlled growth

------------------------------------------------------------------------

# SECTION R --- WHAT IS NOT REQUIRED FOR V1

## 48.107 --- Avoid Scope Explosion

Ne pas bloquer le lancement V1 pour construire :

-   complete marketing suite
-   complete recruitment suite
-   marketplace
-   massive affiliate ecosystem
-   complex forecasting
-   advanced cross-agency benchmarks
-   unnecessary mobile app
-   every possible platform
-   fine-tuned proprietary model

------------------------------------------------------------------------

## 48.108 --- Future Modules

Ces éléments doivent rester compatibles avec l'architecture, pas
obligatoirement construits.

------------------------------------------------------------------------

# SECTION S --- FINAL DOCUMENT CONTROL

## 48.109 --- Source Files

Les 48 parties originales doivent être conservées.

------------------------------------------------------------------------

## 48.110 --- No Silent Modification

Si une décision change pendant développement :

ajouter la décision au Decision Log.

------------------------------------------------------------------------

## 48.111 --- Superseded Requirement

Marquer :

``` text
SUPERSEDED
```

avec référence à la nouvelle décision.

Ne pas supprimer l'historique silencieusement.

------------------------------------------------------------------------

## 48.112 --- Build Progress

Toujours maintenir :

``` text
Current Phase
Current Milestone
Completed
Blocked
Next
```

------------------------------------------------------------------------

## 48.113 --- Benchmark Reminder

Jusqu'à son exécution :

``` text
MANDATORY UPCOMING GATE:
FULL AI BENCHMARK BEFORE PILOT.
```

------------------------------------------------------------------------

## 48.114 --- External Integration Reminder

Jusqu'à résolution :

``` text
EXTERNAL DEPENDENCY:
AUTHORIZED ONLYFANS / MYM INTEGRATION PATH.
```

------------------------------------------------------------------------

# SECTION T --- FINAL HANDOFF PROMPT

## 48.115 --- Prompt to Give Claude Code

Le propriétaire peut transmettre les 48 parties avec cette instruction :

``` text
You are taking over the implementation of OmniFlow V1.

The 48 OmniFlow specification files form one complete product specification. Read them before making major architectural or destructive changes.

Do not overwrite the specification files.

OmniFlow must be rebuilt from a clean base:
- rebuild the landing page;
- rebuild the authenticated user application;
- rebuild the Chatting experience;
- preserve only useful infrastructure/assets after auditing them.

The V1 product is centered on AI-powered Chatting for creator agencies.

Locked product principles include:
- Copilot and Full AI;
- Creator DNA;
- fan memory and scoring;
- structured commercial scripts;
- purchase / non-purchase branching;
- media and offer management;
- controlled pricing and negotiation;
- human takeover and Full AI kill switch;
- task-based cloud AI model routing;
- analytics and AI attribution;
- subscription plus 2.5% commission on eligible sales;
- OnlyFans and MYM as target platforms, only through authorized integration methods;
- premium, dynamic, AI-native OmniFlow design.

Start with an audit of the existing repository.

Before deleting or replacing anything, create a git checkpoint and document what should be kept.

Then create and maintain:
- /docs/implementation/CURRENT_STATE_AUDIT.md
- /docs/implementation/REBUILD_PLAN.md
- /docs/implementation/REQUIREMENTS_MATRIX.md
- /docs/implementation/DECISION_LOG.md
- /docs/implementation/OPEN_QUESTIONS.md
- /docs/implementation/TECH_DEBT.md
- /docs/implementation/BUILD_PROGRESS.md

Follow the implementation order defined in Part 47.

Use a mock platform adapter when real authorized platform access is unavailable. Never invent or bypass a platform integration.

Do not present mocks as production functionality.

Before every phase:
1. read the relevant requirements;
2. inspect current code;
3. write the implementation plan;
4. identify migrations;
5. identify tests.

After every phase:
1. run tests;
2. run the build;
3. verify errors;
4. update documentation;
5. update the requirements matrix;
6. update build progress;
7. list blockers;
8. stop at owner checkpoints when required.

Do not re-brainstorm locked decisions unless the specification contains a genuine unresolved conflict.

When the AI core reaches Milestone I, STOP feature expansion and explicitly tell me:

"CORE OMNIFLOW IS INTEGRATED. IT IS NOW TIME TO RUN THE FIRST COMPLETE AI BENCHMARK BEFORE REAL PILOT TRAFFIC."

Run and document the benchmark before any real Full AI pilot.

Before pilot, explicitly tell me:

"RELEASE CANDIDATE READY — COMPLETE THE RELEASE READINESS CHECK BEFORE PILOT."

Do not call OmniFlow production-ready until the pilot, security, legal/privacy, billing, platform, benchmark and release-readiness gates have been completed for the intended production scope.

When blocked by an external dependency, document the blocker and continue with independent work rather than inventing a workaround.

Build OmniFlow phase by phase, with small, testable and reversible changes.
```

------------------------------------------------------------------------

# SECTION U --- FINAL ACCEPTANCE CRITERIA FOR THE ENTIRE SPECIFICATION

## 48.116 --- Product

``` text
[ ] V1 scope is clear
[ ] Chatting is core
[ ] Copilot defined
[ ] Full AI defined
[ ] Creator DNA defined
[ ] Memory defined
[ ] Fan scoring defined
[ ] Scripts defined
[ ] Branching defined
[ ] Media defined
[ ] Commercial engine defined
[ ] Analytics defined
[ ] Billing defined
```

------------------------------------------------------------------------

## 48.117 --- Technical

``` text
[ ] Architecture defined
[ ] Multi-tenancy defined
[ ] RBAC defined
[ ] AI routing defined
[ ] Platform adapters defined
[ ] Observability defined
[ ] Testing defined
[ ] Release strategy defined
```

------------------------------------------------------------------------

## 48.118 --- Business

``` text
[ ] Subscription model defined
[ ] 2.5% commission defined
[ ] Commission ledger defined
[ ] Growth architecture defined
[ ] Retention/churn handling defined
```

------------------------------------------------------------------------

## 48.119 --- Safety & Control

``` text
[ ] Human takeover
[ ] Kill switch
[ ] Audit
[ ] Pricing guardrails
[ ] Platform compliance gate
[ ] Privacy governance
[ ] Benchmark gate
[ ] Pilot gate
[ ] Rollback
```

------------------------------------------------------------------------

## 48.120 --- Implementation

``` text
[ ] Rebuild decision explicit
[ ] Existing repo audit required
[ ] Git checkpoint required
[ ] Build order explicit
[ ] Claude Code protocol explicit
[ ] Owner checkpoints explicit
[ ] Final handoff prompt included
```

------------------------------------------------------------------------

# SECTION V --- FINAL PROJECT PRINCIPLES

## 48.121 --- Principle 1

# BUILD THE CORE BEFORE THE ECOSYSTEM.

------------------------------------------------------------------------

## 48.122 --- Principle 2

# AI MUST UNDERSTAND BEFORE IT ACTS.

------------------------------------------------------------------------

## 48.123 --- Principle 3

# AUTOMATION WITHOUT CONTROL IS NOT A FEATURE.

------------------------------------------------------------------------

## 48.124 --- Principle 4

# SALES INTELLIGENCE MUST BE MEASURABLE.

------------------------------------------------------------------------

## 48.125 --- Principle 5

# PREMIUM DESIGN MUST IMPROVE CLARITY, NOT HIDE IT.

------------------------------------------------------------------------

## 48.126 --- Principle 6

# REAL DATA MUST IMPROVE THE SYSTEM WITHOUT BLINDLY TRAINING IT.

------------------------------------------------------------------------

## 48.127 --- Principle 7

# PLATFORM DEPENDENCIES MUST NEVER FORCE UNSAFE SHORTCUTS.

------------------------------------------------------------------------

## 48.128 --- Principle 8

# EVERY IMPORTANT CHANGE MUST BE TESTABLE AND REVERSIBLE.

------------------------------------------------------------------------

## 48.129 --- Principle 9

# BENCHMARK BEFORE AUTONOMY AT SCALE.

------------------------------------------------------------------------

## 48.130 --- Principle 10

# PROVE VALUE BEFORE EXPANDING SCOPE.

------------------------------------------------------------------------

# SECTION W --- FINAL STATUS

## 48.131 --- Specification Status

``` text
OMNIFLOW V1 PRODUCT SPECIFICATION
STATUS: COMPLETE
PARTS: 48 / 48
```

------------------------------------------------------------------------

## 48.132 --- Next Operational Step

Le cahier des charges est terminé.

La prochaine étape n'est plus de définir OmniFlow.

La prochaine étape est :

``` text
1. GIVE CLAUDE CODE THE COMPLETE SPECIFICATION
2. AUDIT THE EXISTING REPOSITORY
3. CREATE THE REBUILD PLAN
4. VALIDATE WHAT IS PRESERVED
5. BEGIN PHASE 1
```

------------------------------------------------------------------------

# OMNIFLOW V1 --- CAHIER DES CHARGES TERMINÉ

# 48 / 48 PARTIES COMPLETED

# NEXT STEP: IMPLEMENTATION.
