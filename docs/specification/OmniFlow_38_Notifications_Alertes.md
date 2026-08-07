# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 38 --- NOTIFICATIONS & ALERTES

## 38.1 --- Objectif

OmniFlow doit informer les agences des événements importants sans
transformer le produit en flux permanent de notifications inutiles.

Le système doit distinguer :

``` text
INFORMATION
ACTION REQUIRED
WARNING
CRITICAL
```

Une notification doit être envoyée lorsqu'elle aide réellement
l'utilisateur à :

-   agir
-   vendre
-   corriger
-   surveiller
-   éviter une perte
-   reprendre le contrôle

------------------------------------------------------------------------

## 38.2 --- Notification Center

Créer un centre de notifications dans l'application.

Il doit permettre :

-   unread/read
-   type
-   timestamp
-   creator
-   conversation/fan si applicable
-   action associée
-   priority
-   deep link vers l'élément concerné

------------------------------------------------------------------------

## 38.3 --- Notification Categories

Catégories principales :

``` text
AI
SALES
FAN
SCRIPT
FOLLOW_UP
PLATFORM
BILLING
TEAM
SECURITY
SYSTEM
```

------------------------------------------------------------------------

## 38.4 --- Priority Levels

``` text
LOW
NORMAL
HIGH
CRITICAL
```

Les niveaux doivent avoir un comportement cohérent dans tout OmniFlow.

------------------------------------------------------------------------

## 38.5 --- AI Notifications

Exemples :

-   Full AI paused
-   AI escalated to human
-   low-confidence decision
-   AI action blocked
-   model/provider unavailable
-   abnormal AI error rate

------------------------------------------------------------------------

## 38.6 --- Human Takeover Alert

Lorsqu'une conversation nécessite un humain :

la notification doit clairement indiquer :

-   creator
-   fan
-   reason
-   urgency
-   conversation link

------------------------------------------------------------------------

## 38.7 --- Sales Notifications

Exemples :

-   important purchase
-   high-value opportunity
-   abandoned paid offer
-   negotiation requiring approval
-   custom request
-   unusual conversion drop

------------------------------------------------------------------------

## 38.8 --- High-Value Fan Alert

Une agence peut choisir d'être alertée lorsqu'un fan dépasse certains
critères.

Exemples :

-   spending threshold
-   spending potential
-   purchase intent
-   custom request value

------------------------------------------------------------------------

## 38.9 --- Fan Alerts

Exemples :

-   churn risk increased
-   high purchase intent
-   important fan returned
-   relationship milestone
-   unresolved request

Les alertes doivent rester configurables.

------------------------------------------------------------------------

## 38.10 --- Script Alerts

Exemples :

-   script conversion degraded
-   step conversion unusually low
-   script error
-   missing media
-   invalid published dependency

------------------------------------------------------------------------

## 38.11 --- Follow-up Alerts

Exemples :

-   follow-up awaiting approval
-   follow-up failed
-   follow-up skipped after context change
-   high-value recovery opportunity

------------------------------------------------------------------------

## 38.12 --- Platform Alerts

Exemples :

-   connector disconnected
-   authentication expired
-   rate limited
-   sync delayed
-   webhook failures
-   capability unavailable

------------------------------------------------------------------------

## 38.13 --- Billing Alerts

Exemples :

-   subscription payment failed
-   payment method issue
-   commission billing issue
-   reconciliation mismatch
-   invoice available

------------------------------------------------------------------------

## 38.14 --- Team Alerts

Exemples :

-   invitation accepted
-   permission changed
-   team member removed
-   creator assignment changed

------------------------------------------------------------------------

## 38.15 --- Security Alerts

Exemples :

-   suspicious login
-   repeated authorization failure
-   secret/configuration issue
-   unusual admin action

Security alerts must follow the security and incident rules already
defined.

------------------------------------------------------------------------

## 38.16 --- System Alerts

Examples:

-   maintenance
-   incident
-   degraded service
-   feature temporarily unavailable
-   resolved incident

------------------------------------------------------------------------

## 38.17 --- Channels

Architecture should support:

``` text
IN_APP
EMAIL
OPTIONAL EXTERNAL CHANNEL
```

External channels can be added only when technically justified.

------------------------------------------------------------------------

## 38.18 --- In-App First

V1 should prioritize a strong in-app notification center.

Do not make the product dependent on Telegram or another external
messaging platform for core alerts.

------------------------------------------------------------------------

## 38.19 --- Email Notifications

Email can be used for important events such as:

-   billing
-   account/security
-   major platform disconnection
-   critical system issue

Avoid emailing every operational event.

------------------------------------------------------------------------

## 38.20 --- External Integrations

Future notification channels may include:

-   Slack
-   Telegram
-   Discord

but they should use a generic notification adapter architecture.

------------------------------------------------------------------------

## 38.21 --- Notification Preferences

Agency settings should allow users to choose what they receive.

Example:

``` text
High-value purchase
Full AI escalation
Platform disconnect
Billing issue
Security alert
```

------------------------------------------------------------------------

## 38.22 --- Per-User Preferences

Preferences should be user-specific where appropriate.

An agency owner and chatter do not necessarily need the same alerts.

------------------------------------------------------------------------

## 38.23 --- Creator Scope

A user restricted to specific creators must not receive notifications
from unauthorized creators.

------------------------------------------------------------------------

## 38.24 --- Role-Based Defaults

Default preferences can differ by role.

Example:

``` text
OWNER
→ billing + system + sales + AI

CHATTER
→ assigned conversations + AI escalations

MANAGER
→ operational + creator performance
```

Final behavior remains configurable.

------------------------------------------------------------------------

## 38.25 --- Notification Entity

Conceptual fields:

``` text
id
agency_id
user_id
category
priority
title
body
entity_type
entity_id
creator_id
status
created_at
read_at
action_url
metadata
```

------------------------------------------------------------------------

## 38.26 --- Delivery Records

For external channels, track delivery separately.

Example:

``` text
notification_id
channel
status
attempts
sent_at
failed_at
error
```

------------------------------------------------------------------------

## 38.27 --- Deduplication

Avoid duplicate notifications for the same underlying event.

Example:

a connector outage generating 200 failed jobs should not necessarily
produce 200 user alerts.

------------------------------------------------------------------------

## 38.28 --- Grouping

Similar events may be grouped.

Example:

``` text
12 follow-ups failed for Creator X
```

rather than 12 separate notifications.

------------------------------------------------------------------------

## 38.29 --- Cooldowns

Use cooldowns for recurring alerts.

Example:

do not send the same platform degradation warning every minute.

------------------------------------------------------------------------

## 38.30 --- Escalation

Critical unresolved events may escalate.

Example:

``` text
Platform disconnected
↓
In-app alert
↓
Still disconnected
↓
Email owner
```

depending on configured policy.

------------------------------------------------------------------------

## 38.31 --- Notification Actions

Where useful, notifications should provide a direct action.

Examples:

``` text
Open conversation
Review negotiation
Reconnect platform
Review billing
Take over
View script
```

------------------------------------------------------------------------

## 38.32 --- Deep Linking

Every actionable notification should open the exact relevant context
rather than the dashboard homepage.

------------------------------------------------------------------------

## 38.33 --- Read State

Support:

-   unread
-   read
-   mark all as read

Potentially:

-   archived/dismissed

if useful.

------------------------------------------------------------------------

## 38.34 --- Notification Inbox Filters

Filters:

-   all
-   unread
-   priority
-   category
-   creator

------------------------------------------------------------------------

## 38.35 --- Real-Time Delivery

Important in-app notifications should appear without requiring a full
page refresh.

Respect tenant and creator authorization.

------------------------------------------------------------------------

## 38.36 --- Notification Event Architecture

Notifications should be created from domain events where possible.

Example:

``` text
AI_ESCALATION_CREATED
↓
Notification Policy
↓
Notification
↓
Delivery
```

------------------------------------------------------------------------

## 38.37 --- Separation from Domain Logic

Core business actions should not directly contain large notification
implementations.

Use a notification service/policy layer.

------------------------------------------------------------------------

## 38.38 --- Policy Engine

Conceptually:

``` text
EVENT
↓
WHO SHOULD KNOW?
↓
HOW IMPORTANT?
↓
WHICH CHANNEL?
↓
COOLDOWN / DEDUP?
↓
DELIVER
```

------------------------------------------------------------------------

## 38.39 --- Full AI Escalation Policy

A Full AI escalation should be high priority when:

-   action cannot safely continue
-   custom request requires approval
-   pricing conflict
-   sensitive ambiguity
-   repeated AI failure

------------------------------------------------------------------------

## 38.40 --- AI Blocked Action

If the validator blocks an AI action:

not every block needs a user notification.

Differentiate:

``` text
NORMAL GUARDRAIL
vs
OPERATIONAL PROBLEM
```

------------------------------------------------------------------------

## 38.41 --- Purchase Notifications

Allow thresholds.

Example:

``` text
Notify me for purchases ≥ €100
```

rather than every €10 sale.

------------------------------------------------------------------------

## 38.42 --- Revenue Milestones

Optional future notification:

``` text
Creator reached €X today/month
```

Useful for agency management but not critical V1.

------------------------------------------------------------------------

## 38.43 --- Conversion Alerts

Analytics may trigger an alert when a meaningful
statistically/operationally relevant degradation is detected.

Avoid alerting on tiny sample sizes.

------------------------------------------------------------------------

## 38.44 --- Script Performance Alert

Example:

``` text
Script A — Step 1 unlock rate dropped significantly versus baseline.
```

The alert should link to analytics.

------------------------------------------------------------------------

## 38.45 --- Media Performance Alert

Optional:

-   high-performing media
-   underperforming media
-   repeated request with no matching media

------------------------------------------------------------------------

## 38.46 --- Fan Opportunity Alert

Potentially:

``` text
High-intent fan has returned.
```

Only if the connector provides reliable activity data.

------------------------------------------------------------------------

## 38.47 --- Follow-up Approval Queue

If an agency requires manual approval:

create a dedicated operational queue rather than relying only on
notifications.

Notifications should point to the queue.

------------------------------------------------------------------------

## 38.48 --- Custom Request Queue

Custom requests requiring human action should have a clear queue/status.

Possible states:

``` text
NEW
REVIEWING
APPROVED
DECLINED
FULFILLED
```

------------------------------------------------------------------------

## 38.49 --- Notification Noise Protection

A noisy notification system will be ignored.

Therefore track:

``` text
notification volume
open rate
action rate
dismiss rate
```

where useful.

------------------------------------------------------------------------

## 38.50 --- Digest

For lower-priority events, a digest can replace immediate notifications.

Example:

``` text
Daily performance digest
```

Future or configurable.

------------------------------------------------------------------------

## 38.51 --- Critical Alerts Are Immediate

Do not put critical events only in a digest.

Examples:

-   security
-   billing failure affecting service
-   platform disconnect
-   Full AI incident

------------------------------------------------------------------------

## 38.52 --- Quiet Hours

Optional user preference for non-critical notifications.

Critical alerts may bypass quiet hours depending on policy.

------------------------------------------------------------------------

## 38.53 --- Timezone

Notification scheduling and digest times must respect the
user's/workspace timezone settings.

------------------------------------------------------------------------

## 38.54 --- Localization

Notification architecture should not hardcode assumptions preventing
future localization.

V1 language scope can remain limited.

------------------------------------------------------------------------

## 38.55 --- Notification Copy

Copy should be concise and operational.

Bad:

``` text
Something happened.
```

Good:

``` text
Full AI paused for Creator Emma after a pricing rule conflict.
```

------------------------------------------------------------------------

## 38.56 --- No Sensitive Overexposure

Email/external notifications should avoid exposing unnecessary private
fan information.

Deep link back into authenticated OmniFlow.

------------------------------------------------------------------------

## 38.57 --- Audit

Important notification events should be traceable.

Especially:

-   critical alerts
-   billing
-   security
-   Full AI escalations

------------------------------------------------------------------------

## 38.58 --- Retry

External delivery failures may retry according to channel policy.

Use bounded retries.

------------------------------------------------------------------------

## 38.59 --- Failed Notification Delivery

A failed email/Slack/etc. notification should not break the original
business transaction.

Notification delivery is generally secondary.

------------------------------------------------------------------------

## 38.60 --- Idempotency

Notification creation/delivery should be protected against duplicate
event processing.

------------------------------------------------------------------------

## 38.61 --- Admin Visibility

Internal admin should be able to inspect:

-   notification volume
-   failed deliveries
-   channel health
-   unusual spikes

------------------------------------------------------------------------

## 38.62 --- Operational Alerts vs User Notifications

Keep separate concepts:

``` text
USER NOTIFICATION
```

and:

``` text
INTERNAL OPERATIONAL ALERT
```

Partie 31 defines the latter in depth.

------------------------------------------------------------------------

## 38.63 --- Security Boundaries

A notification deep link must still pass normal authorization.

Possessing a notification ID or URL must never bypass access control.

------------------------------------------------------------------------

## 38.64 --- Deletion

Define retention policy for old notifications.

Do not let the table grow indefinitely without strategy.

------------------------------------------------------------------------

## 38.65 --- Testing

Test:

-   create
-   dedup
-   grouping
-   read/unread
-   permissions
-   creator scope
-   deep link
-   delivery failure
-   retry
-   preference filtering

------------------------------------------------------------------------

## 38.66 --- E2E Scenario --- Full AI

``` text
AI requires human
↓
Escalation created
↓
High-priority notification
↓
Manager opens conversation
↓
Takes over
↓
Notification resolved/read
```

------------------------------------------------------------------------

## 38.67 --- E2E Scenario --- Platform

``` text
Connector disconnected
↓
Alert generated
↓
Owner notified
↓
Reconnect action
↓
Connector healthy
```

------------------------------------------------------------------------

## 38.68 --- E2E Scenario --- Billing

``` text
Payment failure
↓
Billing notification
↓
Owner opens billing
↓
Payment method updated
↓
Issue resolved
```

------------------------------------------------------------------------

## 38.69 --- E2E Scenario --- Negotiation

``` text
Fan proposes special deal
↓
AI requires approval
↓
Notification
↓
Manager reviews
↓
Approve / decline
↓
Conversation continues
```

------------------------------------------------------------------------

## 38.70 --- Notification Settings UI

Create settings section with grouped controls.

Example:

``` text
AI & Conversations
Sales
Platform
Billing
Security
```

------------------------------------------------------------------------

## 38.71 --- Global vs Personal Settings

Agency can define global defaults.

Users can personalize where allowed.

Critical security/billing notifications may not be fully disableable for
responsible account roles.

------------------------------------------------------------------------

## 38.72 --- Default Strategy

Default to fewer, higher-value notifications.

Users can opt into more detailed alerts.

------------------------------------------------------------------------

## 38.73 --- MVP Notification Scope

P0/P1:

``` text
Full AI escalation
Human takeover required
Platform disconnect
Billing failure
Security/account issue
Custom request approval
Critical system incident
```

------------------------------------------------------------------------

## 38.74 --- Secondary Scope

P2:

``` text
High-value sale
Follow-up opportunity
Script degradation
Fan opportunity
Performance digest
```

------------------------------------------------------------------------

## 38.75 --- Future Scope

P3:

``` text
Slack
Telegram
Discord
Advanced digests
Smart notification ranking
```

------------------------------------------------------------------------

## 38.76 --- Claude Code Deliverables

Create or complete:

``` text
/docs/architecture/NOTIFICATIONS.md
/docs/operations/NOTIFICATION_POLICIES.md
```

------------------------------------------------------------------------

## 38.77 --- NOTIFICATIONS.md

Document:

-   schema
-   service
-   event flow
-   delivery adapters
-   permissions
-   realtime
-   retry
-   deduplication

------------------------------------------------------------------------

## 38.78 --- NOTIFICATION_POLICIES.md

Document:

-   event → notification mapping
-   priority
-   recipients
-   channels
-   cooldowns
-   escalation

------------------------------------------------------------------------

## 38.79 --- Acceptance Criteria

Notification system is acceptable when:

-   users see important events quickly
-   alerts link to the right context
-   permissions are respected
-   duplicates are controlled
-   noise remains manageable
-   critical events can escalate
-   external delivery failures do not corrupt core workflows
-   Full AI can reliably request human intervention
-   billing/platform/security events reach responsible users

------------------------------------------------------------------------

## 38.80 --- Final Principle

OmniFlow should not notify users about everything.

It should notify them about:

# WHAT REQUIRES ATTENTION.

The best notification system is not the one that sends the most alerts.

It is the one whose alerts users trust enough to act on.

------------------------------------------------------------------------

## PARTIE 38 --- VALIDÉE COMME NOTIFICATIONS & ALERTES

La suite du cahier des charges commence avec :

# PARTIE 39 --- ONBOARDING & ACTIVATION
