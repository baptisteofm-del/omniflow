# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 17 --- LEARNING ENGINE, FEEDBACK LOOPS & CONTINUOUS IMPROVEMENT

## 17.1 --- Objectif

OmniFlow ne doit pas rester figé après son lancement.

Le système doit apprendre à partir des résultats réels afin d'améliorer
progressivement :

-   décisions commerciales
-   timing
-   stratégies
-   scripts
-   formulations
-   sélection média
-   pricing
-   négociation
-   follow-ups
-   compréhension des fans
-   Model DNA

Principe :

# ACT → OBSERVE → MEASURE → LEARN → IMPROVE.

Mais :

# LEARNING DOES NOT MEAN AUTOMATICALLY COPYING EVERYTHING THAT HAPPENED.

Les conversations humaines, décisions agence et résultats historiques
peuvent être mauvais.

OmniFlow doit donc apprendre à partir de signaux filtrés et évalués.

## 17.2 --- Séparation entre mémoire et apprentissage

Ne pas confondre :

### FAN MEMORY

Ce qu'OmniFlow doit retenir sur un fan précis.

### MODEL DNA

Comment une créatrice doit parler.

### LEARNING ENGINE

Ce que le système apprend sur les stratégies et comportements qui
fonctionnent.

### MODEL TRAINING / FINE-TUNING

Modification éventuelle d'un modèle ou adaptateur à partir d'un dataset
validé.

Ces quatre systèmes doivent rester séparés.

## 17.3 --- Sources de données

Le Learning Engine peut exploiter :

-   conversations
-   suggestions IA
-   messages réellement envoyés
-   human edits
-   actions du Brain
-   script runs
-   offers
-   purchases
-   objections
-   negotiations
-   follow-ups
-   media performance
-   pricing experiments
-   A/B tests
-   human feedback
-   benchmark results
-   human takeover
-   churn / engagement signals

## 17.4 --- Event Logging

Toutes les actions importantes doivent produire des événements
structurés.

Exemples :

-   MESSAGE_RECEIVED
-   AI_DECISION_CREATED
-   AI_MESSAGE_GENERATED
-   AI_MESSAGE_SENT
-   HUMAN_MESSAGE_SENT
-   AI_SUGGESTION_EDITED
-   OFFER_SENT
-   PURCHASE_CONFIRMED
-   OFFER_DECLINED
-   SCRIPT_STARTED
-   SCRIPT_STEP_COMPLETED
-   NEGOTIATION_STARTED
-   FOLLOW_UP_SENT
-   HUMAN_TAKEOVER
-   FEEDBACK_SUBMITTED

Ces événements doivent être horodatés et reliés au contexte.

## 17.5 --- Outcome Tracking

Une action n'a de valeur d'apprentissage que si son résultat peut être
observé.

Exemple :

AI Decision: START_SCRIPT

Résultats possibles :

-   purchase
-   no purchase
-   objection
-   no response
-   conversation continued
-   human takeover

Le système doit relier décision et outcome.

## 17.6 --- Attribution Window

Définir des fenêtres d'attribution.

Exemple :

Offer Sent → Purchase 5 minutes later

peut être attribué directement.

Follow-up Sent → Purchase 2 jours plus tard

nécessite une logique différente.

Les fenêtres doivent être configurables par événement.

## 17.7 --- Correlation vs Causation

Ne jamais considérer automatiquement :

**purchase after action = action caused purchase.**

Pour les décisions importantes, utiliser :

-   A/B tests
-   control groups
-   randomized experiments lorsque possible

Cela permet de mesurer l'effet incrémental réel.

## 17.8 --- Feedback explicite

Les utilisateurs autorisés peuvent noter une suggestion.

Exemples :

-   Good
-   Bad
-   Wrong Tone
-   Wrong Strategy
-   Incorrect Fact
-   Too Aggressive
-   Too Passive
-   Wrong Media
-   Wrong Timing
-   Other

Le feedback doit être stocké avec :

-   message
-   decision
-   context
-   model version
-   prompt version
-   settings version

## 17.9 --- Human Edit Signal

Lorsqu'un chatter modifie une suggestion :

comparer :

**AI Draft** vs **Final Sent Message**

Extraire éventuellement :

-   length change
-   tone change
-   vocabulary change
-   emoji change
-   commercial intensity change
-   factual correction

Mais :

# HUMAN EDIT ≠ AUTOMATIC GROUND TRUTH.

Le chatter peut lui-même être mauvais.

## 17.10 --- Human Quality Weighting

Prévoir un système permettant de pondérer les données humaines.

Facteurs possibles :

-   role
-   historical performance
-   agency-defined trusted users
-   edit acceptance
-   conversion metrics
-   quality review

Ne pas implémenter une notation opaque des employés en V1.

V1 :

permettre au minimum de distinguer :

-   trusted examples
-   normal examples
-   rejected examples

## 17.11 --- Trusted Dataset

Créer un dataset interne de haute qualité.

Sources :

-   conversations manuellement validées
-   meilleures conversations
-   stratégies prouvées
-   réponses benchmark validées
-   exemples construits par OmniFlow
-   agency examples explicitement approved

Ce dataset sert de référence.

## 17.12 --- Bad Example Dataset

Conserver également des exemples négatifs.

Exemples :

-   wrong tone
-   wrong strategy
-   hallucination
-   premature sale
-   excessive pressure
-   missed opportunity
-   wrong price
-   wrong media
-   repetitive response

Un système apprend aussi en comprenant ce qu'il ne faut pas faire.

## 17.13 --- Conversation Import

Lorsqu'une agence importe ses anciennes conversations :

elles ne doivent pas devenir automatiquement des exemples à reproduire.

Pipeline :

1.  import
2.  parse
3.  extract creator facts
4.  extract style signals
5.  detect recurring patterns
6.  quality analysis
7.  separate useful style from poor strategy
8.  human validation when needed

Principe :

# LEARN THE CREATOR.

# DO NOT BLINDLY COPY THE CHATTER.

## 17.14 --- Preference Hierarchy

En cas de conflit :

Agency Explicit Settings \> Creator Explicit Settings \> Validated
OmniFlow Rules \> Trusted Examples \> Imported Historical Patterns

Exemple :

Historique : long relationship phase.

Agency setting : Revenue Focused.

→ le comportement futur doit respecter le réglage actuel, pas reproduire
aveuglément l'historique.

## 17.15 --- Online Learning

Ne pas permettre au modèle de modifier ses poids directement après
chaque conversation.

La V1 doit utiliser :

-   analytics
-   memory updates
-   score updates
-   strategy performance
-   prompt/config versioning
-   controlled experiments

Les changements de comportement doivent être contrôlables et
réversibles.

## 17.16 --- Learning Loops

Prévoir plusieurs boucles.

### FAN LOOP

Met à jour la compréhension du fan.

### CREATOR LOOP

Améliore Model DNA et creator-specific behavior.

### STRATEGY LOOP

Mesure les stratégies commerciales.

### MEDIA LOOP

Mesure les performances des médias.

### PRICING LOOP

Analyse prix et négociation.

### FOLLOW-UP LOOP

Analyse timing et stratégies de relance.

### GLOBAL OMNIFLOW LOOP

Améliore les moteurs généraux.

## 17.17 --- Fan Loop

Après chaque interaction pertinente :

mettre à jour :

-   Purchase Intent
-   Relationship
-   Engagement
-   Spending Potential
-   Churn Risk
-   Price Sensitivity
-   Content Affinity
-   Commercial Fatigue

Ne recalculer que ce qui est nécessaire.

## 17.18 --- Creator Loop

Analyser :

-   suggestions acceptées
-   edits récurrents
-   expressions validées
-   messages performants
-   feedback agence

Puis proposer éventuellement :

**Model DNA Update Suggestion**

Exemple :

"Creator messages are consistently shortened by managers."

→ proposer de réduire la longueur par défaut.

Ne pas modifier silencieusement le DNA critique sans politique
explicite.

## 17.19 --- Strategy Loop

Pour chaque stratégie :

mesurer :

-   exposure
-   conversion
-   revenue
-   response
-   objection
-   long-term effect
-   segment
-   creator
-   sample size

Comparer uniquement des populations suffisamment comparables.

## 17.20 --- Media Loop

Pour chaque média :

-   conversion
-   revenue
-   price
-   segment
-   script
-   timing
-   objections

Media Intelligence utilise ensuite ces données comme signaux de ranking.

## 17.21 --- Pricing Loop

Analyser :

-   target vs sold price
-   conversion by price
-   revenue per offer
-   negotiation performance
-   discount impact

Produire des recommandations plutôt que modifier automatiquement les
minimum prices.

## 17.22 --- Follow-up Loop

Analyser :

-   timing
-   response
-   conversion
-   incremental revenue
-   follow-up number
-   negative signals

Le système peut recommander de réduire ou augmenter certains délais.

## 17.23 --- Model Router Learning

Mesurer les performances par modèle LLM selon la tâche.

Exemple :

Task: classification

Model A: quality 98 % cost low

Model B: quality 99 % cost high

→ Model A peut être préférable.

Pour reasoning complexe :

un modèle plus puissant peut rester nécessaire.

## 17.24 --- Model Performance Registry

Stocker :

-   provider
-   model
-   task
-   latency
-   cost
-   quality
-   benchmark score
-   failure rate

Cela permet d'améliorer le routing.

## 17.25 --- Benchmark Suite

Créer une suite de cas de référence.

Catégories :

-   understanding
-   fan memory
-   Model DNA
-   strategy
-   scripts
-   pricing
-   negotiation
-   media selection
-   follow-up
-   safety/rules
-   hallucination

Chaque nouvelle version doit être testée avant déploiement.

## 17.26 --- Golden Conversations

Créer un ensemble de conversations de référence.

Pour chaque scénario :

-   input
-   context
-   expected decision
-   acceptable decisions
-   forbidden decisions
-   expected style characteristics
-   important facts
-   pricing constraints

Ce dataset devient essentiel avant le lancement Full AI.

## 17.27 --- Benchmark Timing

Le Benchmark doit être construit progressivement pendant le
développement.

Étapes :

### PHASE 1 --- DURING DEVELOPMENT

Créer les premiers scénarios au fur et à mesure des moteurs.

### PHASE 2 --- BEFORE CLOSED BETA

Construire une suite suffisamment large pour tester le système complet.

### PHASE 3 --- BEFORE FULL AI PRODUCTION

Tester intensivement les décisions autonomes.

### PHASE 4 --- CONTINUOUSLY

Ajouter les bugs et situations réelles rencontrées.

Claude Code doit rappeler explicitement ces étapes dans le plan
d'implémentation.

## 17.28 --- Regression Testing

Une amélioration sur un scénario ne doit pas casser les autres.

Avant nouvelle version :

**Old Version** vs **Candidate Version**

Comparer tous les benchmarks.

Bloquer le déploiement si des régressions critiques apparaissent.

## 17.29 --- Evaluation Dimensions

Noter séparément :

-   correctness
-   decision quality
-   naturalness
-   Model DNA fidelity
-   memory usage
-   commercial quality
-   rule compliance
-   pricing compliance
-   hallucination
-   latency
-   cost

Ne pas réduire toute la qualité à un score unique.

## 17.30 --- LLM-as-Judge

Un modèle puissant peut aider à évaluer certaines dimensions :

-   naturalness
-   style
-   contextual relevance

Mais ne pas l'utiliser seul pour :

-   prix
-   permissions
-   transaction correctness
-   hard rules

Ces éléments doivent avoir des tests déterministes.

## 17.31 --- Human Evaluation

Pour les cas importants :

faire évaluer des réponses par des humains compétents.

Utiliser une grille structurée.

Exemple :

1--5: - naturalness - creator fidelity - commercial timing - response
quality

Ajouter commentaires.

## 17.32 --- Blind Comparison

Pour comparer deux versions :

ne pas indiquer à l'évaluateur laquelle est nouvelle.

Afficher :

Response A vs Response B

Cela réduit le biais.

## 17.33 --- Shadow Mode

Avant de remplacer un moteur en production :

le nouveau moteur peut fonctionner en parallèle.

Il observe les mêmes inputs mais n'agit pas.

Comparer :

-   decisions
-   messages
-   expected outcome
-   latency
-   cost

## 17.34 --- Canary Release

Après Shadow Mode :

déployer la nouvelle version sur une petite portion du trafic.

Exemple :

5 %

Puis :

-   10 %
-   25 %
-   50 %
-   100 %

si les métriques restent bonnes.

## 17.35 --- Rollback

Chaque composant critique doit pouvoir revenir à la version précédente.

Versionner :

-   prompts
-   rules
-   routing
-   strategy engine
-   scoring
-   validators
-   Model DNA schema

Le rollback doit être rapide.

## 17.36 --- Prompt Versioning

Chaque prompt système important doit avoir :

-   prompt_id
-   version
-   created_at
-   status
-   benchmark results

Chaque génération doit enregistrer la version utilisée.

## 17.37 --- Fine-tuning

Le fine-tuning ne doit pas être la première étape.

Ordre recommandé :

1.  strong base model
2.  structured context
3.  Model DNA
4.  memory
5.  rules
6.  strategy engine
7.  high-quality prompts
8.  benchmark
9.  collect production data
10. curate dataset
11. evaluate fine-tuning

Fine-tuning seulement si les données montrent un bénéfice clair.

## 17.38 --- Quand Fine-tuner

Cas possibles :

-   style très spécifique
-   format structuré difficile à maintenir
-   réduction de coût via modèle plus petit spécialisé
-   amélioration répétable sur une tâche précise

Ne pas fine-tuner pour résoudre un problème causé par :

-   mauvais contexte
-   mauvaise mémoire
-   règles contradictoires
-   architecture incorrecte

## 17.39 --- Dataset Quality

Avant fine-tuning :

-   deduplicate
-   remove low-quality examples
-   remove policy/rule violations
-   validate facts
-   normalize format
-   balance scenarios
-   separate train / validation / test

Ne jamais entraîner sur toutes les conversations brutes.

## 17.40 --- Training Data Isolation

Les données d'une agence ne doivent pas être utilisées pour entraîner un
système partagé d'une manière incompatible avec :

-   contrat
-   consentement
-   confidentialité
-   réglementation
-   politiques applicables

Prévoir une architecture permettant de distinguer :

-   agency-private data
-   approved global training data
-   synthetic data
-   OmniFlow-owned examples

## 17.41 --- Synthetic Data

OmniFlow peut créer des scénarios synthétiques pour :

-   edge cases
-   objections rares
-   pricing cases
-   branch failures
-   safety cases

Mais les données synthétiques doivent compléter, pas remplacer, les
données réelles validées.

## 17.42 --- Error Mining

Les erreurs production deviennent des opportunités d'amélioration.

Workflow :

1.  detect issue
2.  store case
3.  classify
4.  reproduce
5.  add benchmark
6.  fix
7.  regression test
8.  deploy

Principe :

# EVERY IMPORTANT FAILURE SHOULD BECOME A TEST.

## 17.43 --- Learning Dashboard

Créer une section interne ou admin :

### AI PERFORMANCE

Afficher :

-   benchmark score
-   acceptance rate
-   edit rate
-   human takeover
-   conversion
-   validator failures
-   model cost
-   latency
-   regressions
-   current production versions

## 17.44 --- Agency Insights

Côté agence, afficher des insights simples.

Exemples :

-   Best performing script
-   Best media category
-   Most effective follow-up timing
-   Negotiation performance
-   AI vs Human conversion
-   Revenue generated by Full AI

Éviter d'exposer la complexité interne inutilement.

## 17.45 --- AI vs Human Comparison

Comparer lorsque les données sont suffisamment comparables :

-   conversion
-   revenue per conversation
-   response time
-   AOV
-   follow-up performance

Ne pas comparer naïvement deux populations différentes.

Utiliser des cohortes ou expérimentations.

## 17.46 --- Autonomous Change Levels

Classer les changements.

### LEVEL 0 --- OBSERVE

Aucune modification.

### LEVEL 1 --- RECOMMEND

OmniFlow propose un changement.

### LEVEL 2 --- AUTO-OPTIMIZE LOW RISK

Optimisation limitée dans des bornes explicitement autorisées.

### LEVEL 3 --- HUMAN APPROVAL REQUIRED

Changement important.

En V1, privilégier Levels 0--1.

## 17.47 --- Changes Requiring Approval

Exemples :

-   minimum price
-   major strategy change
-   creator identity fact
-   new commercial permission
-   negotiation limit
-   custom service
-   Full AI autonomy

Ces éléments ne doivent pas être modifiés silencieusement par le
Learning Engine.

## 17.48 --- Success Metrics

Le Learning Engine doit améliorer dans le temps :

-   benchmark quality
-   conversion
-   revenue per conversation
-   AI suggestion acceptance
-   lower edit rate
-   lower hallucination
-   lower unnecessary human takeover
-   better latency/cost efficiency

Sans dégrader :

-   compliance
-   creator fidelity
-   relationship quality
-   pricing rules

## 17.49 --- Critère de réussite

Le Learning Engine est réussi lorsque :

-   OmniFlow apprend des résultats réels
-   les mauvaises conversations ne contaminent pas automatiquement le
    système
-   les paramètres explicites de l'agence restent prioritaires
-   les améliorations sont mesurées
-   chaque nouvelle version est benchmarkée
-   les régressions sont détectées
-   les changements peuvent être rollback
-   le fine-tuning n'est utilisé qu'avec un dataset de qualité
-   les erreurs importantes deviennent des tests
-   OmniFlow devient progressivement meilleur sans devenir incontrôlable

# OMNIFLOW SHOULD LEARN FAST.

# BUT IT SHOULD CHANGE CAREFULLY.

------------------------------------------------------------------------

## PARTIE 17 --- VALIDÉE COMME SPÉCIFICATION DU LEARNING ENGINE, FEEDBACK LOOPS & CONTINUOUS IMPROVEMENT

La suite du cahier des charges commence avec :

# PARTIE 18 --- MODEL ROUTER, LLM ARCHITECTURE & AI COST OPTIMIZATION
