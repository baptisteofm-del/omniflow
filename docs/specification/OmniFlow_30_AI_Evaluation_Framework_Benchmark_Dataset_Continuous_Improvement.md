# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 30 --- AI EVALUATION FRAMEWORK, BENCHMARK DATASET & CONTINUOUS IMPROVEMENT SYSTEM

## 30.1 --- Objectif

La performance de l'IA est le cœur du produit OmniFlow.

Le système ne doit donc jamais considérer qu'une nouvelle version IA est
meilleure simplement parce qu'elle utilise :

-   un modèle plus récent
-   un modèle plus cher
-   un prompt plus long
-   davantage de contexte

Chaque évolution doit être mesurée.

Principe :

# NO AI RELEASE WITHOUT EVALUATION.

OmniFlow doit pouvoir répondre objectivement à :

-   l'IA comprend-elle mieux les conversations ?
-   respecte-t-elle mieux la personnalité de la créatrice ?
-   choisit-elle le bon moment pour vendre ?
-   sélectionne-t-elle le bon script ?
-   respecte-t-elle les prix ?
-   négocie-t-elle correctement ?
-   utilise-t-elle correctement la mémoire ?
-   améliore-t-elle la conversion ?
-   coûte-t-elle plus ou moins cher ?
-   nécessite-t-elle davantage d'interventions humaines ?

## 30.2 --- Trois niveaux d'évaluation

Le système d'évaluation doit fonctionner sur trois niveaux.

### LEVEL 1 --- Offline Benchmark

Cas contrôlés sans clients réels.

### LEVEL 2 --- Shadow / Pilot Evaluation

Nouvelle version testée sur trafic limité ou en parallèle sans exécution
autonome risquée.

### LEVEL 3 --- Production Metrics

Mesure du comportement réel après déploiement.

Aucun niveau ne remplace complètement les autres.

## 30.3 --- Golden Dataset

Créer un dataset interne appelé :

# OMNIFLOW GOLDEN SET

Il représente les situations importantes qu'un excellent chatter IA doit
savoir gérer.

Le Golden Set évolue avec le produit.

## 30.4 --- Structure d'un Benchmark Case

Chaque cas contient :

``` text
case_id
category
difficulty
risk_level
creator_profile
agency_settings
fan_profile
fan_scores
relevant_memory
conversation_history
script_state
available_media
pricing_rules
incoming_message
expected_behavior
forbidden_behavior
evaluation_dimensions
```

## 30.5 --- Expected Behavior

Ne pas toujours imposer une phrase exacte.

Évaluer surtout :

-   intention
-   stratégie
-   action
-   contraintes
-   style

Plusieurs réponses peuvent être bonnes.

## 30.6 --- Benchmark Categories

Créer au minimum :

``` text
Conversation Understanding
Persona
Relationship
Sales Timing
Script Selection
Script Progression
Objection Handling
Pricing
Negotiation
Memory
Media Selection
Follow-up
Custom Requests
Human Escalation
Rule Compliance
```

## 30.7 --- Conversation Understanding

Tester :

-   humour
-   sarcasme
-   ambiguïté
-   changement de sujet
-   message court
-   message émotionnel
-   intention commerciale indirecte
-   refus
-   hésitation

## 30.8 --- Persona Consistency

Tester plusieurs Model DNA.

L'IA doit adapter :

-   vocabulaire
-   longueur
-   ponctuation
-   emojis
-   chaleur
-   flirt
-   directness
-   style commercial

Sans devenir robotique.

## 30.9 --- Agency Preference Priority

Créer des cas où les conversations historiques contredisent les nouveaux
paramètres agence.

Expected behavior :

# CURRENT EXPLICIT SETTINGS WIN.

Les conversations importées servent de contexte et d'information, pas de
règle supérieure.

## 30.10 --- Bad Historical Conversations

Inclure des exemples volontairement mauvais.

Tester que l'IA n'imite pas :

-   mauvaises habitudes
-   répétitions
-   mauvais timing commercial
-   style incohérent

simplement parce qu'ils existent dans l'historique.

## 30.11 --- Relationship Benchmark

Tester :

-   nouveau fan
-   fan régulier
-   fan attaché
-   fan distant
-   fan revenant après plusieurs jours
-   fan frustré

L'IA doit ajuster la relation.

## 30.12 --- Sales Timing Benchmark

Cas :

-   trop tôt pour vendre
-   moment idéal
-   fan explicitement intéressé
-   fan hésitant
-   fan vient d'acheter
-   fan veut uniquement parler
-   fan très chaud

Évaluer le timing, pas seulement la qualité du texte.

## 30.13 --- Script Selection Benchmark

Plusieurs scripts disponibles.

L'IA doit déterminer :

-   aucun script
-   script A
-   script B
-   vente hors script

selon contexte.

## 30.14 --- Script Progression Benchmark

Tester :

``` text
Step 1 purchased
→ Step 2
```

et :

``` text
Step 1 not purchased
→ recovery branch
```

ainsi que :

-   hesitation
-   objection
-   fan changes topic
-   purchase arrives late

## 30.15 --- Recovery Branch Benchmark

Tester différentes stratégies configurées par l'agence.

Exemples :

-   playful disappointment
-   teasing
-   softer relationship recovery
-   wait

L'IA doit respecter la stratégie autorisée.

## 30.16 --- Pricing Benchmark

Cas critiques :

``` text
target = €50
minimum = €40
max discount = 20%
```

L'IA ne doit jamais proposer sous €40.

## 30.17 --- Negotiation Benchmark

Tester :

-   negotiation disabled
-   fan asks 10% discount
-   fan asks 50% discount
-   fan counteroffers below minimum
-   high-value fan
-   low purchase intent

## 30.18 --- Media Selection Benchmark

Bibliothèque avec plusieurs médias taggés.

Tester :

-   demande spécifique
-   script actif
-   hors script
-   média indisponible
-   média déjà vendu récemment
-   prix minimum différent

## 30.19 --- Memory Benchmark

Tester :

-   prénom
-   métier
-   préférence
-   ancienne promesse
-   achat précédent
-   sujet personnel
-   custom request

L'IA doit récupérer seulement les memories pertinentes.

## 30.20 --- Memory Contradiction Benchmark

Exemple :

Ancienne mémoire :

``` text
Fan lives in Paris.
```

Nouveau message :

``` text
I moved to Lyon last month.
```

Le système doit gérer la contradiction correctement.

## 30.21 --- Memory Correction Benchmark

Si un humain corrige une information :

la correction validée doit prendre priorité sur une extraction
automatique précédente.

## 30.22 --- Fan Intelligence Benchmark

Tester les cinq scores :

-   Purchase Intent
-   Relationship
-   Spending Potential
-   Engagement
-   Churn Risk

Ne pas chercher une précision pseudo-scientifique absolue.

Évaluer surtout :

-   direction correcte
-   cohérence
-   changements logiques

## 30.23 --- Follow-up Benchmark

Tester :

-   fan n'a pas répondu
-   fan vient de revenir
-   fan a répondu avant scheduled time
-   fan vient d'acheter
-   fan a demandé de ne pas être relancé
-   follow-up disabled

## 30.24 --- Custom Request Benchmark

Tester :

-   custom content autorisé
-   interdit
-   prix minimum
-   demande ambiguë
-   besoin de validation humaine

## 30.25 --- Human Escalation Benchmark

L'IA doit savoir ne pas agir.

Cas :

-   information insuffisante
-   action non supportée
-   risque élevé
-   conflit de règles
-   plateforme indisponible

Expected action :

``` text
ESCALATE
```

ou attente/approval selon configuration.

## 30.26 --- Rule Compliance Benchmark

Règles absolues à tester systématiquement :

-   minimum price
-   negotiation permission
-   creator scope
-   Full AI status
-   platform capabilities
-   custom request permissions
-   human takeover

## 30.27 --- Difficulty Levels

Chaque cas :

``` text
EASY
MEDIUM
HARD
EDGE
```

Ne pas optimiser uniquement pour les cas faciles.

## 30.28 --- Risk Levels

``` text
LOW
MEDIUM
HIGH
CRITICAL
```

Une erreur de ponctuation n'a pas le même poids qu'une vente sous le
minimum.

## 30.29 --- Evaluation Dimensions

Chaque output peut être noté sur :

``` text
Understanding
Strategy
Persona
Naturalness
Commercial Timing
Rule Compliance
Memory Usage
Action Correctness
```

## 30.30 --- Weighted Score

Les dimensions n'ont pas toutes le même poids.

Exemple conceptuel :

``` text
Rule Compliance      25%
Action Correctness   20%
Strategy             15%
Commercial Timing    15%
Understanding        10%
Persona               5%
Naturalness           5%
Memory Usage          5%
```

Les poids finaux doivent être configurables.

## 30.31 --- Critical Failure Override

Une violation critique ne doit pas être cachée par une bonne moyenne.

Exemple :

réponse excellente mais prix sous minimum.

Résultat :

# FAIL.

## 30.32 --- Deterministic Evaluators

Utiliser du code lorsque possible.

Exemples :

-   price \>= minimum
-   correct script branch
-   negotiation enabled
-   media allowed
-   expected action type

Ne pas demander à un LLM de juger ce qui peut être vérifié exactement.

## 30.33 --- LLM-as-Judge

Pour dimensions subjectives :

-   naturalness
-   persona
-   quality
-   strategy

un modèle évaluateur peut être utilisé.

Mais :

-   prompt d'évaluation versionné
-   critères explicites
-   calibration humaine régulière

## 30.34 --- Human Review

Créer une interface ou workflow pour review humain.

Le reviewer voit :

-   case
-   output
-   expected behavior
-   automated scores

Puis peut :

-   accept
-   override
-   comment

## 30.35 --- Human Review Sampling

Pas besoin de reviewer humainement chaque cas à chaque run.

Prioriser :

-   failures
-   regressions
-   edge cases
-   disagreement evaluator
-   high-risk cases

## 30.36 --- Benchmark Versioning

Exemple :

``` text
Golden Set v1.0
Golden Set v1.1
Golden Set v2.0
```

Chaque release IA doit indiquer le dataset utilisé.

## 30.37 --- AI Version Identifier

Une version doit identifier :

``` text
decision_engine
prompt_versions
model_router
models
memory_version
scoring_version
```

Pas seulement :

``` text
Claude X
```

## 30.38 --- Benchmark Run

Un run stocke :

-   AI version
-   dataset version
-   date
-   model configuration
-   score
-   failures
-   cost
-   latency

## 30.39 --- Comparison

Vue :

``` text
Current Production
vs
Candidate
```

Afficher :

-   overall
-   category
-   critical failures
-   latency
-   cost

## 30.40 --- Regression Detection

Exemple :

Candidate améliore Persona +8%.

Mais Pricing perd 2 cas critiques.

Résultat :

# DO NOT SHIP.

## 30.41 --- Minimum Release Gates

Avant production :

-   zero unacceptable critical regression
-   required rule compliance threshold
-   benchmark minimum score
-   latency acceptable
-   cost acceptable

Valeurs exactes à calibrer après premiers benchmarks.

## 30.42 --- Cost Evaluation

Pour chaque run :

``` text
total tokens
input tokens
output tokens
cost per case
estimated cost per 1,000 conversations
```

## 30.43 --- Latency Evaluation

Mesurer :

-   p50
-   p95
-   p99 si volume suffisant

Par task/model.

## 30.44 --- Model Routing Benchmark

Comparer plusieurs stratégies.

Exemple :

### Strategy A

Premium model partout.

### Strategy B

Fast model simple tasks + premium complex tasks.

Mesurer :

-   quality
-   cost
-   latency

## 30.45 --- Routing Goal

Chercher :

# MAXIMUM QUALITY PER EURO/DOLLAR SPENT.

Pas simplement le modèle le moins cher.

## 30.46 --- Prompt Experimentation

Chaque changement de prompt doit être traité comme une version.

Ne pas éditer directement production.

## 30.47 --- Prompt Registry Integration

Benchmark doit pouvoir sélectionner :

``` text
conversation_reply_v8
sales_decision_v5
memory_extraction_v3
```

## 30.48 --- Temperature / Generation Parameters

Versionner les paramètres pertinents.

Tester leur impact si nécessaire.

## 30.49 --- Context Strategy Benchmark

Comparer :

-   recent messages only
-   recent + summary
-   recent + relevant memories
-   recent + commercial state

Objectif :

trouver le meilleur contexte sans explosion de coût.

## 30.50 --- Memory Retrieval Evaluation

Mesurer :

-   relevant memory retrieved
-   irrelevant memory injected
-   missing important memory
-   outdated memory used

## 30.51 --- Imported Conversation Evaluation

Tester les conversations importées.

Objectif :

extraire :

-   creator style signals
-   fan facts
-   relationship context

sans reproduire automatiquement la mauvaise stratégie commerciale
historique.

## 30.52 --- Copilot Metrics

En production :

-   suggestion acceptance rate
-   edit rate
-   regenerate rate
-   dismiss rate
-   time to send

## 30.53 --- Copilot Edit Distance

Mesurer approximativement à quel point le chatter modifie la suggestion.

Attention :

une faible modification n'implique pas automatiquement une meilleure
vente.

## 30.54 --- Full AI Metrics

Suivre :

-   autonomous conversations
-   autonomous sales
-   takeovers
-   escalations
-   rule violations
-   failed actions
-   conversion
-   revenue

## 30.55 --- Human Takeover Rate

Analyser par raison :

-   bad AI
-   custom request
-   platform issue
-   agency preference
-   complex fan

Une hausse peut révéler une faiblesse précise.

## 30.56 --- Business Metrics

Mesurer :

-   purchase conversion
-   PPV conversion
-   average sold price
-   revenue/conversation
-   revenue/fan
-   script completion
-   recovery conversion
-   follow-up recovery

## 30.57 --- Quality + Revenue

Ne jamais optimiser uniquement pour le revenu court terme.

Une IA trop agressive peut :

-   augmenter vente immédiate
-   dégrader relation
-   augmenter churn

Analyser plusieurs horizons.

## 30.58 --- Longitudinal Metrics

Lorsque suffisamment de données :

-   repeat purchases
-   fan retention
-   revenue over 7/30 days
-   relationship progression

## 30.59 --- Agency-level Differences

Ne pas conclure qu'une stratégie est universellement meilleure.

Segmenter :

-   creator
-   agency strategy
-   fan type
-   spending level
-   platform

## 30.60 --- A/B Testing

Le système peut tester :

-   message style
-   timing
-   script
-   price
-   recovery branch
-   follow-up

Seulement dans les limites configurées par l'agence.

## 30.61 --- Experiment Unit

Choisir explicitement :

-   fan
-   conversation
-   agency
-   creator

Éviter qu'un même fan change de variante en permanence.

## 30.62 --- Experiment Guardrails

A/B tests ne peuvent jamais contourner :

-   minimum price
-   permissions
-   creator rules
-   platform rules
-   safety rules

## 30.63 --- Experiment Success

Définir avant test :

``` text
Primary metric
Secondary metrics
Guardrail metrics
Minimum sample
```

Éviter de choisir la métrique gagnante après coup.

## 30.64 --- Statistical Caution

Ne pas déclarer un gagnant après quelques ventes.

Afficher :

-   sample size
-   uncertainty
-   duration

Le système peut rester simple V1 mais ne doit pas induire en erreur.

## 30.65 --- Learning From Agencies

OmniFlow apprend de l'utilisation agrégée uniquement selon les règles de
données, confidentialité et consentement applicables.

Ne pas mélanger automatiquement les données privées d'une agence dans
une autre.

## 30.66 --- Agency-specific Learning

OmniFlow peut améliorer le comportement pour une agence via :

-   settings
-   feedback
-   approved edits
-   performance
-   script analytics

sans nécessairement fine-tuner un modèle par agence.

## 30.67 --- Global Learning

Les patterns globaux doivent être transformés en :

-   règles produit
-   benchmark cases
-   prompts améliorés
-   routing amélioré

après validation.

## 30.68 --- Fine-tuning

Ne pas commencer V1 par du fine-tuning.

Commencer par :

-   strong base models
-   structured context
-   memory
-   rules
-   prompts
-   evaluation

Envisager fine-tuning seulement si les données démontrent un avantage
clair.

## 30.69 --- Fine-tuning Trigger

Étudier le fine-tuning lorsque :

-   dataset suffisamment grand
-   outputs répétitifs bien définis
-   prompt engineering plafonne
-   coût/latence pourrait être amélioré
-   benchmark permet de mesurer le gain

## 30.70 --- Fine-tuning Dataset Quality

Ne jamais entraîner naïvement sur toutes les conversations humaines.

Filtrer :

-   high-performing examples
-   approved examples
-   quality-reviewed examples

Exclure les mauvaises conversations.

## 30.71 --- Preference Dataset

Les corrections Copilot peuvent devenir un dataset utile.

Exemple :

``` text
AI suggestion
vs
approved human final response
```

Mais seulement après nettoyage et contrôle qualité.

## 30.72 --- Outcome-aware Learning

Une réponse ayant généré une vente n'est pas automatiquement excellente.

Prendre en compte :

-   context
-   timing
-   fan quality
-   later behavior

## 30.73 --- Failure Taxonomy

Créer catégories :

``` text
UNDERSTANDING_ERROR
PERSONA_ERROR
MEMORY_ERROR
TIMING_ERROR
STRATEGY_ERROR
PRICING_ERROR
NEGOTIATION_ERROR
SCRIPT_ERROR
MEDIA_ERROR
FOLLOW_UP_ERROR
PLATFORM_ERROR
```

## 30.74 --- Root Cause

Pour chaque incident AI important :

distinguer :

-   model
-   prompt
-   context
-   memory
-   rules
-   connector
-   data
-   code

Ne pas conclure automatiquement :

"the LLM is bad".

## 30.75 --- AI Quality Queue

Les retours production entrent dans :

``` text
AI Quality Queue
```

Priorité selon :

-   severity
-   financial impact
-   recurrence
-   Full AI involvement

## 30.76 --- Weekly AI Review

Pendant pilote/lancement :

réunion/process hebdomadaire :

-   top failures
-   top wins
-   regressions
-   benchmark additions
-   cost
-   routing
-   experiments

## 30.77 --- Benchmark Growth

Chaque semaine/période :

ajouter les nouveaux cas réellement utiles.

Éviter les doublons.

## 30.78 --- Edge Case Library

Créer une section dédiée :

``` text
EDGE_CASES.md
```

Exemples :

-   contradictory fan
-   late purchase
-   multiple simultaneous messages
-   repeated negotiation
-   stale script
-   platform reconnect
-   creator settings changed mid-conversation

## 30.79 --- Shadow Mode

Avant une nouvelle version Full AI :

elle peut observer les conversations et produire une décision sans
l'exécuter.

Comparer :

``` text
Production action
vs
Candidate action
```

## 30.80 --- Shadow Metrics

Mesurer :

-   agreement rate
-   candidate quality
-   rule compliance
-   potential improvement

## 30.81 --- Canary Rollout

Après benchmark :

``` text
Internal
↓
Pilot agencies
↓
Small %
↓
Larger %
↓
100%
```

Avec possibilité de rollback.

## 30.82 --- Automatic Rollback Signals

Possibles triggers :

-   critical violation
-   error spike
-   abnormal takeover rate
-   connector action failures

Les seuils doivent être configurables.

## 30.83 --- Production Monitoring

Dashboard AI :

``` text
Quality
Revenue
Safety
Cost
Latency
```

Ces cinq dimensions doivent toujours être visibles ensemble.

## 30.84 --- AI Scorecard

Exemple :

``` text
Quality Score
Commercial Score
Rule Compliance
Cost / Conversation
Latency
Takeover Rate
```

## 30.85 --- Agency Feedback

Permettre aux agences de signaler facilement :

-   réponse mauvaise
-   mauvaise stratégie
-   mauvais souvenir
-   mauvais prix
-   mauvais timing

Le feedback doit être relié à la décision exacte.

## 30.86 --- Positive Feedback

Permettre aussi :

-   good response
-   great sale
-   good recovery

Pour comprendre les comportements réussis.

## 30.87 --- Feedback Abuse / Noise

Ne pas considérer chaque feedback comme vérité.

Une agence peut avoir une préférence différente.

Distinguer :

-   preference
-   actual rule violation
-   general quality issue

## 30.88 --- Personalization vs Global Quality

Ordre de priorité conceptuel :

``` text
Hard System Rules
↓
Agency Explicit Settings
↓
Creator Settings
↓
Current Conversation State
↓
Fan Memory
↓
Learned Preferences
```

## 30.89 --- AI Improvement Pipeline

``` text
Production
↓
Feedback + Metrics
↓
Failure Analysis
↓
Benchmark Cases
↓
Prompt / Model / Logic Change
↓
Offline Benchmark
↓
Shadow
↓
Pilot
↓
Production
```

## 30.90 --- No Self-Modifying Production AI

V1 ne doit pas laisser l'IA modifier seule :

-   prompts production
-   pricing rules
-   sales rules
-   autonomy

L'apprentissage passe par un pipeline contrôlé.

## 30.91 --- Automatic Optimization

Le système peut recommander :

``` text
Script step 1 conversion is low.
Suggested test: lower price from €20 to €17.
```

Mais l'agence valide les changements commerciaux importants.

## 30.92 --- Script Performance Diagnostics

Analyser :

-   step conversion
-   drop-off
-   price
-   media
-   preceding conversation
-   copy
-   timing

Ne pas attribuer automatiquement la cause à un seul facteur.

## 30.93 --- Media Performance Diagnostics

Comparer :

-   media type
-   price
-   audience
-   context
-   script position

## 30.94 --- Pricing Diagnostics

Détecter :

-   high conversion + low price
-   low conversion + high price
-   frequent negotiation
-   minimum frequently reached

Puis proposer un test.

## 30.95 --- Benchmark Before Launch

Claude Code doit explicitement rappeler au propriétaire du projet de
lancer le benchmark lorsque :

-   Mock Connector
-   Memory
-   Decision Engine
-   Scripts
-   Pricing

sont fonctionnels.

C'est le premier benchmark majeur.

## 30.96 --- Benchmark Before Full AI Pilot

Deuxième gate obligatoire après :

-   negotiation
-   media selection
-   follow-ups
-   action validator
-   Full AI

## 30.97 --- Benchmark Before AI Release

Après lancement :

chaque changement majeur du moteur doit repasser le benchmark.

## 30.98 --- Benchmark CLI / Script

Créer une commande interne.

Exemple conceptuel :

``` text
npm run benchmark:ai
```

Elle doit :

-   charger dataset
-   exécuter candidate
-   scorer
-   comparer production
-   générer rapport

## 30.99 --- Benchmark Report

Générer :

``` text
/docs/benchmarks/runs/<date>-<version>.md
```

Avec :

-   configuration
-   overall score
-   category scores
-   regressions
-   critical failures
-   cost
-   latency
-   recommendation

## 30.100 --- Release Recommendation

Rapport :

``` text
SHIP
SHIP TO PILOT ONLY
DO NOT SHIP
```

La recommandation doit expliquer pourquoi.

## 30.101 --- Benchmark Reproducibility

Stocker :

-   dataset version
-   prompts
-   model names
-   model parameters
-   code version

afin de pouvoir comparer correctement.

## 30.102 --- Non-determinism

Les LLM peuvent varier.

Pour les cas sensibles :

-   plusieurs runs si nécessaire
-   température contrôlée
-   score agrégé

## 30.103 --- Benchmark Cost Control

Le benchmark ne doit pas exploser les coûts.

Prévoir :

-   smoke suite
-   core suite
-   full suite

## 30.104 --- Smoke Suite

Rapide.

Exécutée fréquemment.

Inclut les règles critiques.

## 30.105 --- Core Suite

Tests principaux qualité.

Avant merge/release IA importante.

## 30.106 --- Full Suite

Dataset complet.

Avant pilote majeur ou production.

## 30.107 --- CI Integration

La Smoke Suite peut être intégrée au CI si coût acceptable.

Les suites plus lourdes peuvent être déclenchées manuellement ou sur
release.

## 30.108 --- Critical Assertions

Toujours tester automatiquement :

``` text
never sell below minimum
never negotiate when disabled
never auto-send during human takeover
never use unavailable media
never continue invalid script state
```

## 30.109 --- Commercial Benchmark

Créer un sous-score spécifique :

# OMNIFLOW SALES INTELLIGENCE SCORE

Composé de :

-   sales timing
-   offer selection
-   script progression
-   objection handling
-   negotiation
-   recovery

## 30.110 --- Relationship Benchmark

Créer :

# OMNIFLOW RELATIONSHIP INTELLIGENCE SCORE

Composé de :

-   memory
-   emotional continuity
-   personalization
-   conversation quality
-   long-term consistency

## 30.111 --- Autonomy Benchmark

Créer :

# OMNIFLOW AUTONOMY RELIABILITY SCORE

Composé de :

-   correct actions
-   rule compliance
-   escalation
-   duplicate prevention
-   execution reliability

## 30.112 --- Marketing Claims

Ne pas annoncer :

``` text
better than human chatters
```

ou un gain chiffré précis sans données suffisantes.

Les benchmarks internes servent d'abord à construire un produit
réellement performant.

## 30.113 --- Future External Benchmark

Plus tard, OmniFlow pourra créer un benchmark anonymisé pour démontrer :

-   conversion lift
-   response speed
-   cost reduction

avec méthodologie claire.

## 30.114 --- Continuous Improvement Dashboard

Afficher en Admin :

``` text
Current AI Version
Golden Set Version
Benchmark Score
Critical Failures
Production Quality
Cost
Next Candidate
```

## 30.115 --- Owner Reminder

Claude Code doit ajouter dans :

``` text
/docs/implementation/AI_BENCHMARK.md
```

une checklist claire indiquant :

``` text
[ ] Benchmark Phase 1 completed
[ ] Full AI benchmark completed
[ ] Pilot benchmark completed
[ ] Production release benchmark completed
```

## 30.116 --- Critère de réussite

Le framework est réussi lorsque :

-   OmniFlow possède un Golden Set versionné
-   les mauvais historiques humains ne deviennent pas automatiquement la
    référence
-   les préférences explicites de l'agence restent prioritaires
-   les règles financières sont testées de manière déterministe
-   la qualité subjective peut être évaluée avec calibration humaine
-   chaque version IA est comparable à la précédente
-   coût et latence sont mesurés avec la qualité
-   les erreurs réelles enrichissent le benchmark
-   les changements sont testés avant production
-   Full AI peut être déployé progressivement
-   les performances commerciales sont mesurées en production
-   le système apprend de manière contrôlée
-   le fine-tuning n'est utilisé que lorsqu'il devient réellement
    justifié

# TEST.

# MEASURE.

# LEARN.

# IMPROVE.

# NEVER SHIP BLIND.

------------------------------------------------------------------------

## PARTIE 30 --- VALIDÉE COMME AI EVALUATION FRAMEWORK, BENCHMARK DATASET & CONTINUOUS IMPROVEMENT SYSTEM

La suite du cahier des charges commence avec :

# PARTIE 31 --- OBSERVABILITY, LOGGING, MONITORING, ALERTING & INCIDENT RESPONSE
