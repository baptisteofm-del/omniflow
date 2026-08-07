# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 19 --- PLATFORM INTEGRATIONS: ONLYFANS & MYM

## 19.1 --- Objectif

OmniFlow doit être conçu pour fonctionner avec les deux plateformes
prioritaires dès la V1 :

-   OnlyFans
-   MYM

L'objectif est de permettre à une agence de connecter ses comptes
créateurs à OmniFlow afin d'utiliser, selon les capacités réellement
disponibles :

-   conversations
-   réception des messages
-   envoi des messages
-   médias
-   offres payantes
-   transactions
-   abonnés / fans
-   événements commerciaux
-   données nécessaires aux analytics
-   Copilot
-   Full AI

Principe :

# ONE OMNIFLOW EXPERIENCE.

# MULTIPLE PLATFORM CONNECTORS.

L'architecture métier d'OmniFlow ne doit pas dépendre directement du
format interne d'OnlyFans ou de MYM.

## 19.2 --- Contrainte majeure

Claude Code ne doit PAS supposer l'existence d'une API officielle, d'un
endpoint, d'un webhook, d'un MCP ou d'une permission qui n'a pas été
confirmé.

Avant de développer une intégration production :

1.  vérifier les capacités officielles disponibles
2.  obtenir les accès nécessaires
3.  lire la documentation correspondante
4.  confirmer les permissions
5.  confirmer les règles d'utilisation
6.  créer le connecteur adapté

Si une fonctionnalité n'est pas officiellement disponible :

→ la marquer comme non disponible / pending integration.

Ne pas construire un système destiné à contourner les protections d'une
plateforme.

## 19.3 --- Étape obligatoire avant intégration réelle

Créer dans le plan projet une tâche explicite :

# PLATFORM ACCESS VALIDATION

Pour OnlyFans et MYM, vérifier :

-   API disponible ?
-   API partenaire ?
-   accès agence ?
-   OAuth ?
-   token ?
-   webhooks ?
-   messaging ?
-   media sending ?
-   paid media ?
-   transaction data ?
-   subscriber data ?
-   rate limits ?
-   automation permissions ?
-   commercial restrictions ?

Cette validation doit avoir lieu avant la phase d'intégration
production.

## 19.4 --- Contacter les plateformes

Si l'accès n'est pas publiquement disponible ou suffisamment documenté :

prévoir que le fondateur contacte directement :

-   OnlyFans
-   MYM

afin de demander un accès API / partenaire / intégration approprié.

Claude Code doit laisser cette dépendance clairement visible dans la
roadmap.

## 19.5 --- Pas de blocage du développement

L'absence temporaire d'accès réel aux plateformes ne doit pas bloquer la
construction du produit.

Construire :

# PLATFORM ADAPTER LAYER

avec des interfaces abstraites et un environnement Mock/Sandbox.

Cela permet de développer tout le Brain avant l'intégration réelle.

## 19.6 --- Architecture

Architecture recommandée :

``` text
OmniFlow Core
      ↓
Platform Service
      ↓
Unified Platform Interface
      ↓
 ┌──────────────┬──────────────┐
 │              │              │
OnlyFans       MYM          Future
Adapter        Adapter       Adapter
```

Le Core ne doit pas connaître les détails spécifiques d'une plateforme
sauf lorsque nécessaire.

## 19.7 --- Unified Platform Interface

Créer une interface commune couvrant les capacités OmniFlow.

Exemple conceptuel :

``` text
connectAccount()
disconnectAccount()

getCreators()
getFans()
getConversations()
getMessages()

sendMessage()
sendMedia()
sendPaidMedia()

getTransactions()
getSubscriptions()

registerWebhooks()
syncData()

getCapabilities()
```

Les méthodes réelles dépendent des capacités confirmées.

## 19.8 --- Capability Matrix

Chaque connecteur doit déclarer ce qu'il supporte.

Exemple :

``` json
{
  "read_messages": true,
  "send_messages": true,
  "send_media": true,
  "send_paid_media": false,
  "read_transactions": true,
  "webhooks": false
}
```

Le produit adapte automatiquement son interface et son autonomie.

## 19.9 --- Capability-driven UI

Ne jamais afficher une fonctionnalité comme disponible si la plateforme
connectée ne la supporte pas.

Exemple :

Si MYM Adapter ne permet pas encore une action :

→ bouton désactivé / feature unavailable.

Pas d'erreur silencieuse.

## 19.10 --- Platform Account

Créer un objet interne :

# PLATFORM ACCOUNT

Champs :

-   id
-   agency_id
-   platform
-   external_account_id
-   creator_id
-   status
-   connection_type
-   scopes / capabilities
-   token reference
-   last_sync_at
-   health
-   created_at
-   updated_at

## 19.11 --- Connection Status

Statuts :

-   NOT_CONNECTED
-   CONNECTING
-   CONNECTED
-   DEGRADED
-   REAUTH_REQUIRED
-   ERROR
-   DISCONNECTED

Afficher clairement l'état dans OmniFlow.

## 19.12 --- Connection Flow

UX :

**Settings** → **Integrations** → **OnlyFans / MYM** → **Connect**

Puis utiliser le mécanisme officiel disponible.

Ne jamais demander à l'utilisateur de transmettre son mot de passe de
plateforme à OmniFlow si une méthode d'autorisation appropriée existe.

## 19.13 --- Credential Security

Les credentials / tokens doivent être :

-   backend only
-   encrypted at rest
-   never exposed to frontend
-   never logged
-   revocable
-   rotatable

Utiliser un secret manager / mécanisme sécurisé adapté à
l'infrastructure.

## 19.14 --- Token Refresh

Si le système utilise des tokens expirables :

prévoir :

-   expiration tracking
-   refresh
-   retry
-   reauthorization
-   agency notification

Ne pas laisser Full AI fonctionner avec une connexion invalide.

## 19.15 --- Unified Creator

Un Creator OmniFlow peut être relié à :

-   OnlyFans
-   MYM
-   les deux

Exemple :

``` text
Creator: Emma

Platforms:
✓ OnlyFans
✓ MYM
```

Les données restent séparées par plateforme mais peuvent être agrégées
dans le dashboard.

## 19.16 --- Unified Fan Identity

Ne pas supposer qu'un fan OnlyFans et un fan MYM sont la même personne.

Par défaut :

``` text
OnlyFans Fan A
≠
MYM Fan B
```

Prévoir éventuellement une fusion manuelle future si une correspondance
est légitime et fiable.

## 19.17 --- External IDs

Chaque objet synchronisé doit conserver :

-   platform
-   external_id

Exemples :

-   external fan ID
-   external conversation ID
-   external message ID
-   external transaction ID
-   external media ID

Créer des contraintes d'unicité appropriées.

## 19.18 --- Normalized Data Model

Transformer les objets plateforme vers un format OmniFlow commun.

Exemple :

``` text
UnifiedMessage
UnifiedConversation
UnifiedFan
UnifiedTransaction
UnifiedMediaReference
```

Cela évite que le Brain doive comprendre deux schémas différents.

## 19.19 --- Raw Platform Payload

Pour debug et compatibilité :

conserver éventuellement une version contrôlée du payload brut lorsque
nécessaire.

Mais :

-   éviter les données inutiles
-   respecter la rétention
-   sécuriser
-   ne pas en faire la source principale de logique métier

## 19.20 --- Message Object

Format interne conceptuel :

``` json
{
  "id": "...",
  "platform": "ONLYFANS",
  "external_id": "...",
  "conversation_id": "...",
  "sender_type": "FAN",
  "text": "...",
  "media": [],
  "timestamp": "...",
  "metadata": {}
}
```

## 19.21 --- Conversation Sync

Le système doit pouvoir synchroniser :

-   conversations récentes
-   nouveaux messages
-   états utiles
-   historique nécessaire

La profondeur d'historique dépend :

-   API
-   plan
-   limites
-   besoins OmniFlow

Ne pas importer inutilement des années de données lors de la première
connexion.

## 19.22 --- Initial Sync

Lors de la connexion :

1.  authenticate
2.  retrieve capabilities
3.  retrieve creator account
4.  import recent fans
5.  import recent conversations
6.  import relevant transactions
7.  build initial memory
8.  calculate initial fan scores
9.  mark sync complete

Afficher la progression.

## 19.23 --- Background Sync

Après connexion :

préférer :

### WEBHOOKS

si disponibles.

Sinon :

### CONTROLLED POLLING

selon rate limits et règles de plateforme.

## 19.24 --- Webhooks

Si disponibles :

valider :

-   signature
-   timestamp
-   event ID
-   replay protection

Stocker l'événement avant traitement lorsque pertinent.

## 19.25 --- Polling

Si polling nécessaire :

-   configurable intervals
-   incremental sync
-   cursor
-   last_sync
-   rate limit awareness
-   retries
-   backoff

Ne pas rescanner toutes les conversations à chaque cycle.

## 19.26 --- Event Normalization

Transformer les événements plateforme en événements OmniFlow.

Exemple :

``` text
platform.message.created
→ MESSAGE_RECEIVED

platform.purchase.created
→ PURCHASE_CONFIRMED
```

Le Brain consomme les événements OmniFlow.

## 19.27 --- Incoming Message Pipeline

Lorsqu'un message arrive :

``` text
Platform
↓
Adapter
↓
Normalize
↓
Store
↓
Conversation State
↓
Memory Retrieval
↓
Fan Intelligence
↓
Sales Strategy Engine
↓
Conversation Engine
↓
Action Validator
↓
Send / Copilot Suggestion
```

## 19.28 --- Outgoing Message Pipeline

Avant envoi :

1.  action authorized
2.  current connection valid
3.  platform capability
4.  message validated
5.  platform format conversion
6.  send
7.  capture external message ID
8.  store result
9.  update state
10. learning event

## 19.29 --- Paid Media Sending

Si supporté :

le connecteur reçoit une action structurée.

Exemple :

``` json
{
  "action": "SEND_PAID_MEDIA",
  "media_id": "...",
  "price": 45,
  "currency": "EUR",
  "caption": "..."
}
```

Le connecteur convertit vers le format plateforme.

Le prix doit déjà avoir été validé par Pricing Engine.

## 19.30 --- Purchase Confirmation

Une vente n'est considérée confirmée que lorsque la plateforme fournit
un signal suffisamment fiable.

Créer :

# PURCHASE_CONFIRMED

avec :

-   transaction ID
-   fan
-   creator
-   amount
-   currency
-   timestamp
-   platform
-   linked offer si possible

## 19.31 --- Revenue Source of Truth

Pour les commissions et analytics :

la source de vérité doit être la transaction plateforme confirmée, pas
le texte de la conversation.

Un fan disant :

« je l'ai acheté »

ne suffit pas.

## 19.32 --- Transaction Sync

Synchroniser :

-   transaction
-   amount
-   currency
-   fan
-   creator
-   type
-   status
-   timestamp
-   refund/reversal si disponible

Cela alimente :

-   revenue analytics
-   script conversion
-   media performance
-   OmniFlow commission ledger

## 19.33 --- Refunds / Reversals

Si la plateforme expose :

-   refund
-   chargeback
-   reversal

mettre à jour :

-   revenue
-   attribution
-   commission ledger

Ne pas conserver une commission calculée sur une vente annulée si le
contrat prévoit l'inverse.

## 19.34 --- Fan Sync

Importer uniquement les données nécessaires.

Exemples :

-   platform fan ID
-   display name
-   subscription status
-   join date
-   spend data si disponible
-   conversation relation

Ne pas dépendre d'un champ non garanti par toutes les plateformes.

## 19.35 --- Platform-specific Metadata

Les données uniques à une plateforme peuvent être stockées dans :

``` text
platform_metadata
```

Mais le Brain doit privilégier les champs normalisés.

## 19.36 --- Platform Formatting

Chaque plateforme peut avoir ses propres limites :

-   message length
-   media format
-   price format
-   attachment rules
-   rate limits

Le connecteur doit adapter l'action.

Le Conversation Engine ne doit pas gérer ces détails.

## 19.37 --- Rate Limits

Créer un Rate Limit Manager par plateforme.

Suivre :

-   requests remaining
-   reset
-   endpoint limits
-   account limits

Si proche de la limite :

prioriser les actions importantes.

## 19.38 --- Action Queue

Les actions sortantes doivent passer par une queue fiable.

Exemple :

``` text
AI_ACTION
↓
VALIDATED
↓
QUEUED
↓
PLATFORM_SEND
↓
CONFIRMED
```

Cela facilite :

-   retries
-   rate limits
-   idempotency
-   audit

## 19.39 --- Idempotency

Chaque action externe doit avoir une clé unique.

Un retry ne doit pas envoyer deux fois :

-   message
-   média
-   offre

si la première requête a déjà réussi.

## 19.40 --- Reconciliation

Prévoir un job périodique de réconciliation.

Comparer :

-   OmniFlow state
-   platform state

Objectifs :

-   détecter message manquant
-   transaction manquante
-   sync failure
-   duplicate
-   stale state

## 19.41 --- Human Activity

Si un chatter humain utilise directement la plateforme en parallèle
d'OmniFlow :

OmniFlow doit, lorsque les données disponibles le permettent,
synchroniser ses actions.

Exemple :

un humain répond directement sur OnlyFans.

→ OmniFlow doit voir le nouveau message avant de relancer
automatiquement.

## 19.42 --- Conflict Prevention

Avant Full AI send :

revalider le dernier état.

Si un humain vient de répondre :

→ annuler l'action IA devenue obsolète.

Cela évite :

-   double réponse
-   contradictions
-   double vente
-   mauvais script state

## 19.43 --- Human Takeover

Lorsque Human Takeover est actif :

-   Full AI sending disabled pour cette conversation
-   incoming sync remains active
-   memory remains active
-   analytics remain active
-   Copilot peut éventuellement rester disponible

Le retour en Full AI doit être explicite ou suivre une règle configurée.

## 19.44 --- Copilot sans envoi automatique

Si une plateforme autorise la lecture mais pas l'envoi automatisé :

OmniFlow peut éventuellement fonctionner en :

# READ + COPILOT MODE

Le système :

-   analyse
-   recommande
-   prépare la réponse

mais l'utilisateur effectue l'action selon le workflow autorisé.

## 19.45 --- Full AI Capability Requirement

Full AI ne doit être activable que si toutes les capacités nécessaires
sont confirmées.

Exemple :

-   read messages
-   send messages
-   transaction confirmation
-   media operations nécessaires
-   permissions valides

Sinon :

→ Full AI unavailable for this platform/account.

## 19.46 --- Integration Health

Créer un Health Score ou statut.

Vérifier :

-   authentication
-   last successful sync
-   webhook health
-   error rate
-   queue backlog
-   rate limit
-   transaction sync

Afficher :

**Healthy** **Degraded** **Action Required**

## 19.47 --- Integration Dashboard

Settings → Integrations.

Pour chaque compte :

-   platform
-   creator
-   status
-   capabilities
-   last sync
-   errors
-   reconnect
-   disconnect

## 19.48 --- Error Handling

Catégories :

-   AUTH_ERROR
-   RATE_LIMIT
-   PLATFORM_DOWN
-   INVALID_REQUEST
-   PERMISSION_ERROR
-   MEDIA_ERROR
-   SYNC_ERROR
-   UNKNOWN

Chaque erreur doit avoir :

-   retryable yes/no
-   user action needed yes/no
-   internal logging

## 19.49 --- Platform Downtime

Si plateforme indisponible :

-   stop sending
-   preserve queued safe actions
-   continue local app
-   show degraded state
-   retry appropriately

Avant d'envoyer une ancienne action après retour :

→ revalidate context.

## 19.50 --- Disconnect

Lorsqu'une agence déconnecte un compte :

-   revoke token si possible
-   stop sync
-   stop scheduled actions
-   disable Full AI
-   preserve historical analytics selon politique
-   remove credentials

Ne pas supprimer automatiquement toutes les données historiques sans
demande explicite.

## 19.51 --- Multi-account Agencies

Une agence peut connecter plusieurs créatrices.

Architecture :

``` text
Agency
├── Creator A
│   ├── OnlyFans
│   └── MYM
├── Creator B
│   └── OnlyFans
└── Creator C
    └── MYM
```

Tous les objets doivent être correctement tenant-scoped.

## 19.52 --- Cross-platform Dashboard

Le Dashboard peut afficher :

### ALL PLATFORMS

-   revenue
-   conversations
-   sales
-   AI actions

Puis filtres :

-   OnlyFans
-   MYM
-   creator

Ne pas additionner des métriques incompatibles sans normalisation.

## 19.53 --- Cross-platform Fan Intelligence

Fan Intelligence reste spécifique à l'identité fan de chaque plateforme
par défaut.

Cependant les mêmes moteurs :

-   scoring
-   memory
-   strategy
-   scripts

doivent fonctionner indépendamment de la plateforme.

## 19.54 --- Platform-specific Strategy

Certaines règles peuvent varier par plateforme.

Prévoir :

Agency Settings → Platform Overrides.

Exemple :

OnlyFans strategy MYM strategy

sans dupliquer toute la configuration.

## 19.55 --- Mock Platform

Créer un :

# OMNIFLOW MOCK CONNECTOR

Il doit simuler :

-   fan message
-   message send
-   media send
-   paid offer
-   purchase
-   no purchase
-   webhook
-   platform error
-   rate limit

Ce connecteur est essentiel pour développer avant les accès réels.

## 19.56 --- Demo Environment

Le Mock Connector doit aussi pouvoir alimenter une démo commerciale.

Exemple :

-   fake creator
-   fake fans
-   fake conversations
-   fake transactions

Les données démo doivent être clairement séparées de la production.

## 19.57 --- Integration Tests

Pour chaque adapter :

tester :

-   auth
-   read
-   send
-   duplicate event
-   retry
-   rate limit
-   token expiry
-   disconnect
-   purchase
-   refund
-   human activity
-   malformed payload

## 19.58 --- Contract Tests

Créer des tests garantissant que OnlyFansAdapter et MYMAdapter
respectent la même interface OmniFlow.

Cela permet au Core d'être réellement platform-agnostic.

## 19.59 --- Sandbox

Si une plateforme fournit un environnement sandbox :

l'utiliser avant production.

Sinon :

Mock Connector + comptes de test autorisés selon les règles applicables.

## 19.60 --- Security Review

Avant production :

vérifier :

-   credential storage
-   access scopes
-   webhook verification
-   tenant isolation
-   logs
-   media access
-   data retention
-   disconnect
-   token rotation

## 19.61 --- Compliance Review

Avant activation de l'automatisation réelle :

confirmer :

-   droit d'accès aux données
-   droit d'automatiser les actions concernées
-   règles commerciales
-   règles de messagerie
-   exigences contractuelles
-   protection des données

Cette étape doit être un gate de production.

## 19.62 --- Feature Flags

Prévoir des flags par plateforme.

Exemples :

``` text
onlyfans_full_ai
onlyfans_paid_media
mym_full_ai
mym_paid_media
```

Cela permet d'activer progressivement les capacités validées.

## 19.63 --- Rollout

Ordre recommandé :

1.  Mock Connector
2.  read-only integration
3.  Copilot
4.  controlled sending
5.  paid media
6.  transaction reconciliation
7.  Full AI closed beta
8.  Full AI wider rollout

OnlyFans et MYM peuvent avancer à des vitesses différentes.

## 19.64 --- Intégration et Benchmark

Avant Full AI sur chaque plateforme :

tester les Golden Conversations dans un contexte proche de la plateforme
réelle.

Vérifier notamment :

-   formatting
-   timing
-   purchase detection
-   script progression
-   media actions
-   human conflicts

## 19.65 --- Critère de réussite

Les intégrations OnlyFans & MYM sont réussies lorsque :

-   les deux plateformes utilisent une architecture commune
-   aucune capacité non confirmée n'est inventée
-   OmniFlow peut être développé avec Mock Connector avant les accès
    réels
-   les comptes sont connectés de manière sécurisée
-   les messages sont correctement synchronisés
-   les actions sont idempotentes
-   les transactions confirmées alimentent les analytics
-   les interventions humaines sont détectées
-   Full AI ne fonctionne que lorsque les capacités nécessaires existent
-   une panne plateforme ne casse pas l'état OmniFlow
-   de nouvelles plateformes pourront être ajoutées sans reconstruire le
    Brain

# BUILD OMNIFLOW ON A PLATFORM LAYER.

# NEVER BUILD THE PRODUCT AROUND ONE PLATFORM'S INTERNALS.

------------------------------------------------------------------------

## PARTIE 19 --- VALIDÉE COMME SPÉCIFICATION DES PLATFORM INTEGRATIONS ONLYFANS & MYM

La suite du cahier des charges commence avec :

# PARTIE 20 --- DASHBOARD, ANALYTICS & ROI COMMAND CENTER
