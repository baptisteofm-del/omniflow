# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 12 --- SALES STRATEGY ENGINE

## 12.1 --- Objectif

Le Sales Strategy Engine doit déterminer la meilleure stratégie
commerciale à appliquer à un fan à un instant donné.

Il ne rédige pas directement les messages.

Principe :

# FAN INTELLIGENCE UNDERSTANDS THE FAN.

# SALES STRATEGY ENGINE CHOOSES THE COMMERCIAL APPROACH.

# CONVERSATION ENGINE FORMULATES IT.

Le moteur doit maximiser la performance commerciale sans sacrifier
inutilement la relation, la conformité, les règles de l'agence ou
l'expérience du fan.

## 12.2 --- Responsabilités

Le Sales Strategy Engine doit notamment pouvoir décider :

-   continuer le relationnel
-   construire davantage d'intérêt
-   lancer un script
-   sélectionner un script
-   poursuivre un script
-   modifier la stratégie
-   proposer un média hors script
-   traiter une objection
-   autoriser une négociation
-   revenir au relationnel
-   attendre
-   créer une opportunité de follow-up
-   demander une validation humaine
-   arrêter temporairement la vente

Il doit fonctionner en corrélation avec tous les autres moteurs.

## 12.3 --- Inputs

Le moteur peut utiliser :

-   message actuel
-   conversation récente
-   conversation state
-   Fan Memory
-   Fan Intelligence
-   Purchase Intent
-   Relationship Score
-   Spending Potential
-   Engagement Score
-   Churn Risk
-   Price Sensitivity
-   Commercial Fatigue
-   Content Affinity
-   Objection Profile
-   achats
-   offres précédentes
-   script state
-   media library
-   Agency Settings
-   Creator Settings
-   Model DNA
-   platform capabilities
-   timing
-   strategy performance
-   A/B test assignment

## 12.4 --- Output structuré

La décision doit être structurée.

Exemple :

``` json
{
  "action": "START_SCRIPT",
  "strategy_id": "strategy_123",
  "script_id": "script_456",
  "objective": "convert_high_intent_fan",
  "confidence": 0.93,
  "reason_codes": [
    "HIGH_PURCHASE_INTENT",
    "LOW_COMMERCIAL_FATIGUE",
    "SCRIPT_MATCH"
  ],
  "requires_approval": false
}
```

Ne pas dépendre uniquement d'un texte libre produit par le LLM.

## 12.5 --- Action Taxonomy

Prévoir au minimum :

-   CONTINUE_RELATIONSHIP
-   BUILD_INTEREST
-   START_SCRIPT
-   CONTINUE_SCRIPT
-   RECOVER_SCRIPT
-   OFFER_MEDIA
-   HANDLE_OBJECTION
-   NEGOTIATE
-   POST_PURCHASE_RELATIONSHIP
-   WAIT
-   FOLLOW_UP_CANDIDATE
-   ESCALATE_HUMAN
-   STOP_SELLING

Cette liste doit rester extensible.

## 12.6 --- State Machine

La stratégie doit tenir compte de l'état actuel.

Exemple conceptuel :

**RELATIONSHIP** → **INTEREST_BUILDING** → **OFFER_READY** →
**SCRIPT_ACTIVE** → **PURCHASE** → **POST_PURCHASE**

ou :

**SCRIPT_ACTIVE** → **DECLINED** → **RECOVERY** → **RELATIONSHIP**

ou :

**OFFER_READY** → **WAIT**

Ne pas laisser le modèle improviser l'état commercial à chaque message.

## 12.7 --- Relationship First

Le moteur doit comprendre qu'une vente immédiate n'est pas toujours la
meilleure action.

Il peut choisir :

**CONTINUE_RELATIONSHIP**

lorsque :

-   Purchase Intent faible
-   fan nouveau
-   relation insuffisante
-   commercial fatigue élevée
-   refus récent
-   contexte non adapté
-   stratégie agence orientée relationnel

L'absence de vente immédiate peut être une décision commerciale
volontaire.

## 12.8 --- Opportunity Detection

Le moteur doit détecter les moments où une opportunité commerciale
devient suffisamment forte.

Signaux possibles :

-   demande explicite
-   forte curiosité
-   progression conversationnelle
-   Purchase Intent élevé
-   historique d'achat favorable
-   intérêt pour un type de contenu
-   réponse positive à une phase de teasing
-   script trigger

Le seuil dépend des Agency Settings.

## 12.9 --- Script Selection

Lorsqu'un script doit être lancé, sélectionner parmi les scripts
éligibles.

Critères possibles :

-   créatrice
-   fan segment
-   Purchase Intent
-   Spending Potential
-   Relationship
-   Content Affinity
-   prix
-   performance historique
-   script availability
-   A/B test
-   agency priority
-   exclusions

Ne jamais sélectionner un script désactivé ou incompatible.

## 12.10 --- Agency Strategy vs OmniFlow Strategy

Trois modes :

### OMNIFLOW

Priorité aux stratégies OmniFlow validées.

### AGENCY

Priorité aux stratégies configurées par l'agence.

### HYBRID

OmniFlow choisit parmi les stratégies autorisées selon contexte et
performance.

Le mode doit être défini dans Agency Settings.

## 12.11 --- Script Branching

Chaque script doit pouvoir contenir des branches.

Exemple :

``` text
STEP 1 OFFER
├── PURCHASED → STEP 2
├── PRICE OBJECTION → PRICE_BRANCH
├── HESITATION → HESITATION_BRANCH
├── NO RESPONSE → FOLLOW_UP_BRANCH
├── EXPLICIT REFUSAL → RELATIONSHIP_RECOVERY
└── CUSTOM REQUEST → CUSTOM_REQUEST_FLOW
```

Les branches doivent être explicites et éditables.

## 12.12 --- Purchased Branch

Si le fan achète une étape :

-   enregistrer la conversion
-   mettre à jour Fan Intelligence
-   appliquer post-purchase behavior
-   déterminer si l'étape suivante est pertinente
-   respecter cooldown et fatigue
-   continuer le script uniquement si les règles le permettent

Achat ≠ obligation d'upsell immédiat.

## 12.13 --- Not Purchased Branch

Si le fan n'achète pas :

ne pas répéter automatiquement la même proposition.

Le moteur doit classifier la situation :

-   objection prix
-   hésitation
-   manque d'intérêt
-   mauvais timing
-   contenu non adapté
-   aucune réponse
-   refus explicite
-   changement de sujet

Puis sélectionner une stratégie autorisée.

## 12.14 --- Recovery Strategy

Une branche de récupération peut :

-   répondre à l'objection
-   clarifier la valeur
-   proposer une alternative
-   revenir au relationnel
-   attendre
-   utiliser une remise autorisée
-   proposer un autre média pertinent

Le moteur doit respecter les limites de pression commerciale.

## 12.15 --- Emotional Selling Boundaries

Les stratégies peuvent utiliser :

-   personnalité
-   relation
-   humour
-   teasing
-   chaleur
-   exclusivité réelle
-   personnalisation

Elles ne doivent pas s'appuyer sur :

-   menaces
-   coercition
-   humiliation
-   fausses urgences
-   mensonges
-   pression abusive
-   manipulation financière
-   culpabilisation agressive

Les stratégies OmniFlow doivent rester commercialement performantes tout
en respectant ces limites.

## 12.16 --- Objection Classification

Créer une taxonomie.

Exemples :

-   PRICE_TOO_HIGH
-   NOT_NOW
-   NOT_INTERESTED
-   NEED_MORE_CONTEXT
-   CONTENT_MISMATCH
-   TRUST
-   WANTS_DISCOUNT
-   WANTS_CUSTOM
-   ALREADY_SPENT
-   UNKNOWN

La classification peut utiliser un modèle rapide.

## 12.17 --- Objection Strategy

Chaque objection peut posséder plusieurs stratégies autorisées.

Exemple :

**PRICE_TOO_HIGH**

Possibilités : - reinforce value - smaller alternative - authorized
discount - return to relationship - wait

Le moteur choisit selon le fan et les règles.

## 12.18 --- Negotiation Trigger

La négociation ne peut commencer que si :

-   Agency Negotiation = ON
-   Creator Negotiation = allowed
-   Offer Negotiation = allowed
-   minimum price exists
-   fan situation is eligible

Puis le Negotiation Engine calcule les limites.

Le Sales Strategy Engine décide de l'utiliser ou non.

## 12.19 --- Price Sensitivity

Un fan très sensible au prix peut recevoir une stratégie différente d'un
fan qui accepte habituellement les prix affichés.

Mais :

# DO NOT DISCOUNT BY DEFAULT.

Une remise doit être justifiée par une stratégie ou une règle.

## 12.20 --- Media Outside Script

Le moteur peut proposer un média hors script si :

-   le fan demande quelque chose de précis
-   Media Intelligence trouve un contenu pertinent
-   le média est autorisé en standalone
-   prix valide
-   contexte commercial pertinent
-   aucune règle ne l'interdit

Cela permet de ne pas enfermer OmniFlow dans des scénarios rigides.

## 12.21 --- Content Match

Avant OFFER_MEDIA :

Media Intelligence doit retourner :

-   candidate media
-   relevance
-   content tags
-   target price
-   minimum price
-   permissions

Le Strategy Engine sélectionne ou demande une validation.

## 12.22 --- Custom Request

Si le fan demande quelque chose qui n'existe pas dans la bibliothèque :

le moteur doit détecter :

**CUSTOM_REQUEST**

Puis vérifier :

-   catégorie autorisée
-   creator availability
-   minimum price
-   target price
-   negotiation permission
-   human approval
-   platform capability

Ne jamais promettre automatiquement quelque chose qui n'a pas été
autorisé.

## 12.23 --- Live / Custom Services

Même logique pour les services configurés par l'agence.

Chaque service doit posséder :

-   enabled
-   target price
-   minimum price
-   negotiation
-   approval requirements
-   creator-specific rules

Le moteur peut négocier uniquement dans ce cadre.

## 12.24 --- Commercial Fatigue

Le moteur doit consulter Commercial Fatigue avant toute nouvelle vente.

Si fatigue élevée :

-   STOP_SELLING
-   CONTINUE_RELATIONSHIP
-   WAIT

peuvent devenir prioritaires.

L'objectif est d'optimiser le revenu dans la durée, pas seulement la
transaction immédiate.

## 12.25 --- Churn Risk Interaction

Un fan avec Churn Risk élevé peut nécessiter une stratégie de
réengagement.

Exemple :

**High Spending Potential** + **High Churn Risk**

ne signifie pas :

« pousser une grosse offre immédiatement ».

Le moteur doit considérer la combinaison des scores.

## 12.26 --- Strategy Matrix

Créer une matrice initiale déterministe pour encadrer le moteur.

Exemple conceptuel :

  Purchase Intent   Relationship   Fatigue   Action Bias
  ----------------- -------------- --------- ------------------------
  Low               Low            Low       Relationship
  High              Low            Low       Build Interest / Offer
  High              High           Low       Offer / Script
  Medium            High           High      Relationship
  Low               High           High      Wait
  High              High           High      Carefully evaluate

Cette matrice sert de garde-fou et pourra évoluer avec les données.

## 12.27 --- AI Strategy Reasoning

Le LLM peut aider à interpréter les situations ambiguës.

Mais la décision finale doit être encadrée par :

-   rules
-   eligibility
-   scores
-   state machine
-   permissions
-   deterministic validators

Le LLM ne doit jamais pouvoir contourner une interdiction.

## 12.28 --- Strategy Confidence

Chaque décision doit posséder :

-   confidence
-   reason codes
-   missing information éventuelle

Si confiance insuffisante :

→ Copilot ou → ESCALATE_HUMAN.

## 12.29 --- Revenue Optimization

Le moteur doit optimiser des KPI tels que :

-   conversion rate
-   revenue per conversation
-   revenue per active fan
-   average order value
-   repeat purchase
-   long-term fan value

Ne pas optimiser uniquement :

**nombre d'offres envoyées**.

## 12.30 --- Long-term Value

Une stratégie peut volontairement accepter moins de revenu immédiat si
elle améliore la valeur attendue à long terme.

Exemple :

fan important ayant déjà beaucoup acheté récemment.

→ relationnel plutôt qu'une nouvelle sollicitation immédiate.

Cette logique devra être calibrée avec les données.

## 12.31 --- Strategy Performance

Pour chaque stratégie, mesurer :

-   exposures
-   conversions
-   revenue
-   conversion rate
-   average order value
-   fan response
-   downstream engagement
-   churn impact
-   segment performance
-   creator performance

Ne pas comparer deux stratégies sans tenir compte du contexte.

## 12.32 --- Minimum Sample Size

Ne pas déclarer une stratégie gagnante après quelques conversations.

Chaque analyse doit afficher :

-   sample size
-   confidence
-   performance
-   segment

Prévoir des seuils minimums.

## 12.33 --- A/B Testing

Le moteur doit pouvoir assigner des variantes.

Exemple :

**Strategy A** vs **Strategy B**

Comparer :

-   conversion
-   revenue
-   AOV
-   downstream behavior

L'assignation doit être stable pour l'unité de test choisie.

## 12.34 --- Contextual Bandit --- Future

Prévoir une architecture pouvant évoluer vers un système de contextual
bandit.

Objectif futur :

sélectionner progressivement la stratégie la plus performante selon le
contexte du fan.

Ne pas implémenter un système complexe prématurément en V1.

V1 :

-   règles
-   scores
-   stratégies
-   A/B Testing
-   apprentissage supervisé par analytics

## 12.35 --- Strategy Library

Créer une bibliothèque de stratégies.

Deux sources :

### OMNIFLOW STRATEGIES

Créées et versionnées par OmniFlow.

### AGENCY STRATEGIES

Créées par l'agence.

Chaque stratégie peut contenir :

-   name
-   objective
-   eligibility
-   steps
-   branches
-   allowed actions
-   stop conditions
-   creator assignments
-   version
-   performance

## 12.36 --- Strategy Builder

L'agence doit pouvoir créer une stratégie sans coder.

Interface conceptuelle :

**Trigger** → **Action** → **Condition** → **Branch** → **Next Step**

Exemple :

Fan shows high intent → Offer Media A → If Purchased → Continue Step 2 →
If Price Objection → Negotiation Branch → If Refusal → Relationship
Recovery

## 12.37 --- Visual Flow Builder

Prévoir à terme une représentation visuelle node-based.

Nodes :

-   Trigger
-   Message
-   Offer
-   Media
-   Condition
-   Purchase
-   Objection
-   Wait
-   Follow-up
-   Human Approval
-   End

Pour la V1, privilégier la robustesse fonctionnelle avant un éditeur
visuel extrêmement complexe.

## 12.38 --- Strategy Versioning

Chaque modification importante crée une version.

Exemple :

Script V1 Script V2 Script V3

Les conversations historiques doivent conserver la version réellement
utilisée.

## 12.39 --- Strategy Rollback

L'agence peut restaurer une ancienne version.

Le rollback crée une nouvelle version active.

Ne jamais modifier rétroactivement les données historiques.

## 12.40 --- Strategy Recommendations

OmniFlow peut analyser les performances et proposer :

-   changer le prix
-   modifier une étape
-   remplacer un média
-   raccourcir la phase relationnelle
-   augmenter la phase relationnelle
-   tester une autre formulation
-   tester une autre branche

Les recommandations doivent être accompagnées de données.

Exemple :

**Step 1 unlock rate: 18 %** vs **Agency average: 34 %**

Potential issue: - price - media fit - pre-offer conversation - copy

Ne pas présenter une cause comme certaine sans preuve suffisante.

## 12.41 --- Funnel Analytics

Pour chaque script :

**Entered Script** → **Step 1 Offered** → **Step 1 Purchased** → **Step
2 Offered** → **Step 2 Purchased** → etc.

Mesurer :

-   drop-off
-   unlock rate
-   revenue
-   average revenue
-   time between steps

C'est essentiel pour comprendre où un script perd de l'argent.

## 12.42 --- Root Cause Analysis

Lorsqu'une étape sous-performe, OmniFlow peut analyser :

-   prix
-   média
-   copy
-   fan segment
-   timing
-   Purchase Intent
-   conversation quality avant offre
-   creator
-   chatter / Full AI
-   traffic source si disponible

Le système doit distinguer :

**correlation** de **causation**.

## 12.43 --- Copilot Strategy Display

En Copilot, le chatter peut voir :

**OmniFlow recommends: Start Script A**

Reason: - high purchase intent - fan bought similar content - low
commercial fatigue

Actions :

-   Apply
-   Choose another strategy
-   Continue relationship

L'interface doit rester rapide.

## 12.44 --- Full AI Execution

En Full AI :

1.  Strategy Engine décide
2.  Permission Engine vérifie
3.  Pricing / Media Engines valident
4.  Conversation Engine rédige
5.  Validator contrôle
6.  Action Engine exécute
7.  Observer mesure
8.  Learning Engine enregistre le résultat

Cela suit le principe OmniFlow :

# MESSAGE → UNDERSTAND → DECIDE → ACT → OBSERVE → LEARN

## 12.45 --- Critère de réussite

Le Sales Strategy Engine est réussi lorsque :

-   OmniFlow sait quand vendre et quand ne pas vendre
-   les scripts sont dynamiques
-   les branches réagissent au comportement du fan
-   les objections sont comprises
-   les prix restent dans les limites
-   les médias pertinents peuvent être proposés hors script
-   les demandes personnalisées sont correctement routées
-   la fatigue commerciale est prise en compte
-   les stratégies sont mesurables
-   l'agence peut utiliser ses propres stratégies
-   OmniFlow peut progressivement identifier ce qui convertit le mieux

# NOT MORE SALES PRESSURE.

# BETTER SALES DECISIONS.

------------------------------------------------------------------------

## PARTIE 12 --- VALIDÉE COMME SPÉCIFICATION DU SALES STRATEGY ENGINE

La suite du cahier des charges commence avec :

# PARTIE 13 --- SCRIPT ENGINE & BRANCHING SYSTEM
