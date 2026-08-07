# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 29 --- API CONTRACTS, SERVICE LAYER & EVENT SYSTEM

## 29.1 --- Objectif

Cette partie définit la manière dont les différentes briques OmniFlow
communiquent entre elles.

Le système doit éviter :

-   logique métier dispersée
-   appels directs incontrôlés à la database
-   dépendances fortes aux plateformes
-   actions IA exécutées sans validation
-   duplication de logique entre frontend, API et jobs

Principe :

# THIN INTERFACES.

# STRONG DOMAIN SERVICES.

# CONTROLLED EVENTS.

## 29.2 --- Architecture logique

``` text
Frontend
↓
API / Server Actions
↓
Authorization
↓
Domain Services
↓
Business Rules
↓
Repositories / Database
↓
Events / Jobs / External Connectors
```

L'API n'est pas l'endroit principal où vit la logique métier.

## 29.3 --- API Style

Utiliser le style le plus cohérent avec la stack auditée.

REST, server actions ou architecture hybride sont acceptables.

Mais les contrats doivent rester :

-   explicites
-   typés
-   validés
-   versionnables

## 29.4 --- API Namespace

Exemple conceptuel :

``` text
/api/v1/
```

Routes possibles :

``` text
/agencies
/creators
/fans
/conversations
/messages
/scripts
/media
/offers
/follow-ups
/analytics
/integrations
/team
/billing
/ai
```

## 29.5 --- Request Context

Chaque requête authentifiée doit résoudre :

``` text
user
agency
role
permissions
creator_scope
request_id
```

Ne jamais faire confiance au scope envoyé uniquement par le frontend.

## 29.6 --- Authorization Middleware

Avant service métier :

``` text
authenticate
↓
resolve agency
↓
authorize permission
↓
validate resource ownership
↓
execute
```

## 29.7 --- Input Validation

Chaque endpoint/action doit valider :

-   body
-   query
-   params
-   enums
-   IDs
-   money
-   dates

Utiliser schemas partagés lorsque pertinent.

## 29.8 --- Response Contract

Réponse cohérente.

Exemple :

``` json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Ou convention équivalente.

Ne pas inventer une structure différente pour chaque endpoint.

## 29.9 --- Error Contract

Erreur structurée :

``` json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSION",
    "message": "You do not have permission to perform this action.",
    "request_id": "..."
  }
}
```

Le message utilisateur peut être différent du détail interne.

## 29.10 --- Error Codes

Créer un catalogue.

Exemples :

``` text
UNAUTHENTICATED
INSUFFICIENT_PERMISSION
RESOURCE_NOT_FOUND
VALIDATION_ERROR
PLATFORM_UNAVAILABLE
AI_PROVIDER_ERROR
PRICE_RULE_VIOLATION
DUPLICATE_EVENT
BILLING_ERROR
RATE_LIMITED
```

## 29.11 --- Pagination

Pour listes importantes :

-   cursor pagination recommandée
-   limit borné
-   stable ordering

Exemples :

-   conversations
-   fans
-   messages
-   transactions
-   audit

## 29.12 --- Filtering

Filtres côté serveur.

Exemple Inbox :

``` text
creator
platform
status
ai_mode
priority
unread
purchase_intent
```

## 29.13 --- Sorting

Autoriser uniquement une whitelist de champs.

Ne pas injecter directement un nom de colonne fourni par le client dans
une query.

## 29.14 --- Agency Service

Responsabilités :

-   create workspace
-   update workspace
-   settings
-   status
-   entitlements

Interface conceptuelle :

``` text
AgencyService.create()
AgencyService.updateSettings()
AgencyService.getEntitlements()
```

## 29.15 --- Creator Service

``` text
CreatorService.create()
CreatorService.update()
CreatorService.archive()
CreatorService.getAIProfile()
CreatorService.publishAIProfile()
```

## 29.16 --- Fan Service

``` text
FanService.get()
FanService.search()
FanService.getProfile()
FanService.getScores()
FanService.getTimeline()
```

## 29.17 --- Memory Service

``` text
MemoryService.extract()
MemoryService.upsert()
MemoryService.correct()
MemoryService.retrieveRelevant()
MemoryService.summarize()
```

Les corrections humaines ont priorité.

## 29.18 --- Fan Intelligence Service

``` text
FanIntelligenceService.calculateScores()
FanIntelligenceService.updateCommercialState()
FanIntelligenceService.explainScores()
```

Versionner la logique de scoring.

## 29.19 --- Conversation Service

``` text
ConversationService.getInbox()
ConversationService.getConversation()
ConversationService.assign()
ConversationService.takeOver()
ConversationService.returnToAI()
ConversationService.changeMode()
```

## 29.20 --- Message Service

``` text
MessageService.ingestInbound()
MessageService.sendText()
MessageService.sendMedia()
MessageService.sendPaidOffer()
MessageService.markFailed()
```

Toute action sortante passe par le connecteur plateforme.

## 29.21 --- AI Orchestrator

Interface centrale :

``` text
AIOrchestrator.processInboundMessage()
AIOrchestrator.generateCopilotSuggestion()
AIOrchestrator.evaluateFollowUp()
AIOrchestrator.evaluateNegotiation()
```

## 29.22 --- Decision Service

Le Decision Service reçoit le contexte structuré.

Retour attendu :

``` json
{
  "objective": "CONVERT",
  "strategy": "CONTINUE_SCRIPT",
  "action": "SEND_PAID_OFFER",
  "confidence": 0.91,
  "parameters": {}
}
```

## 29.23 --- Action Validator

Avant exécution :

``` text
Decision
↓
Action Validator
↓
Allowed / Modified / Approval / Rejected
```

Valide :

-   permissions
-   AI mode
-   price
-   minimum price
-   negotiation
-   script state
-   media availability
-   platform capability
-   safety rules

## 29.24 --- Action Executor

Uniquement après validation.

``` text
ActionExecutor.execute()
```

Il ne décide pas de la stratégie.

Il exécute une action autorisée.

## 29.25 --- Script Service

``` text
ScriptService.create()
ScriptService.createVersion()
ScriptService.validate()
ScriptService.publish()
ScriptService.startRun()
ScriptService.advance()
ScriptService.stop()
```

## 29.26 --- Script Runtime

Le runtime reçoit :

-   current node
-   fan state
-   purchase state
-   AI decision
-   rules

et détermine les transitions autorisées.

## 29.27 --- Media Service

``` text
MediaService.upload()
MediaService.search()
MediaService.recommend()
MediaService.getSignedUrl()
MediaService.archive()
```

## 29.28 --- Offer Service

``` text
OfferService.create()
OfferService.send()
OfferService.markPurchased()
OfferService.expire()
OfferService.cancel()
```

Toute vente doit pouvoir être reliée à une Offer lorsque pertinent.

## 29.29 --- Pricing Service

``` text
PricingService.validatePrice()
PricingService.getMinimum()
PricingService.calculateDiscount()
PricingService.canNegotiate()
```

Le Pricing Service est autoritaire.

## 29.30 --- Negotiation Service

``` text
NegotiationService.start()
NegotiationService.evaluateCounterOffer()
NegotiationService.accept()
NegotiationService.reject()
NegotiationService.close()
```

Aucune négociation ne peut descendre sous le minimum configuré.

## 29.31 --- Follow-up Service

``` text
FollowUpService.create()
FollowUpService.approve()
FollowUpService.schedule()
FollowUpService.revalidate()
FollowUpService.send()
FollowUpService.cancel()
```

## 29.32 --- Transaction Service

``` text
TransactionService.ingest()
TransactionService.deduplicate()
TransactionService.attribute()
TransactionService.reconcile()
```

## 29.33 --- Commission Service

``` text
CommissionService.evaluateEligibility()
CommissionService.createLedgerEntry()
CommissionService.adjust()
CommissionService.reconcilePeriod()
```

Le ledger est append-only autant que possible.

## 29.34 --- Analytics Service

``` text
AnalyticsService.recordEvent()
AnalyticsService.aggregate()
AnalyticsService.getDashboard()
AnalyticsService.getScriptPerformance()
AnalyticsService.getMediaPerformance()
```

## 29.35 --- Integration Service

``` text
IntegrationService.connect()
IntegrationService.disconnect()
IntegrationService.sync()
IntegrationService.getCapabilities()
IntegrationService.health()
```

## 29.36 --- Billing Service

``` text
BillingService.createCheckout()
BillingService.changePlan()
BillingService.cancel()
BillingService.processWebhook()
BillingService.getInvoicePreview()
```

## 29.37 --- Notification Service

``` text
NotificationService.create()
NotificationService.markRead()
NotificationService.sendInternalAlert()
```

## 29.38 --- Audit Service

``` text
AuditService.record()
AuditService.search()
```

Les services critiques doivent appeler l'audit de manière centralisée.

## 29.39 --- Repository Layer

Option recommandée si elle améliore la clarté.

Exemples :

``` text
ConversationRepository
FanRepository
TransactionRepository
```

Le repository gère l'accès aux données.

Le service gère la logique métier.

## 29.40 --- Transactions Database

Les opérations financières ou multi-écritures critiques doivent utiliser
des transactions DB.

Exemple :

``` text
transaction ingested
+
attribution
+
commission ledger
```

doivent rester cohérents.

## 29.41 --- Event Bus

Créer une abstraction événementielle.

Exemple :

``` text
EventBus.publish(event)
```

Au départ, l'implémentation peut rester simple.

L'interface permet une évolution future.

## 29.42 --- Event Envelope

Chaque événement :

``` json
{
  "event_id": "...",
  "event_type": "MESSAGE_RECEIVED",
  "version": 1,
  "agency_id": "...",
  "resource_id": "...",
  "occurred_at": "...",
  "payload": {}
}
```

## 29.43 --- Event Naming

Convention :

``` text
ENTITY_ACTION
```

Exemples :

``` text
MESSAGE_RECEIVED
MESSAGE_SENT
OFFER_SENT
OFFER_PURCHASED
TRANSACTION_CONFIRMED
FOLLOW_UP_DUE
AI_ACTION_FAILED
```

## 29.44 --- Event Versioning

Chaque event possède une version.

Ne pas casser silencieusement les consumers existants.

## 29.45 --- Core Conversation Event Flow

``` text
Platform
↓
MESSAGE_RECEIVED
↓
Ingestion
↓
Conversation updated
↓
AI_PROCESSING_REQUESTED
↓
Context Builder
↓
Decision Engine
↓
AI_DECISION_CREATED
↓
Validator
↓
AI_ACTION_APPROVED
↓
Executor
↓
MESSAGE_SENT / OFFER_SENT
↓
Observation
↓
Memory + Analytics
```

## 29.46 --- Purchase Event Flow

``` text
Platform Transaction
↓
TRANSACTION_RECEIVED
↓
Deduplicate
↓
Confirm
↓
TRANSACTION_CONFIRMED
↓
Offer attribution
↓
Script update
↓
Commission ledger
↓
Fan score update
↓
Analytics
```

## 29.47 --- Follow-up Event Flow

``` text
Conversation state
↓
FOLLOW_UP_CREATED
↓
Scheduled
↓
FOLLOW_UP_DUE
↓
Revalidation
├── invalid → FOLLOW_UP_SKIPPED
└── valid → AI/Rule generation
            ↓
            send
            ↓
            FOLLOW_UP_SENT
```

## 29.48 --- Script Event Flow

``` text
SCRIPT_STARTED
↓
SCRIPT_NODE_ENTERED
↓
Action
↓
Outcome
↓
SCRIPT_NODE_COMPLETED
↓
Branch Evaluation
↓
Next Node
```

## 29.49 --- AI Feedback Flow

``` text
User flags AI response
↓
AI_FEEDBACK_CREATED
↓
AI Quality Queue
↓
Review
↓
Benchmark Candidate
↓
Future AI Release
```

## 29.50 --- Event Consumers

Un événement peut déclencher plusieurs consumers.

Exemple :

``` text
TRANSACTION_CONFIRMED
├── Commission
├── Analytics
├── Fan Intelligence
├── Script Engine
└── Notification
```

Chaque consumer doit être indépendant.

## 29.51 --- Consumer Failure

Si Analytics échoue après une transaction :

la transaction ne doit pas disparaître.

Retry uniquement le consumer défaillant.

## 29.52 --- Idempotent Consumers

Chaque consumer doit supporter la réception répétée du même event.

## 29.53 --- Ordering

Certaines opérations nécessitent un ordre.

Exemple :

``` text
MESSAGE_RECEIVED
```

dans une même conversation.

Prévoir mécanisme de séquencement ou vérification de state si
nécessaire.

## 29.54 --- Outbox Pattern

Pour les événements critiques liés à une transaction DB, envisager
Outbox Pattern.

Exemple :

``` text
DB transaction
├── transaction row
└── outbox event
```

Puis worker publie l'événement.

Évite les états où la DB est modifiée mais l'événement perdu.

## 29.55 --- Webhook Ingestion

Endpoint séparé par provider.

Exemple :

``` text
/api/webhooks/billing
/api/webhooks/platform/:platform
```

Toujours :

1.  verify signature
2.  store/deduplicate
3.  acknowledge rapidement
4.  process async

## 29.56 --- Webhook Security

Vérifier :

-   signature
-   timestamp
-   replay
-   provider event ID

Ne jamais faire confiance au payload avant vérification.

## 29.57 --- Platform Connector Interface

``` text
interface PlatformConnector {
  getCapabilities()
  healthCheck()
  syncMessages()
  sendMessage()
  sendMedia()
  sendPaidOffer()
  syncTransactions()
}
```

Adapter aux capacités réelles.

## 29.58 --- Mock Connector Contract

Le Mock Connector doit implémenter la même interface.

Ainsi :

``` text
Mock
OnlyFans
MYM
```

peuvent être remplacés sans modifier le moteur métier.

## 29.59 --- AI Provider Interface

Concept :

``` text
AIProvider.generateStructured()
AIProvider.generateText()
AIProvider.embed()
```

Les capacités peuvent varier.

## 29.60 --- Model Registry

Créer une configuration centrale.

Exemple :

``` text
FAST_MODEL
BALANCED_MODEL
PREMIUM_MODEL
EMBEDDING_MODEL
```

Chaque alias pointe vers un modèle réel configurable.

## 29.61 --- Model Router Contract

Input :

``` text
task
risk
complexity
fan_value
context_size
latency_target
```

Output :

``` text
model_alias
reason_code
```

Le reason code est loggable.

## 29.62 --- Prompt Registry

Centraliser les prompts.

Exemples :

``` text
conversation_reply
sales_decision
memory_extraction
fan_scoring
negotiation
follow_up
```

Chaque prompt possède une version.

## 29.63 --- Prompt Composition

Construire le prompt depuis modules.

Exemple :

``` text
System Rules
+
Agency Rules
+
Creator DNA
+
Task Instructions
+
Relevant Context
+
Output Schema
```

Éviter un prompt géant dupliqué partout.

## 29.64 --- Context Builder Contract

``` text
ContextBuilder.build({
  agency,
  creator,
  fan,
  conversation,
  task
})
```

Retour :

-   relevant memories
-   recent messages
-   commercial state
-   script state
-   media candidates
-   rules

## 29.65 --- Context Budget

Chaque task possède un budget de contexte.

Ne pas envoyer automatiquement :

-   toute la bibliothèque
-   toute la conversation
-   toutes les memories

## 29.66 --- Structured AI Schemas

Créer des schemas séparés.

Exemples :

``` text
SalesDecisionSchema
MemoryExtractionSchema
FanScoreSchema
NegotiationDecisionSchema
FollowUpDecisionSchema
```

## 29.67 --- Invalid AI Output

Si sortie invalide :

1.  safe retry si pertinent
2.  fallback model si autorisé
3.  human/escalation
4.  log

Jamais exécuter une sortie partiellement parsée dangereuse.

## 29.68 --- Confidence

La confidence du LLM ne doit pas être utilisée seule comme vérité
mathématique.

Elle peut participer à une règle combinée avec :

-   action risk
-   context completeness
-   validator
-   platform state

## 29.69 --- Approval Engine

Créer une fonction :

``` text
ApprovalService.requiresApproval(action, context)
```

Selon :

-   agency settings
-   autonomy level
-   action type
-   amount
-   confidence
-   risk

## 29.70 --- Approval API

Actions :

``` text
GET /approvals
POST /approvals/:id/approve
POST /approvals/:id/reject
```

ou équivalent.

## 29.71 --- Approval Expiration

Une approval ancienne peut devenir invalide.

Avant exécution :

revalider contexte.

## 29.72 --- Real-time Layer

Pour l'Inbox :

publier les changements pertinents :

-   new message
-   AI suggestion
-   AI action
-   purchase
-   score update
-   assignment

Utiliser le mécanisme temps réel adapté à la stack.

## 29.73 --- Realtime Authorization

Un client ne doit s'abonner qu'aux channels/resources autorisés.

Tester fuite cross-agency.

## 29.74 --- API for Inbox

Concept :

``` text
GET /conversations
GET /conversations/:id
GET /conversations/:id/messages
POST /conversations/:id/take-over
POST /conversations/:id/return-to-ai
POST /conversations/:id/messages
```

## 29.75 --- API for AI Copilot

Concept :

``` text
POST /conversations/:id/copilot/generate
POST /conversations/:id/copilot/regenerate
POST /conversations/:id/copilot/send
```

Éviter de permettre au frontend d'appeler directement le provider IA.

## 29.76 --- API for Scripts

``` text
GET /scripts
POST /scripts
POST /scripts/:id/versions
POST /script-versions/:id/validate
POST /script-versions/:id/publish
```

## 29.77 --- API for Media

``` text
GET /media
POST /media/upload-intent
POST /media
PATCH /media/:id
POST /media/:id/archive
```

Upload direct sécurisé vers storage si adapté.

## 29.78 --- API for Analytics

``` text
GET /analytics/overview
GET /analytics/scripts
GET /analytics/media
GET /analytics/ai
GET /analytics/follow-ups
```

Réponses agrégées, pas calcul massif côté frontend.

## 29.79 --- API for Billing

``` text
GET /billing
POST /billing/checkout
POST /billing/change-plan
POST /billing/cancel
GET /billing/invoices
```

## 29.80 --- API Versioning

V1 :

``` text
/api/v1
```

Si un contrat public/externe apparaît plus tard, versionner
explicitement.

Pour les interfaces internes, éviter le versioning excessif si les
consommateurs sont déployés ensemble.

## 29.81 --- Internal Admin API

Séparer :

``` text
/api/internal/
```

avec authorization interne stricte.

Ne jamais réutiliser simplement une route client avec un flag
`isAdmin=true`.

## 29.82 --- Internal Actions

Exemples :

``` text
POST /internal/agencies/:id/pause-ai
POST /internal/features/:id/rollout
POST /internal/jobs/:id/retry
POST /internal/incidents
```

Chaque action sensible auditée.

## 29.83 --- Service-to-Service Auth

Si architecture future multi-service :

prévoir identité service.

Mais ne pas complexifier V1 avec microservices sans besoin.

## 29.84 --- Monolith Modulaire

Architecture recommandée V1 :

# MODULAR MONOLITH.

Avantages :

-   développement rapide
-   transactions simples
-   moins d'infrastructure
-   séparation logique maintenue

Extraire des services plus tard si nécessaire.

## 29.85 --- Module Boundaries

Modules conceptuels :

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

Éviter imports circulaires.

## 29.86 --- Dependency Direction

Exemple :

``` text
API → Services → Repositories
```

et non :

``` text
Repository → API
```

Les modules peuvent communiquer via services/events.

## 29.87 --- Shared Types

Créer un package/module partagé pour :

-   enums
-   schemas
-   DTOs
-   event contracts

Éviter les copies divergentes frontend/backend.

## 29.88 --- Domain Enums

Centraliser :

-   AI modes
-   offer status
-   transaction status
-   script status
-   follow-up status
-   platform capability
-   permissions

## 29.89 --- API Documentation

Générer ou maintenir :

``` text
/docs/api/API.md
```

Pour chaque endpoint :

-   method
-   route
-   auth
-   permission
-   input
-   output
-   errors
-   side effects

## 29.90 --- Event Documentation

Créer :

``` text
/docs/events/EVENT_CATALOG.md
```

Pour chaque event :

-   name
-   version
-   producer
-   consumers
-   payload
-   idempotency behavior

## 29.91 --- Service Documentation

Créer :

``` text
/docs/architecture/SERVICES.md
```

Décrire :

-   responsibility
-   public methods
-   dependencies
-   emitted events

## 29.92 --- Contract Tests

Tester :

-   API schemas
-   connector contracts
-   event schemas
-   AI structured outputs

Un changement incompatible doit être détecté.

## 29.93 --- Integration Tests

Scénario :

``` text
Mock message
↓
MessageService
↓
AI Orchestrator
↓
Decision
↓
Validator
↓
Mock Connector
↓
Message Sent
```

## 29.94 --- Purchase Integration Test

``` text
Mock Purchase
↓
TransactionService
↓
Attribution
↓
Commission
↓
Script
↓
Analytics
```

Vérifier idempotency.

## 29.95 --- Failure Integration Test

Simuler :

-   AI timeout
-   connector timeout
-   duplicate webhook
-   database retry
-   invalid output
-   stale approval

Le système doit rester cohérent.

## 29.96 --- Observability per Request

Propager :

``` text
request_id
event_id
job_id
conversation_id
agency_id
```

dans les logs appropriés.

Cela facilite le diagnostic de bout en bout.

## 29.97 --- Performance Budgets

Définir des objectifs réalistes par type.

Exemple :

-   standard API reads rapides
-   Inbox initial load optimisé
-   AI response peut être asynchrone/streamée
-   analytics lourdes pré-agrégées

Mesurer avant optimisation prématurée.

## 29.98 --- Caching

Utiliser cache pour :

-   stable settings
-   entitlements
-   analytics aggregates
-   platform capabilities

Ne pas cacher aveuglément :

-   live conversation state
-   critical pricing state

## 29.99 --- Cache Invalidation

Toute donnée mise en cache doit avoir une stratégie d'invalidation.

Pas de cache sans ownership clair.

## 29.100 --- Streaming AI

Pour Copilot, possibilité d'afficher la génération en streaming si UX
utile.

Mais la réponse finale doit être validée avant une action commerciale
autonome.

## 29.101 --- Full AI Non-Streaming Execution

Pour Full AI :

préférer :

``` text
generate
↓
parse
↓
validate
↓
execute
```

Le fan ne doit pas recevoir des fragments non validés.

## 29.102 --- Retry Policy

Définir par service.

Exemple :

### AI generation

retry limité.

### message send

retry seulement si idempotency connue.

### financial webhook

safe retry.

### analytics

retry plus tolérant.

## 29.103 --- Timeout Policy

Chaque appel externe doit avoir timeout.

Ne pas laisser une requête attendre indéfiniment.

## 29.104 --- Circuit Breakers

Pour :

-   AI provider
-   platform connector
-   billing provider

Si défaillance répétée :

-   stop calls temporairement
-   degrade gracefully
-   alert

## 29.105 --- Graceful Degradation

Exemples :

AI premium indisponible :

→ fallback model si validé.

Analytics indisponible :

→ chatting continue.

Platform send indisponible :

→ ne pas marquer le message comme envoyé.

## 29.106 --- API Security Tests

Tester :

-   changed agency_id
-   changed creator_id
-   guessed resource ID
-   invalid role
-   expired session
-   replayed webhook
-   oversized payload
-   malicious upload metadata

## 29.107 --- Business Rule Tests

Tester :

-   price below minimum
-   discount over limit
-   custom content disabled
-   Full AI disabled
-   follow-up disabled
-   creator override
-   script branch condition
-   human takeover active

## 29.108 --- Event Replay

Prévoir possibilité contrôlée de rejouer certains events internes pour
recovery.

Mais éviter de rejouer directement des actions externes dangereuses sans
idempotency.

## 29.109 --- Dead-letter Handling

Les événements/jobs définitivement échoués doivent aller dans une
queue/vue dédiée.

L'équipe peut :

-   inspect
-   retry
-   discard avec raison

## 29.110 --- No Hidden Side Effects

Une méthode nommée :

``` text
getConversation()
```

ne doit pas envoyer un message ou modifier une vente.

Les side effects doivent être explicites.

## 29.111 --- Audit Side Effects

Actions critiques :

-   AI mode change
-   send paid offer
-   negotiation
-   commission adjustment
-   platform disconnect
-   permission change

→ audit.

## 29.112 --- API Rate Limits

Différencier :

-   user reads
-   user writes
-   AI generation
-   public auth
-   webhooks
-   internal admin

## 29.113 --- Plan Entitlements

Avant feature premium :

``` text
EntitlementService.canUse(agency, feature)
```

Ne pas contrôler uniquement l'affichage frontend.

## 29.114 --- Usage Limits

Si un plan possède des limites :

validation atomique si nécessaire.

Éviter les race conditions permettant de dépasser massivement une
limite.

## 29.115 --- Future Public API

Ne pas construire maintenant une API publique complète.

Mais garder des frontières propres permettra plus tard :

-   partner API
-   webhooks
-   integrations
-   enterprise

## 29.116 --- Future MCP

MCP n'est pas un remplacement automatique des APIs plateforme.

OmniFlow peut utiliser MCP plus tard pour exposer ou consommer certains
outils lorsque pertinent.

Pour les opérations critiques :

utiliser des interfaces contrôlées, authentifiées et adaptées aux
capacités réelles des plateformes.

## 29.117 --- Build Order

Ordre recommandé :

1.  shared schemas/enums
2.  request context/auth
3.  authorization
4.  repositories
5.  core domain services
6.  event contracts
7.  event bus
8.  connectors
9.  AI provider abstraction
10. context builder
11. decision/validator/executor
12. APIs
13. jobs
14. realtime
15. observability
16. contract/integration tests

## 29.118 --- Critère de réussite

Cette architecture est réussie lorsque :

-   le frontend ne contient pas la logique métier critique
-   chaque requête est correctement scopée à une agence
-   les services métier ont des responsabilités claires
-   le LLM ne peut pas contourner les règles backend
-   les scripts, prix et négociations sont validés
-   les connecteurs plateforme sont interchangeables
-   Mock Connector utilise le même contrat
-   les événements sont versionnés et idempotents
-   une transaction peut déclencher plusieurs traitements indépendants
-   les erreurs partielles ne corrompent pas le système
-   Copilot et Full AI utilisent le même cœur métier contrôlé
-   l'API interne Admin est séparée
-   le système reste simple à développer en V1

# THE AI DECIDES.

# THE SYSTEM VALIDATES.

# THE PLATFORM EXECUTES.

------------------------------------------------------------------------

## PARTIE 29 --- VALIDÉE COMME API CONTRACTS, SERVICE LAYER & EVENT SYSTEM

La suite du cahier des charges commence avec :

# PARTIE 30 --- AI EVALUATION FRAMEWORK, BENCHMARK DATASET & CONTINUOUS IMPROVEMENT SYSTEM
