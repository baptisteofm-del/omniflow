# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 27 --- OMNIFLOW ADMIN, INTERNAL CONTROL CENTER & SUPPORT OPERATIONS

## 27.1 --- Objectif

OmniFlow doit posséder un espace interne distinct de l'application
client.

Cet espace est réservé à l'équipe OmniFlow et sert à :

-   surveiller la plateforme
-   gérer les agences
-   contrôler Full AI
-   suivre les incidents
-   surveiller les intégrations
-   suivre les coûts IA
-   suivre la facturation
-   diagnostiquer les problèmes
-   gérer le support
-   sécuriser les opérations

Nom conceptuel :

# OMNIFLOW CONTROL CENTER

Il ne doit jamais être accessible aux utilisateurs agence standards.

## 27.2 --- Séparation stricte

Séparer :

``` text
Customer Application
```

et :

``` text
OmniFlow Internal Admin
```

Ne pas considérer un `agency owner` comme un administrateur OmniFlow.

## 27.3 --- Internal Roles

Prévoir des rôles internes.

Exemples :

### SUPER ADMIN

Accès maximal.

### SUPPORT

Accès aux outils nécessaires au support.

### AI OPS

Accès aux performances IA, incidents et déploiements.

### BILLING OPS

Accès aux informations de facturation nécessaires.

### READ ONLY

Observation interne sans modification.

Les permissions doivent être granulaires.

## 27.4 --- Internal Permission Examples

Exemples :

``` text
internal.agencies.view
internal.agencies.manage

internal.ai.view
internal.ai.pause
internal.ai.rollout

internal.integrations.view
internal.integrations.manage

internal.billing.view
internal.billing.manage

internal.support.view
internal.support.manage

internal.audit.view
```

## 27.5 --- Admin Authentication

L'espace Admin nécessite une protection renforcée.

Prévoir :

-   authentification forte
-   MFA recommandé/obligatoire
-   sessions sécurisées
-   audit complet
-   restrictions supplémentaires si nécessaire

## 27.6 --- Admin Dashboard

Page principale :

``` text
/admin
```

Afficher les indicateurs opérationnels essentiels :

-   active agencies
-   active creators
-   conversations processed
-   Full AI conversations
-   AI errors
-   connector health
-   failed jobs
-   billing issues
-   MRR
-   variable revenue
-   AI cost
-   system incidents

## 27.7 --- System Status

Bloc :

# SYSTEM STATUS

Services :

-   App
-   Database
-   Queue
-   AI Providers
-   OnlyFans Connector
-   MYM Connector
-   Billing
-   Storage

Statuts :

-   Operational
-   Degraded
-   Down
-   Unknown

## 27.8 --- Agency Directory

Route :

``` text
/admin/agencies
```

Table :

-   agency
-   plan
-   status
-   creators
-   monthly eligible revenue
-   Full AI status
-   billing status
-   integration health
-   last active
-   risk flags

## 27.9 --- Agency Search

Recherche par :

-   agency name
-   owner email
-   creator
-   external billing customer ID

Appliquer les permissions internes.

## 27.10 --- Agency Detail

Route :

``` text
/admin/agencies/:id
```

Sections :

-   Overview
-   Creators
-   Integrations
-   AI
-   Usage
-   Billing
-   Incidents
-   Audit
-   Support Notes

## 27.11 --- Agency Health Score

Créer éventuellement un indicateur interne.

Basé sur :

-   integration health
-   billing
-   AI error rate
-   activity
-   unresolved incidents

Ne pas confondre avec un score commercial client.

## 27.12 --- Agency Status

Statuts :

-   ACTIVE
-   TRIAL
-   PAST_DUE
-   SUSPENDED
-   CANCELED
-   INTERNAL
-   DEMO

Les changements manuels doivent être audités.

## 27.13 --- Internal Agency Actions

Selon permission :

-   pause Full AI
-   disable proactive actions
-   reconnect assistance
-   resend invitation
-   suspend workspace
-   reactivate
-   inspect billing state
-   trigger safe resync
-   open support case

Les actions destructives demandent confirmation.

## 27.14 --- No Silent Data Editing

L'équipe support ne doit pas modifier silencieusement les données métier
d'une agence.

Toute correction manuelle importante doit :

-   être justifiée
-   être auditée
-   conserver before/after lorsque pertinent

## 27.15 --- Impersonation

Éviter l'impersonation complète par défaut.

Si elle devient nécessaire pour le support :

-   permission dédiée
-   bannière visible
-   durée limitée
-   audit
-   aucune action financière sensible sans contrôle supplémentaire

Préférer un mode support en lecture lorsque possible.

## 27.16 --- Support View

Créer un mode permettant de voir l'état de l'application tel que
l'agence le voit, sans accéder inutilement aux contenus sensibles.

Objectif :

diagnostiquer UX, permissions et configuration.

## 27.17 --- Sensitive Content Protection

Les conversations et médias peuvent être hautement sensibles.

L'accès interne doit suivre :

# LEAST PRIVILEGE.

Un agent support ne doit pas voir le contenu brut s'il peut résoudre le
problème avec :

-   metadata
-   error code
-   configuration
-   logs techniques

## 27.18 --- Content Access Audit

Toute ouverture interne de contenu sensible, si autorisée, doit pouvoir
être auditée.

Stocker :

-   internal user
-   agency
-   resource
-   reason
-   timestamp

## 27.19 --- AI Operations Dashboard

Route :

``` text
/admin/ai
```

Afficher :

-   total AI requests
-   model distribution
-   success rate
-   latency
-   cost
-   structured output failures
-   fallback rate
-   escalations
-   Full AI pauses
-   rule violations

## 27.20 --- Model Performance

Par modèle :

-   tasks
-   average latency
-   cost
-   failure rate
-   benchmark score
-   production quality indicators

Permet de vérifier si un modèle plus cher apporte réellement plus de
valeur.

## 27.21 --- AI Task Breakdown

Catégories :

-   classification
-   reply
-   memory extraction
-   fan scoring
-   sales decision
-   negotiation
-   follow-up
-   media selection

Suivre coût et qualité par tâche.

## 27.22 --- AI Version Registry

Créer une vue des versions :

``` text
Decision Engine v1
Prompt v7
Memory Extractor v3
Model Router v2
```

Chaque version doit être traçable.

## 27.23 --- AI Release Status

Statuts :

-   INTERNAL
-   TEST
-   PILOT
-   PARTIAL
-   PRODUCTION
-   ROLLED_BACK

## 27.24 --- AI Rollout

Permettre un rollout progressif :

-   internal only
-   selected agencies
-   percentage
-   all agencies

Ne pas basculer toute la production sur une nouvelle version risquée
immédiatement.

## 27.25 --- AI Rollback

Pouvoir revenir rapidement à une version précédente validée.

Le rollback doit être simple et audité.

## 27.26 --- AI Kill Switch

Contrôles internes :

-   pause Full AI globally
-   pause sales actions
-   pause negotiation
-   pause follow-ups
-   pause specific model
-   pause specific agency

Ces contrôles sont critiques.

## 27.27 --- Kill Switch UX

Chaque kill switch doit indiquer :

-   current state
-   impact
-   activated by
-   activated at
-   reason

Réactivation également auditée.

## 27.28 --- Incident Center

Route :

``` text
/admin/incidents
```

Un incident peut concerner :

-   AI
-   platform
-   billing
-   database
-   queue
-   security
-   storage

## 27.29 --- Incident Severity

### SEV 1

Risque majeur :

-   data leak
-   unauthorized actions
-   incorrect widespread financial actions
-   major outage

### SEV 2

Fonction critique fortement dégradée.

### SEV 3

Incident limité.

### SEV 4

Problème mineur.

## 27.30 --- Incident Record

Stocker :

-   title
-   severity
-   status
-   affected services
-   affected agencies
-   started_at
-   detected_at
-   owner
-   mitigation
-   root cause
-   resolved_at

## 27.31 --- Incident Workflow

``` text
DETECTED
↓
INVESTIGATING
↓
MITIGATING
↓
MONITORING
↓
RESOLVED
↓
POSTMORTEM
```

## 27.32 --- Automated Incident Signals

Créer des alertes sur :

-   AI error spike
-   duplicate sends
-   connector failures
-   queue backlog
-   unusual commission amount
-   payment webhook failures
-   database errors
-   abnormal latency

## 27.33 --- Platform Operations

Route :

``` text
/admin/integrations
```

Afficher par plateforme :

-   connection count
-   healthy
-   degraded
-   disconnected
-   sync latency
-   API errors
-   rate limit issues

## 27.34 --- Connection Detail

Pour une connexion :

-   agency
-   creator
-   platform
-   status
-   capabilities
-   last successful sync
-   last error
-   credential expiry metadata
-   recent events

Ne jamais afficher le secret brut.

## 27.35 --- Safe Resync

Permettre une action :

**Resync**

Elle doit être :

-   idempotente
-   scoped
-   auditée
-   protégée contre les boucles

## 27.36 --- Job Operations

Route :

``` text
/admin/jobs
```

Afficher :

-   queue
-   pending
-   running
-   failed
-   retries
-   dead-letter

Filtres :

-   agency
-   job type
-   status
-   date

## 27.37 --- Failed Job Detail

Afficher :

-   job type
-   resource
-   attempts
-   sanitized error
-   timestamps
-   retry eligibility

Action :

**Retry**

uniquement si sûre.

## 27.38 --- Billing Operations

Route :

``` text
/admin/billing
```

Afficher :

-   subscription MRR
-   variable revenue
-   failed payments
-   past due agencies
-   commission pending
-   reconciliation errors
-   refunds/credits

## 27.39 --- Commission Monitoring

Détecter :

-   unusual spikes
-   duplicate transaction
-   missing transaction mapping
-   negative reconciliation
-   currency issue
-   unbilled eligible revenue

## 27.40 --- Agency Billing Detail

Afficher :

-   subscription
-   commission rate
-   eligible revenue
-   ledger
-   invoices
-   payments
-   credits
-   status

Toute modification manuelle doit être auditable.

## 27.41 --- AI Cost Dashboard

Afficher :

-   total AI cost
-   cost per agency
-   cost per creator
-   cost per conversation
-   cost per task
-   cost per model
-   premium routing rate

## 27.42 --- Margin Dashboard

Calcul interne :

``` text
Subscription Revenue
+
Variable Revenue
-
AI Cost
-
Infrastructure Allocation
-
Payment Costs
=
Estimated Contribution
```

Par agence et global.

## 27.43 --- Cost Alerts

Créer des alertes :

-   agency AI cost anomaly
-   token spike
-   premium model overuse
-   retry loop
-   context size anomaly

## 27.44 --- Usage Monitoring

Suivre :

-   conversations
-   messages
-   AI calls
-   storage
-   media
-   creators
-   seats
-   Full AI usage

Permet de détecter bugs et abus.

## 27.45 --- Support Cases

Créer un système léger interne ou prévoir intégration future.

Objet :

``` text
SupportCase
```

Champs :

-   agency
-   requester
-   category
-   priority
-   status
-   assigned_to
-   description
-   internal notes
-   created_at
-   resolved_at

## 27.46 --- Support Categories

-   AI Quality
-   Billing
-   Integration
-   Account
-   Script
-   Media
-   Bug
-   Feature Request
-   Other

## 27.47 --- Support Priority

Prioriser selon :

-   business impact
-   Full AI impact
-   financial impact
-   number of users affected
-   security

## 27.48 --- Internal Notes

Les notes support :

-   internes
-   auditables
-   séparées des messages client

Ne jamais exposer accidentellement les notes internes au client.

## 27.49 --- AI Quality Report

Depuis une conversation, l'agence peut signaler :

-   bad reply
-   wrong decision
-   wrong memory
-   bad timing
-   pricing issue
-   other

Créer une entrée dans la queue AI Quality.

## 27.50 --- AI Quality Queue

Route :

``` text
/admin/ai/quality
```

Afficher :

-   report
-   agency
-   creator
-   task
-   AI version
-   model
-   outcome
-   severity

## 27.51 --- Review Workflow

Reviewer interne peut :

-   confirm issue
-   reject report
-   categorize
-   add to benchmark candidate
-   mark fixed
-   link to release

## 27.52 --- Benchmark Candidate

Un cas réel intéressant peut être ajouté comme candidat au Golden Set.

Avant ajout :

-   anonymiser/minimiser les données si nécessaire
-   vérifier pertinence
-   définir expected behavior
-   faire valider

## 27.53 --- Benchmark Dashboard

Afficher :

-   current benchmark version
-   test count
-   category scores
-   current production version
-   previous version
-   regressions
-   improvements

## 27.54 --- Release Gate

Une nouvelle version IA ne peut passer production que si les critères
configurés sont respectés.

Exemples :

-   no critical rule regression
-   pricing compliance = required threshold
-   memory accuracy threshold
-   overall quality threshold

## 27.55 --- Feature Flags Admin

Route :

``` text
/admin/features
```

Permet :

-   enable globally
-   disable globally
-   selected agencies
-   rollout percentage

Exemples :

-   Full AI
-   Auto Follow-up
-   New Negotiation Engine
-   New Memory System

## 27.56 --- Feature Flag Safety

Les flags critiques doivent :

-   être server-side
-   avoir fallback
-   être audités

Ne pas dépendre uniquement d'un flag frontend.

## 27.57 --- Agency Configuration Inspector

Créer une vue support montrant :

-   inherited agency settings
-   creator overrides
-   AI mode
-   pricing rules
-   negotiation
-   script
-   platform capabilities

Très utile pour comprendre pourquoi l'IA a agi d'une certaine manière.

## 27.58 --- Decision Inspector

Pour une action AI :

afficher :

-   structured input summary
-   relevant settings
-   selected strategy
-   model
-   confidence
-   validator result
-   final action
-   outcome

Ne pas afficher de chain-of-thought privée.

## 27.59 --- Audit Explorer

Route :

``` text
/admin/audit
```

Recherche globale :

-   agency
-   internal user
-   customer user
-   action
-   resource
-   date

## 27.60 --- Security Events

Créer une catégorie dédiée :

-   suspicious login
-   repeated permission denial
-   token misuse
-   webhook signature failure
-   unusual admin access
-   excessive export

## 27.61 --- Security Response

Pour un événement critique :

actions possibles :

-   revoke session
-   suspend user
-   suspend agency
-   rotate secret
-   disable connector
-   pause Full AI

Selon permissions.

## 27.62 --- Data Export Operations

Si une agence demande export :

le système doit pouvoir générer un export autorisé.

Tracer :

-   requester
-   scope
-   generated_at
-   downloaded/accessed
-   expiration

## 27.63 --- Data Deletion Operations

Pour suppression :

workflow contrôlé.

Étapes possibles :

-   request
-   eligibility check
-   retention check
-   confirmation
-   scheduled deletion
-   completion log

Ne pas permettre un delete arbitraire depuis l'Admin.

## 27.64 --- Notifications internes

L'équipe OmniFlow peut recevoir des alertes pour :

-   SEV1/SEV2
-   connector outage
-   AI error spike
-   failed billing
-   queue backlog
-   cost anomaly

Les canaux pourront être définis plus tard.

## 27.65 --- Daily Operations View

Créer une vue concise :

# TODAY

-   incidents
-   failed jobs
-   integrations down
-   past due high-volume agencies
-   AI quality flags
-   cost anomalies

Objectif :

savoir en quelques minutes ce qui nécessite une action.

## 27.66 --- Support SLA Future-ready

Prévoir :

-   priority
-   first response time
-   resolution time

Particulièrement utile pour future offre Enterprise.

## 27.67 --- Internal Search

Recherche globale Admin :

-   agency
-   user
-   creator
-   transaction
-   conversation ID
-   invoice
-   support case

Les résultats doivent respecter les permissions internes.

## 27.68 --- Internal Analytics

Suivre :

-   agency acquisition
-   activation
-   conversion to paid
-   retention
-   churn
-   expansion
-   Full AI adoption
-   support volume
-   AI quality

## 27.69 --- Churn Intelligence

Afficher :

-   cancellations
-   reasons
-   plan
-   revenue
-   usage before cancellation
-   AI quality reports
-   integration issues

Permet de comprendre les causes réelles.

## 27.70 --- Retention Signals

Signaux possibles :

-   usage drop
-   integration disconnected
-   Full AI disabled
-   repeated bad AI reports
-   billing failure
-   no creator active

Créer un risque interne, pas une vérité absolue.

## 27.71 --- Internal Customer Timeline

Sur Agency Detail :

timeline :

``` text
Signed up
Subscribed
Creator added
Platform connected
First AI conversation
Full AI activated
First sale
Support case
Plan change
Cancellation
```

Très utile pour support et Customer Success.

## 27.72 --- Admin UI Design

L'espace Admin doit rester cohérent avec OmniFlow mais plus
opérationnel.

Priorité :

-   information
-   rapidité
-   diagnostic
-   sécurité

Moins d'animations que la landing.

## 27.73 --- Dangerous Action Design

Actions dangereuses :

-   rouge / warning approprié
-   confirmation
-   impact text
-   reason field si nécessaire

Exemples :

-   Suspend Agency
-   Disable Full AI
-   Force Disconnect
-   Issue Credit

## 27.74 --- Admin Mobile

Pas priorité V1.

Mais les alertes critiques et actions d'urgence importantes doivent
rester utilisables sur mobile si possible.

## 27.75 --- Admin Performance

Les pages globales peuvent traiter beaucoup de données.

Utiliser :

-   pagination
-   indexed queries
-   aggregates
-   background analytics

Ne pas charger toutes les conversations de toutes les agences.

## 27.76 --- Privacy by Default

Les tableaux globaux doivent privilégier :

-   metadata
-   metrics
-   IDs

et éviter d'afficher automatiquement le contenu intime des
conversations.

## 27.77 --- Production vs Demo

Les comptes :

-   INTERNAL
-   DEMO
-   TEST

doivent être identifiables.

Les exclure des KPI business lorsque nécessaire.

## 27.78 --- Sandbox Tools

Créer des outils internes de test :

-   simulate incoming message
-   simulate purchase
-   simulate connector error
-   simulate failed payment
-   simulate follow-up

Uniquement dans environnements appropriés.

## 27.79 --- No Production Simulation Accident

Les outils de simulation doivent être fortement séparés de production.

Aucun bouton de simulation ne doit pouvoir envoyer accidentellement un
événement réel vers une plateforme client.

## 27.80 --- Operational Runbooks

Créer dans :

``` text
/docs/runbooks/
```

au minimum :

``` text
AI_PROVIDER_OUTAGE.md
PLATFORM_CONNECTOR_OUTAGE.md
BILLING_FAILURE.md
DATABASE_INCIDENT.md
FULL_AI_EMERGENCY_STOP.md
DATA_SECURITY_INCIDENT.md
```

## 27.81 --- Runbook Format

Chaque runbook :

-   symptoms
-   detection
-   immediate actions
-   mitigation
-   communication
-   recovery
-   post-incident steps

## 27.82 --- Full AI Emergency Stop

Documenter précisément :

1.  activate kill switch
2.  stop queued autonomous actions
3.  preserve incoming messages
4.  notify affected agencies if required
5.  diagnose
6.  validate fix
7.  staged restart

## 27.83 --- Queue Drain Strategy

Lors d'un incident :

ne pas envoyer aveuglément toutes les anciennes actions après
rétablissement.

Revalider :

-   context
-   timing
-   fan response
-   pricing
-   eligibility

## 27.84 --- Support Diagnostics Bundle

Prévoir un résumé générable pour un incident :

-   agency
-   creator
-   platform status
-   relevant IDs
-   recent errors
-   AI version
-   app version
-   timestamps

Sans secrets.

## 27.85 --- Admin Audit Requirement

Toutes les actions internes sensibles doivent générer un audit event.

Un administrateur OmniFlow ne doit pas être « invisible ».

## 27.86 --- Production Access Principle

Limiter l'accès production au strict nécessaire.

Éviter les credentials partagés.

Chaque membre interne doit avoir son propre accès.

## 27.87 --- Internal Account Offboarding

Lorsqu'un membre OmniFlow quitte l'équipe :

-   revoke sessions
-   remove permissions
-   rotate shared secrets si nécessaire
-   audit completion

## 27.88 --- Admin Testing

Tester :

-   unauthorized customer tries `/admin`
-   support user tries billing modification
-   read-only tries kill switch
-   internal user opens another permission scope
-   admin action is audited
-   suspended admin loses access

## 27.89 --- Control Center Build Order

Ordre recommandé :

1.  Internal auth/roles
2.  Admin dashboard
3.  Agency directory
4.  Agency detail
5.  System health
6.  AI Ops
7.  Integrations Ops
8.  Billing Ops
9.  Jobs
10. Incident Center
11. AI Quality
12. Feature Flags
13. Audit
14. Support tools
15. Runbooks

## 27.90 --- V1 Scope

Ne pas transformer le Control Center en énorme CRM interne.

Construire uniquement ce qui permet :

-   opérer
-   diagnostiquer
-   sécuriser
-   supporter
-   améliorer l'IA

## 27.91 --- Critère de réussite

Le Control Center est réussi lorsque :

-   OmniFlow peut surveiller toutes les agences sans mélanger leurs
    données
-   l'équipe détecte rapidement les incidents
-   Full AI peut être stoppé globalement ou par agence
-   les nouvelles versions IA peuvent être déployées progressivement
-   les coûts IA sont visibles
-   les intégrations défaillantes sont identifiables
-   les commissions et paiements peuvent être audités
-   les mauvais cas IA peuvent rejoindre le benchmark
-   le support peut diagnostiquer sans accès excessif aux contenus
    sensibles
-   chaque action interne importante est auditée
-   des runbooks existent pour les incidents critiques

# AUTONOMOUS AI REQUIRES HUMAN OPERATIONAL CONTROL.

------------------------------------------------------------------------

## PARTIE 27 --- VALIDÉE COMME SPÉCIFICATION DE OMNIFLOW ADMIN, INTERNAL CONTROL CENTER & SUPPORT OPERATIONS

La suite du cahier des charges commence avec :

# PARTIE 28 --- DATA MODEL, ENTITY RELATIONSHIPS & DATABASE SCHEMA BLUEPRINT
