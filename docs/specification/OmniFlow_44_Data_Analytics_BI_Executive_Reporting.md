# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 44 --- DATA ANALYTICS, BI & EXECUTIVE REPORTING

## 44.1 --- Objectif

OmniFlow doit transformer les données opérationnelles du Chatting en
décisions compréhensibles pour l'agence.

Le dashboard ne doit pas seulement afficher des chiffres.

Il doit répondre à :

``` text
WHAT IS HAPPENING?
WHY?
WHERE?
WHAT SHOULD I DO?
```

------------------------------------------------------------------------

## 44.2 --- Analytics Philosophy

Séparer :

``` text
OPERATIONAL ANALYTICS
COMMERCIAL ANALYTICS
AI ANALYTICS
EXECUTIVE ANALYTICS
```

------------------------------------------------------------------------

## 44.3 --- Source of Truth

Chaque KPI doit avoir une définition unique et documentée.

Éviter que deux pages calculent différemment le même indicateur.

------------------------------------------------------------------------

## 44.4 --- Metric Registry

Créer un registre documentaire des métriques :

``` text
Name
Definition
Formula
Source
Filters
Timezone behavior
Known limitations
```

------------------------------------------------------------------------

## 44.5 --- Core Dimensions

Les données doivent pouvoir être segmentées selon disponibilité par :

-   agency
-   creator
-   fan
-   conversation
-   script
-   script step
-   AI mode
-   period
-   platform
-   team member

------------------------------------------------------------------------

## 44.6 --- Time Filters

Minimum :

``` text
Today
Yesterday
7 days
30 days
This month
Last month
Custom
```

------------------------------------------------------------------------

## 44.7 --- Timezone

Tous les agrégats temporels doivent utiliser une règle de timezone
explicite.

------------------------------------------------------------------------

## 44.8 --- Currency

Définir une stratégie pour :

-   transaction currency
-   display currency
-   conversion if multiple currencies become relevant

Ne pas additionner naïvement des devises différentes.

------------------------------------------------------------------------

## 44.9 --- Executive Dashboard

Vue agence synthétique :

``` text
Revenue
AI-attributed Revenue
Sales
Conversion
Active Fans
High-Intent Fans
AI Usage
Copilot / Full AI
Creator Performance
```

------------------------------------------------------------------------

## 44.10 --- Revenue

Afficher selon données disponibles :

-   gross tracked revenue
-   AI-attributed revenue
-   revenue by creator
-   revenue by period

------------------------------------------------------------------------

## 44.11 --- AI-Attributed Revenue

Définition stricte nécessaire.

Exemples de catégories :

``` text
FULL_AI
COPILOT_ACCEPTED
HUMAN
MIXED / UNKNOWN
```

------------------------------------------------------------------------

## 44.12 --- Attribution Window

Une vente ne doit pas être arbitrairement attribuée à l'IA.

Documenter la logique reliant :

``` text
message/action
→
offer
→
purchase
```

------------------------------------------------------------------------

## 44.13 --- Conversion Funnel

Exemple :

``` text
Fans engaged
↓
Offer sent
↓
Offer opened/unlocked
↓
Purchase
↓
Next script step
```

selon données plateforme réellement disponibles.

------------------------------------------------------------------------

## 44.14 --- Script Analytics

Pour chaque script :

-   usage count
-   revenue
-   conversion
-   average order value
-   completion
-   drop-off

------------------------------------------------------------------------

## 44.15 --- Step Analytics

Pour chaque étape :

``` text
Entered
Offer Sent
Purchased
Skipped
Failed
Drop-off
Revenue
```

------------------------------------------------------------------------

## 44.16 --- Script Branch Analytics

Mesurer les branches :

``` text
PAID
NOT_PAID
FOLLOW_UP
RECOVERY
```

pour comprendre où les fans sortent du flow.

------------------------------------------------------------------------

## 44.17 --- Script Comparison

Comparer deux scripts sur des périodes/populations comparables.

------------------------------------------------------------------------

## 44.18 --- Statistical Caution

Ne pas conclure qu'un script est meilleur avec un échantillon minuscule.

Afficher volume et contexte.

------------------------------------------------------------------------

## 44.19 --- A/B Test Analytics

Pour les expériences :

``` text
Variant A
Variant B
Sample
Conversion
Revenue
Confidence/decision rule
```

La méthodologie exacte doit être documentée.

------------------------------------------------------------------------

## 44.20 --- Creator Performance

Pour chaque créatrice :

-   revenue
-   AI-attributed revenue
-   conversion
-   active fans
-   average spend
-   AI usage
-   Full AI adoption
-   script performance

------------------------------------------------------------------------

## 44.21 --- Creator Comparison

Permettre comparaison entre créatrices.

Toujours afficher suffisamment de contexte pour éviter les conclusions
trompeuses.

------------------------------------------------------------------------

## 44.22 --- Fan Analytics

Vue agrégée :

-   new fans
-   active fans
-   buyers
-   repeat buyers
-   high spenders
-   churn-risk fans
-   high-intent fans

------------------------------------------------------------------------

## 44.23 --- Fan Segmentation

Segments possibles :

``` text
NEW
COLD
WARM
HOT
BUYER
HIGH_VALUE
AT_RISK
DORMANT
```

Les définitions doivent provenir du scoring réel.

------------------------------------------------------------------------

## 44.24 --- Purchase Intent Analytics

Afficher distribution :

``` text
Low
Medium
High
```

et relation avec conversion.

------------------------------------------------------------------------

## 44.25 --- Relationship Analytics

Utiliser avec prudence.

Le score relationnel doit aider à comprendre les interactions, pas
prétendre mesurer une émotion humaine avec certitude.

------------------------------------------------------------------------

## 44.26 --- Spending Potential Analytics

Comparer :

``` text
Predicted potential
vs
Actual spending
```

pour calibrer le score.

------------------------------------------------------------------------

## 44.27 --- Churn Risk Analytics

Mesurer si les fans classés à risque deviennent effectivement inactifs
selon définition retenue.

------------------------------------------------------------------------

## 44.28 --- Score Calibration

Les scores doivent pouvoir être évalués dans le temps.

Un score inutilement confiant doit être corrigé.

------------------------------------------------------------------------

## 44.29 --- AI Performance Dashboard

Afficher :

``` text
AI Messages
Copilot Suggestions
Acceptance Rate
Edit Rate
Regeneration Rate
Full AI Messages
Takeover Rate
Escalations
```

------------------------------------------------------------------------

## 44.30 --- Copilot Acceptance

Définition :

``` text
accepted suggestions
/
eligible generated suggestions
```

selon instrumentation finale.

------------------------------------------------------------------------

## 44.31 --- Edit Rate

Mesurer les suggestions modifiées avant envoi.

Cela peut signaler :

-   tone mismatch
-   quality issue
-   context issue

------------------------------------------------------------------------

## 44.32 --- Regeneration Rate

Un taux élevé doit être investigable par :

-   creator
-   prompt/model version
-   scenario

------------------------------------------------------------------------

## 44.33 --- Full AI Takeover Rate

Mesurer :

``` text
human takeovers
/
full AI conversations
```

avec raisons.

------------------------------------------------------------------------

## 44.34 --- Escalation Reasons

Agrégation :

``` text
Pricing
Custom request
Low confidence
Platform limitation
Safety/policy
Technical error
Other
```

------------------------------------------------------------------------

## 44.35 --- AI Quality Feedback

Afficher :

-   positive feedback
-   negative feedback
-   categories
-   trends

------------------------------------------------------------------------

## 44.36 --- Model Analytics

Interne OmniFlow :

-   calls
-   tokens
-   cost
-   latency
-   errors
-   task distribution
-   benchmark quality

------------------------------------------------------------------------

## 44.37 --- Cost Analytics

Voir Partie 37.

Intégrer :

``` text
AI Cost
Cost / Conversation
Cost / Creator
Cost / Agency
Cost / AI Revenue
```

------------------------------------------------------------------------

## 44.38 --- Unit Economics Dashboard

Interne :

``` text
Subscription Revenue
Commission Revenue
Variable AI Cost
Infrastructure Cost
Contribution Margin
```

------------------------------------------------------------------------

## 44.39 --- Commission Analytics

Afficher :

-   eligible sales
-   commission base
-   2.5% amount
-   adjustments
-   reconciliation status

------------------------------------------------------------------------

## 44.40 --- Agency Savings Estimate

Optionnel :

comparer le coût OmniFlow à une hypothèse chatter configurable.

Ne pas présenter l'estimation comme vérité comptable.

------------------------------------------------------------------------

## 44.41 --- Operational Analytics

Mesurer :

-   connector health
-   message failures
-   sync delays
-   queue backlog
-   notification failures

------------------------------------------------------------------------

## 44.42 --- Team Analytics

Si chatter humain :

-   conversations handled
-   response activity
-   Copilot usage
-   AI acceptance

Éviter les métriques de surveillance invasives sans besoin produit/légal
validé.

------------------------------------------------------------------------

## 44.43 --- Response Time

Mesurer si la plateforme fournit les timestamps fiables.

Distinguer :

``` text
Technical processing time
Human response time
Intentional AI delay
```

------------------------------------------------------------------------

## 44.44 --- Follow-Up Analytics

Mesurer :

``` text
Scheduled
Sent
Skipped
Cancelled
Converted
Revenue
```

------------------------------------------------------------------------

## 44.45 --- Media Analytics

Si disponible :

-   offers containing media
-   purchases
-   revenue
-   average price
-   script usage

------------------------------------------------------------------------

## 44.46 --- Media Ranking

Ne pas classer uniquement sur revenu brut.

Considérer :

-   impressions/offers
-   conversion
-   revenue
-   price

------------------------------------------------------------------------

## 44.47 --- Custom Content Analytics

Mesurer :

-   requests
-   accepted
-   declined
-   negotiated price
-   completed
-   revenue

selon capacités et conformité.

------------------------------------------------------------------------

## 44.48 --- Negotiation Analytics

Mesurer :

``` text
Negotiations
Starting price
Final price
Discount %
Conversion
Revenue
```

------------------------------------------------------------------------

## 44.49 --- Discount Performance

Permettre de comprendre si les discounts améliorent réellement la
conversion ou réduisent inutilement le revenu.

------------------------------------------------------------------------

## 44.50 --- Pricing Analytics

Analyser par tranche de prix.

Ne pas recommander automatiquement une baisse de prix sur simple
corrélation.

------------------------------------------------------------------------

## 44.51 --- Diagnostic Insights

OmniFlow peut produire des insights comme :

``` text
Step 1 conversion is below its 30-day baseline.
```

------------------------------------------------------------------------

## 44.52 --- Insight Requirements

Chaque insight doit avoir :

``` text
Metric
Comparison
Evidence
Confidence/context
Suggested investigation
```

------------------------------------------------------------------------

## 44.53 --- No Fake Causality

Ne pas écrire :

``` text
Your price caused the drop.
```

si la donnée montre seulement une corrélation.

Préférer :

``` text
The drop coincides with a price increase. Review price, media and pre-offer conversation.
```

------------------------------------------------------------------------

## 44.54 --- AI Analytics Assistant

À terme, l'agence peut poser :

``` text
Why did revenue drop this week?
```

L'assistant doit répondre à partir des données calculées, pas inventer.

------------------------------------------------------------------------

## 44.55 --- Structured Query Layer

Préférer que l'IA interroge une couche métrique structurée plutôt que
générer du SQL libre production.

------------------------------------------------------------------------

## 44.56 --- Executive Summary

Générer un résumé :

``` text
What improved
What declined
Largest opportunity
Largest risk
Recommended actions
```

------------------------------------------------------------------------

## 44.57 --- Daily Summary

Optionnel :

résumé quotidien agence.

------------------------------------------------------------------------

## 44.58 --- Weekly Report

Rapport hebdomadaire :

-   revenue
-   conversion
-   creators
-   scripts
-   AI
-   opportunities
-   risks

------------------------------------------------------------------------

## 44.59 --- Monthly Report

Vue plus stratégique :

-   growth
-   creator comparison
-   AI adoption
-   script performance
-   commission
-   trends

------------------------------------------------------------------------

## 44.60 --- Report Delivery

Canaux possibles :

``` text
In-app
Email
Export
```

------------------------------------------------------------------------

## 44.61 --- Export

Permettre export approprié :

-   CSV
-   possibly PDF later

selon type de rapport.

------------------------------------------------------------------------

## 44.62 --- CSV Security

Les exports doivent respecter :

-   tenant
-   permissions
-   creator scope

------------------------------------------------------------------------

## 44.63 --- Scheduled Reports

P2 :

l'utilisateur peut choisir :

-   recipients
-   cadence
-   report
-   scope

------------------------------------------------------------------------

## 44.64 --- Dashboard Filters

Filtres persistants si utile :

-   creator
-   platform
-   AI mode
-   script
-   period

------------------------------------------------------------------------

## 44.65 --- Drill-Down

Chaque KPI majeur doit idéalement permettre de comprendre sa
composition.

Exemple :

``` text
Revenue
↓
Creator
↓
Script
↓
Transaction
```

selon permission.

------------------------------------------------------------------------

## 44.66 --- Dashboard Loading

Ne pas bloquer toute la page sur une seule requête analytique lourde.

------------------------------------------------------------------------

## 44.67 --- Aggregation Layer

Pour les métriques coûteuses :

utiliser des agrégats pré-calculés lorsque nécessaire.

------------------------------------------------------------------------

## 44.68 --- Event Model

Les événements analytiques doivent être immuables autant que possible.

Les corrections passent par événements/ajustements ou recalcul contrôlé.

------------------------------------------------------------------------

## 44.69 --- Event Idempotency

Éviter de compter deux fois un événement provenant d'un webhook retry.

------------------------------------------------------------------------

## 44.70 --- Late Events

Prévoir que certaines transactions arrivent tardivement.

Les agrégats doivent pouvoir être corrigés.

------------------------------------------------------------------------

## 44.71 --- Backfill

Prévoir un mécanisme de recalcul/backfill contrôlé.

------------------------------------------------------------------------

## 44.72 --- Metric Versioning

Si une définition KPI change :

versionner ou documenter la date de changement.

------------------------------------------------------------------------

## 44.73 --- Data Quality

Créer des checks :

``` text
Missing IDs
Duplicate transactions
Negative impossible amounts
Orphaned events
Unexpected currency
```

------------------------------------------------------------------------

## 44.74 --- Data Freshness

Afficher la fraîcheur si les données ne sont pas realtime.

Exemple :

``` text
Last synced 4 min ago
```

------------------------------------------------------------------------

## 44.75 --- Incomplete Data

Si un connecteur ne fournit pas une métrique :

ne pas afficher une valeur fausse.

Afficher :

``` text
Unavailable
```

------------------------------------------------------------------------

## 44.76 --- Platform Comparison

Ne comparer deux plateformes que sur métriques réellement équivalentes.

------------------------------------------------------------------------

## 44.77 --- Dashboard Customization

P2/P3 :

permettre éventuellement de réordonner certains widgets.

Pas nécessaire V1.

------------------------------------------------------------------------

## 44.78 --- Saved Views

Future :

``` text
Agency Overview
Creator Review
AI Review
Sales Review
```

------------------------------------------------------------------------

## 44.79 --- Goal Tracking

L'agence peut définir un objectif :

``` text
Monthly Revenue Target
```

et suivre progression.

------------------------------------------------------------------------

## 44.80 --- Goal Alerts

Optionnel via Partie 38 :

-   target reached
-   pacing below target

------------------------------------------------------------------------

## 44.81 --- Forecasting

Ne pas intégrer un forecast financier sophistiqué sans assez de données.

------------------------------------------------------------------------

## 44.82 --- Simple Pacing

Possible :

``` text
MTD revenue
/
elapsed days
```

avec indication claire que ce n'est qu'une projection simple.

------------------------------------------------------------------------

## 44.83 --- BI Internal

L'équipe OmniFlow doit pouvoir analyser :

-   acquisition
-   activation
-   retention
-   expansion
-   revenue
-   AI cost
-   support
-   incidents

------------------------------------------------------------------------

## 44.84 --- Internal vs Agency Metrics

Séparer clairement les données internes OmniFlow des dashboards clients.

------------------------------------------------------------------------

## 44.85 --- Privacy

Les analytics inter-agences doivent être agrégées/anonymisées de manière
appropriée.

------------------------------------------------------------------------

## 44.86 --- Benchmarks Across Agencies

Ne pas afficher :

``` text
Agency X does Y
```

à Agency Z.

Des benchmarks anonymisés peuvent être envisagés après revue
juridique/statistique.

------------------------------------------------------------------------

## 44.87 --- Industry Benchmark

P3 :

``` text
Your conversion vs anonymized cohort
```

uniquement avec dataset suffisant et gouvernance validée.

------------------------------------------------------------------------

## 44.88 --- Analytics Permissions

Exemples :

``` text
Owner → all agency analytics
Manager → assigned creator analytics
Chatter → operational scope
```

------------------------------------------------------------------------

## 44.89 --- Financial Metric Permissions

Les données financières peuvent nécessiter une permission distincte.

------------------------------------------------------------------------

## 44.90 --- Audit

Les exports sensibles et certains accès analytics doivent être
auditables.

------------------------------------------------------------------------

## 44.91 --- Analytics API

Créer une couche API stable pour les métriques principales.

------------------------------------------------------------------------

## 44.92 --- No Business Logic in Charts

Les composants frontend ne doivent pas recalculer arbitrairement les KPI
métier.

------------------------------------------------------------------------

## 44.93 --- Metric Service

Centraliser les calculs importants côté backend/data layer.

------------------------------------------------------------------------

## 44.94 --- Chart Standards

Charts doivent :

-   avoir unités
-   période
-   légende
-   tooltip
-   empty state

------------------------------------------------------------------------

## 44.95 --- Comparison

Afficher clairement :

``` text
+12.4% vs previous period
```

avec définition de la période précédente.

------------------------------------------------------------------------

## 44.96 --- Percentage Edge Cases

Gérer :

-   previous = 0
-   missing data
-   tiny denominator

sans afficher des pourcentages absurdes.

------------------------------------------------------------------------

## 44.97 --- Revenue Formatting

Utiliser format monétaire cohérent.

------------------------------------------------------------------------

## 44.98 --- Dashboard Design

Respecter direction premium IA.

Priorité :

``` text
READABILITY
HIERARCHY
DECISION-MAKING
```

pas une surcharge de graphiques.

------------------------------------------------------------------------

## 44.99 --- KPI Cards

Limiter les KPI principaux à ceux qui orientent réellement une décision.

------------------------------------------------------------------------

## 44.100 --- Insight Cards

Ajouter des cartes de diagnostic lorsque les données sont suffisamment
solides.

------------------------------------------------------------------------

## 44.101 --- MVP Dashboard

P0/P1 :

``` text
Revenue
AI-attributed Revenue
Sales
Conversion
Creator Comparison
Script Performance
AI Usage
Copilot Acceptance
Full AI Activity
Fan Segments
```

------------------------------------------------------------------------

## 44.102 --- P2

``` text
A/B testing analytics
Weekly reports
Advanced negotiation analytics
Goals
Scheduled reports
AI analytics assistant
```

------------------------------------------------------------------------

## 44.103 --- P3

``` text
Forecasting
Cross-agency anonymized benchmarks
Advanced BI customization
Predictive executive insights
```

------------------------------------------------------------------------

## 44.104 --- Testing

Tester :

-   KPI formulas
-   date boundaries
-   timezone
-   currency
-   duplicate events
-   late events
-   permissions
-   empty states
-   large datasets

------------------------------------------------------------------------

## 44.105 --- Golden Dataset

Créer un dataset analytique test avec résultats attendus.

Exemple :

``` text
10 offers
4 purchases
€200 revenue
2 Full AI
2 Copilot
```

Les KPI doivent produire exactement les valeurs attendues.

------------------------------------------------------------------------

## 44.106 --- Reconciliation

Les totaux financiers analytics doivent être réconciliables avec les
transactions sources.

------------------------------------------------------------------------

## 44.107 --- Performance

Les dashboards courants doivent rester rapides même lorsque l'historique
grandit.

------------------------------------------------------------------------

## 44.108 --- Observability

Surveiller :

-   query latency
-   aggregation failures
-   stale data
-   backfill failures

------------------------------------------------------------------------

## 44.109 --- Claude Code Deliverables

Créer :

``` text
/docs/analytics/METRIC_REGISTRY.md
/docs/analytics/ATTRIBUTION_MODEL.md
/docs/analytics/REPORTING_ARCHITECTURE.md
/docs/analytics/DATA_QUALITY.md
```

------------------------------------------------------------------------

## 44.110 --- METRIC_REGISTRY.md

Définir chaque KPI principal.

------------------------------------------------------------------------

## 44.111 --- ATTRIBUTION_MODEL.md

Documenter :

-   AI attribution
-   sales attribution
-   limitations
-   edge cases

------------------------------------------------------------------------

## 44.112 --- REPORTING_ARCHITECTURE.md

Documenter :

-   aggregation
-   dashboard APIs
-   reports
-   exports
-   scheduling

------------------------------------------------------------------------

## 44.113 --- DATA_QUALITY.md

Documenter :

-   checks
-   reconciliation
-   backfill
-   late events
-   duplicate protection

------------------------------------------------------------------------

## 44.114 --- Acceptance Criteria

Cette partie est réussie lorsque :

-   chaque KPI important a une définition unique
-   l'agence comprend son revenu et sa conversion
-   les performances par créatrice sont comparables
-   les scripts peuvent être diagnostiqués étape par étape
-   Copilot et Full AI sont mesurables
-   les fan scores peuvent être évalués
-   les coûts IA peuvent être rapprochés de la valeur
-   les données manquantes ne deviennent jamais de faux chiffres
-   les dashboards restent rapides
-   les permissions financières sont respectées
-   les rapports peuvent conduire à une action

------------------------------------------------------------------------

## 44.115 --- Final Principle

OmniFlow ne doit pas être un dashboard qui dit seulement :

# "HERE ARE YOUR NUMBERS."

Il doit progressivement devenir un système capable de dire :

# "HERE IS WHAT CHANGED."

# "HERE IS WHERE."

# "HERE IS THE LIKELY OPPORTUNITY."

# "HERE IS WHAT YOU SHOULD INVESTIGATE NEXT."

sans confondre analyse et certitude causale.

------------------------------------------------------------------------

## PARTIE 44 --- VALIDÉE COMME DATA ANALYTICS, BI & EXECUTIVE REPORTING

La suite du cahier des charges commence avec :

# PARTIE 45 --- QA, RELEASE READINESS & PRODUCTION LAUNCH
