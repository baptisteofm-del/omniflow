# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 47 --- IMPLEMENTATION ROADMAP, BUILD ORDER & CLAUDE CODE EXECUTION PLAN

## 47.1 --- Objectif

Cette partie transforme les 46 parties précédentes en ordre d'exécution
concret.

Claude Code ne doit pas tenter de construire OmniFlow comme une seule
tâche géante.

Il doit avancer par phases :

``` text
AUDIT
↓
RESET
↓
FOUNDATIONS
↓
CORE PRODUCT
↓
AI ENGINE
↓
COMMERCIAL ENGINE
↓
PLATFORM INTEGRATIONS
↓
ANALYTICS
↓
BILLING
↓
QA
↓
BENCHMARK
↓
PILOT
↓
PRODUCTION
```

------------------------------------------------------------------------

## 47.2 --- Instruction fondamentale

Le projet OmniFlow existant ne doit pas être considéré comme la base
fonctionnelle à conserver.

Décision produit :

# REBUILD FROM A CLEAN BASE.

Cela concerne :

-   landing page
-   authentication flow si nécessaire
-   authenticated user application
-   dashboard
-   chatting
-   AI architecture
-   settings
-   billing UX
-   internal architecture

------------------------------------------------------------------------

## 47.3 --- Existing Repository

Le repository existant peut être utilisé comme :

``` text
TECHNICAL REFERENCE
ASSET SOURCE
INFRASTRUCTURE REFERENCE
```

mais pas comme justification pour conserver une architecture ou
interface obsolète.

------------------------------------------------------------------------

## 47.4 --- Preserve Before Reset

Avant suppression/remplacement :

Claude Code doit identifier et sauvegarder ce qui doit éventuellement
être conservé :

-   environment configuration
-   Supabase project references
-   Vercel configuration
-   domain configuration
-   useful database migrations
-   reusable infrastructure
-   logo/assets validés
-   secrets references
-   integration work already useful

------------------------------------------------------------------------

## 47.5 --- No Blind Deletion

Ne pas supprimer le projet existant avant :

``` text
AUDIT
+
BACKUP / GIT CHECKPOINT
+
PRESERVATION PLAN
```

------------------------------------------------------------------------

## 47.6 --- Git Safety

Créer un checkpoint clair avant rebuild.

Exemple conceptuel :

``` text
pre-omniflow-v1-rebuild
```

------------------------------------------------------------------------

## 47.7 --- Claude Code First Task

Avant de coder :

# AUDIT THE CURRENT REPOSITORY.

Produire :

``` text
/docs/implementation/CURRENT_STATE_AUDIT.md
```

------------------------------------------------------------------------

## 47.8 --- Current State Audit

Inclure :

-   framework
-   routes
-   components
-   database
-   auth
-   integrations
-   environment variables
-   deployment
-   reusable code
-   obsolete code
-   risks

------------------------------------------------------------------------

## 47.9 --- Second Task

Créer :

``` text
/docs/implementation/REBUILD_PLAN.md
```

avec mapping :

``` text
Existing
→
Keep
→
Refactor
→
Replace
→
Delete later
```

------------------------------------------------------------------------

## 47.10 --- No Coding Before Plan

Claude Code ne doit pas commencer une refonte massive avant d'avoir
écrit le plan de rebuild.

------------------------------------------------------------------------

# PHASE 0 --- PROJECT CONTROL

## 47.11 --- Documentation Index

Créer un index reliant les 48 parties du cahier des charges.

------------------------------------------------------------------------

## 47.12 --- Requirements Matrix

Créer :

``` text
/docs/implementation/REQUIREMENTS_MATRIX.md
```

Colonnes :

``` text
Requirement
Source Part
Priority
Status
Implementation
Test
Notes
```

------------------------------------------------------------------------

## 47.13 --- Priority Levels

Utiliser :

``` text
P0 — mandatory for safe core
P1 — required for strong V1
P2 — after core
P3 — future
```

------------------------------------------------------------------------

## 47.14 --- Decision Log

Créer :

``` text
/docs/implementation/DECISION_LOG.md
```

pour éviter que Claude Code redécide plus tard des choix déjà validés.

------------------------------------------------------------------------

## 47.15 --- Locked Product Decisions

Inclure notamment :

``` text
Product = OmniFlow
Core V1 = AI Chatting
Modes = Copilot + Full AI
Platforms target = OnlyFans + MYM
Pricing = subscription + 2.5% commission on eligible sales
Design = premium + AI + dynamic + flow
Rebuild = clean base
```

Les montants d'abonnement définitifs restent configurables si non
définitivement verrouillés.

------------------------------------------------------------------------

# PHASE 1 --- TECHNICAL FOUNDATIONS

## 47.16 --- Architecture

Mettre en place l'architecture définie dans les parties techniques
précédentes.

------------------------------------------------------------------------

## 47.17 --- Environments

Séparer :

``` text
LOCAL
STAGING
PRODUCTION
```

------------------------------------------------------------------------

## 47.18 --- Configuration

Créer validation centralisée des variables d'environnement.

------------------------------------------------------------------------

## 47.19 --- Database

Mettre en place le schéma fondamental :

-   agencies
-   users
-   creators
-   memberships
-   roles
-   settings
-   audit foundations

------------------------------------------------------------------------

## 47.20 --- Authentication

Implémenter auth et session management.

------------------------------------------------------------------------

## 47.21 --- Tenant Isolation

Avant les features métier :

tester l'isolation agence.

------------------------------------------------------------------------

## 47.22 --- RBAC

Implémenter permissions agence.

------------------------------------------------------------------------

## 47.23 --- Audit Foundations

Les événements sensibles doivent pouvoir être audités dès le début.

------------------------------------------------------------------------

## 47.24 --- Observability Foundations

Installer :

-   structured logs
-   request IDs
-   error monitoring
-   basic health checks

------------------------------------------------------------------------

## 47.25 --- Queue / Background Jobs

Si requis par architecture :

mettre en place la fondation avant les automatisations complexes.

------------------------------------------------------------------------

## 47.26 --- Feature Flags

Prévoir tôt les flags pour les features risquées.

------------------------------------------------------------------------

## 47.27 --- Phase 1 Exit

Ne pas continuer si :

-   tenant isolation non testée
-   auth instable
-   environnement non séparé

------------------------------------------------------------------------

# PHASE 2 --- DESIGN SYSTEM + LANDING PAGE

## 47.28 --- Design System

Construire les primitives :

-   typography
-   spacing
-   cards
-   buttons
-   inputs
-   modal
-   table
-   badges
-   navigation
-   motion

------------------------------------------------------------------------

## 47.29 --- Visual Direction

Direction verrouillée :

``` text
PREMIUM
FUTURISTIC
AI
FLOW
CONTROL
```

------------------------------------------------------------------------

## 47.30 --- Logo

Utiliser le logo OmniFlow validé séparément.

Prévoir :

-   wordmark
-   symbol
-   dark/light-compatible variants si nécessaires

------------------------------------------------------------------------

## 47.31 --- Landing Rebuild

Recréer entièrement la landing.

------------------------------------------------------------------------

## 47.32 --- Landing Sections

Selon cahier des charges :

-   hero
-   product value
-   Copilot
-   Full AI
-   workflow
-   analytics
-   savings/value
-   pricing
-   FAQ
-   CTA
-   footer/legal

------------------------------------------------------------------------

## 47.33 --- Dynamic Landing

Inclure de manière performante :

-   hover interactions
-   animated elements
-   horizontal moving strip/ticker where useful
-   depth/3D-inspired elements
-   AI motion
-   smooth transitions

------------------------------------------------------------------------

## 47.34 --- Motion Guardrail

Le dynamisme doit renforcer le premium.

Ne pas transformer le site en démonstration d'effets.

------------------------------------------------------------------------

## 47.35 --- Landing Performance

Mesurer :

-   loading
-   responsiveness
-   motion performance

------------------------------------------------------------------------

## 47.36 --- Landing Analytics

Instrumenter les événements d'acquisition définis Partie 43.

------------------------------------------------------------------------

## 47.37 --- Phase 2 Exit

Landing :

-   visually coherent
-   responsive
-   fast
-   conversion-ready
-   pricing-ready

------------------------------------------------------------------------

# PHASE 3 --- AUTHENTICATED APPLICATION SHELL

## 47.38 --- App Shell

Créer la nouvelle interface connectée depuis zéro.

------------------------------------------------------------------------

## 47.39 --- Core Navigation

Prévoir les modules nécessaires au Chatting V1.

------------------------------------------------------------------------

## 47.40 --- Agency Context

L'utilisateur doit toujours opérer dans un contexte agence correct.

------------------------------------------------------------------------

## 47.41 --- Creator Context

Les vues doivent pouvoir filtrer/changer de créatrice.

------------------------------------------------------------------------

## 47.42 --- Settings Foundation

Créer :

-   agency settings
-   team
-   permissions
-   creator settings
-   billing entry
-   integrations entry

------------------------------------------------------------------------

## 47.43 --- Empty States

Chaque module non configuré doit expliquer la prochaine action.

------------------------------------------------------------------------

## 47.44 --- Phase 3 Exit

L'app shell doit être navigable avant de brancher toute l'intelligence
IA.

------------------------------------------------------------------------

# PHASE 4 --- CREATOR DNA + COMMERCIAL CONFIGURATION

## 47.45 --- Creator Creation

Créer onboarding créatrice.

------------------------------------------------------------------------

## 47.46 --- Creator DNA

Implémenter :

-   identity
-   personality
-   tone
-   vocabulary
-   boundaries
-   selling style
-   relationship style

------------------------------------------------------------------------

## 47.47 --- Commercial Rules

Implémenter :

-   pricing boundaries
-   negotiation allowed
-   discount max
-   custom content allowed
-   live session if applicable
-   minimum prices
-   escalation rules

------------------------------------------------------------------------

## 47.48 --- Versioning

Les changements importants de configuration doivent être versionnables
ou auditables.

------------------------------------------------------------------------

## 47.49 --- Validation

Empêcher les configurations contradictoires lorsque possible.

------------------------------------------------------------------------

## 47.50 --- Phase 4 Exit

Claude Code doit pouvoir créer une créatrice complète sans plateforme
externe.

------------------------------------------------------------------------

# PHASE 5 --- CONVERSATION DOMAIN + MOCK PLATFORM

## 47.51 --- Conversation Model

Construire :

-   fans
-   conversations
-   messages
-   states
-   purchases
-   offers

------------------------------------------------------------------------

## 47.52 --- Mock Platform Adapter

Avant OnlyFans/MYM réels :

créer un connecteur mock.

------------------------------------------------------------------------

## 47.53 --- Why Mock First

Il permet de développer :

``` text
CHAT UI
AI
SCRIPTS
PURCHASE EVENTS
ANALYTICS
```

sans être bloqué par l'accès API.

------------------------------------------------------------------------

## 47.54 --- Inbox

Construire inbox conversationnelle.

------------------------------------------------------------------------

## 47.55 --- Message Timeline

Afficher :

-   fan
-   creator/human
-   AI
-   system events
-   purchases

clairement.

------------------------------------------------------------------------

## 47.56 --- Manual Send

Le chat humain doit fonctionner avant Full AI.

------------------------------------------------------------------------

## 47.57 --- Phase 5 Exit

Un scénario complet doit fonctionner sur mock :

``` text
Fan sends
↓
Human sees
↓
Human replies
↓
Purchase event can be simulated
```

------------------------------------------------------------------------

# PHASE 6 --- FAN MEMORY + SCORING

## 47.58 --- Memory

Implémenter la mémoire structurée.

------------------------------------------------------------------------

## 47.59 --- Summary

Créer résumés utiles des historiques longs.

------------------------------------------------------------------------

## 47.60 --- Fan Scores

Implémenter les scores définis :

-   purchase intent
-   spending potential
-   relationship
-   churn risk

------------------------------------------------------------------------

## 47.61 --- Explainability

Afficher pourquoi un score est élevé lorsque possible.

------------------------------------------------------------------------

## 47.62 --- No False Precision

Éviter une précision artificielle si le modèle n'est pas calibré.

------------------------------------------------------------------------

## 47.63 --- Phase 6 Exit

Le système doit récupérer correctement mémoire + scores pour une
conversation mock.

------------------------------------------------------------------------

# PHASE 7 --- AI ORCHESTRATION + CLOUD MODEL ROUTING

## 47.64 --- AI Gateway

Créer une couche unique d'accès aux modèles.

------------------------------------------------------------------------

## 47.65 --- Task-Based Routing

Stratégie validée :

# USE DIFFERENT CLOUD MODELS ACCORDING TO THE TASK.

------------------------------------------------------------------------

## 47.66 --- Example Routing

Architecture compatible avec :

``` text
Fast classification → efficient model
Memory extraction → efficient/reliable model
Complex sales reasoning → stronger model
Response generation → quality-optimized model
Fallback → alternate provider/model
```

Les modèles exacts doivent rester configurables et benchmarkés.

------------------------------------------------------------------------

## 47.67 --- No Model Hard Dependency

Le domaine métier ne doit pas dépendre directement d'un seul provider.

------------------------------------------------------------------------

## 47.68 --- AI Context Builder

Assembler :

-   Creator DNA
-   fan memory
-   scores
-   conversation
-   script state
-   commercial rules

------------------------------------------------------------------------

## 47.69 --- Structured Decision

Avant texte final :

produire une décision structurée lorsque nécessaire.

------------------------------------------------------------------------

## 47.70 --- AI Observability

Tracer :

-   task
-   model
-   latency
-   cost
-   version
-   outcome

------------------------------------------------------------------------

## 47.71 --- Phase 7 Exit

L'IA doit pouvoir analyser une conversation mock et générer une réponse
contextualisée.

------------------------------------------------------------------------

# PHASE 8 --- COPILOT

## 47.72 --- Copilot First

Construire Copilot avant Full AI.

------------------------------------------------------------------------

## 47.73 --- Copilot Workflow

``` text
Fan message
↓
Context
↓
AI analysis
↓
Suggested response
↓
Human review
↓
Edit / regenerate / send
```

------------------------------------------------------------------------

## 47.74 --- Feedback Instrumentation

Mesurer :

-   accept
-   edit
-   regenerate
-   reject

------------------------------------------------------------------------

## 47.75 --- Phase 8 Exit

Copilot doit être utilisable quotidiennement sur environnement mock.

------------------------------------------------------------------------

# PHASE 9 --- SCRIPT ENGINE + BRANCHING

## 47.76 --- Script Builder

Implémenter scripts agence.

------------------------------------------------------------------------

## 47.77 --- Steps

Chaque script peut contenir plusieurs étapes.

------------------------------------------------------------------------

## 47.78 --- Branching

Règle indispensable :

``` text
IF PURCHASED
→ NEXT STEP

IF NOT PURCHASED
→ RECOVERY BRANCH
```

------------------------------------------------------------------------

## 47.79 --- Recovery Strategy

L'agence choisit la stratégie autorisée.

Le système ne doit pas imposer une seule approche.

------------------------------------------------------------------------

## 47.80 --- Recovery Configuration

Options possibles selon configuration :

-   softer follow-up
-   objection handling
-   wait
-   alternative offer
-   agency-defined persuasion style

Toute stratégie doit respecter les règles applicables et la
configuration agence.

------------------------------------------------------------------------

## 47.81 --- Script State Machine

Ne pas gérer les étapes uniquement via texte libre.

Créer un état structuré.

------------------------------------------------------------------------

## 47.82 --- Script Analytics Events

Instrumenter chaque étape dès sa construction.

------------------------------------------------------------------------

## 47.83 --- Phase 9 Exit

Un fan mock doit pouvoir :

``` text
enter script
→ buy or not buy
→ follow correct branch
→ generate analytics event
```

------------------------------------------------------------------------

# PHASE 10 --- MEDIA + OFFER ENGINE

## 47.84 --- Media Library

Construire :

-   upload
-   metadata
-   creator association
-   access
-   search/filter

------------------------------------------------------------------------

## 47.85 --- Offer

Créer l'entité offre.

------------------------------------------------------------------------

## 47.86 --- Media Selection

L'IA peut sélectionner uniquement parmi les médias autorisés et
compatibles avec le contexte.

------------------------------------------------------------------------

## 47.87 --- Pricing Guardrails

Le prix doit respecter les limites agence.

------------------------------------------------------------------------

## 47.88 --- Negotiation

Si activée :

respecter max discount.

------------------------------------------------------------------------

## 47.89 --- Phase 10 Exit

Le mock doit simuler :

``` text
AI chooses offer
↓
Correct media
↓
Correct price
↓
Purchase/no purchase
```

------------------------------------------------------------------------

# PHASE 11 --- FULL AI

## 47.90 --- Full AI Dependency

Ne pas construire Full AI comme simple auto-send autour du Copilot.

Il doit utiliser le moteur de décision complet.

------------------------------------------------------------------------

## 47.91 --- Full AI Actions

``` text
REPLY
WAIT
OFFER
FOLLOW_UP
ESCALATE
```

selon règles.

------------------------------------------------------------------------

## 47.92 --- Confidence / Escalation

Les situations ambiguës ou interdites doivent escalader.

------------------------------------------------------------------------

## 47.93 --- Kill Switch

Implémenter avant activation pilote.

------------------------------------------------------------------------

## 47.94 --- Takeover

Le chatter humain peut reprendre immédiatement.

------------------------------------------------------------------------

## 47.95 --- Phase 11 Exit

Full AI doit passer les scénarios critiques sur mock.

------------------------------------------------------------------------

# PHASE 12 --- ANALYTICS CORE

## 47.96 --- Event Pipeline

Brancher les événements :

-   message
-   suggestion
-   offer
-   purchase
-   script
-   AI action
-   takeover

------------------------------------------------------------------------

## 47.97 --- Dashboard V1

Construire les KPI P0/P1 Partie 44.

------------------------------------------------------------------------

## 47.98 --- Script Diagnosis

Afficher :

-   step conversion
-   branch drop-off
-   revenue

------------------------------------------------------------------------

## 47.99 --- AI Diagnosis

Afficher :

-   acceptance
-   edit
-   regenerate
-   Full AI takeover

------------------------------------------------------------------------

## 47.100 --- Phase 12 Exit

Les données du scénario mock doivent correspondre exactement au
dashboard.

------------------------------------------------------------------------

# PHASE 13 --- BILLING + COMMISSION

## 47.101 --- Subscription

Brancher fournisseur de paiement choisi.

------------------------------------------------------------------------

## 47.102 --- Pricing Config

Les offres doivent être configurables.

------------------------------------------------------------------------

## 47.103 --- Commission

Règle actuelle :

# 2.5% ON ELIGIBLE SALES.

------------------------------------------------------------------------

## 47.104 --- Commission Ledger

Créer un ledger fiable.

------------------------------------------------------------------------

## 47.105 --- Commission Disclosure

Afficher clairement la commission dans le parcours pricing/contractuel.

------------------------------------------------------------------------

## 47.106 --- Commission Value Positioning

Le marketing peut expliquer l'économie potentielle face à un chatter
traditionnel payé autour de 10% ou davantage lorsque cette comparaison
est justifiée.

------------------------------------------------------------------------

## 47.107 --- Reconciliation

Chaque commission doit pouvoir être reliée à la vente source.

------------------------------------------------------------------------

## 47.108 --- Phase 13 Exit

Les golden tests financiers doivent passer.

------------------------------------------------------------------------

# PHASE 14 --- REAL PLATFORM INTEGRATIONS

## 47.109 --- Target

Objectif produit :

``` text
ONLYFANS
+
MYM
```

------------------------------------------------------------------------

## 47.110 --- Important Dependency

Avant implémentation production :

# CONFIRM AUTHORIZED TECHNICAL ACCESS.

------------------------------------------------------------------------

## 47.111 --- Claude Code Blocker

Si API/MCP/connecteur autorisé non disponible :

Claude Code doit écrire clairement :

``` text
PLATFORM INTEGRATION BLOCKED — AUTHORIZED ACCESS REQUIRED
```

et continuer le reste du produit avec mock adapter.

------------------------------------------------------------------------

## 47.112 --- No Illegal Shortcut

Ne pas contourner les restrictions de plateforme pour terminer
artificiellement l'intégration.

------------------------------------------------------------------------

## 47.113 --- Adapter Contract

OnlyFans et MYM doivent implémenter le même contrat métier autant que
possible.

------------------------------------------------------------------------

## 47.114 --- Capability Differences

Si une plateforme ne supporte pas une capability :

la déclarer explicitement.

------------------------------------------------------------------------

## 47.115 --- Progressive Integration

Ordre par plateforme :

``` text
Authentication
↓
Read conversations
↓
Receive updates
↓
Send message
↓
Media/offer
↓
Purchase events
↓
Reconciliation
```

------------------------------------------------------------------------

## 47.116 --- Phase 14 Exit

Chaque connecteur doit passer son integration test avant pilote.

------------------------------------------------------------------------

# PHASE 15 --- SUPPORT + ADMIN + OPERATIONS

## 47.117 --- Support

Implémenter le minimum Partie 40.

------------------------------------------------------------------------

## 47.118 --- Admin

Implémenter le minimum Partie 41.

------------------------------------------------------------------------

## 47.119 --- Operations

Activer :

-   alerts
-   incidents
-   logs
-   kill switches
-   feature flags

------------------------------------------------------------------------

## 47.120 --- Phase 15 Exit

L'équipe OmniFlow doit pouvoir diagnostiquer un problème pilote sans
accéder directement à la base pour chaque incident.

------------------------------------------------------------------------

# PHASE 16 --- BENCHMARK GATE

## 47.121 --- Claude Code Mandatory Reminder

À ce moment précis, Claude Code doit arrêter l'expansion fonctionnelle
et afficher au propriétaire du projet :

# CORE OMNIFLOW IS INTEGRATED. IT IS NOW TIME TO RUN THE FIRST COMPLETE AI BENCHMARK BEFORE REAL PILOT TRAFFIC.

------------------------------------------------------------------------

## 47.122 --- Benchmark Requirements

Le benchmark doit couvrir :

-   Creator DNA
-   memory
-   scoring
-   sales reasoning
-   scripts
-   branching
-   pricing
-   negotiation
-   media selection
-   Copilot
-   Full AI
-   escalation

------------------------------------------------------------------------

## 47.123 --- Benchmark Output

Produire :

``` text
/docs/benchmarks/FIRST_FULL_BENCHMARK_REPORT.md
```

------------------------------------------------------------------------

## 47.124 --- Benchmark Decision

Résultat :

``` text
PASS
PASS WITH FIXES
FAIL
```

------------------------------------------------------------------------

## 47.125 --- Fail Behavior

Si FAIL :

ne pas lancer le pilote Full AI.

------------------------------------------------------------------------

# PHASE 17 --- SECURITY, PRIVACY & RELEASE READINESS

## 47.126 --- Execute Part 45

Passer la checklist complète.

------------------------------------------------------------------------

## 47.127 --- Legal Review Gate

Résoudre les blockers identifiés Partie 42.

------------------------------------------------------------------------

## 47.128 --- Security Review

Vérifier :

-   auth
-   RBAC
-   tenant isolation
-   storage
-   secrets
-   admin
-   webhooks

------------------------------------------------------------------------

## 47.129 --- Financial Review

Vérifier :

-   subscription
-   commission
-   refund
-   reconciliation

------------------------------------------------------------------------

## 47.130 --- Release Candidate

Créer RC.

------------------------------------------------------------------------

## 47.131 --- Claude Code Reminder

Afficher :

# RELEASE CANDIDATE READY --- COMPLETE THE RELEASE READINESS CHECK BEFORE PILOT.

------------------------------------------------------------------------

# PHASE 18 --- PILOT

## 47.132 --- Limited Agencies

Commencer avec petit nombre d'agences.

------------------------------------------------------------------------

## 47.133 --- Recommended Initial Mode

Démarrer prioritairement avec Copilot pour observer la qualité.

Full AI peut être activé progressivement lorsque les gates sont
satisfaits.

------------------------------------------------------------------------

## 47.134 --- Pilot Instrumentation

Collecter :

-   acceptance
-   edits
-   regenerations
-   takeovers
-   sales
-   script conversion
-   AI cost
-   latency
-   errors

------------------------------------------------------------------------

## 47.135 --- Pilot Review

Revue fréquente des conversations problématiques selon gouvernance
autorisée.

------------------------------------------------------------------------

## 47.136 --- Feedback

Créer un canal simple de feedback agence.

------------------------------------------------------------------------

## 47.137 --- Pilot Exit

Ne pas ouvrir largement avant critères Partie 45.

------------------------------------------------------------------------

# PHASE 19 --- PRODUCTION ROLLOUT

## 47.138 --- Progressive Rollout

Utiliser feature flags.

------------------------------------------------------------------------

## 47.139 --- Full AI Rollout

Full AI reste contrôlé séparément.

------------------------------------------------------------------------

## 47.140 --- Launch Monitoring

Surveillance renforcée.

------------------------------------------------------------------------

## 47.141 --- Rollback

Tout changement critique doit rester réversible.

------------------------------------------------------------------------

# PHASE 20 --- CONTINUOUS IMPROVEMENT

## 47.142 --- Execute Part 46

Après lancement :

mettre en place la boucle d'amélioration continue.

------------------------------------------------------------------------

## 47.143 --- Weekly Review

Au début :

-   AI quality
-   scripts
-   sales
-   errors
-   costs
-   feedback

------------------------------------------------------------------------

## 47.144 --- Growth

N'activer les mécaniques avancées Partie 43 qu'après preuve de valeur et
rétention.

------------------------------------------------------------------------

# BUILD ORDER SUMMARY

## 47.145 --- Exact Order

Claude Code doit utiliser cet ordre par défaut :

``` text
0. Audit existing repository
1. Protect existing useful infrastructure
2. Requirements matrix + decision log
3. Technical foundations
4. Design system
5. Landing page rebuild
6. Authenticated app shell
7. Creator DNA
8. Commercial configuration
9. Conversation domain
10. Mock platform adapter
11. Fan memory
12. Fan scoring
13. AI gateway + model routing
14. Copilot
15. Script engine
16. Branching
17. Media library
18. Offer/pricing engine
19. Full AI
20. Analytics
21. Billing
22. 2.5% commission ledger
23. Real platform adapters
24. Support
25. Admin/operations
26. Full AI benchmark
27. Security/privacy/release QA
28. Pilot
29. Production rollout
30. Continuous optimization
```

------------------------------------------------------------------------

## 47.146 --- Why This Order

Il réduit trois risques :

``` text
BUILDING AI WITHOUT DATA STRUCTURE
BUILDING PLATFORM DEPENDENCY TOO EARLY
LAUNCHING FULL AI WITHOUT EVALUATION
```

------------------------------------------------------------------------

## 47.147 --- Vertical Slices

À l'intérieur de chaque phase :

préférer une feature utilisable de bout en bout à dix composants à
moitié terminés.

------------------------------------------------------------------------

## 47.148 --- Small Commits

Claude Code doit produire des changements compréhensibles et
réversibles.

------------------------------------------------------------------------

## 47.149 --- One Phase at a Time

Ne pas lancer simultanément plusieurs refontes majeures sans nécessité.

------------------------------------------------------------------------

## 47.150 --- Phase Report

Après chaque phase :

mettre à jour :

``` text
REQUIREMENTS_MATRIX.md
```

et produire un résumé :

``` text
Completed
Tests
Remaining
Blockers
Next Phase
```

------------------------------------------------------------------------

## 47.151 --- Stop on Blocker

Si une dépendance externe bloque une feature :

ne pas inventer une intégration.

Documenter le blocker et avancer sur les éléments indépendants.

------------------------------------------------------------------------

## 47.152 --- Claude Code Questions

Claude Code ne doit poser une question au propriétaire que lorsque la
décision :

-   ne peut pas être déduite du cahier des charges
-   change réellement le produit
-   comporte un choix commercial/juridique important

------------------------------------------------------------------------

## 47.153 --- Do Not Re-Brainstorm Locked Decisions

Ne pas redemander :

-   si OmniFlow doit être rebuild
-   si V1 est centrée Chatting
-   si Copilot + Full AI existent
-   si 2.5% commission est prévu
-   si design doit être premium/AI/dynamic

------------------------------------------------------------------------

## 47.154 --- Unknowns Register

Créer :

``` text
/docs/implementation/OPEN_QUESTIONS.md
```

------------------------------------------------------------------------

## 47.155 --- Open Question Format

``` text
Question
Why it matters
Blocking?
Recommended option
Owner
Status
```

------------------------------------------------------------------------

## 47.156 --- Critical External Unknowns

Inclure initialement :

``` text
OnlyFans authorized integration path
MYM authorized integration path
Final subscription prices
Production legal review
AI provider policy compatibility
```

------------------------------------------------------------------------

## 47.157 --- Technical Debt Register

Créer :

``` text
/docs/implementation/TECH_DEBT.md
```

------------------------------------------------------------------------

## 47.158 --- No Hidden TODO

Les raccourcis temporaires doivent être documentés.

------------------------------------------------------------------------

## 47.159 --- MVP Discipline

Une feature P2/P3 ne doit pas retarder un P0/P1 critique.

------------------------------------------------------------------------

## 47.160 --- MVP Definition

Le MVP n'est pas :

``` text
Every OmniFlow idea
```

Il est :

``` text
A reliable AI Chatting product that agencies can configure, trust, measure and pay for.
```

------------------------------------------------------------------------

# CLAUDE CODE EXECUTION PROTOCOL

## 47.161 --- Before Each Phase

Claude Code doit :

1.  lire les exigences concernées ;
2.  inspecter le code actuel ;
3.  écrire le plan ;
4.  identifier les migrations ;
5.  identifier les tests ;
6.  seulement ensuite coder.

------------------------------------------------------------------------

## 47.162 --- After Each Phase

Claude Code doit :

1.  exécuter tests ;
2.  exécuter build ;
3.  vérifier erreurs ;
4.  mettre à jour docs ;
5.  mettre à jour requirements matrix ;
6.  indiquer les blockers ;
7.  proposer la prochaine phase.

------------------------------------------------------------------------

## 47.163 --- No Fake Completion

Ne jamais déclarer une phase terminée si :

-   build échoue
-   tests critiques échouent
-   TODO bloquant
-   intégration mock présentée comme réelle

------------------------------------------------------------------------

## 47.164 --- Mock Labeling

Tout comportement simulé doit être clairement identifié comme :

``` text
MOCK
DEMO
TEST
```

------------------------------------------------------------------------

## 47.165 --- Production Labeling

Ne jamais appeler une intégration "production-ready" avant validation
réelle.

------------------------------------------------------------------------

## 47.166 --- Documentation as Source of Truth

Les décisions du cahier des charges et du Decision Log priment sur les
anciennes implémentations.

------------------------------------------------------------------------

## 47.167 --- Conflict Handling

Si deux parties semblent contradictoires :

Claude Code doit :

1.  identifier le conflit ;
2.  chercher la décision la plus récente/explicite ;
3.  documenter son interprétation ;
4.  demander seulement si le conflit reste réellement bloquant.

------------------------------------------------------------------------

## 47.168 --- Security Priority

Une instruction fonctionnelle ne doit pas contourner :

-   tenant isolation
-   authorization
-   platform compliance
-   secrets safety

------------------------------------------------------------------------

## 47.169 --- Data Migration

Si les anciennes données OmniFlow ne sont pas utiles à V1 :

ne pas complexifier inutilement la nouvelle architecture pour les
conserver.

Valider avant suppression définitive.

------------------------------------------------------------------------

## 47.170 --- Existing Landing

L'ancienne landing peut servir uniquement de référence historique.

La nouvelle landing doit suivre le nouveau positionnement.

------------------------------------------------------------------------

## 47.171 --- Existing User Area

L'ancienne zone connectée doit être remplacée selon la nouvelle
architecture.

------------------------------------------------------------------------

## 47.172 --- No Partial Old/New UX

Éviter un produit final mélangeant des écrans legacy incohérents avec le
nouveau design.

------------------------------------------------------------------------

# DEVELOPMENT MILESTONES

## 47.173 --- Milestone A

``` text
FOUNDATION READY
```

Inclut :

-   auth
-   tenant
-   RBAC
-   app shell
-   design system

------------------------------------------------------------------------

## 47.174 --- Milestone B

``` text
CHAT CORE READY
```

Inclut :

-   creator
-   fan
-   conversation
-   mock platform
-   manual chat

------------------------------------------------------------------------

## 47.175 --- Milestone C

``` text
COPILOT READY
```

Inclut :

-   memory
-   scoring
-   AI routing
-   suggestions
-   feedback

------------------------------------------------------------------------

## 47.176 --- Milestone D

``` text
COMMERCIAL ENGINE READY
```

Inclut :

-   scripts
-   branches
-   media
-   offers
-   pricing
-   negotiation

------------------------------------------------------------------------

## 47.177 --- Milestone E

``` text
FULL AI CORE READY
```

Inclut :

-   autonomous decisions
-   escalation
-   takeover
-   kill switch

------------------------------------------------------------------------

## 47.178 --- Milestone F

``` text
MEASUREMENT READY
```

Inclut :

-   analytics
-   AI metrics
-   script metrics
-   attribution
-   cost

------------------------------------------------------------------------

## 47.179 --- Milestone G

``` text
BUSINESS MODEL READY
```

Inclut :

-   subscription
-   commission
-   ledger
-   reconciliation

------------------------------------------------------------------------

## 47.180 --- Milestone H

``` text
PLATFORM READY
```

Seulement lorsque connecteurs autorisés réels sont validés.

------------------------------------------------------------------------

## 47.181 --- Milestone I

``` text
BENCHMARK READY
```

À ce milestone :

# STOP FEATURE EXPANSION AND RUN THE FULL BENCHMARK.

------------------------------------------------------------------------

## 47.182 --- Milestone J

``` text
PILOT READY
```

Après QA + legal/security gates.

------------------------------------------------------------------------

## 47.183 --- Milestone K

``` text
PRODUCTION READY
```

Après pilote concluant.

------------------------------------------------------------------------

# PROJECT OWNER CHECKPOINTS

## 47.184 --- Checkpoint 1

Après audit/rebuild plan :

présenter au propriétaire ce qui sera conservé/supprimé.

------------------------------------------------------------------------

## 47.185 --- Checkpoint 2

Après nouvelle landing + app shell :

validation visuelle.

------------------------------------------------------------------------

## 47.186 --- Checkpoint 3

Après Creator DNA + commercial settings :

validation logique agence.

------------------------------------------------------------------------

## 47.187 --- Checkpoint 4

Après Copilot :

test manuel réel/simulé par le propriétaire.

------------------------------------------------------------------------

## 47.188 --- Checkpoint 5

Après scripts + offers :

validation du flow commercial.

------------------------------------------------------------------------

## 47.189 --- Checkpoint 6

Après Full AI :

validation des contrôles avant benchmark.

------------------------------------------------------------------------

## 47.190 --- Checkpoint 7

Benchmark complet.

------------------------------------------------------------------------

## 47.191 --- Checkpoint 8

Pilot readiness.

------------------------------------------------------------------------

## 47.192 --- Checkpoint 9

Go/No-Go production.

------------------------------------------------------------------------

# REQUIRED IMPLEMENTATION DOCUMENTS

## 47.193 --- Files

Claude Code doit créer et maintenir :

``` text
/docs/implementation/CURRENT_STATE_AUDIT.md
/docs/implementation/REBUILD_PLAN.md
/docs/implementation/REQUIREMENTS_MATRIX.md
/docs/implementation/DECISION_LOG.md
/docs/implementation/OPEN_QUESTIONS.md
/docs/implementation/TECH_DEBT.md
/docs/implementation/BUILD_PROGRESS.md
```

------------------------------------------------------------------------

## 47.194 --- BUILD_PROGRESS.md

Structure :

``` text
Current Phase
Current Milestone
Completed
In Progress
Blocked
Tests
Next
Owner Checkpoint
```

------------------------------------------------------------------------

## 47.195 --- Persistent Reminder

BUILD_PROGRESS.md doit inclure jusqu'à exécution :

``` text
UPCOMING MANDATORY GATE:
Run full AI benchmark at Milestone I before pilot.
```

------------------------------------------------------------------------

## 47.196 --- Platform Reminder

Tant que non résolu :

``` text
EXTERNAL BLOCKER:
Confirm authorized OnlyFans and MYM integration methods.
```

------------------------------------------------------------------------

## 47.197 --- Legal Reminder

Tant que non validé :

``` text
PRE-PRODUCTION BLOCKER:
Complete legal/privacy/provider/platform review.
```

------------------------------------------------------------------------

## 47.198 --- Final Acceptance Criteria

Cette partie est correctement appliquée lorsque :

-   Claude Code commence par auditer le repository
-   aucune suppression aveugle n'a lieu
-   landing et app sont réellement reconstruites
-   les décisions validées ne sont pas re-brainstormées
-   le build suit des phases ordonnées
-   mock platform débloque le développement
-   Copilot précède Full AI
-   scripts et branches sont structurés
-   le modèle 2.5% est intégré au ledger
-   OnlyFans/MYM restent bloqués tant que l'accès autorisé n'est pas
    confirmé
-   le benchmark est un gate obligatoire
-   le pilote précède la production générale
-   chaque phase met à jour la documentation
-   les blockers sont visibles
-   le propriétaire dispose de checkpoints clairs
-   le système reste réversible

------------------------------------------------------------------------

## 47.199 --- Final Principle

Claude Code ne doit pas essayer de construire OmniFlow vite en faisant
tout à la fois.

Il doit construire :

# THE RIGHT FOUNDATION.

# THEN THE CHAT.

# THEN THE INTELLIGENCE.

# THEN THE SALES ENGINE.

# THEN THE AUTONOMY.

# THEN THE MEASUREMENT.

# THEN THE REAL-WORLD INTEGRATIONS.

# THEN THE BENCHMARK.

# THEN THE PILOT.

# THEN THE SCALE.

------------------------------------------------------------------------

## PARTIE 47 --- VALIDÉE COMME IMPLEMENTATION ROADMAP, BUILD ORDER & CLAUDE CODE EXECUTION PLAN

La dernière partie du cahier des charges est :

# PARTIE 48 --- MASTER SPECIFICATION, FINAL CHECKLIST & HANDOFF TO CLAUDE CODE
