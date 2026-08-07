# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 28 --- DATA MODEL, ENTITY RELATIONSHIPS & DATABASE SCHEMA BLUEPRINT

## 28.1 --- Objectif

Cette partie définit le blueprint de données d'OmniFlow V1.

Claude Code doit utiliser cette structure comme base conceptuelle, puis
l'adapter à la stack réelle après audit du repository et de la base
existante.

Objectif :

# ONE CONSISTENT DATA MODEL FOR THE ENTIRE AI CHATTING ENGINE.

La base doit pouvoir supporter :

-   multi-agency
-   multi-creator
-   multi-platform
-   Copilot
-   Full AI
-   fan intelligence
-   long-term memory
-   scripts
-   media
-   sales
-   negotiation
-   follow-ups
-   analytics
-   billing
-   team permissions
-   audit
-   AI evaluation

## 28.2 --- Principes de modélisation

Principes :

1.  isolation stricte par agence
2.  IDs non prédictibles
3.  timestamps systématiques
4.  données financières auditables
5.  historique conservé lorsque nécessaire
6.  versioning des éléments critiques
7.  pas de duplication inutile
8.  dénormalisation uniquement pour performance mesurée
9.  contraintes database sur les règles critiques
10. soft delete uniquement lorsque réellement utile

## 28.3 --- Schéma logique global

``` text
Agency
├── Members
├── Creators
│   ├── Platform Accounts
│   ├── AI Settings
│   ├── Scripts
│   └── Media
├── Fans
│   ├── Memories
│   ├── Scores
│   ├── Conversations
│   │   ├── Messages
│   │   ├── AI Decisions
│   │   └── Script Runs
│   ├── Transactions
│   └── Follow-ups
├── Billing
├── Analytics
└── Audit
```

## 28.4 --- agencies

Table centrale tenant.

Champs conceptuels :

``` text
id
name
slug
status
default_currency
timezone
plan_id
created_at
updated_at
```

## 28.5 --- agency_settings

Réglages globaux agence.

``` text
id
agency_id
default_ai_mode
default_language
default_tone
sales_aggressiveness
relationship_priority
negotiation_enabled
max_discount_percent
follow_up_enabled
custom_requests_enabled
settings_json
created_at
updated_at
```

Les paramètres structurants doivent avoir des colonnes explicites
lorsque cela améliore validation et requêtes.

## 28.6 --- users

Compte humain.

``` text
id
auth_user_id
email
display_name
avatar_url
status
created_at
updated_at
```

Ne pas dupliquer inutilement les secrets/auth credentials gérés par le
provider d'authentification.

## 28.7 --- agency_memberships

Relation User ↔ Agency.

``` text
id
agency_id
user_id
role_id
status
invited_by
joined_at
created_at
updated_at
```

Contrainte unique appropriée sur membership active.

## 28.8 --- roles

``` text
id
agency_id nullable
name
type
is_system
created_at
updated_at
```

Les rôles système peuvent être globaux.

Les rôles custom peuvent être liés à une agence.

## 28.9 --- permissions

Catalogue des permissions.

Exemples :

``` text
conversations.view
conversations.reply
full_ai.manage
scripts.manage
media.manage
billing.view
team.manage
```

## 28.10 --- role_permissions

``` text
role_id
permission_id
created_at
```

Contrainte unique :

``` text
(role_id, permission_id)
```

## 28.11 --- creators

Une créatrice gérée par une agence.

``` text
id
agency_id
display_name
internal_name
status
default_language
timezone
avatar_url
notes
created_at
updated_at
archived_at
```

## 28.12 --- creator_access

Permet de limiter un membre à certaines créatrices.

``` text
id
agency_id
creator_id
user_id
access_level
created_at
```

## 28.13 --- creator_ai_profiles

Model DNA.

``` text
id
agency_id
creator_id
version
status
tone
vocabulary_style
message_length
emoji_style
punctuation_style
flirt_intensity
warmth
directness
sales_aggressiveness
persona_description
forbidden_behaviors
preferred_behaviors
custom_instructions
created_at
updated_at
published_at
```

Versionner les profils importants.

## 28.14 --- creator_commercial_settings

``` text
id
agency_id
creator_id
negotiation_enabled
max_discount_percent
custom_content_enabled
live_session_enabled
minimum_custom_price
minimum_live_price
follow_up_enabled
proactive_messages_enabled
approval_threshold
created_at
updated_at
```

Les overrides Creator prennent priorité sur les defaults Agency selon
les règles définies.

## 28.15 --- platforms

Catalogue interne.

``` text
id
code
name
status
created_at
```

Exemples :

``` text
ONLYFANS
MYM
MOCK
```

## 28.16 --- platform_connections

Connexion technique agence/plateforme.

``` text
id
agency_id
platform_id
status
auth_type
encrypted_credentials_reference
capabilities_json
last_connected_at
last_sync_at
last_error_code
last_error_at
created_at
updated_at
```

Ne jamais stocker des credentials sensibles en clair.

## 28.17 --- creator_platform_accounts

Relie une créatrice à son compte plateforme.

``` text
id
agency_id
creator_id
platform_connection_id
external_account_id
external_username
status
metadata_json
created_at
updated_at
```

## 28.18 --- fans

Identité interne d'un fan.

``` text
id
agency_id
canonical_name
status
created_at
updated_at
```

Un fan peut potentiellement posséder plusieurs identités plateforme.

## 28.19 --- fan_platform_profiles

``` text
id
agency_id
fan_id
creator_id
platform_id
external_fan_id
username
display_name
subscription_status
first_seen_at
last_seen_at
metadata_json
created_at
updated_at
```

La relation au creator est importante car un même identifiant logique
peut avoir un contexte différent selon la créatrice.

## 28.20 --- fan_profiles

Profil enrichi.

``` text
id
agency_id
fan_id
creator_id
relationship_stage
preferred_language
timezone
summary
preferences_json
commercial_profile_json
last_interaction_at
created_at
updated_at
```

## 28.21 --- fan_memories

Mémoire structurée longue durée.

``` text
id
agency_id
fan_id
creator_id
memory_type
key
value
source_type
source_id
confidence
importance
is_verified
last_confirmed_at
expires_at
created_at
updated_at
deleted_at
```

## 28.22 --- memory_type

Exemples :

``` text
PERSONAL_FACT
PREFERENCE
RELATIONSHIP
COMMERCIAL
OBJECTION
BOUNDARY
CUSTOM_REQUEST
IMPORTANT_EVENT
```

## 28.23 --- fan_scores

Stocker l'état courant.

``` text
id
agency_id
fan_id
creator_id
purchase_intent
relationship
spending_potential
engagement
churn_risk
score_version
calculated_at
created_at
updated_at
```

Valeurs normalisées, par exemple 0--100.

## 28.24 --- fan_score_history

Historique optionnel mais recommandé.

``` text
id
agency_id
fan_id
creator_id
score_type
previous_value
new_value
reason_code
calculated_at
```

Permet d'analyser les évolutions.

## 28.25 --- conversations

``` text
id
agency_id
creator_id
fan_id
platform_id
external_conversation_id
status
ai_mode
assigned_user_id
current_script_run_id
last_message_at
last_inbound_at
last_outbound_at
created_at
updated_at
```

## 28.26 --- Conversation AI Modes

Valeurs :

``` text
COPILOT
FULL_AI
HUMAN_TAKEOVER
PAUSED
```

## 28.27 --- messages

``` text
id
agency_id
conversation_id
external_message_id
direction
sender_type
sender_user_id nullable
text
message_type
is_paid
price_amount
currency
status
reply_to_message_id
sent_at
received_at
created_at
updated_at
```

## 28.28 --- Message Types

Exemples :

``` text
TEXT
MEDIA
PAID_MEDIA
VOICE
SYSTEM
CUSTOM_OFFER
```

## 28.29 --- message_media

Relation message ↔ media.

``` text
id
agency_id
message_id
media_asset_id
external_media_id
created_at
```

## 28.30 --- message_events

Événements liés au message.

``` text
id
agency_id
message_id
event_type
payload_json
occurred_at
created_at
```

Exemples :

-   delivered
-   opened
-   purchased
-   failed

selon capacités plateforme.

## 28.31 --- ai_decisions

Une des tables centrales.

``` text
id
agency_id
conversation_id
message_id
fan_id
creator_id
decision_type
objective
strategy
confidence
model_provider
model_name
model_version
prompt_version
router_version
structured_output_json
context_snapshot_reference
status
latency_ms
estimated_cost
created_at
```

## 28.32 --- ai_actions

Action résultant d'une décision.

``` text
id
agency_id
ai_decision_id
conversation_id
action_type
status
requires_approval
approved_by
approved_at
validator_result_json
scheduled_for
executed_at
failure_code
created_at
updated_at
```

## 28.33 --- AI Action Types

Exemples :

``` text
SEND_MESSAGE
SEND_MEDIA
SEND_PAID_OFFER
START_SCRIPT
CONTINUE_SCRIPT
NEGOTIATE
CREATE_FOLLOW_UP
WAIT
ESCALATE
```

## 28.34 --- ai_feedback

Feedback humain ou client.

``` text
id
agency_id
ai_decision_id
message_id
submitted_by
feedback_type
rating
comment
corrected_text
created_at
```

## 28.35 --- AI Feedback Types

``` text
GOOD
BAD_REPLY
WRONG_DECISION
WRONG_MEMORY
BAD_TIMING
PRICING_ISSUE
OTHER
```

## 28.36 --- scripts

Identité logique du script.

``` text
id
agency_id
creator_id nullable
name
description
status
created_by
created_at
updated_at
```

## 28.37 --- script_versions

``` text
id
agency_id
script_id
version_number
status
strategy_type
published_at
created_by
created_at
```

Une version publiée est immuable.

## 28.38 --- script_nodes

``` text
id
agency_id
script_version_id
node_key
node_type
title
message_template
price_amount
currency
delay_seconds
config_json
position_json
created_at
```

## 28.39 --- Script Node Types

Exemples :

``` text
START
MESSAGE
RELATIONSHIP
PAID_MEDIA
CONDITION
WAIT
RECOVERY
NEGOTIATION
END
```

## 28.40 --- script_edges

``` text
id
agency_id
script_version_id
from_node_id
to_node_id
condition_type
condition_json
priority
created_at
```

## 28.41 --- script_runs

Exécution d'un script pour un fan.

``` text
id
agency_id
script_version_id
conversation_id
fan_id
creator_id
current_node_id
status
started_at
completed_at
abandoned_at
created_at
updated_at
```

## 28.42 --- script_run_events

``` text
id
agency_id
script_run_id
node_id
event_type
outcome
transaction_id nullable
metadata_json
occurred_at
```

Permet analytics précis étape par étape.

## 28.43 --- media_assets

``` text
id
agency_id
creator_id
storage_key
media_type
title
description
status
target_price
minimum_price
currency
duration_seconds
metadata_json
created_at
updated_at
archived_at
```

## 28.44 --- media_tags

``` text
id
agency_id
name
created_at
```

## 28.45 --- media_asset_tags

``` text
media_asset_id
media_tag_id
created_at
```

## 28.46 --- media_performance

Vue matérialisée ou table agrégée possible.

Métriques :

-   offers
-   purchases
-   conversion
-   revenue
-   average sold price

La source de vérité reste transactions + offers.

## 28.47 --- offers

Créer une entité commerciale distincte.

``` text
id
agency_id
conversation_id
fan_id
creator_id
offer_type
source_type
source_id
initial_price
final_price
minimum_allowed_price
currency
status
ai_decision_id
sent_message_id
created_at
expires_at
updated_at
```

## 28.48 --- Offer Types

``` text
SCRIPT_MEDIA
CUSTOM_MEDIA
OUT_OF_SCRIPT_MEDIA
LIVE_SESSION
CUSTOM_REQUEST
OTHER
```

## 28.49 --- Offer Status

``` text
DRAFT
SENT
PURCHASED
DECLINED
EXPIRED
CANCELED
FAILED
```

## 28.50 --- negotiations

``` text
id
agency_id
offer_id
conversation_id
status
starting_price
minimum_price
current_price
max_discount_percent
created_at
updated_at
closed_at
```

## 28.51 --- negotiation_events

``` text
id
agency_id
negotiation_id
event_type
price
actor_type
ai_decision_id nullable
message_id nullable
occurred_at
```

## 28.52 --- custom_requests

``` text
id
agency_id
creator_id
fan_id
conversation_id
request_type
description
status
quoted_price
minimum_price
currency
notes
created_at
updated_at
```

## 28.53 --- transactions

Source financière.

``` text
id
agency_id
creator_id
fan_id
platform_id
external_transaction_id
offer_id nullable
message_id nullable
transaction_type
gross_amount
currency
status
occurred_at
synced_at
created_at
updated_at
```

## 28.54 --- Transaction Types

Exemples :

``` text
SUBSCRIPTION
MESSAGE_PURCHASE
MEDIA_PURCHASE
TIP
CUSTOM_CONTENT
LIVE_SESSION
OTHER
```

La commission OmniFlow doit s'appliquer uniquement aux catégories
définies contractuellement comme éligibles.

## 28.55 --- transaction_attribution

Permet de savoir si OmniFlow a participé à la vente.

``` text
id
agency_id
transaction_id
attribution_type
ai_decision_id nullable
script_run_id nullable
follow_up_id nullable
confidence
rules_version
created_at
```

## 28.56 --- Attribution Types

Exemples :

``` text
FULL_AI
COPILOT
HUMAN
FOLLOW_UP
SCRIPT
UNKNOWN
```

Définir précisément les règles avant facturation.

## 28.57 --- commission_ledger

Ledger immuable.

``` text
id
agency_id
transaction_id
commission_rate
eligible_amount
commission_amount
currency
status
billing_period
created_at
reconciled_at
```

Ne pas recalculer silencieusement l'historique si le taux change.

## 28.58 --- Commission Rate Snapshot

Toujours enregistrer le taux appliqué à la transaction.

Exemple :

``` text
0.025
```

Ainsi, un changement futur de pricing ne modifie pas les périodes
précédentes.

## 28.59 --- commission_adjustments

Pour correction :

``` text
id
agency_id
commission_ledger_id
adjustment_amount
reason
created_by
created_at
```

Ne pas modifier directement le ledger original.

## 28.60 --- follow_ups

``` text
id
agency_id
conversation_id
fan_id
creator_id
reason
priority
status
message_template
scheduled_for
requires_approval
approved_by
approved_at
ai_decision_id
sent_message_id
created_at
updated_at
```

## 28.61 --- Follow-up Status

``` text
DRAFT
WAITING_APPROVAL
SCHEDULED
SENT
SKIPPED
CANCELED
FAILED
```

## 28.62 --- follow_up_events

``` text
id
agency_id
follow_up_id
event_type
reason_code
occurred_at
```

## 28.63 --- notifications

``` text
id
agency_id
user_id
type
severity
title
body
resource_type
resource_id
read_at
created_at
```

## 28.64 --- subscriptions

Abonnement OmniFlow.

``` text
id
agency_id
provider_customer_id
provider_subscription_id
plan_id
status
current_period_start
current_period_end
cancel_at_period_end
created_at
updated_at
```

## 28.65 --- plans

``` text
id
code
name
base_price
currency
billing_interval
commission_rate
status
entitlements_json
created_at
updated_at
```

Même si 2,5 % est commun à plusieurs plans, conserver le taux dans le
plan/configuration.

## 28.66 --- billing_events

Webhook/event billing.

``` text
id
agency_id nullable
provider_event_id
event_type
payload_reference
status
received_at
processed_at
created_at
```

Contrainte unique sur `provider_event_id`.

## 28.67 --- invoices

``` text
id
agency_id
provider_invoice_id
period_start
period_end
subscription_amount
variable_amount
total_amount
currency
status
created_at
updated_at
```

## 28.68 --- usage_records

Pour limites d'abonnement.

``` text
id
agency_id
usage_type
quantity
period_start
period_end
created_at
updated_at
```

Exemples :

-   creators
-   seats
-   AI messages
-   Full AI conversations

## 28.69 --- analytics_events

Événements produit/métier.

``` text
id
agency_id
creator_id nullable
fan_id nullable
conversation_id nullable
event_name
properties_json
occurred_at
created_at
```

## 28.70 --- analytics_daily

Agrégations quotidiennes.

``` text
id
agency_id
creator_id nullable
date
metric_name
metric_value
dimensions_json
created_at
updated_at
```

Utiliser pour accélérer Dashboard.

## 28.71 --- experiments

``` text
id
agency_id nullable
name
scope
status
hypothesis
started_at
ended_at
created_at
```

## 28.72 --- experiment_variants

``` text
id
experiment_id
name
config_json
created_at
```

## 28.73 --- experiment_assignments

``` text
id
experiment_id
variant_id
agency_id
creator_id nullable
fan_id nullable
conversation_id nullable
assigned_at
```

L'unité d'expérimentation doit être définie explicitement.

## 28.74 --- experiment_outcomes

``` text
id
experiment_assignment_id
metric_name
metric_value
occurred_at
```

## 28.75 --- audit_logs

Table critique.

``` text
id
agency_id nullable
actor_type
actor_id
action
resource_type
resource_id
before_json
after_json
reason
ip_metadata
created_at
```

## 28.76 --- Actor Types

``` text
USER
INTERNAL_ADMIN
AI
SYSTEM
WEBHOOK
JOB
```

## 28.77 --- integration_events

``` text
id
agency_id
platform_connection_id
external_event_id
event_type
status
payload_reference
received_at
processed_at
created_at
```

Déduplication obligatoire.

## 28.78 --- jobs

Si le provider de queue ne fournit pas déjà une source suffisante :

``` text
id
agency_id nullable
job_type
status
resource_type
resource_id
attempts
scheduled_for
started_at
completed_at
failure_code
created_at
updated_at
```

## 28.79 --- support_cases

``` text
id
agency_id
requester_user_id
category
priority
status
assigned_internal_user_id
description
created_at
updated_at
resolved_at
```

## 28.80 --- support_internal_notes

``` text
id
support_case_id
internal_user_id
body
created_at
```

Strictement internes.

## 28.81 --- ai_benchmark_cases

Dataset interne.

``` text
id
category
input_reference
expected_behavior_json
severity
status
dataset_version
created_at
updated_at
```

## 28.82 --- ai_benchmark_runs

``` text
id
benchmark_version
ai_version
model_config
started_at
completed_at
overall_score
status
created_at
```

## 28.83 --- ai_benchmark_results

``` text
id
benchmark_run_id
benchmark_case_id
score
dimensions_json
failure_type
review_status
created_at
```

## 28.84 --- feature_flags

``` text
id
key
status
default_value
config_json
created_at
updated_at
```

## 28.85 --- feature_flag_overrides

``` text
id
feature_flag_id
agency_id nullable
user_id nullable
value
created_at
updated_at
```

## 28.86 --- incidents

``` text
id
severity
title
status
affected_services
started_at
detected_at
resolved_at
owner_internal_user_id
summary
root_cause
created_at
updated_at
```

## 28.87 --- incident_agencies

``` text
incident_id
agency_id
created_at
```

## 28.88 --- internal_users

Si nécessaire, séparer clairement les comptes internes des memberships
agence.

``` text
id
auth_user_id
email
status
internal_role_id
created_at
updated_at
```

## 28.89 --- internal_roles

``` text
id
name
permissions_json
created_at
updated_at
```

## 28.90 --- Indexes essentiels

Prévoir notamment des indexes sur :

``` text
agency_id
creator_id
fan_id
conversation_id
external IDs
status
created_at
occurred_at
scheduled_for
last_message_at
```

Créer des indexes composites selon requêtes réelles.

## 28.91 --- Conversation Index Example

Exemple :

``` text
(agency_id, creator_id, last_message_at DESC)
```

Pour Inbox.

## 28.92 --- Message Index Example

``` text
(conversation_id, created_at)
```

Pour historique.

## 28.93 --- Transaction Index Example

``` text
(agency_id, occurred_at)
```

et contrainte unique appropriée sur :

``` text
(platform_id, external_transaction_id)
```

selon réalité des IDs plateforme.

## 28.94 --- Foreign Keys

Utiliser de vraies foreign keys pour les relations critiques.

Ne pas remplacer toutes les relations par des IDs libres dans JSON.

## 28.95 --- Cascades

Utiliser `ON DELETE CASCADE` avec prudence.

Pour données financières/audit :

éviter la suppression en cascade destructive.

## 28.96 --- Soft Delete

Candidats :

-   creators
-   scripts
-   media

Pas recommandé pour tout.

Les transactions et ledger doivent rester historiques.

## 28.97 --- Money

Ne jamais stocker les montants financiers en floating point.

Utiliser :

-   integer minor units

ou type decimal adapté.

Toujours stocker la currency.

## 28.98 --- Time

Stocker les timestamps en UTC.

Afficher selon timezone agence/utilisateur.

Les scheduled actions doivent rester non ambiguës.

## 28.99 --- JSON

JSON/JSONB utile pour :

-   provider metadata
-   experimental config
-   flexible settings

Mais les données fréquemment filtrées ou validées doivent avoir des
colonnes explicites.

## 28.100 --- External IDs

Toujours distinguer :

``` text
internal id
external platform id
```

Ne pas utiliser directement un external ID comme clé primaire interne.

## 28.101 --- Idempotency Keys

Prévoir une table ou mécanisme pour les opérations critiques :

``` text
idempotency_keys
```

Champs conceptuels :

``` text
key
agency_id
operation
resource_id
status
created_at
expires_at
```

## 28.102 --- Data Ownership

Toute ressource doit avoir une chaîne de propriété claire jusqu'à
l'Agency.

Exemple :

``` text
message
→ conversation
→ agency
```

Mais pour les ressources critiques, conserver également `agency_id`
directement peut améliorer sécurité et performance.

## 28.103 --- RLS Strategy

Si Supabase :

policies basées sur :

-   authenticated user
-   agency membership
-   resource agency_id
-   creator access lorsque applicable

Ne jamais faire confiance à un `agency_id` fourni par le client sans
validation.

## 28.104 --- Server-only Tables

Certaines tables doivent être accessibles uniquement côté serveur.

Exemples :

-   commission ledger
-   raw integration events
-   internal admin
-   benchmark internals
-   sensitive AI logs

## 28.105 --- Data Retention

Définir une politique par catégorie :

-   messages
-   AI logs
-   raw provider payloads
-   analytics
-   audit
-   billing
-   support

Les durées exactes seront définies avec contraintes légales et
opérationnelles.

## 28.106 --- Raw Payload Storage

Éviter de dupliquer indéfiniment tous les payloads externes.

Si conservation nécessaire :

-   chiffrer/protéger
-   limiter retention
-   stocker une référence plutôt que dupliquer partout

## 28.107 --- Migration depuis l'ancien OmniFlow

Claude Code doit :

1.  inspecter les tables existantes
2.  mapper ce qui reste utile
3.  identifier les données incompatibles
4.  créer migrations
5.  préserver les données nécessaires
6.  ne pas conserver un mauvais schema uniquement pour éviter une
    migration

## 28.108 --- Migration Safety

Avant migration destructive :

-   backup
-   dry run
-   staging
-   row counts
-   integrity checks
-   rollback plan

## 28.109 --- Seed / Demo Dataset

Créer un dataset fictif cohérent.

Exemple :

``` text
Agency: Demo Agency
Creator: Emma
Fans:
- Alex — high spender
- Noah — cold
- Liam — relationship-heavy
- Lucas — price objection
```

Inclure scripts, messages, offers et transactions fictifs.

## 28.110 --- Demo Safety

Aucune donnée réelle d'agence ou de fan dans les seeds.

## 28.111 --- ERD Documentation

Claude Code doit générer et maintenir :

``` text
/docs/database/ERD.md
```

Avec diagramme Mermaid si possible.

Exemple :

``` mermaid
erDiagram
    AGENCIES ||--o{ CREATORS : owns
    AGENCIES ||--o{ FANS : manages
    CREATORS ||--o{ CONVERSATIONS : has
    FANS ||--o{ CONVERSATIONS : participates
    CONVERSATIONS ||--o{ MESSAGES : contains
```

Le diagramme complet doit être généré depuis le schema final.

## 28.112 --- Schema Documentation

Créer :

``` text
/docs/database/SCHEMA.md
```

Pour chaque table :

-   purpose
-   important fields
-   relationships
-   indexes
-   RLS
-   retention notes

## 28.113 --- Database Tests

Tester :

-   cross-agency isolation
-   creator scope
-   duplicate external message
-   duplicate transaction
-   invalid script edge
-   deleted creator behavior
-   ledger immutability
-   permission denial

## 28.114 --- Financial Integrity Tests

Tester :

``` text
Transaction €100
Commission 2.5%
→ €2.50
```

Puis :

-   refund
-   adjustment
-   duplicate webhook
-   currency difference
-   rate change

## 28.115 --- Script Integrity Tests

Tester :

-   no start node
-   broken edge
-   circular branch involontaire
-   missing media
-   invalid minimum price
-   deleted media
-   version published

## 28.116 --- Memory Integrity Tests

Tester :

-   duplicate fact
-   contradiction
-   manual correction
-   expired memory
-   low-confidence memory
-   creator separation

## 28.117 --- AI Audit Integrity

Pour chaque Full AI action importante, pouvoir retrouver :

``` text
incoming message
→ AI decision
→ validator
→ action
→ outgoing message/offer
→ outcome
```

Cette chaîne doit être reconstruisible.

## 28.118 --- Analytics Integrity

Une métrique Dashboard doit pouvoir être reliée à une source.

Exemple :

``` text
Revenue
→ transactions
```

``` text
Script Conversion
→ script_run_events + transactions
```

## 28.119 --- No Metric Without Definition

Créer :

``` text
/docs/analytics/METRICS_DICTIONARY.md
```

Chaque KPI :

-   name
-   definition
-   formula
-   source tables
-   filters
-   attribution rules

## 28.120 --- Schema Evolution

Quand OmniFlow ajoutera :

-   Marketing
-   Recruitment
-   VA Management

ne pas ajouter leurs tables maintenant sauf infrastructure générique
nécessaire.

Le cœur Agency/User/Creator peut être réutilisé.

## 28.121 --- Future Marketplace

La Marketplace future devra être isolée du modèle actuel.

Ne pas transformer `creators` en marketplace listings dès la V1.

Future entities possibles :

``` text
marketplace_profiles
marketplace_listings
applications
transactions
```

hors scope V1.

## 28.122 --- Data Model Build Order

Ordre recommandé :

1.  Agency/User/Auth
2.  Roles/Permissions
3.  Creators
4.  Platforms
5.  Fans
6.  Conversations/Messages
7.  Memory/Scores
8.  AI Decisions/Actions
9.  Scripts
10. Media
11. Offers/Negotiations
12. Transactions
13. Follow-ups
14. Billing/Commission
15. Analytics
16. Audit
17. Benchmark/Admin

## 28.123 --- Database Naming

Utiliser une convention uniforme.

Exemple :

-   snake_case tables
-   snake_case columns
-   plural table names

Ne pas mélanger plusieurs conventions.

## 28.124 --- Generated Types

Si stack TypeScript + Supabase :

générer les types database.

Ne pas maintenir manuellement une copie divergente du schema.

## 28.125 --- Schema as Code

Le schema doit être reproductible depuis :

-   migrations
-   seed
-   config

La production ne doit pas dépendre de changements manuels oubliés.

## 28.126 --- Critère de réussite

Le Data Model est réussi lorsque :

-   chaque donnée appartient clairement à une agence
-   les créatrices sont séparées proprement
-   les fans possèdent mémoire et scores durables
-   les conversations et messages sont auditables
-   chaque décision IA peut être reliée à une action
-   les scripts sont versionnés
-   les médias sont sécurisés
-   les offres et négociations sont mesurables
-   les transactions sont la source financière
-   la commission 2,5 % est calculable et auditable
-   les follow-ups sont traçables
-   les analytics reposent sur des sources définies
-   les permissions peuvent être appliquées au niveau database/backend
-   le benchmark IA possède son propre modèle de données
-   l'architecture peut évoluer sans casser le cœur OmniFlow

# CLEAN DATA.

# RELIABLE AI.

# AUDITABLE REVENUE.

------------------------------------------------------------------------

## PARTIE 28 --- VALIDÉE COMME DATA MODEL, ENTITY RELATIONSHIPS & DATABASE SCHEMA BLUEPRINT

La suite du cahier des charges commence avec :

# PARTIE 29 --- API CONTRACTS, SERVICE LAYER & EVENT SYSTEM
