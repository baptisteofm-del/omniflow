# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 5 --- AI MODEL ROUTER

## 5.1 --- Objectif

OmniFlow ne doit pas utiliser un seul modèle IA pour toutes les tâches.

Créer un **AI Model Router** central chargé de sélectionner le modèle le
plus adapté selon :

-   type de tâche
-   complexité
-   importance commerciale
-   niveau de risque
-   latence attendue
-   coût
-   taille du contexte
-   besoin de raisonnement
-   besoin de structured output
-   disponibilité du provider
-   résultats du Benchmark

Objectif :

# UTILISER LA BONNE INTELLIGENCE AU BON MOMENT.

Le modèle le plus puissant ne doit pas être appelé lorsqu'un modèle plus
rapide et moins coûteux obtient une qualité suffisante.

Inversement, OmniFlow ne doit pas sacrifier une décision commerciale
importante uniquement pour économiser quelques tokens.

## 5.2 --- Architecture provider-agnostic

Le Router doit être indépendant d'Anthropic.

Même si Anthropic constitue le provider principal au lancement,
l'architecture doit permettre ultérieurement :

-   Anthropic
-   OpenAI
-   Google
-   autres providers compatibles
-   modèles spécialisés internes éventuels

Ne jamais disperser les appels directs aux providers dans toute la
codebase.

Tous les appels IA doivent passer par une couche centrale.

## 5.3 --- Model Registry

Créer un registre configurable des modèles.

Pour chaque modèle, stocker notamment :

-   provider
-   model identifier
-   display name
-   enabled / disabled
-   task compatibility
-   context window si nécessaire
-   structured output support
-   estimated input cost
-   estimated output cost
-   latency class
-   reasoning class
-   fallback priority
-   benchmark score
-   production status

Les identifiants exacts des modèles doivent être configurables afin de
pouvoir évoluer sans modifier toute l'application.

## 5.4 --- Task Registry

Chaque appel IA doit appartenir à un type de tâche clairement identifié.

Exemples :

-   MESSAGE_CLASSIFICATION
-   INTENT_DETECTION
-   SENTIMENT_ANALYSIS
-   MEMORY_EXTRACTION
-   MEMORY_RETRIEVAL_SUPPORT
-   CONVERSATION_SUMMARY
-   FAN_SCORING
-   PURCHASE_INTENT_ANALYSIS
-   STRATEGY_SELECTION
-   COMPLEX_DECISION
-   OBJECTION_ANALYSIS
-   NEGOTIATION_DECISION
-   MEDIA_MATCHING
-   PRICE_RECOMMENDATION
-   RESPONSE_GENERATION
-   FOLLOW_UP_DECISION
-   SCRIPT_ANALYSIS
-   SCRIPT_OPTIMIZATION
-   ANALYTICS_INSIGHT
-   BENCHMARK_EVALUATION

Cette liste doit rester extensible.

## 5.5 --- Modèles rapides / économiques

Les modèles rapides et économiques doivent être privilégiés pour les
tâches fréquentes et relativement simples.

Exemples :

-   classification
-   extraction d'informations
-   tagging
-   sentiment simple
-   résumé court
-   détection d'intention simple
-   extraction mémoire
-   transformation structurée
-   tâches répétitives à fort volume

Un modèle de classe Haiku peut être utilisé pour ce type de workload si
les benchmarks OmniFlow démontrent une qualité suffisante.

Ne jamais considérer qu'un modèle est "suffisant" uniquement sur la base
de son positionnement marketing.

La décision doit être validée par les benchmarks OmniFlow.

## 5.6 --- Modèles plus puissants

Utiliser un modèle supérieur lorsque la décision nécessite davantage de
compréhension ou possède un impact commercial important.

Exemples :

-   situation ambiguë
-   stratégie commerciale complexe
-   objection difficile
-   négociation
-   conflit entre plusieurs signaux
-   demande personnalisée
-   décision de lancer/interrompre un script
-   situation à fort potentiel commercial
-   contexte relationnel complexe
-   arbitrage entre plusieurs stratégies
-   analyse avancée d'un script
-   génération nécessitant une forte cohérence contextuelle

Un modèle de classe Sonnet ou supérieur peut être privilégié pour ces
tâches selon les résultats du Benchmark.

## 5.7 --- Escalation dynamique

Le Router doit pouvoir commencer avec un modèle rapide puis escalader
vers un modèle plus puissant lorsque nécessaire.

Exemple :

**Haiku** → analyse initiale → confidence faible / ambiguïté détectée →
**Sonnet** → décision finale

Cela évite d'utiliser systématiquement un modèle coûteux.

## 5.8 --- Complexity Score

Prévoir un score interne de complexité pour certaines décisions.

Exemple :

**Complexity Score: 0--100**

Facteurs possibles :

-   ambiguïté du message
-   longueur du contexte
-   conflit entre signaux
-   présence d'une objection
-   négociation
-   demande personnalisée
-   valeur commerciale potentielle
-   script actif
-   règles multiples
-   historique complexe
-   faible confiance d'une première analyse

Le score peut participer au choix du modèle.

## 5.9 --- Commercial Impact Score

Créer également un indicateur d'impact potentiel.

Exemple :

**Commercial Impact: LOW / MEDIUM / HIGH / CRITICAL**

Une tâche simple mais liée à une transaction importante peut justifier
un modèle plus performant.

Le Router ne doit donc pas considérer uniquement la complexité
linguistique.

## 5.10 --- Risk Score

Certaines actions doivent être routées vers un modèle supérieur ou vers
un humain lorsque leur risque est élevé.

Facteurs possibles :

-   action financière
-   prix important
-   négociation proche du minimum
-   demande atypique
-   conflit de règles
-   faible confiance
-   risque de mauvaise interprétation
-   action irréversible
-   situation nécessitant validation humaine

## 5.11 --- Routing Policy

La politique de routing doit être configurable.

Exemple conceptuel :

### Tier 1 --- Fast

Tâches simples et fréquentes.

### Tier 2 --- Standard

Conversation et décisions normales.

### Tier 3 --- Advanced

Décisions complexes ou à forte valeur.

### Human

Situation ne devant pas être résolue automatiquement.

Les modèles associés à chaque tier doivent pouvoir être modifiés sans
changement majeur de code.

## 5.12 --- Routing par tâche

Exemple initial à tester, et non règle définitive :

  Task                   Default Tier
  ---------------------- -----------------
  Classification         Fast
  Memory Extraction      Fast
  Sentiment              Fast
  Conversation Summary   Fast
  Fan Scoring            Fast / Standard
  Response Generation    Standard
  Strategy Selection     Standard
  Purchase Decision      Standard
  Complex Objection      Advanced
  Negotiation            Advanced
  High-value Decision    Advanced
  Benchmark Judge        Advanced

La configuration finale sera déterminée par le Benchmark.

## 5.13 --- Structured Outputs

Pour les tâches utilisées par la logique métier, privilégier les sorties
structurées.

Exemple conceptuel :

``` json
{
  "intent": "content_interest",
  "purchase_intent": 82,
  "confidence": 0.91,
  "signals": [
    "explicit_interest",
    "high_engagement"
  ]
}
```

Valider les réponses contre un schéma.

Si le schéma est invalide :

1.  retry contrôlé
2.  fallback model si nécessaire
3.  fail safe

Ne jamais exécuter une action commerciale sensible à partir d'un JSON
invalide ou incomplet.

## 5.14 --- Prompt Registry

Les prompts doivent être centralisés et versionnés.

Chaque prompt doit posséder :

-   prompt ID
-   version
-   task type
-   system instructions
-   schema attendu
-   model compatibility
-   status
-   date de création
-   benchmark results

Exemple :

**strategy-selection-v1.3**

Ne pas disperser de longs prompts directement dans les composants
frontend ou dans des fonctions métier aléatoires.

## 5.15 --- Prompt Versioning

Toute modification significative d'un prompt doit créer une nouvelle
version.

Exemple :

-   strategy-v1.0
-   strategy-v1.1
-   strategy-v2.0

Le système doit pouvoir comparer les performances entre versions.

Une ancienne décision doit rester associée au prompt exact qui l'a
produite.

## 5.16 --- Configuration par environnement

Le Router doit permettre des configurations différentes :

### Development

Tests rapides et coûts réduits.

### Staging

Configuration proche de production.

### Production

Routing validé par Benchmark.

### Benchmark

Possibilité de comparer plusieurs modèles sur le même dataset.

## 5.17 --- Benchmark routing

Le Benchmark doit pouvoir exécuter exactement la même tâche avec
plusieurs modèles.

Exemple :

Conversation #184

→ Haiku candidate\
→ Sonnet candidate\
→ autre modèle candidate

Comparer :

-   compréhension
-   décision
-   respect des règles
-   réponse
-   coût
-   latence

L'objectif est de déterminer si l'amélioration de qualité justifie le
surcoût.

## 5.18 --- Quality / Cost Frontier

Pour chaque type de tâche, OmniFlow doit chercher le meilleur compromis
:

# QUALITY × COST × LATENCY

Exemple :

Si un modèle Fast obtient :

**96 % de la qualité du modèle Advanced**

pour :

**20 % du coût**

et une latence inférieure,

il peut être préférable pour cette tâche.

Mais si une tâche influence directement une vente importante, un gain
même faible de qualité peut justifier le modèle supérieur.

## 5.19 --- Fallback Chain

Chaque tâche critique doit avoir une chaîne de fallback.

Exemple conceptuel :

**Primary Model** ↓ failure **Secondary Model** ↓ failure **Safe Action
/ Human**

Déclencheurs :

-   timeout
-   provider outage
-   rate limit
-   malformed output
-   schema validation failure
-   safety refusal inattendue
-   internal error

Le fallback ne doit jamais provoquer une double action.

## 5.20 --- Provider Health

Suivre l'état des providers :

-   availability
-   error rate
-   latency
-   rate limits
-   recent failures

Le Router doit pouvoir temporairement éviter un provider dégradé.

## 5.21 --- Timeouts

Définir des timeouts selon le type de tâche.

Une extraction mémoire asynchrone peut attendre davantage qu'une réponse
nécessaire à une conversation en direct.

Les timeouts doivent être configurables.

## 5.22 --- Retry Policy

Les retries doivent être contrôlés.

Prévoir :

-   nombre maximum de retries
-   backoff
-   erreurs retryables
-   erreurs non retryables
-   changement éventuel de modèle

Ne jamais lancer des retries illimités.

## 5.23 --- Context Budget

Le Router doit connaître le budget de contexte nécessaire.

Le système doit éviter :

-   historique complet inutile
-   duplication de données
-   mémoire non pertinente
-   instructions répétées

Le Context Loader doit préparer un contexte optimisé avant l'appel.

## 5.24 --- Token Budget

Définir des budgets par tâche.

Exemple :

Classification : → réponse extrêmement courte

Strategy Decision : → structured output limité

Response Generation : → longueur adaptée au Model DNA

Analytics : → budget supérieur si nécessaire

Éviter de payer pour des sorties inutilement longues.

## 5.25 --- Caching

Lorsque pertinent et sans compromettre la fraîcheur des données,
permettre le cache de certains résultats.

Exemples :

-   configuration Model DNA
-   règles agence
-   descriptions de scripts
-   embeddings
-   analyses statiques

Ne pas cacher une décision conversationnelle dynamique qui doit utiliser
le dernier contexte.

## 5.26 --- Batch Processing

Pour les tâches non temps réel, permettre le traitement par batch
lorsque cela réduit les coûts ou améliore l'efficacité.

Exemples :

-   analyses historiques
-   recalculs
-   embeddings
-   Benchmark
-   analytics
-   analyse globale de scripts

## 5.27 --- AI Usage Ledger

Chaque appel IA doit produire une entrée exploitable dans un ledger
technique.

Enregistrer :

-   agency_id
-   creator_id si applicable
-   conversation_id si applicable
-   task_type
-   provider
-   model
-   prompt_version
-   input tokens
-   output tokens
-   estimated cost
-   latency
-   status
-   fallback_used
-   timestamp

Cela permettra de calculer précisément le coût réel d'OmniFlow.

## 5.28 --- Cost Analytics

Créer des métriques internes :

-   AI cost / agency
-   AI cost / creator
-   AI cost / active fan
-   AI cost / conversation
-   AI cost / 1,000 messages
-   AI cost / €1,000 revenue
-   cost by task
-   cost by model
-   cost by provider

Ces données seront importantes pour déterminer les marges des offres
Copilot et Full AI.

## 5.29 --- Budget Guards

Prévoir des protections contre une consommation anormale.

Exemples :

-   boucle IA
-   contexte énorme
-   retry excessif
-   agence générant une anomalie de trafic
-   mauvaise configuration

Le système doit pouvoir détecter et alerter sur des coûts inhabituels.

Ne pas couper arbitrairement une agence en production sans politique
définie.

## 5.30 --- Model Evaluation

Chaque modèle candidat doit être évalué sur plusieurs dimensions :

-   understanding accuracy
-   decision quality
-   rule compliance
-   memory usage
-   strategy selection
-   pricing compliance
-   negotiation quality
-   response naturalness
-   Model DNA fidelity
-   hallucination rate
-   latency
-   cost

La qualité de rédaction seule n'est pas suffisante.

## 5.31 --- Judge Architecture

Pour le Benchmark, ne pas utiliser uniquement un LLM pour décider si un
autre LLM est bon.

Combiner lorsque possible :

-   règles déterministes
-   résultats commerciaux objectifs
-   annotations humaines de qualité
-   expected actions
-   constraint checks
-   LLM-as-judge pour les dimensions subjectives

Un LLM Judge ne doit pas devenir la seule vérité du Benchmark.

## 5.32 --- Human Gold Dataset

Le Benchmark doit progressivement contenir un ensemble de cas validés
par des personnes compétentes.

Pour chaque cas :

-   contexte
-   décision attendue
-   décisions acceptables
-   décisions interdites
-   règles
-   raison opérationnelle
-   résultat attendu lorsque disponible

Les conversations historiques médiocres ne doivent pas être considérées
automatiquement comme des exemples corrects.

## 5.33 --- Routing Learning

Les données de production peuvent permettre d'améliorer progressivement
le routing.

Exemple :

OmniFlow constate qu'une catégorie de tâche classée Standard obtient les
mêmes performances avec Fast.

→ proposer un test.

Inversement :

Une catégorie Fast produit trop d'erreurs.

→ tester Standard.

Toute modification de routing doit être benchmarkée et versionnée avant
déploiement large.

## 5.34 --- A/B Testing des modèles

Le système doit pouvoir comparer différentes configurations sur une
fraction contrôlée du trafic lorsque cela est approprié.

Exemple :

90 % → routing production

10 % → candidate routing

Mesurer :

-   conversion
-   revenue
-   corrections humaines
-   latency
-   cost
-   error rate

Les expérimentations à impact commercial doivent être contrôlées et
auditables.

## 5.35 --- Shadow Model Testing

Une nouvelle configuration peut être exécutée en Shadow Mode.

Le modèle candidat reçoit le même contexte mais sa décision n'est pas
envoyée au fan.

Comparer ensuite :

**Production Decision vs Candidate Decision**

Ce mécanisme doit être privilégié avant les tests réels pour les
changements importants.

## 5.36 --- Modèles Anthropic --- stratégie initiale

La V1 peut utiliser Anthropic comme provider principal.

Stratégie initiale à tester :

### Haiku-class model

Pour :

-   extraction
-   classification
-   mémoire
-   sentiment
-   résumé
-   tâches simples
-   structured transformations

### Sonnet-class model

Pour :

-   réponse conversationnelle principale
-   décision stratégique
-   vente
-   objections
-   sélection de stratégie
-   raisonnement commercial normal

### Highest-capability model disponible et validé

Réservé éventuellement à :

-   cas très complexes
-   Benchmark
-   analyses difficiles
-   tâches offline
-   situations où le gain de qualité justifie réellement coût et latence

IMPORTANT :

Ne pas figer les noms ou versions des modèles dans ce cahier des
charges.

Au moment du développement, utiliser les modèles Anthropic actuellement
disponibles et officiellement supportés, puis déterminer leur rôle final
grâce au Benchmark OmniFlow.

## 5.37 --- Séparation Decision / Generation

Le Router doit pouvoir utiliser deux modèles différents pour une même
interaction.

Exemple :

**Decision Model** → décide CONTINUE_RELATIONSHIP

puis

**Generation Model** → rédige le message selon Model DNA

Cela permet d'optimiser indépendamment :

-   intelligence stratégique
-   naturel conversationnel
-   coût
-   vitesse

## 5.38 --- Multi-pass limité

Certaines décisions critiques peuvent utiliser plusieurs passes.

Exemple :

1.  Understanding
2.  Decision
3.  Validation

Mais éviter les architectures où cinq ou dix agents débattent
systématiquement pour chaque message.

Le coût et la latence deviendraient inutiles.

Utiliser plusieurs passes uniquement lorsqu'elles apportent une
amélioration mesurable.

## 5.39 --- Deterministic First

Avant d'appeler un LLM, vérifier si la décision peut être prise de
manière déterministe.

Exemples :

Negotiation OFF → aucun besoin de demander au LLM si une remise est
autorisée.

Minimum price = 50 € → aucun modèle ne peut autoriser 40 €.

Full AI OFF → aucune action autonome.

Le LLM apporte l'intelligence là où elle est utile.

Les règles déterministes gardent le contrôle.

## 5.40 --- Critère de réussite du Router

Le Model Router est réussi lorsque OmniFlow peut obtenir :

**une qualité décisionnelle maximale**

avec :

**un coût maîtrisé**

et :

**une latence compatible avec le chatting en temps réel.**

La question ne doit jamais être :

> « Quel est le meilleur modèle ? »

La question doit être :

# « Quel est le meilleur modèle pour CETTE tâche, dans CE contexte, à CE niveau de risque ? »

------------------------------------------------------------------------

## PARTIE 5 --- VALIDÉE COMME SPÉCIFICATION DU ROUTAGE IA

La suite du cahier des charges commence avec :

# PARTIE 6 --- MODEL DNA
