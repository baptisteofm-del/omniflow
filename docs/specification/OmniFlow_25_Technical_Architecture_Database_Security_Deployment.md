# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 25 --- TECHNICAL ARCHITECTURE, DATABASE, SECURITY & DEPLOYMENT

## 25.1 --- Objectif

Cette partie définit l'architecture technique cible de la V1 OmniFlow.

Claude Code doit d'abord auditer le repository existant avant toute
reconstruction afin d'identifier ce qui peut réellement être conservé.

Principe :

# REBUILD THE PRODUCT.

# KEEP ONLY HEALTHY INFRASTRUCTURE.

Ne pas supprimer aveuglément une infrastructure fonctionnelle.

Ne pas conserver non plus du code legacy uniquement parce qu'il existe
déjà.

## 25.2 --- Audit technique obligatoire avant développement

Avant de modifier le produit :

1.  inspecter le repository complet
2.  identifier la stack actuelle
3.  identifier les routes
4.  identifier les composants
5.  identifier l'authentification
6.  identifier la base de données
7.  identifier les migrations
8.  identifier les intégrations
9.  identifier les variables d'environnement
10. identifier les jobs / cron
11. identifier le déploiement Vercel
12. identifier les dépendances inutilisées
13. identifier la dette technique
14. identifier les éléments réutilisables

Créer un rapport interne court avant reconstruction.

## 25.3 --- Ne pas casser la production sans plan

Avant changement majeur :

-   créer une branche dédiée
-   sauvegarder l'état actuel
-   vérifier les migrations
-   vérifier les données existantes
-   prévoir rollback
-   tester avant merge

La reconstruction ne doit pas signifier destruction incontrôlée.

## 25.4 --- Architecture générale

Architecture logique recommandée :

``` text
Frontend
   ↓
Application/API Layer
   ↓
Domain Services
   ↓
AI Orchestration Layer
   ↓
Platform Connectors
   ↓
Database / Queue / Storage
```

Séparer clairement les responsabilités.

## 25.5 --- Frontend

Le frontend gère :

-   landing
-   authentication UX
-   dashboard
-   inbox
-   fans
-   scripts
-   media
-   analytics
-   settings
-   billing
-   team

Le frontend ne doit jamais contenir les secrets providers ou les règles
de sécurité critiques.

## 25.6 --- Backend

Le backend est responsable de :

-   authentication enforcement
-   tenant isolation
-   permissions
-   platform sync
-   AI orchestration
-   messaging actions
-   commission ledger
-   billing
-   jobs
-   analytics aggregation
-   audit
-   secure media access

## 25.7 --- Domain Services

Créer des services métier explicites.

Exemples :

``` text
ConversationService
FanIntelligenceService
MemoryService
DecisionService
ScriptEngine
MediaService
PricingService
NegotiationService
FollowUpService
CommissionService
AnalyticsService
IntegrationService
```

Éviter de mettre toute la logique dans les API routes.

## 25.8 --- AI Orchestration Layer

Créer une couche dédiée permettant de router les tâches vers différents
modèles.

Exemple :

``` text
AI Router
├── Fast Model
├── Reasoning Model
├── Premium Model
└── Future Providers
```

L'application ne doit pas dépendre directement d'un unique modèle
partout.

## 25.9 --- Model Routing

Le routeur décide selon :

-   task type
-   complexity
-   risk
-   latency
-   cost
-   conversation state

Exemple :

``` text
classification → fast model
simple reply → fast model
complex negotiation → stronger model
high-value decision → premium/reasoning model
```

Les règles exactes doivent être configurables.

## 25.10 --- Provider Abstraction

Créer une interface interne commune.

Exemple conceptuel :

``` text
generateText()
generateStructuredOutput()
classify()
```

Cela permet de changer de modèle/provider sans réécrire toute
l'application.

## 25.11 --- Structured Outputs

Pour les décisions importantes :

ne pas demander uniquement du texte libre.

Utiliser des sorties structurées validées.

Exemple :

``` json
{
  "intent": "PURCHASE_INTEREST",
  "strategy": "CONTINUE_SCRIPT",
  "confidence": 0.91,
  "next_action": "SEND_STEP_2"
}
```

Valider côté serveur.

## 25.12 --- AI Action Boundary

Le LLM recommande ou produit une décision structurée.

Le backend détermine si l'action est réellement autorisée.

Exemple :

``` text
AI wants price = €35
↓
Pricing Rule minimum = €40
↓
Action rejected or corrected
```

# BUSINESS RULES OVERRIDE MODEL OUTPUT.

## 25.13 --- Database

Utiliser PostgreSQL/Supabase si cohérent avec l'infrastructure existante
après audit.

La base doit être structurée pour :

-   multi-tenant
-   conversations
-   events
-   AI state
-   analytics
-   billing
-   audit

## 25.14 --- Tables principales conceptuelles

Prévoir notamment :

``` text
users
agencies
agency_memberships
roles
permissions
role_permissions

creators
creator_memberships
creator_settings

platform_connections
platform_accounts

fans
fan_profiles
fan_scores
fan_memories

conversations
conversation_participants
messages

ai_decisions
ai_actions
ai_feedback

scripts
script_versions
script_nodes
script_edges
script_runs

media_assets
media_tags
media_offers

transactions
commission_ledger

follow_ups

subscriptions
billing_events

analytics_events
notifications
audit_logs
```

La structure finale doit être normalisée de manière pragmatique.

## 25.15 --- IDs

Utiliser des IDs non prédictibles adaptés.

Toutes les ressources métier importantes doivent posséder :

-   id
-   agency_id lorsque applicable
-   created_at
-   updated_at

## 25.16 --- Tenant Isolation

Toute table métier partagée doit être reliée directement ou
indirectement à une Agency.

Pour les tables critiques, préférer un `agency_id` explicite lorsque
cela simplifie les contrôles et requêtes.

## 25.17 --- Row Level Security

Si Supabase est utilisé :

mettre en place RLS pour les données utilisateur accessibles via les
clients Supabase.

Tester les policies.

Ne jamais exposer une table sensible avec une policy permissive par
défaut.

## 25.18 --- Service Role Security

La service role key :

-   backend only
-   jamais dans frontend
-   jamais dans repository
-   jamais dans logs

Toute requête utilisant des privilèges élevés doit appliquer
explicitement :

-   agency scope
-   permissions
-   resource scope

## 25.19 --- Authentication

Réutiliser l'auth existante uniquement si elle est saine.

Sinon reconstruire.

Besoins :

-   signup
-   login
-   logout
-   email verification
-   password reset
-   session handling
-   invitation flow

## 25.20 --- Authorization

Créer une fonction centrale.

Concept :

``` text
authorize(user, permission, agency, resource)
```

Éviter les contrôles dispersés incohérents.

## 25.21 --- Conversations

Une conversation doit contenir :

-   agency
-   creator
-   platform
-   fan
-   current mode
-   assignment
-   state
-   last activity
-   script state
-   AI state

Les messages doivent rester séparés.

## 25.22 --- Messages

Message fields conceptuels :

-   conversation_id
-   external_message_id
-   direction
-   sender_type
-   sender_id
-   text
-   media
-   paid
-   price
-   status
-   sent_at
-   received_at
-   AI attribution

Prévoir déduplication des messages externes.

## 25.23 --- Event-driven Architecture

Les événements importants doivent pouvoir déclencher des traitements.

Exemples :

``` text
MESSAGE_RECEIVED
SALE_CONFIRMED
SCRIPT_STEP_COMPLETED
FAN_SCORE_CHANGED
FOLLOW_UP_DUE
INTEGRATION_DISCONNECTED
```

Cela évite de coupler toutes les fonctionnalités directement.

## 25.24 --- Event Idempotency

Chaque événement externe doit avoir une clé de déduplication.

Un webhook ou sync reçu deux fois ne doit pas :

-   doubler une vente
-   doubler un message
-   envoyer deux offres
-   facturer deux commissions

## 25.25 --- Queue / Background Jobs

Les tâches longues ou différées doivent passer par un système de jobs
adapté.

Exemples :

-   AI processing
-   sync
-   embeddings
-   analytics
-   follow-ups
-   commission reconciliation
-   notifications

Ne pas bloquer une requête web pendant un traitement lourd.

## 25.26 --- Job Requirements

Chaque job critique doit prévoir :

-   idempotency
-   retry
-   max attempts
-   error logging
-   dead-letter/failure handling
-   observability

## 25.27 --- Follow-up Scheduler

Les relances automatiques doivent être gérées par un scheduler fiable.

Flow :

``` text
Follow-up created
↓
Scheduled
↓
Eligibility re-check
↓
Send or Skip
↓
Log result
```

Toujours revalider les conditions au moment de l'envoi.

## 25.28 --- Revalidation avant action

Avant une action différée :

vérifier si la situation a changé.

Exemple :

un follow-up était prévu mais le fan a répondu entre-temps.

→ annuler ou recalculer.

## 25.29 --- Memory Architecture

Séparer :

### Raw History

Messages et événements.

### Structured Memory

Facts utiles.

### Relationship Summary

Résumé actualisé.

### Commercial Memory

Purchases, objections, pricing behavior.

Le LLM ne doit pas recevoir toute l'historique brut à chaque message.

## 25.30 --- Context Builder

Créer un service qui construit le contexte minimal nécessaire.

Exemple :

``` text
Model DNA
+
Agency Rules
+
Fan Memory
+
Recent Messages
+
Current Script
+
Commercial State
+
Relevant Media
```

Limiter les tokens inutiles.

## 25.31 --- Priority Rules

Ordre de priorité conceptuel :

``` text
Hard Safety / Platform Rules
↓
Agency Explicit Settings
↓
Creator Settings
↓
Script / Pricing Rules
↓
Verified Fan Memory
↓
Imported Conversation Style Signals
↓
Generic OmniFlow Strategy
```

Les anciennes conversations importées ne doivent jamais écraser les
réglages explicites de l'agence.

## 25.32 --- Imported Conversations

Lors de l'import :

extraire uniquement les signaux utiles.

Exemples :

-   creator vocabulary
-   recurring facts
-   relationship patterns
-   fan information

Ne pas copier automatiquement les mauvaises stratégies commerciales
historiques.

## 25.33 --- Memory Confidence

Chaque mémoire peut avoir :

-   source
-   confidence
-   last confirmed
-   importance

Les informations corrigées manuellement doivent avoir une priorité
élevée.

## 25.34 --- Vector Search

Utiliser embeddings/vector search seulement lorsqu'ils améliorent
réellement la récupération mémoire.

Ne pas transformer toute la base en vector database sans raison.

Combiner :

-   structured SQL
-   summaries
-   vector retrieval

selon le besoin.

## 25.35 --- Script Engine

Le moteur de scripts doit être déterministe pour les transitions
critiques.

Le LLM peut recommander une branche.

Mais le backend valide :

-   condition
-   purchase
-   price
-   media
-   permissions

## 25.36 --- Script Versioning

Une version publiée ne doit pas être modifiée rétroactivement.

Flow :

``` text
Version 3 Published
↓
Edit
↓
Version 4 Draft
```

Les analytics historiques restent reliées à la bonne version.

## 25.37 --- Media Storage

Les médias doivent être stockés dans un storage privé.

Utiliser :

-   private buckets
-   signed URLs
-   expiration
-   access checks

Jamais de lien public permanent par défaut.

## 25.38 --- Media Metadata

Base :

-   creator
-   category
-   tags
-   target price
-   minimum price
-   platform compatibility
-   status

Séparer fichier et metadata.

## 25.39 --- Platform Connectors

Créer une interface de connecteur.

Concept :

``` text
PlatformConnector
├── authenticate()
├── syncMessages()
├── sendMessage()
├── syncTransactions()
├── sendMedia()
├── sendPaidOffer()
└── getCapabilities()
```

Chaque plateforme implémente uniquement les capacités réellement
disponibles.

## 25.40 --- Capability Matrix

Le backend doit savoir :

``` text
can_read_messages
can_send_messages
can_read_transactions
can_send_media
can_send_paid_offer
can_detect_online_status
```

Ne jamais supposer qu'une plateforme supporte une action.

## 25.41 --- Mock Connector

Tant que l'accès réel n'est pas disponible :

développer avec un connecteur simulé.

Le Mock Connector doit reproduire :

-   incoming messages
-   outgoing messages
-   purchases
-   errors
-   delays

Cela permet de développer tout le moteur sans attendre les plateformes.

## 25.42 --- Secrets

Toutes les clés :

-   AI providers
-   Supabase service role
-   Stripe
-   platform credentials
-   webhook secrets

doivent être dans des variables d'environnement sécurisées.

Ne jamais les committer.

## 25.43 --- Environment Separation

Prévoir :

-   local
-   preview/staging
-   production

Chaque environnement possède :

-   database
-   secrets
-   integrations
-   billing mode

Ne pas utiliser des credentials production en local.

## 25.44 --- Vercel

Si Vercel reste utilisé :

configurer correctement :

-   environment variables
-   preview deployments
-   production branch
-   cron/jobs uniquement si adaptés
-   logs

Vérifier que les traitements longs sont compatibles avec les limites
d'exécution.

## 25.45 --- Cron

Ne pas utiliser un cron comme solution universelle.

Cron adapté pour :

-   periodic reconciliation
-   scheduled aggregation
-   maintenance

Pour événements rapides :

préférer webhooks, queues ou realtime lorsque disponibles.

## 25.46 --- API Routes

Organiser clairement.

Exemple :

``` text
/api/agencies
/api/creators
/api/conversations
/api/fans
/api/scripts
/api/media
/api/follow-ups
/api/analytics
/api/integrations
/api/billing
```

Ou architecture équivalente selon framework.

## 25.47 --- Input Validation

Toutes les entrées doivent être validées côté serveur.

Utiliser schemas typés.

Ne jamais faire confiance :

-   IDs
-   price
-   role
-   agency_id
-   platform data
-   AI output

## 25.48 --- Rate Limiting

Protéger :

-   auth
-   AI generation
-   message sending
-   imports
-   uploads
-   public forms

Les limites peuvent varier par plan et endpoint.

## 25.49 --- AI Cost Protection

Créer des garde-fous :

-   token limits
-   context limits
-   model routing
-   per-agency quotas
-   anomaly detection
-   retry limits

Un bug ne doit pas pouvoir déclencher des milliers d'appels premium.

## 25.50 --- Concurrency

Protéger les conversations contre les courses critiques.

Exemple :

deux jobs AI ne doivent pas répondre au même message simultanément.

Utiliser :

-   locks
-   unique constraints
-   state checks

selon architecture.

## 25.51 --- Message State Machine

États possibles :

``` text
RECEIVED
PROCESSING
ACTION_PLANNED
SENDING
SENT
FAILED
SKIPPED
```

Permet audit et retry.

## 25.52 --- AI Decision Logging

Pour chaque décision importante :

stocker :

-   model
-   prompt/config version
-   structured result
-   confidence
-   selected strategy
-   action result
-   latency
-   cost metadata

Sans stocker inutilement des secrets.

## 25.53 --- Prompt Versioning

Les prompts système doivent être versionnés.

Exemple :

``` text
sales_decision_v1
sales_decision_v2
```

Cela permet de comparer les performances.

## 25.54 --- Feature Flags

Créer un système simple de feature flags.

Exemples :

-   full_ai
-   auto_follow_up
-   new_decision_engine
-   premium_model_router

Permet de tester progressivement.

## 25.55 --- A/B Testing Infrastructure

Pour les tests :

stocker :

-   experiment
-   variant
-   assignment
-   exposure
-   outcome

Ne pas modifier une variante au milieu d'un test sans versionner.

## 25.56 --- Analytics Events

Créer une nomenclature.

Exemples :

``` text
conversation_started
ai_suggestion_generated
ai_suggestion_accepted
offer_sent
offer_purchased
script_started
script_step_reached
follow_up_sent
human_takeover
```

## 25.57 --- Analytics Source of Truth

Les KPI financiers doivent venir des transactions confirmées.

Les événements analytics servent à comprendre le comportement.

Ne pas calculer le revenu uniquement depuis des events frontend.

## 25.58 --- Logging

Logs structurés :

-   request_id
-   agency_id
-   user_id si approprié
-   service
-   event
-   severity

Ne jamais logger :

-   passwords
-   payment secrets
-   raw sensitive credentials

## 25.59 --- Error Monitoring

Brancher un système de monitoring adapté.

Suivre :

-   frontend exceptions
-   backend exceptions
-   job failures
-   platform connector errors
-   AI provider failures

## 25.60 --- Observability Dashboard

Interne OmniFlow :

-   error rate
-   message processing latency
-   AI latency
-   queue depth
-   connector health
-   billing webhook health
-   database health

## 25.61 --- Health Checks

Créer des health checks appropriés.

Exemples :

-   application
-   database
-   queue
-   AI provider
-   integrations

Ne pas exposer de secrets dans les réponses.

## 25.62 --- Security Headers

Configurer notamment selon stack :

-   CSP
-   HSTS
-   X-Content-Type-Options
-   Referrer-Policy
-   frame protections

Tester les impacts sur les intégrations.

## 25.63 --- CSRF / XSS / Injection

Appliquer les protections framework.

Éviter :

-   raw HTML non sécurisé
-   SQL construit par concaténation
-   actions sensibles sans protection

## 25.64 --- File Upload Security

Valider :

-   MIME type
-   extension
-   size
-   ownership

Prévoir scan de sécurité si nécessaire.

Ne pas faire confiance au nom de fichier.

## 25.65 --- Encryption

Utiliser TLS en transit.

Pour les données sensibles au repos :

utiliser les mécanismes du provider et, si nécessaire, chiffrement
applicatif ciblé.

Les credentials plateforme doivent recevoir une protection renforcée.

## 25.66 --- Data Minimization

Ne stocker que ce qui est utile au fonctionnement du produit.

Définir :

-   retention
-   deletion
-   export
-   anonymization

selon obligations applicables.

## 25.67 --- Privacy

Prévoir les fondations nécessaires pour :

-   privacy policy
-   data export
-   account deletion
-   retention
-   access controls

La conformité juridique finale doit être validée séparément.

## 25.68 --- Backup

Configurer backups database.

Vérifier :

-   fréquence
-   retention
-   restore procedure

Un backup non testé n'est pas suffisant.

## 25.69 --- Disaster Recovery

Documenter au minimum :

-   database restore
-   secret rotation
-   integration reconnect
-   deployment rollback

## 25.70 --- Database Migrations

Toutes les modifications schema passent par migrations versionnées.

Interdit :

modifier manuellement production sans migration reproductible.

## 25.71 --- Seed Data

Créer des seeds pour développement :

-   demo agency
-   creator
-   fans
-   conversations
-   scripts
-   media metadata
-   transactions

Aucun contenu sensible réel dans le repository.

## 25.72 --- Testing Strategy

Prévoir :

### Unit Tests

Logique métier.

### Integration Tests

Database, services, connectors.

### End-to-End Tests

Flows critiques.

### AI Evaluation

Qualité décisionnelle.

## 25.73 --- Critical E2E

Tester :

``` text
Signup
→ Agency
→ Creator
→ Integration/Mock
→ Fan Message
→ AI Decision
→ Reply
→ Offer
→ Purchase
→ Commission
→ Analytics
```

C'est le flow principal OmniFlow.

## 25.74 --- Security Tests

Inclure :

-   cross-tenant access
-   privilege escalation
-   expired invite
-   revoked session
-   manipulated price
-   forged webhook
-   duplicate webhook
-   unauthorized media access

## 25.75 --- AI Failure Tests

Tester :

-   provider timeout
-   malformed structured output
-   hallucinated action
-   price below minimum
-   unavailable media
-   missing fan context
-   contradictory memory
-   duplicate incoming message

Le système doit échouer proprement.

## 25.76 --- Fallback Model

Si le modèle principal échoue :

possibilité de fallback.

Mais éviter une boucle de retries coûteuse.

Exemple :

``` text
Primary
↓ fail
Fallback
↓ fail
Human / Queue
```

## 25.77 --- Circuit Breaker

Si un provider ou connecteur rencontre trop d'erreurs :

mettre temporairement en pause certaines actions automatiques.

Prévenir l'agence si nécessaire.

## 25.78 --- Full AI Fail-safe

Si l'état système n'est pas fiable :

# DO NOT GUESS.

Exemples :

-   platform disconnected
-   transaction state unknown
-   pricing config invalid
-   AI confidence below threshold
-   critical service unavailable

→ pause / approval / human takeover selon règle.

## 25.79 --- Deployment Pipeline

Flow recommandé :

``` text
Feature Branch
↓
Automated Checks
↓
Preview Deployment
↓
Review
↓
Staging Tests
↓
Production
```

## 25.80 --- CI Checks

Avant merge :

-   lint
-   typecheck
-   tests
-   build
-   migration validation
-   secret scan si disponible

## 25.81 --- Preview Deployments

Chaque grosse feature doit pouvoir être testée avant production.

Utiliser des données de test.

Ne pas connecter automatiquement une preview aux comptes réels.

## 25.82 --- Production Deployment

Avant production :

-   migrations reviewed
-   environment variables ready
-   webhooks configured
-   rollback possible
-   monitoring active

## 25.83 --- Rollback

Prévoir rollback applicatif.

Pour database :

préférer migrations backward-compatible lorsque possible.

Éviter les migrations destructives combinées au même instant qu'un
déploiement risqué.

## 25.84 --- Feature Rollout

Pour Full AI :

déployer progressivement.

Exemple :

``` text
Internal
↓
Demo
↓
Selected Test Agencies
↓
Limited Beta
↓
General Availability
```

## 25.85 --- Benchmark Timing

Le benchmark IA ne doit pas attendre que tout OmniFlow soit terminé.

Il commence dès qu'un premier pipeline conversationnel fonctionnel
existe.

Étapes :

### PHASE 1 --- BEFORE PLATFORM INTEGRATION

Avec Mock Connector et conversations de test.

### PHASE 2 --- BEFORE FULL AI BETA

Sur dataset de conversations annotées.

### PHASE 3 --- PILOT

Avec agences tests et supervision humaine.

### PHASE 4 --- CONTINUOUS

À chaque modification importante :

-   prompt
-   model
-   memory
-   scoring
-   decision engine
-   scripts

## 25.86 --- Benchmark Dataset

Créer un dataset de situations représentatives.

Exemples :

-   cold fan
-   returning buyer
-   price objection
-   high spender
-   relationship conversation
-   script opportunity
-   no-sale situation
-   negotiation
-   follow-up
-   custom request

Inclure de bons et mauvais exemples.

## 25.87 --- Ne pas prendre les chatters comme vérité absolue

Les réponses historiques humaines ne doivent pas devenir automatiquement
le gold standard.

Pour chaque benchmark :

évaluer selon une grille OmniFlow.

Exemples :

-   persona consistency
-   context understanding
-   memory accuracy
-   sales timing
-   rule compliance
-   commercial quality
-   price compliance
-   naturalness
-   safety
-   outcome quality

## 25.88 --- Human Evaluation

Créer une interface ou workflow interne permettant de noter :

-   AI response A
-   AI response B
-   human response

sans forcément révéler la source au reviewer.

Cela réduit certains biais.

## 25.89 --- Golden Set

Construire progressivement un :

# OMNIFLOW GOLDEN SET

Cas validés manuellement représentant le niveau attendu.

Chaque nouvelle version importante doit être testée dessus.

## 25.90 --- Regression Gate

Avant déployer une nouvelle version AI :

comparer avec version précédente.

Si amélioration globale mais forte régression sur une catégorie critique
:

ne pas déployer automatiquement.

## 25.91 --- Fine-tuning

Ne pas commencer par fine-tuner sans données propres.

Ordre recommandé :

1.  strong base models
2.  prompt/system design
3.  structured memory
4.  rules
5.  retrieval
6.  evaluation
7.  collect quality data
8.  fine-tuning seulement si bénéfice démontré

Le fine-tuning doit résoudre un problème mesuré.

## 25.92 --- Learning Loop

Flow :

``` text
Conversation
↓
Decision
↓
Action
↓
Outcome
↓
Feedback
↓
Analytics
↓
Evaluation Dataset
↓
Improved Strategy
```

L'apprentissage ne signifie pas que le modèle se réentraîne
automatiquement après chaque conversation.

## 25.93 --- Controlled Learning

Les données réelles peuvent améliorer :

-   prompts
-   scoring
-   routing
-   strategies
-   benchmark
-   future fine-tuning

Mais toute nouvelle logique doit être :

-   testée
-   versionnée
-   comparée
-   déployée progressivement

## 25.94 --- Claude Code Milestone Reminder

Claude Code doit créer dans le projet une checklist ou documentation de
milestones.

Inclure explicitement :

``` text
MILESTONE — AI BENCHMARK PHASE 1
Trigger:
First complete Mock Connector conversation pipeline works.

MILESTONE — AI BENCHMARK PHASE 2
Trigger:
Decision Engine + Memory + Scripts + Pricing are integrated.

MILESTONE — PILOT READINESS REVIEW
Trigger:
Platform connector is available and Full AI can be tested safely.
```

Ainsi, le benchmark ne sera pas oublié.

## 25.95 --- Documentation

Maintenir dans le repository :

``` text
/docs
```

avec notamment :

-   architecture
-   database
-   AI system
-   integrations
-   billing
-   security
-   deployment
-   benchmark
-   environment setup

## 25.96 --- README

Le README doit permettre à un nouveau développeur de :

1.  comprendre OmniFlow
2.  installer
3.  configurer env
4.  lancer database
5.  lancer app
6.  lancer mock connector
7.  lancer tests

## 25.97 --- Architecture Decision Records

Pour les décisions majeures :

créer éventuellement des ADR courts.

Exemples :

-   AI provider abstraction
-   queue choice
-   memory architecture
-   tenant model

Cela évite de perdre la logique des décisions.

## 25.98 --- Technical Debt

Ne pas bloquer la V1 pour perfection absolue.

Mais marquer clairement :

-   temporary
-   TODO
-   mock
-   technical debt

avec issue ou documentation.

Éviter les hacks invisibles.

## 25.99 --- Priorité technique V1

Priorité absolue :

``` text
Reliability
↓
AI Quality
↓
Security
↓
Product UX
↓
Scalability
↓
Optimization
```

Ne pas construire prématurément une infrastructure pour des millions
d'utilisateurs si cela ralentit le MVP.

## 25.100 --- Architecture évolutive

La V1 doit cependant pouvoir accueillir plus tard :

-   Marketing
-   Recruitment
-   VA workflows
-   additional platforms
-   more AI models
-   enterprise agencies
-   marketplace

Sans devoir réécrire le cœur multi-tenant.

## 25.101 --- Critère de réussite

L'architecture technique est réussie lorsque :

-   l'ancien repository a été audité avant modification
-   la nouvelle interface peut être reconstruite proprement
-   les données sont strictement isolées par agence
-   les permissions sont vérifiées backend
-   l'IA est séparée des règles métier
-   les actions critiques sont déterministes et auditées
-   les modèles peuvent être routés selon les tâches
-   les plateformes sont abstraites via connectors
-   le développement peut continuer avec Mock Connector
-   les jobs sont fiables et idempotents
-   les médias sont privés
-   la facturation est auditable
-   les erreurs sont observables
-   Full AI possède des fail-safes
-   le benchmark IA démarre au bon moment
-   chaque nouvelle version IA peut être comparée à la précédente
-   le système peut évoluer sans reconstruire le cœur du produit

# THE LLM IS NOT THE PRODUCT ARCHITECTURE.

# IT IS ONE ENGINE INSIDE A CONTROLLED SYSTEM.

------------------------------------------------------------------------

## PARTIE 25 --- VALIDÉE COMME SPÉCIFICATION DE TECHNICAL ARCHITECTURE, DATABASE, SECURITY & DEPLOYMENT

La suite du cahier des charges commence avec :

# PARTIE 26 --- DEVELOPMENT ROADMAP, BUILD ORDER, QA & LAUNCH PLAN
