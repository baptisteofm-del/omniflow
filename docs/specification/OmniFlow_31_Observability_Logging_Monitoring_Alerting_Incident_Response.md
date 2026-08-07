# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 31 --- OBSERVABILITY, LOGGING, MONITORING, ALERTING & INCIDENT RESPONSE

## 31.1 --- Objectif

OmniFlow exécute des actions conversationnelles, commerciales et
financières potentiellement autonomes.

Il doit donc être possible de comprendre rapidement :

-   ce qui s'est passé
-   pour quelle agence
-   pour quelle créatrice
-   dans quelle conversation
-   quelle version IA a décidé
-   quelle action a été validée
-   quelle action a réellement été exécutée
-   si la plateforme externe a répondu
-   combien l'opération a coûté
-   si une erreur a eu un impact client

Principe :

# IF OMNIFLOW CANNOT EXPLAIN WHAT HAPPENED, IT IS NOT READY FOR FULL AI.

## 31.2 --- Les 5 piliers d'observabilité

OmniFlow doit couvrir :

``` text
LOGS
METRICS
TRACES
ALERTS
AUDIT
```

Ces éléments sont complémentaires.

## 31.3 --- Logs

Les logs servent à diagnostiquer les événements techniques et métier.

Ils doivent être :

-   structurés
-   horodatés
-   filtrables
-   corrélables
-   sans secrets
-   suffisamment détaillés

Éviter les logs texte impossibles à exploiter.

## 31.4 --- Structured Logging

Format conceptuel :

``` json
{
  "level": "info",
  "event": "ai_action_executed",
  "request_id": "...",
  "agency_id": "...",
  "creator_id": "...",
  "conversation_id": "...",
  "ai_decision_id": "...",
  "action_type": "SEND_PAID_OFFER",
  "timestamp": "..."
}
```

## 31.5 --- Correlation IDs

Propager lorsque pertinent :

``` text
request_id
trace_id
event_id
job_id
agency_id
creator_id
conversation_id
message_id
ai_decision_id
transaction_id
```

Cela permet de reconstruire un workflow complet.

## 31.6 --- Log Levels

Utiliser une convention :

``` text
DEBUG
INFO
WARN
ERROR
FATAL
```

Production ne doit pas être noyée par des logs DEBUG permanents.

## 31.7 --- Sensitive Data

Ne jamais logger en clair :

-   passwords
-   tokens
-   API keys
-   session secrets
-   billing secrets
-   platform credentials
-   private signed URLs

## 31.8 --- Conversation Content

Ne pas enregistrer automatiquement le texte intégral de toutes les
conversations dans les logs techniques.

Les conversations existent dans leur stockage métier sécurisé.

Les logs doivent privilégier :

-   IDs
-   state
-   action
-   error code
-   metadata minimale

## 31.9 --- AI Logs

Pour chaque appel IA important, tracer :

-   task type
-   provider
-   model
-   prompt version
-   router version
-   context size
-   latency
-   token usage
-   estimated cost
-   status
-   retry count

## 31.10 --- Prompt Privacy

Ne pas envoyer les prompts complets contenant des données sensibles dans
un outil de monitoring tiers sans nécessité et garanties appropriées.

Préférer :

-   prompt version
-   hashes/références
-   metadata

## 31.11 --- AI Decision Trace

Pour chaque décision Full AI :

``` text
Inbound Message
↓
Context Build
↓
Model Route
↓
AI Decision
↓
Validator
↓
Approval State
↓
Executor
↓
Platform Result
↓
Outcome
```

Chaque étape doit être corrélable.

## 31.12 --- Business Logs

Événements importants :

``` text
creator_created
platform_connected
conversation_takeover
script_started
offer_sent
offer_purchased
negotiation_started
follow_up_sent
commission_created
plan_changed
```

## 31.13 --- Security Logs

Tracer :

-   login failures
-   suspicious access
-   permission denials
-   admin actions
-   session revocation
-   webhook signature failure
-   secret/config changes
-   repeated unauthorized resource access

## 31.14 --- Audit vs Logs

Ne pas confondre.

### LOG

Diagnostic opérationnel.

### AUDIT

Preuve durable d'une action importante.

Les logs peuvent avoir une rétention différente.

L'audit critique doit être conservé selon la politique définie.

## 31.15 --- Metrics

Les métriques doivent couvrir au minimum :

``` text
APPLICATION
DATABASE
QUEUE
AI
CONNECTORS
BUSINESS
BILLING
SECURITY
```

## 31.16 --- Application Metrics

Suivre :

-   request count
-   error rate
-   response latency
-   active sessions
-   failed actions
-   server errors

## 31.17 --- Database Metrics

Suivre :

-   query latency
-   connection usage
-   slow queries
-   lock contention
-   storage
-   failed queries
-   replication/backup health selon infrastructure

## 31.18 --- Queue Metrics

Suivre :

-   queue depth
-   oldest pending job
-   processing time
-   failed jobs
-   retries
-   dead-letter count

## 31.19 --- AI Metrics

Suivre :

-   calls
-   errors
-   latency
-   tokens
-   cost
-   model distribution
-   fallback rate
-   structured output failure
-   validation rejection
-   escalation

## 31.20 --- Connector Metrics

Par plateforme :

-   connected accounts
-   sync success
-   sync failure
-   send success
-   send failure
-   transaction sync delay
-   rate limits
-   reconnect rate

## 31.21 --- Business Metrics

Suivre :

-   conversations
-   messages
-   offers
-   purchases
-   conversion
-   AI-attributed revenue
-   script performance
-   follow-up recovery
-   Full AI usage

## 31.22 --- Billing Metrics

Suivre :

-   subscription revenue
-   variable commission
-   failed payments
-   past due
-   webhook failures
-   reconciliation differences

## 31.23 --- Security Metrics

Suivre :

-   failed logins
-   permission denials
-   suspicious events
-   webhook signature failures
-   internal admin sensitive actions

## 31.24 --- Tracing

Utiliser distributed tracing si l'infrastructure le justifie.

Même en modular monolith, tracer les workflows complexes peut être
utile.

Exemple :

``` text
HTTP request
→ service
→ AI provider
→ queue
→ connector
```

## 31.25 --- Trace Sampling

Ne pas nécessairement conserver 100 % des traces détaillées à grande
échelle.

Mais conserver davantage pour :

-   errors
-   Full AI critical actions
-   billing
-   incidents

## 31.26 --- Health Checks

Créer des health checks.

Exemple :

``` text
/health
```

et éventuellement :

``` text
/health/ready
/health/live
```

selon architecture.

## 31.27 --- Readiness

Readiness vérifie si l'application peut réellement servir.

Exemples :

-   database accessible
-   critical config loaded

Ne pas obligatoirement faire dépendre readiness de chaque service
externe secondaire.

## 31.28 --- Dependency Health

Dashboard interne séparé pour :

-   AI provider
-   billing
-   platform connectors
-   storage
-   email

## 31.29 --- Monitoring Dashboard

Créer des dashboards internes.

Minimum :

### SYSTEM

Infrastructure globale.

### AI

Performance IA.

### CONNECTORS

Plateformes.

### BUSINESS

Usage/revenue.

### BILLING

Paiements/commission.

## 31.30 --- Golden Signals

Pour chaque service critique suivre :

``` text
LATENCY
TRAFFIC
ERRORS
SATURATION
```

## 31.31 --- Alert Philosophy

Ne pas créer une alerte pour chaque erreur.

Une bonne alerte signifie :

# SOMEONE MAY NEED TO ACT.

Éviter alert fatigue.

## 31.32 --- Alert Severity

### P0 / CRITICAL

Action immédiate.

### P1 / HIGH

Impact important.

### P2 / MEDIUM

Investigation rapide mais non urgente.

### P3 / LOW

Observation.

## 31.33 --- Critical Alert Examples

Déclencher immédiatement pour :

-   suspected data leak
-   unauthorized paid actions
-   Full AI widespread rule violation
-   commission corruption
-   major platform send duplication
-   database unavailable
-   billing integrity failure

## 31.34 --- AI Alerts

Alertes :

-   structured output failure spike
-   AI provider outage
-   fallback spike
-   pricing rule rejection spike
-   abnormal Full AI takeover rate
-   AI cost spike
-   latency spike
-   critical benchmark regression in deployment

## 31.35 --- Duplicate Send Alert

Détecter un taux anormal de :

-   duplicate messages
-   duplicate offers
-   duplicate follow-ups

C'est critique pour une application de chatting.

## 31.36 --- Pricing Violation Alert

Une tentative de vente sous le minimum doit être :

-   bloquée
-   loggée
-   mesurée

Si répétée :

alerte AI Ops.

## 31.37 --- Connector Alerts

Déclencher selon :

-   sync delay
-   repeated authentication failure
-   rate limiting
-   send failure rate
-   disconnected high-volume account

## 31.38 --- Queue Alerts

Exemples :

``` text
oldest job > threshold
dead-letter > threshold
retry spike
```

## 31.39 --- Billing Alerts

Exemples :

-   webhook backlog
-   reconciliation mismatch
-   duplicate commission
-   unusually large commission
-   payment failure spike

## 31.40 --- Cost Alerts

Détecter :

-   AI cost per conversation spike
-   premium model routing spike
-   token context spike
-   retry loop
-   single agency anomaly

## 31.41 --- Agency-specific Alerts

Certaines alertes doivent être scopées à une seule agence.

Exemple :

``` text
Agency X platform connection failing.
```

Ne pas créer un incident global si le problème est local.

## 31.42 --- Alert Deduplication

Éviter 500 alertes identiques pendant un incident.

Créer :

-   grouping
-   deduplication
-   cooldown

## 31.43 --- Alert Routing

Prévoir plusieurs destinations internes.

Exemples futurs :

-   dashboard
-   email
-   Slack
-   Pager/on-call system

La V1 peut commencer simple.

## 31.44 --- Incident Creation

Une alerte critique peut créer automatiquement un incident.

``` text
Alert
↓
Incident
↓
Owner
↓
Mitigation
↓
Resolution
```

## 31.45 --- Incident Response Roles

Pour incidents importants :

-   Incident Owner
-   Technical Owner
-   Communication Owner si nécessaire

Une petite équipe peut cumuler les rôles.

## 31.46 --- Incident Lifecycle

``` text
DETECTED
↓
ACKNOWLEDGED
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

## 31.47 --- Incident Timeline

Enregistrer automatiquement ou manuellement :

-   detection
-   alerts
-   actions
-   kill switches
-   deployments
-   recovery
-   resolution

## 31.48 --- First Response

Pour incident critique :

1.  protéger les clients
2.  stopper les actions dangereuses
3.  préserver les données
4.  diagnostiquer
5.  corriger
6.  redémarrer progressivement

## 31.49 --- Full AI Incident

Si Full AI agit mal :

actions possibles :

``` text
Global Kill Switch
Agency Pause
Action-type Pause
Model Rollback
Prompt Rollback
```

## 31.50 --- Stop Autonomous Queue

Lors d'un incident Full AI :

les actions autonomes déjà en queue doivent pouvoir être :

-   paused
-   canceled
-   revalidated

Ne pas simplement laisser la queue se vider.

## 31.51 --- Platform Outage

Si plateforme indisponible :

-   ne pas marquer les messages comme envoyés
-   conserver inbound state
-   limiter retries
-   informer UI
-   reprendre avec revalidation

## 31.52 --- AI Provider Outage

Fallback possible si :

-   modèle fallback validé
-   tâche compatible
-   risque acceptable

Sinon :

-   Copilot unavailable state
-   Full AI pause/escalation

## 31.53 --- Database Incident

Priorités :

-   éviter corruption
-   passer read-only si architecture le permet
-   stopper actions financières/autonomes risquées
-   restaurer depuis backup si nécessaire

## 31.54 --- Billing Incident

Si calcul commission incertain :

-   suspendre facturation variable
-   continuer à enregistrer les transactions si sûr
-   réconcilier avant prélèvement

## 31.55 --- Security Incident

En cas de suspicion :

-   revoke access
-   isolate affected scope
-   preserve evidence
-   rotate secrets
-   audit exposure
-   suivre obligations légales applicables

## 31.56 --- Incident Communication

Prévoir templates pour :

-   investigating
-   identified
-   monitoring
-   resolved

La communication doit rester factuelle.

## 31.57 --- Customer-facing Status

Pas obligatoire pour première alpha.

Mais architecture future compatible avec :

-   status page
-   in-app banner
-   targeted agency notice

## 31.58 --- Postmortem

Pour SEV1/SEV2 :

documenter :

``` text
What happened?
Impact
Timeline
Root cause
Detection
Response
What worked?
What failed?
Corrective actions
Owners
Deadlines
```

## 31.59 --- Blameless Technical Analysis

Le postmortem doit chercher les causes système.

Exemples :

-   missing guardrail
-   missing alert
-   unclear ownership
-   inadequate test

Pas seulement :

``` text
someone made a mistake
```

## 31.60 --- Corrective Actions

Chaque action postmortem :

-   owner
-   priority
-   deadline
-   status

## 31.61 --- Runbooks

Créer :

``` text
/docs/runbooks/
```

Minimum :

``` text
FULL_AI_EMERGENCY_STOP.md
AI_PROVIDER_OUTAGE.md
PLATFORM_CONNECTOR_OUTAGE.md
DATABASE_INCIDENT.md
BILLING_FAILURE.md
QUEUE_BACKLOG.md
SECURITY_INCIDENT.md
```

## 31.62 --- Runbook Testing

Les runbooks critiques doivent être testés avant lancement.

Exemple :

simuler un AI provider outage.

## 31.63 --- Game Days

Plus tard, organiser des simulations :

-   connector down
-   AI down
-   duplicate webhook
-   database degraded

Objectif :

vérifier que l'équipe sait réagir.

## 31.64 --- SLO

Définir progressivement des Service Level Objectives.

Exemples :

-   application availability
-   message processing success
-   connector sync freshness
-   Full AI action success

## 31.65 --- SLI

Chaque SLO doit avoir un indicateur mesurable.

Exemple :

``` text
successful outbound actions / total valid outbound actions
```

## 31.66 --- Error Budget

Pas indispensable à l'alpha, mais utile après lancement.

Permet de décider si l'équipe doit :

-   accélérer features
-   ou stabiliser

## 31.67 --- User-facing Error States

L'observabilité doit se traduire dans l'UX.

Exemple :

``` text
Platform temporarily unavailable.
Your message has not been sent.
```

Plutôt que :

``` text
Success
```

alors que le connector a échoué.

## 31.68 --- Retry Visibility

Pour actions importantes :

l'UI peut afficher :

``` text
Sending
Retrying
Failed
Sent
```

## 31.69 --- AI Status Visibility

Pour Full AI :

afficher état :

``` text
ACTIVE
PAUSED
DEGRADED
HUMAN TAKEOVER
```

## 31.70 --- Integration Health Visibility

Dans Settings :

-   Connected
-   Syncing
-   Degraded
-   Reconnect required

## 31.71 --- Admin Daily View

Le Control Center doit afficher :

``` text
Incidents today
AI errors
Connector failures
Failed jobs
Billing issues
Cost anomalies
```

## 31.72 --- Per-agency Diagnostics

Support doit pouvoir filtrer :

``` text
agency_id
```

et obtenir rapidement :

-   recent errors
-   connector state
-   AI version
-   jobs
-   billing state
-   feature flags

## 31.73 --- Conversation Diagnostics

Depuis une conversation :

ouvrir un diagnostic montrant :

-   recent message events
-   AI decisions
-   validator results
-   platform send result
-   script state
-   follow-up state

Sans exposer de chain-of-thought.

## 31.74 --- Financial Diagnostics

Pour une transaction :

``` text
Platform transaction
↓
Ingestion
↓
Deduplication
↓
Attribution
↓
Commission
↓
Invoice/Reconciliation
```

Chaque étape doit être identifiable.

## 31.75 --- Monitoring Retention

Définir une rétention adaptée pour :

-   logs
-   traces
-   metrics
-   audit

Éviter conservation infinie sans raison.

## 31.76 --- Environment Separation

Séparer :

``` text
development
staging
production
```

Les alertes et dashboards doivent indiquer clairement l'environnement.

## 31.77 --- No Test Alerts in Production Channel

Les tests staging ne doivent pas déclencher des incidents production.

## 31.78 --- Deployment Monitoring

Après chaque déploiement :

surveiller :

-   errors
-   latency
-   AI failures
-   connector failures

Comparer avant/après.

## 31.79 --- Release Marker

Ajouter un marker de déploiement dans l'outil de monitoring.

Permet de corréler une hausse d'erreurs à une release.

## 31.80 --- AI Release Marker

Même principe pour :

-   prompt
-   model router
-   decision engine
-   memory version

## 31.81 --- Canary Monitoring

Lors d'un rollout partiel :

comparer :

``` text
candidate cohort
vs
control cohort
```

sur :

-   errors
-   quality
-   conversion
-   takeover
-   cost

## 31.82 --- Synthetic Monitoring

Créer des tests périodiques simples.

Exemples :

-   login page responds
-   health endpoint
-   mock conversation pipeline
-   billing webhook test in staging

## 31.83 --- End-to-End Synthetic Test

En staging :

``` text
Mock fan sends message
↓
AI responds
↓
Mock purchase
↓
Transaction
↓
Commission
↓
Analytics
```

Exécutable régulièrement.

## 31.84 --- Backup Monitoring

Ne pas seulement avoir des backups.

Vérifier :

-   backup exists
-   backup recent
-   restore procedure tested

## 31.85 --- Restore Test

Avant lancement public :

effectuer au moins un test de restauration staging à partir d'un backup.

## 31.86 --- Storage Monitoring

Surveiller :

-   upload failures
-   storage usage
-   signed URL failures
-   orphaned media

## 31.87 --- Rate Limit Monitoring

Mesurer les rate limits externes.

Si une plateforme approche sa limite :

-   ralentir
-   queue
-   prioriser actions importantes

## 31.88 --- Third-party Dependency Registry

Créer :

``` text
/docs/operations/DEPENDENCIES.md
```

Pour chaque provider :

-   purpose
-   criticality
-   fallback
-   credentials owner
-   monitoring
-   outage behavior

## 31.89 --- Operational Ownership

Chaque système critique doit avoir un owner.

Exemple :

``` text
AI — AI Ops
Billing — Billing Ops
Connectors — Engineering
```

Même si au départ une seule personne remplit plusieurs rôles.

## 31.90 --- Alert Ownership

Chaque alerte doit avoir :

-   owner
-   severity
-   runbook
-   escalation

Une alerte sans owner devient du bruit.

## 31.91 --- Monitoring Costs

L'observabilité elle-même peut coûter cher.

Prévoir :

-   sampling
-   retention
-   aggregation

sans supprimer la visibilité sur les actions critiques.

## 31.92 --- Privacy Controls

Avant d'envoyer des données à un provider d'observabilité :

-   minimiser
-   redact
-   vérifier configuration
-   respecter politique de données

## 31.93 --- PII Redaction

Créer une fonction centrale de redaction pour les logs.

Exemples :

-   email partiellement masqué
-   tokens supprimés
-   credentials supprimés

## 31.94 --- Error Reporting

Les exceptions doivent inclure :

-   error code
-   stack trace côté interne
-   request context non sensible
-   release version

## 31.95 --- User Error Messages

Ne jamais afficher stack traces ou secrets au client.

Afficher :

-   message clair
-   retry possible
-   support reference/request ID

## 31.96 --- Support Reference

Pour erreur importante :

``` text
Reference: req_xxxxx
```

Le support peut rechercher ce request_id.

## 31.97 --- Alert Tests

Créer tests pour vérifier :

-   critical alert fires
-   duplicate alerts grouped
-   resolved state
-   correct environment

## 31.98 --- Observability Tests

Dans integration tests :

vérifier que les événements critiques produisent les logs/audits
attendus.

## 31.99 --- Launch Monitoring Checklist

Avant pilote :

``` text
[ ] Application dashboard
[ ] AI dashboard
[ ] Connector dashboard
[ ] Billing dashboard
[ ] Critical alerts
[ ] Kill switch tested
[ ] Runbooks available
[ ] Request IDs searchable
[ ] Backup monitored
[ ] Restore tested
```

## 31.100 --- First 7 Days After Launch

Surveillance renforcée.

Vérifier quotidiennement :

-   top errors
-   AI failures
-   pricing validator blocks
-   duplicate actions
-   platform failures
-   cost anomalies
-   billing discrepancies
-   support reports

## 31.101 --- First 30 Days

Créer une revue hebdomadaire :

``` text
Reliability
AI Quality
Business Performance
Cost
Incidents
Corrective Actions
```

## 31.102 --- Reliability Scorecard

Dashboard interne :

``` text
App Availability
Outbound Success
AI Success
Connector Health
Queue Health
Billing Integrity
Incident Count
```

## 31.103 --- Full AI Reliability Scorecard

Afficher :

``` text
Autonomous Actions
Successful Actions
Validator Rejections
Escalations
Takeovers
Duplicate Prevention
Critical Violations
```

## 31.104 --- Zero Critical Violation Goal

L'objectif doit être :

# ZERO UNAUTHORIZED CRITICAL ACTIONS.

Une moyenne globale élevée n'excuse pas une violation critique.

## 31.105 --- Build Order

Ordre recommandé :

1.  structured logger
2.  request/correlation IDs
3.  error reporting
4.  application metrics
5.  AI metrics
6.  connector metrics
7.  queue monitoring
8.  billing monitoring
9.  dashboards
10. alerts
11. incident workflow
12. runbooks
13. synthetic tests
14. backup/restore monitoring

## 31.106 --- Claude Code Deliverables

Créer/maintenir :

``` text
/docs/operations/OBSERVABILITY.md
/docs/operations/ALERTS.md
/docs/operations/DEPENDENCIES.md
/docs/runbooks/
```

## 31.107 --- OBSERVABILITY.md

Documenter :

-   logging convention
-   correlation IDs
-   metrics
-   dashboards
-   tracing
-   retention
-   redaction

## 31.108 --- ALERTS.md

Pour chaque alerte :

``` text
Name
Condition
Severity
Owner
Runbook
Cooldown
```

## 31.109 --- Production Readiness Gate

Ne pas ouvrir Full AI à des agences réelles tant que :

-   les actions critiques sont observables
-   le kill switch fonctionne
-   les erreurs sont détectables
-   les connectors sont monitorés
-   les coûts IA sont visibles
-   les incidents ont un workflow

## 31.110 --- Critère de réussite

Cette partie est réussie lorsque :

-   chaque workflow critique peut être reconstruit
-   les logs ne contiennent pas de secrets
-   les appels IA sont mesurés en coût et latence
-   les erreurs plateforme sont visibles
-   les duplicates peuvent être détectés
-   les violations de pricing sont bloquées et monitorées
-   les problèmes de queue sont détectés
-   la facturation variable est observable
-   les alertes ont un owner
-   Full AI peut être stoppé rapidement
-   les incidents critiques possèdent un runbook
-   les backups sont vérifiés et restaurables
-   support peut retrouver un incident avec un request ID
-   une nouvelle release peut être comparée à la précédente

# OBSERVE EVERYTHING IMPORTANT.

# ALERT ONLY WHEN ACTION MATTERS.

# NEVER LET AUTONOMY BECOME INVISIBLE.

------------------------------------------------------------------------

## PARTIE 31 --- VALIDÉE COMME OBSERVABILITY, LOGGING, MONITORING, ALERTING & INCIDENT RESPONSE

La suite du cahier des charges commence avec :

# PARTIE 32 --- TESTING STRATEGY, QA MATRIX, SECURITY TESTING & RELEASE ACCEPTANCE
