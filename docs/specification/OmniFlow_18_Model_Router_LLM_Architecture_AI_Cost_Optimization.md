# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 18 --- MODEL ROUTER, LLM ARCHITECTURE & AI COST OPTIMIZATION

## 18.1 --- Objectif

OmniFlow ne doit pas utiliser le même modèle IA pour toutes les tâches.

Certaines opérations sont :

-   simples
-   fréquentes
-   structurées
-   peu ambiguës

D'autres nécessitent :

-   raisonnement avancé
-   compréhension conversationnelle profonde
-   arbitrage stratégique
-   analyse de situations ambiguës

Principe :

# USE THE CHEAPEST MODEL THAT CAN RELIABLY DO THE JOB.

Mais :

# NEVER SACRIFICE CORE PRODUCT QUALITY TO SAVE A FEW TOKENS.

Le Model Router doit sélectionner automatiquement le modèle adapté à
chaque tâche.

## 18.2 --- Architecture multi-modèles

Prévoir une couche indépendante :

# MODEL ROUTER

Les autres moteurs ne doivent pas appeler directement un modèle
spécifique lorsque cela peut être évité.

Architecture :

``` text
OmniFlow Engine
      ↓
Task Request
      ↓
Model Router
      ↓
Provider / Model Selection
      ↓
LLM
      ↓
Structured Response
```

Cela permet de changer de modèle sans reconstruire toute l'application.

## 18.3 --- Providers

L'architecture doit pouvoir supporter plusieurs providers.

Exemples potentiels :

-   Anthropic
-   OpenAI
-   autres providers futurs

La V1 peut démarrer avec un provider principal.

Mais les interfaces internes doivent éviter un verrouillage inutile.

## 18.4 --- Anthropic comme base initiale

Pour la V1, Anthropic peut être utilisé comme provider principal si les
tests confirment les performances nécessaires.

Ne pas coder les noms de modèles partout dans l'application.

Créer une configuration centrale.

Exemple conceptuel :

``` text
FAST_MODEL
STANDARD_MODEL
REASONING_MODEL
PREMIUM_MODEL
```

Puis mapper ces catégories vers les modèles réellement disponibles.

## 18.5 --- Haiku-class Model

Un modèle rapide et économique de classe Haiku peut être utilisé pour
des tâches telles que :

-   classification simple
-   intent detection
-   language detection
-   objection classification
-   extraction structurée
-   basic summarization
-   tagging
-   simple memory extraction
-   lightweight routing

Haiku 4.5 ou son équivalent disponible doit être benchmarké sur les
tâches OmniFlow avant validation.

Ne pas considérer automatiquement qu'un modèle moins cher est
suffisamment performant.

## 18.6 --- Sonnet-class Model

Un modèle de classe Sonnet peut être le modèle principal pour :

-   conversation generation
-   Model DNA fidelity
-   nuanced understanding
-   sales strategy reasoning
-   objection handling
-   negotiation language
-   memory-aware responses
-   script adaptation
-   ambiguous fan requests

Il représente probablement le meilleur compromis initial :

**quality / latency / cost**

mais cette hypothèse doit être confirmée par Benchmark.

## 18.7 --- Opus-class / Premium Reasoning Model

Un modèle premium de classe Opus peut être réservé aux situations où sa
performance supplémentaire justifie son coût.

Exemples :

-   situation extrêmement ambiguë
-   high-value fan
-   complex custom request
-   difficult strategy arbitration
-   benchmark judging
-   complex conversation analysis
-   internal evaluation

Ne pas utiliser le modèle le plus coûteux sur chaque message.

## 18.8 --- Task Registry

Créer un registre des tâches IA.

Exemple :

``` text
TASK_INTENT_CLASSIFICATION
TASK_MEMORY_EXTRACTION
TASK_FAN_ANALYSIS
TASK_STRATEGY_DECISION
TASK_CONVERSATION_GENERATION
TASK_OBJECTION_CLASSIFICATION
TASK_MEDIA_QUERY
TASK_FOLLOWUP_GENERATION
TASK_BENCHMARK_JUDGE
```

Chaque tâche possède :

-   default model tier
-   fallback tier
-   timeout
-   token budget
-   structured output schema
-   benchmark
-   cost tracking

## 18.9 --- Routing Policy

Exemple conceptuel :

``` text
Simple deterministic task
→ no LLM

Simple AI classification
→ FAST_MODEL

Normal conversation
→ STANDARD_MODEL

Complex strategy
→ REASONING_MODEL

High-risk ambiguity
→ PREMIUM_MODEL or HUMAN
```

Le routing doit être configurable.

## 18.10 --- No-LLM First

Avant d'appeler un modèle, demander :

# CAN THIS BE DONE DETERMINISTICALLY?

Exemples sans LLM :

-   price calculation
-   minimum price validation
-   permission checks
-   transaction matching
-   cooldown
-   script state
-   timestamps
-   max attempts
-   commission calculation

Ne pas payer un LLM pour de la logique classique.

## 18.11 --- Complexity Detection

Le Router peut estimer la complexité.

Signaux :

-   ambiguity
-   conversation length
-   conflicting intent
-   custom request
-   strategy uncertainty
-   confidence from fast model
-   high-value context
-   missing information

Une tâche simple reste sur le modèle rapide.

Une tâche complexe peut être escaladée.

## 18.12 --- Confidence-based Escalation

Exemple :

FAST_MODEL classification confidence ≥ threshold → accept.

Confidence below threshold → STANDARD_MODEL.

Toujours calibrer les seuils avec Benchmark.

## 18.13 --- Cascading

Prévoir un système de cascade.

Exemple :

1.  FAST_MODEL
2.  validator
3.  if failed → STANDARD_MODEL
4.  validator
5.  if still uncertain → PREMIUM_MODEL / HUMAN

Cela permet d'optimiser les coûts.

## 18.14 --- High-value Context

Pour certaines situations commerciales importantes, l'agence peut
autoriser une politique plus premium.

Exemple :

Spending Potential very high + complex negotiation

→ utiliser un modèle supérieur.

La logique doit rester configurable.

## 18.15 --- Full AI vs Copilot

Le Router peut avoir des exigences différentes.

### COPILOT

Une suggestion imparfaite peut être corrigée par un humain.

### FULL AI

L'exécution autonome nécessite :

-   confiance plus élevée
-   validators
-   éventuellement modèle supérieur

Le coût supplémentaire peut être justifié.

## 18.16 --- Model Abstraction Layer

Créer une interface commune.

Exemple conceptuel :

``` text
generate(task, context, options)
```

Le reste de l'application ne doit pas dépendre du SDK spécifique du
provider.

Adapter :

-   messages
-   system prompts
-   structured outputs
-   token usage
-   errors
-   streaming

dans la couche provider.

## 18.17 --- Structured Outputs

Lorsque possible, demander des sorties structurées.

Exemple :

``` json
{
  "intent": "PRICE_OBJECTION",
  "confidence": 0.94
}
```

Valider côté serveur avec un schéma.

Si parsing invalide :

-   retry
-   fallback
-   escalation

## 18.18 --- Prompt Registry

Créer un registre centralisé des prompts.

Chaque prompt :

-   id
-   task
-   version
-   model compatibility
-   variables
-   output schema
-   status
-   benchmark result

Ne pas disperser les prompts en chaînes de caractères non versionnées
dans le code.

## 18.19 --- Prompt Composition

Construire les prompts à partir de blocs.

Exemple :

-   system identity
-   task
-   Model DNA
-   fan context
-   agency rules
-   output constraints
-   relevant memory
-   script context

N'injecter que les blocs nécessaires à la tâche.

## 18.20 --- Context Budget

Chaque tâche doit avoir un budget de contexte.

Ne pas envoyer :

-   toute la mémoire
-   toute la conversation
-   toute la bibliothèque
-   tous les scripts
-   tous les settings

à chaque appel.

Utiliser retrieval + summarization + structured state.

## 18.21 --- Conversation Window

Prévoir :

-   recent raw messages
-   conversation summary
-   relevant long-term memory
-   current state

Cela permet de conserver la continuité sans exploser le nombre de
tokens.

## 18.22 --- Context Compression

Lorsque la conversation devient longue :

résumer les parties anciennes en données structurées.

Conserver séparément :

-   important facts
-   unresolved topics
-   relationship state
-   commercial history
-   promises / commitments
-   script state

Le résumé ne doit pas remplacer les événements commerciaux fiables
stockés en base.

## 18.23 --- Retrieval

Pour la mémoire longue :

récupérer uniquement les éléments pertinents.

Pipeline :

1.  query construction
2.  tenant/fan filter
3.  semantic retrieval
4.  relevance ranking
5.  Anti-Creepy filtering
6.  context injection

## 18.24 --- Token Budget

Mesurer pour chaque appel :

-   input tokens
-   output tokens
-   cached tokens si provider supporté
-   model
-   task
-   agency
-   creator

Cela permet de connaître le coût réel du produit.

## 18.25 --- AI Cost Ledger

Créer un ledger interne.

Pour chaque appel :

-   request_id
-   provider
-   model
-   task
-   input tokens
-   output tokens
-   cost estimate
-   latency
-   status
-   agency_id
-   creator_id
-   fan_id si applicable

## 18.26 --- Cost per Conversation

Calculer :

-   AI cost per conversation
-   AI cost per active fan
-   AI cost per sale
-   AI cost per € revenue generated

Ces métriques sont essentielles pour valider le business model.

## 18.27 --- Gross Margin Protection

Avec une commission OmniFlow de 2,5 %, les coûts IA doivent rester
suffisamment bas pour conserver une marge attractive.

Le système doit donc surveiller :

``` text
AI COST
+
INFRASTRUCTURE COST
+
PAYMENT/BILLING COST
<
SUBSCRIPTION REVENUE + COMMISSION REVENUE
```

Créer des alertes si le coût IA d'une agence devient anormalement élevé.

## 18.28 --- Usage Limits

Les abonnements peuvent définir des limites :

-   creators
-   conversations
-   AI messages
-   Full AI usage
-   premium reasoning usage
-   storage

Les limites exactes seront définies dans Pricing & Plans.

L'architecture doit pouvoir mesurer l'usage.

## 18.29 --- Cost Guardrails

Prévoir :

-   max output tokens
-   max context
-   max premium calls
-   request timeout
-   retry limit
-   daily anomaly alerts
-   agency usage monitoring

Ne pas laisser une boucle technique créer des milliers d'appels.

## 18.30 --- Retry Policy

En cas d'erreur provider :

-   retry limité
-   exponential backoff
-   idempotency
-   fallback provider/model

Ne pas relancer indéfiniment.

## 18.31 --- Fallback Model

Chaque tâche critique doit avoir un fallback.

Exemple :

STANDARD_MODEL unavailable → alternate standard model.

Si aucun modèle fiable :

→ Copilot / Human Required selon action.

## 18.32 --- Provider Outage

Prévoir un état :

**AI DEGRADED MODE**

Possibilités :

-   disable Full AI
-   keep manual chatting
-   keep deterministic features
-   show status
-   queue safe tasks

Ne pas rendre toute l'application inutilisable.

## 18.33 --- Timeout

Chaque tâche possède un timeout adapté.

Exemple :

classification : court.

complex reasoning : plus long.

Si timeout :

-   retry/fallback
-   do not duplicate actions
-   log incident

## 18.34 --- Streaming

Utiliser le streaming principalement pour :

-   Copilot message generation
-   user-facing AI interactions

Pour les décisions structurées backend :

préférer une réponse complète validable.

## 18.35 --- Parallel Calls

Certaines analyses indépendantes peuvent être parallélisées.

Exemple :

-   fan score update
-   memory extraction
-   media retrieval

Mais éviter de paralléliser des tâches dépendantes.

## 18.36 --- Batch Processing

Pour :

-   imports
-   analytics
-   historical conversation processing
-   auto-tagging

utiliser batch/background processing lorsque pertinent.

Ne pas bloquer l'interface.

## 18.37 --- Cache

Cache possible pour :

-   static prompt fragments
-   Model DNA compiled profile
-   agency settings
-   creator facts
-   provider-supported prompt caching

Ne pas cacher aveuglément les réponses conversationnelles.

## 18.38 --- Prompt Caching

Si le provider supporte le prompt caching :

identifier les blocs stables :

-   system instructions
-   OmniFlow rules
-   creator DNA
-   agency configuration

Mesurer réellement l'économie avant optimisation complexe.

## 18.39 --- Model Benchmark Matrix

Créer une matrice.

Exemple :

  Task                  Fast   Standard   Premium
  ------------------- ------ ---------- ---------
  Intent                Test       Test      Test
  Memory extraction     Test       Test      Test
  Strategy              Test       Test      Test
  Conversation          Test       Test      Test
  Negotiation           Test       Test      Test

Pour chaque case :

-   quality
-   latency
-   cost

## 18.40 --- Model Selection Rule

Le modèle choisi doit être celui qui satisfait le seuil qualité au coût
total le plus intéressant.

Exemple :

Haiku-class: Quality 97 Cost 1

Sonnet-class: Quality 99 Cost 5

Si seuil = 95 :

→ Haiku-class.

Pour Conversation Quality :

Haiku = 82 Sonnet = 96 Threshold = 93

→ Sonnet.

## 18.41 --- Benchmark Before Production

Ne pas choisir Haiku, Sonnet ou Opus uniquement sur réputation.

Tester sur des scénarios OmniFlow réels.

Claude Code doit prévoir une configuration permettant de changer les
modèles sans refactor majeur.

## 18.42 --- Model Upgrade

Lorsqu'un nouveau modèle apparaît :

1.  register model
2.  run Benchmark
3.  compare quality
4.  compare latency
5.  compare cost
6.  shadow test
7.  canary
8.  production

Ne pas migrer automatiquement.

## 18.43 --- Model Deprecation

Prévoir qu'un provider puisse retirer un modèle.

Aucun modèle critique ne doit être hardcodé comme dépendance permanente.

## 18.44 --- AI Observability

Dashboard interne :

-   requests/min
-   latency
-   errors
-   token usage
-   cost
-   model distribution
-   fallback rate
-   validator failure
-   escalation rate

Filtres :

-   task
-   model
-   agency
-   creator
-   date

## 18.45 --- Quality/Cost Score

Créer éventuellement un score interne :

``` text
Utility =
Quality × Business Impact
-------------------------
Cost + Latency Penalty
```

Ne pas utiliser une formule simpliste en production sans calibration.

L'objectif est d'aider à comparer les routes.

## 18.46 --- Privacy

Ne transmettre au modèle que les données nécessaires à la tâche.

Éviter d'envoyer :

-   données inutiles
-   secrets
-   credentials
-   informations d'autres tenants

Les logs LLM doivent respecter les règles de confidentialité.

## 18.47 --- Secrets

Les clés API providers :

-   serveur uniquement
-   variables d'environnement / secret manager
-   jamais frontend
-   jamais logs
-   rotation possible

## 18.48 --- Data Retention

Définir une politique pour :

-   prompts
-   model outputs
-   raw provider responses
-   debugging traces

Ne pas conserver indéfiniment des données sensibles sans nécessité.

## 18.49 --- Critère de réussite

Le Model Router est réussi lorsque :

-   chaque tâche utilise un modèle adapté
-   les tâches simples n'utilisent pas inutilement un modèle premium
-   les conversations importantes restent de haute qualité
-   Full AI utilise des seuils plus stricts
-   les coûts sont mesurés par agence et tâche
-   les providers peuvent être remplacés
-   les prompts sont versionnés
-   les erreurs disposent de fallbacks
-   les nouveaux modèles peuvent être benchmarkés rapidement
-   la marge OmniFlow reste protégée

# SMART ROUTING IS NOT ABOUT USING CHEAPER AI.

# IT IS ABOUT SPENDING COMPUTE WHERE INTELLIGENCE CREATES VALUE.

------------------------------------------------------------------------

## PARTIE 18 --- VALIDÉE COMME SPÉCIFICATION DU MODEL ROUTER, LLM ARCHITECTURE & AI COST OPTIMIZATION

La suite du cahier des charges commence avec :

# PARTIE 19 --- PLATFORM INTEGRATIONS: ONLYFANS & MYM
