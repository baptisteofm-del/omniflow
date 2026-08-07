# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 41 --- ADMIN BACKOFFICE & INTERNAL OPERATIONS

## 41.1 --- Objectif

OmniFlow doit disposer d'un backoffice interne séparé de l'application
agence.

Ce backoffice sert à exploiter le SaaS :

``` text
MONITOR
SUPPORT
CONTROL
INVESTIGATE
OPERATE
```

Il ne doit jamais devenir un moyen de contourner silencieusement les
règles de sécurité du produit.

------------------------------------------------------------------------

## 41.2 --- Séparation

Distinguer :

``` text
AGENCY APPLICATION
```

et :

``` text
OMNIFLOW INTERNAL ADMIN
```

Routes, permissions et contrôles doivent refléter cette séparation.

------------------------------------------------------------------------

## 41.3 --- Internal Roles

Prévoir des rôles internes explicites.

Exemples :

``` text
SUPER_ADMIN
OPERATIONS
SUPPORT
BILLING_SUPPORT
TECH_SUPPORT
READ_ONLY
```

Ne pas donner automatiquement tous les droits à chaque employé OmniFlow.

------------------------------------------------------------------------

## 41.4 --- Least Privilege

Chaque rôle interne doit disposer du minimum de permissions nécessaire.

------------------------------------------------------------------------

## 41.5 --- Strong Authentication

Les comptes internes sensibles doivent utiliser des protections
renforcées.

Prévoir notamment MFA selon l'infrastructure retenue.

------------------------------------------------------------------------

## 41.6 --- Admin Audit Log

Toute action sensible doit être tracée.

Minimum :

``` text
admin_user
action
target
reason
timestamp
before
after
request_id
```

lorsque pertinent.

------------------------------------------------------------------------

## 41.7 --- Admin Dashboard

Vue synthétique :

-   agencies
-   active creators
-   active users
-   AI usage
-   AI cost
-   platform health
-   billing health
-   incidents
-   support volume
-   Full AI status

------------------------------------------------------------------------

## 41.8 --- Agency Directory

Permettre de rechercher une agence par :

-   name
-   ID
-   owner email
-   billing reference

sans exposer inutilement les données privées dans les résultats.

------------------------------------------------------------------------

## 41.9 --- Agency Detail

Afficher selon permission :

``` text
Account status
Plan
Billing status
Creator count
User count
Connector status
AI usage
Recent incidents
Support tickets
Feature flags
```

------------------------------------------------------------------------

## 41.10 --- No Default Conversation Browsing

Le backoffice ne doit pas donner un accès libre et permanent à toutes
les conversations privées.

L'accès au contenu doit être :

-   nécessaire
-   autorisé
-   audité
-   limité

------------------------------------------------------------------------

## 41.11 --- Support Access

Si un agent support doit inspecter une conversation pour résoudre un
problème :

enregistrer :

-   reason
-   ticket/reference
-   actor
-   time

------------------------------------------------------------------------

## 41.12 --- Impersonation

Éviter l'impersonation complète en V1 si une alternative suffit.

Si elle devient nécessaire :

``` text
Explicit permission
Reason required
Visible impersonation state
Time limit
Audit
No hidden impersonation
```

------------------------------------------------------------------------

## 41.13 --- Account Actions

Actions possibles selon permission :

-   suspend
-   reactivate
-   lock
-   request verification
-   reset specific state

Les actions destructives doivent demander confirmation.

------------------------------------------------------------------------

## 41.14 --- Suspension

Une suspension doit avoir :

``` text
reason
actor
timestamp
scope
```

et ne pas supprimer automatiquement les données.

------------------------------------------------------------------------

## 41.15 --- Creator Administration

Vue :

-   creator status
-   agency
-   AI mode
-   platform connection
-   configuration health
-   usage

------------------------------------------------------------------------

## 41.16 --- User Administration

Vue :

-   user identity
-   agency
-   role
-   status
-   last activity
-   security events

dans les limites légales et nécessaires.

------------------------------------------------------------------------

## 41.17 --- Platform Connector Operations

Backoffice :

``` text
Connected
Disconnected
Degraded
Rate Limited
Auth Expired
```

par agence/créatrice si autorisé.

------------------------------------------------------------------------

## 41.18 --- Connector Health Dashboard

Agrégats :

-   connection success rate
-   webhook failures
-   send failures
-   sync lag
-   rate-limit events

------------------------------------------------------------------------

## 41.19 --- Manual Connector Actions

Actions éventuelles :

-   retry sync
-   reconnect request
-   disable connector

Ne jamais afficher ou copier les secrets en clair.

------------------------------------------------------------------------

## 41.20 --- AI Operations

Vue interne :

-   providers
-   models
-   availability
-   latency
-   error rate
-   cost
-   routing distribution

------------------------------------------------------------------------

## 41.21 --- Model Control

Permettre aux administrateurs autorisés :

-   disable model
-   change routing config
-   activate fallback
-   roll back configuration

via système versionné.

------------------------------------------------------------------------

## 41.22 --- No Hardcoded Emergency Changes

Les changements d'urgence doivent passer par une configuration
contrôlée, pas par modification improvisée du code en production si
évitable.

------------------------------------------------------------------------

## 41.23 --- AI Configuration Versions

Chaque version doit conserver :

``` text
version
created_by
created_at
changes
status
```

------------------------------------------------------------------------

## 41.24 --- AI Rollback

Pouvoir revenir rapidement à une version précédente stable.

------------------------------------------------------------------------

## 41.25 --- Full AI Global Kill Switch

Backoffice doit permettre de désactiver Full AI :

``` text
GLOBAL
AGENCY
CREATOR
```

selon architecture.

------------------------------------------------------------------------

## 41.26 --- Kill Switch Behavior

Lorsqu'activé :

-   aucune nouvelle action autonome interdite
-   état visible
-   événement audité
-   utilisateurs concernés informés si nécessaire

------------------------------------------------------------------------

## 41.27 --- Feature Flags

Gérer :

-   flag
-   scope
-   rollout %
-   agency allowlist
-   creator allowlist
-   status

------------------------------------------------------------------------

## 41.28 --- Feature Flag Audit

Tout changement important de flag doit être tracé.

------------------------------------------------------------------------

## 41.29 --- Billing Operations

Vue interne :

-   subscription
-   invoices
-   payment status
-   commission ledger
-   reconciliation
-   disputes if applicable

------------------------------------------------------------------------

## 41.30 --- Financial Integrity

Le backoffice ne doit pas permettre de modifier arbitrairement un
montant historique sans trace.

------------------------------------------------------------------------

## 41.31 --- Credits / Adjustments

Toute correction :

``` text
amount
reason
actor
reference
timestamp
```

------------------------------------------------------------------------

## 41.32 --- Commission Operations

Voir :

-   eligible transactions
-   commission rate snapshot
-   commission amount
-   billing status
-   reconciliation state

------------------------------------------------------------------------

## 41.33 --- Reconciliation Dashboard

Identifier :

``` text
Matched
Unmatched
Duplicate
Disputed
Missing
```

------------------------------------------------------------------------

## 41.34 --- Refund Handling

Si remboursement impacte commission :

la logique doit être explicite et auditable.

------------------------------------------------------------------------

## 41.35 --- Support Operations

Vue :

-   open tickets
-   critical tickets
-   waiting customer
-   assigned
-   SLA risk if implemented

------------------------------------------------------------------------

## 41.36 --- Incident Operations

Lien avec Partie 31.

Afficher :

-   active incidents
-   severity
-   affected services
-   owner
-   status
-   timeline

------------------------------------------------------------------------

## 41.37 --- Incident Creation

Utilisateurs autorisés peuvent créer un incident à partir :

-   alert
-   ticket
-   manual observation

------------------------------------------------------------------------

## 41.38 --- Incident Linking

Relier :

-   logs
-   alerts
-   support tickets
-   agencies affected

------------------------------------------------------------------------

## 41.39 --- Notification Operations

Vue :

-   failed deliveries
-   spikes
-   critical notifications
-   channel health

------------------------------------------------------------------------

## 41.40 --- Job Operations

Afficher les jobs importants :

``` text
queued
running
failed
retrying
dead-letter
```

------------------------------------------------------------------------

## 41.41 --- Manual Retry

Autoriser retry uniquement si l'opération est idempotente ou protégée.

------------------------------------------------------------------------

## 41.42 --- Dead-Letter Queue

Les jobs définitivement échoués doivent être inspectables.

------------------------------------------------------------------------

## 41.43 --- Audit Search

Recherche dans les logs d'audit par :

-   actor
-   agency
-   action
-   entity
-   date
-   request ID

------------------------------------------------------------------------

## 41.44 --- Security Events

Vue :

-   suspicious login
-   permission failures
-   admin changes
-   credential issues

------------------------------------------------------------------------

## 41.45 --- Secret Management

Aucun secret ne doit être affiché en clair dans le backoffice.

Afficher éventuellement :

``` text
Configured
Missing
Last rotated
```

------------------------------------------------------------------------

## 41.46 --- Environment Health

Afficher statut :

-   database
-   storage
-   AI provider
-   queue
-   billing provider
-   platform connectors

------------------------------------------------------------------------

## 41.47 --- Production vs Staging

Le backoffice doit clairement indiquer l'environnement.

Éviter toute confusion visuelle entre staging et production.

------------------------------------------------------------------------

## 41.48 --- Dangerous Action UX

Pour :

-   suspend agency
-   disable Full AI globally
-   billing adjustment
-   destructive data action

demander :

``` text
Confirmation
Reason
```

et éventuellement re-authentication.

------------------------------------------------------------------------

## 41.49 --- No Mass Action by Default

Éviter les actions bulk destructives dans les premières versions.

------------------------------------------------------------------------

## 41.50 --- Internal Notes

Permettre des notes internes sur une agence si nécessaire.

Ne pas y stocker de secrets.

------------------------------------------------------------------------

## 41.51 --- Agency Tags

Tags internes possibles :

``` text
PILOT
VIP
TEST
RISK
INTEGRATION_BETA
```

------------------------------------------------------------------------

## 41.52 --- Pilot Management

Identifier les agences pilotes.

Afficher :

-   enabled features
-   benchmark cohort
-   feedback status
-   incidents

------------------------------------------------------------------------

## 41.53 --- Beta Rollout

Feature flags permettent :

``` text
Internal
↓
Selected Pilot
↓
Limited Rollout
↓
General Availability
```

------------------------------------------------------------------------

## 41.54 --- Internal Metrics

Backoffice doit centraliser les métriques produit principales.

Exemples :

``` text
MRR
Active Agencies
Active Creators
AI Conversations
AI Cost
Commission Revenue
Full AI Adoption
```

Les métriques financières doivent provenir de sources fiables.

------------------------------------------------------------------------

## 41.55 --- Product Funnel

Afficher :

``` text
Signup
Activation
First AI Value
Platform Connected
First Sale
Full AI Enabled
```

selon Partie 39.

------------------------------------------------------------------------

## 41.56 --- Retention

Suivre :

-   active agencies
-   churn
-   usage decline
-   creator decline

------------------------------------------------------------------------

## 41.57 --- AI Quality Operations

Vue :

-   negative feedback
-   takeover rate
-   Copilot edit rate
-   regeneration rate
-   critical AI failures

------------------------------------------------------------------------

## 41.58 --- Benchmark Operations

Voir les derniers benchmarks :

-   candidate
-   baseline
-   quality
-   cost
-   latency
-   release recommendation

------------------------------------------------------------------------

## 41.59 --- Release Management

Afficher version production :

-   application
-   AI config
-   database migration
-   connector version

------------------------------------------------------------------------

## 41.60 --- Release Notes

Lier chaque release significative à :

-   changes
-   migration
-   feature flags
-   rollback

------------------------------------------------------------------------

## 41.61 --- Change History

Conserver historique des changements opérationnels majeurs.

------------------------------------------------------------------------

## 41.62 --- Admin Notifications

Les opérateurs OmniFlow doivent recevoir les alertes internes critiques.

Ne pas les mélanger avec les notifications agence.

------------------------------------------------------------------------

## 41.63 --- Admin Search

Recherche globale contrôlée sur :

-   agencies
-   users
-   creators
-   tickets
-   incidents
-   transactions

Pas de recherche libre sur contenu privé sans justification.

------------------------------------------------------------------------

## 41.64 --- Data Export

Les exports administratifs doivent être :

-   permissioned
-   audited
-   limited
-   secure

------------------------------------------------------------------------

## 41.65 --- Data Deletion Requests

Créer un workflow contrôlé :

``` text
Request
↓
Verify
↓
Assess retention/legal requirements
↓
Execute
↓
Audit
```

------------------------------------------------------------------------

## 41.66 --- No Direct SQL Operations in UI

Le backoffice ne doit pas devenir un éditeur SQL production.

------------------------------------------------------------------------

## 41.67 --- Operational Runbooks

Créer des runbooks pour :

-   AI provider outage
-   connector outage
-   billing incident
-   queue backlog
-   Full AI emergency
-   database degradation

------------------------------------------------------------------------

## 41.68 --- Runbook Access

Les opérateurs doivent pouvoir ouvrir le runbook depuis
l'alerte/incident concerné.

------------------------------------------------------------------------

## 41.69 --- Internal Permissions Matrix

Documenter chaque rôle interne.

Exemple :

``` text
View Billing
Adjust Billing
View Support
View Sensitive Conversation
Manage Feature Flags
Manage AI Routing
Suspend Agency
```

------------------------------------------------------------------------

## 41.70 --- Permission Review

Réviser régulièrement les droits internes.

------------------------------------------------------------------------

## 41.71 --- Employee Offboarding

La suppression d'un accès interne doit être immédiate et auditable.

------------------------------------------------------------------------

## 41.72 --- Session Management

Pouvoir révoquer les sessions internes.

------------------------------------------------------------------------

## 41.73 --- Admin API

Les endpoints admin doivent être séparés et protégés.

Ne pas se fier uniquement à une route frontend cachée.

------------------------------------------------------------------------

## 41.74 --- Rate Limits

Les endpoints admin sensibles peuvent avoir des protections
supplémentaires.

------------------------------------------------------------------------

## 41.75 --- CSRF / Session Security

Appliquer les protections adaptées à la stack retenue.

------------------------------------------------------------------------

## 41.76 --- Audit Immutability

Les logs d'audit critiques ne doivent pas être modifiables depuis le
backoffice standard.

------------------------------------------------------------------------

## 41.77 --- Admin Performance

Les pages internes peuvent être plus fonctionnelles que marketing.

Priorité :

``` text
CLARITY
RELIABILITY
TRACEABILITY
```

------------------------------------------------------------------------

## 41.78 --- Internal UX

Utiliser :

-   tables
-   filters
-   status badges
-   timelines
-   confirmation dialogs

------------------------------------------------------------------------

## 41.79 --- Sensitive Data Masking

Masquer les données sensibles lorsque leur affichage complet n'est pas
nécessaire.

------------------------------------------------------------------------

## 41.80 --- Admin Mobile

Le backoffice peut être desktop-first.

Les actions d'urgence critiques doivent idéalement rester accessibles de
manière sûre.

------------------------------------------------------------------------

## 41.81 --- MVP Backoffice Scope

P0/P1 :

``` text
Admin auth
Agency directory
Agency status
Connector health
AI health
Billing status
Support tickets
Incidents
Feature flags
Full AI kill switch
Audit logs
```

------------------------------------------------------------------------

## 41.82 --- Secondary Scope

P2 :

``` text
Advanced metrics
Customer health
Benchmark UI
Reconciliation tools
Pilot management
```

------------------------------------------------------------------------

## 41.83 --- Future Scope

P3 :

``` text
Advanced internal automation
Sophisticated rollout orchestration
Dedicated data operations tooling
```

------------------------------------------------------------------------

## 41.84 --- Testing

Tester :

-   internal RBAC
-   tenant access boundaries
-   audit creation
-   kill switch
-   feature flag
-   suspension
-   billing adjustment
-   support access
-   sensitive data masking

------------------------------------------------------------------------

## 41.85 --- E2E --- Kill Switch

``` text
Critical AI incident
↓
Authorized admin opens operations
↓
Disables Full AI
↓
New autonomous sends stop
↓
Audit event created
↓
Affected state visible
```

------------------------------------------------------------------------

## 41.86 --- E2E --- Support Investigation

``` text
Ticket
↓
Support opens agency
↓
Sees allowed diagnostics
↓
Requests sensitive access if needed
↓
Reason audited
↓
Issue resolved
```

------------------------------------------------------------------------

## 41.87 --- E2E --- Billing Adjustment

``` text
Verified billing issue
↓
Authorized user
↓
Adjustment
↓
Reason
↓
Ledger entry
↓
Audit
```

------------------------------------------------------------------------

## 41.88 --- Claude Code Deliverables

Créer :

``` text
/docs/admin/ADMIN_BACKOFFICE.md
/docs/admin/INTERNAL_RBAC.md
/docs/operations/RUNBOOK_INDEX.md
```

------------------------------------------------------------------------

## 41.89 --- ADMIN_BACKOFFICE.md

Documenter :

-   routes
-   modules
-   sensitive actions
-   agency access
-   operations
-   audit

------------------------------------------------------------------------

## 41.90 --- INTERNAL_RBAC.md

Documenter :

-   internal roles
-   permissions
-   restricted data
-   sensitive operations

------------------------------------------------------------------------

## 41.91 --- RUNBOOK_INDEX.md

Indexer les runbooks opérationnels et leurs triggers.

------------------------------------------------------------------------

## 41.92 --- Acceptance Criteria

Cette partie est réussie lorsque :

-   OmniFlow peut être exploité sans accès manuel constant à la base
-   les opérateurs voient l'état des systèmes critiques
-   les droits internes sont limités
-   Full AI peut être stoppé rapidement
-   les changements sensibles sont audités
-   le support dispose des diagnostics nécessaires
-   billing et commissions restent traçables
-   les incidents sont centralisés
-   les secrets ne sont jamais exposés
-   le backoffice ne contourne pas la sécurité tenant

------------------------------------------------------------------------

## 41.93 --- Final Principle

Le backoffice OmniFlow doit donner à l'équipe :

# CONTROL WITHOUT UNCONTROLLED ACCESS.

L'objectif n'est pas d'avoir un super-admin capable de tout faire sans
trace.

L'objectif est :

``` text
SEE
UNDERSTAND
ACT
AUDIT
RECOVER
```

------------------------------------------------------------------------

## PARTIE 41 --- VALIDÉE COMME ADMIN BACKOFFICE & INTERNAL OPERATIONS

La suite du cahier des charges commence avec :

# PARTIE 42 --- LEGAL, PRIVACY, DATA GOVERNANCE & COMPLIANCE
