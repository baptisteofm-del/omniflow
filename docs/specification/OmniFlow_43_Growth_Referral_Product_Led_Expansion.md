# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 43 --- GROWTH, REFERRAL & PRODUCT-LED EXPANSION

## 43.1 --- Objectif

OmniFlow doit être conçu pour que la qualité du produit puisse elle-même
contribuer à sa croissance.

Le moteur principal reste :

``` text
BETTER AI CHATTING
→
BETTER OPERATIONAL EXPERIENCE
→
BETTER COMMERCIAL RESULTS
→
RETENTION
→
WORD OF MOUTH
```

La croissance produit ne doit pas reposer sur des artifices viraux qui
dégradent l'expérience premium.

------------------------------------------------------------------------

## 43.2 --- North Star

La croissance doit être corrélée à la valeur réelle créée.

Éviter les vanity metrics.

Les signaux importants incluent :

-   agences activées
-   créatrices actives
-   conversations AI-assisted
-   ventes attribuées
-   rétention
-   expansion
-   referrals qualifiés

------------------------------------------------------------------------

## 43.3 --- Product-Led Growth

Le produit doit pouvoir :

``` text
DEMONSTRATE VALUE
↓
CREATE TRUST
↓
INCREASE USAGE
↓
EXPAND ACCOUNT
↓
GENERATE REFERRALS
```

------------------------------------------------------------------------

## 43.4 --- First Growth Loop

Boucle principale :

``` text
Agency uses OmniFlow
↓
AI performs well
↓
Agency sees measurable result
↓
Agency keeps product
↓
Agency recommends OmniFlow
↓
New agency joins
```

------------------------------------------------------------------------

## 43.5 --- Performance as Marketing

Le meilleur argument commercial doit être démontrable dans le produit.

Exemples :

``` text
AI-attributed revenue
Conversion improvement
Copilot acceptance
Full AI performance
Recovered opportunities
```

------------------------------------------------------------------------

## 43.6 --- Shareable Success

À terme, permettre de transformer certains résultats en éléments
partageables.

Exemple :

``` text
€X AI-assisted revenue this month
```

sans exposer de données privées.

------------------------------------------------------------------------

## 43.7 --- Privacy by Default

Aucun résultat agence ne doit être rendu public automatiquement.

Le partage doit être explicite.

------------------------------------------------------------------------

## 43.8 --- Referral Program

Prévoir une architecture de parrainage.

Concept :

``` text
Agency A
↓
Referral Link / Code
↓
Agency B
↓
Qualified Conversion
↓
Reward
```

------------------------------------------------------------------------

## 43.9 --- Referral Entity

Conceptual fields :

``` text
id
referrer_agency_id
code
referred_agency_id
status
qualified_at
reward_type
reward_value
created_at
```

------------------------------------------------------------------------

## 43.10 --- Referral Status

``` text
CLICKED
SIGNED_UP
ACTIVATED
QUALIFIED
REWARDED
INVALID
```

selon architecture finale.

------------------------------------------------------------------------

## 43.11 --- Qualification

Un referral ne doit pas nécessairement être récompensé à la simple
création d'un compte.

Possible qualification :

-   paid subscription
-   minimum active period
-   minimum revenue/usage

La règle finale est configurable.

------------------------------------------------------------------------

## 43.12 --- Reward Types

Architecture compatible avec :

``` text
Account Credit
Subscription Discount
Cash/Partner Payout
Feature Credit
```

Ne pas implémenter tous les types en V1.

------------------------------------------------------------------------

## 43.13 --- Referral Economics

Avant lancement du programme :

calculer :

``` text
CAC SAVED
vs
REFERRAL REWARD
vs
EXPECTED LTV
```

------------------------------------------------------------------------

## 43.14 --- Anti-Abuse

Prévoir :

-   self-referral detection
-   duplicate account detection
-   reward reversal
-   suspicious patterns

------------------------------------------------------------------------

## 43.15 --- Referral Dashboard

L'agence peut voir :

-   link/code
-   invited agencies
-   status
-   earned rewards

sans voir de données privées de l'agence référée.

------------------------------------------------------------------------

## 43.16 --- Partner Program

Plus tard, distinguer :

``` text
CUSTOMER REFERRAL
```

de :

``` text
AFFILIATE / PARTNER
```

------------------------------------------------------------------------

## 43.17 --- Agency Community

Une communauté peut accélérer :

-   feedback
-   education
-   word of mouth

mais elle n'est pas nécessaire au cœur V1.

------------------------------------------------------------------------

## 43.18 --- No Forced Community

OmniFlow doit rester pleinement utilisable sans Discord/Telegram
communautaire.

------------------------------------------------------------------------

## 43.19 --- Expansion Within Account

Expansion naturelle :

``` text
1 Creator
↓
More Creators
↓
More AI Usage
↓
Full AI
↓
Higher Account Value
```

------------------------------------------------------------------------

## 43.20 --- Creator Expansion

Ajouter une créatrice doit être extrêmement simple après onboarding
initial.

------------------------------------------------------------------------

## 43.21 --- Usage Expansion

Identifier les agences qui utilisent fortement Copilot mais pas Full AI.

Cela peut devenir une opportunité d'upgrade.

------------------------------------------------------------------------

## 43.22 --- Upgrade Signals

Exemples :

``` text
High conversation volume
Multiple creators
High Copilot acceptance
Repeated plan limit
Need for autonomous coverage
```

------------------------------------------------------------------------

## 43.23 --- Contextual Upgrade

L'upgrade doit être proposé lorsque le besoin apparaît.

Pas via popups permanents.

------------------------------------------------------------------------

## 43.24 --- Plan Limit UX

Lorsqu'une limite est atteinte :

expliquer :

-   current usage
-   limit
-   value of upgrade
-   action

------------------------------------------------------------------------

## 43.25 --- No Hostage UX

Ne pas bloquer brutalement l'accès aux données historiques parce qu'une
limite d'usage est atteinte.

Les restrictions doivent être cohérentes avec le plan et communiquées.

------------------------------------------------------------------------

## 43.26 --- Full AI Expansion

Full AI est potentiellement le principal levier d'upsell.

Le produit doit démontrer avant upgrade :

-   qualité
-   contrôle
-   sécurité
-   potentiel économique

------------------------------------------------------------------------

## 43.27 --- Full AI Trial

Possible à terme :

``` text
Limited Full AI Trial
```

avec limites strictes.

La stratégie finale doit dépendre des coûts et du risque.

------------------------------------------------------------------------

## 43.28 --- Creator-Level Upgrade

Si pricing le permet :

certaines fonctions peuvent être activées par créatrice.

L'architecture ne doit pas supposer que tout est toujours account-wide.

------------------------------------------------------------------------

## 43.29 --- Usage-Based Expansion

Le modèle de commission crée déjà une expansion économique liée au
succès.

``` text
Agency sells more
↓
OmniFlow commission increases
```

------------------------------------------------------------------------

## 43.30 --- Alignment

La commission de 2,5 % aligne partiellement OmniFlow avec le résultat de
l'agence.

Cela doit être présenté comme :

``` text
WE WIN MORE WHEN YOU SELL MORE
```

sans faire de promesses de revenus garanties.

------------------------------------------------------------------------

## 43.31 --- Savings Positioning

Comparaison commerciale possible :

``` text
Traditional chatter commission ≈ 10%+ benchmark
OmniFlow commission = 2.5%
```

Les comparaisons marketing doivent être exactes, justifiables et
formulées avec prudence.

------------------------------------------------------------------------

## 43.32 --- Savings Calculator

Créer potentiellement un calculateur :

``` text
Monthly sales
Current chatter %
Current CRM cost
↓
Estimated current cost
vs
OmniFlow pricing
```

------------------------------------------------------------------------

## 43.33 --- Calculator Disclaimer

Le calculateur doit être présenté comme estimation.

Ne pas garantir une économie identique pour toutes les agences.

------------------------------------------------------------------------

## 43.34 --- Landing Growth Components

Landing dynamique peut inclure :

-   product demo
-   savings calculator
-   AI workflow
-   performance proof
-   testimonials
-   pricing
-   referral/partner proof

selon disponibilité réelle.

------------------------------------------------------------------------

## 43.35 --- No Fake Social Proof

Interdiction :

-   faux logos clients
-   faux témoignages
-   faux revenus
-   faux nombres d'utilisateurs

------------------------------------------------------------------------

## 43.36 --- Case Studies

Après pilotes :

créer des études de cas basées sur données autorisées.

Structure :

``` text
Before
Setup
OmniFlow usage
Measured result
Time period
Context
```

------------------------------------------------------------------------

## 43.37 --- Case Study Consent

Obtenir l'autorisation nécessaire avant publication d'informations
client.

------------------------------------------------------------------------

## 43.38 --- Testimonials

Stocker :

-   quote
-   source
-   permission
-   status

si une gestion interne est développée.

------------------------------------------------------------------------

## 43.39 --- Product Demo

Le Demo Environment Partie 39 doit pouvoir servir au marketing et à la
vente.

------------------------------------------------------------------------

## 43.40 --- Interactive Demo

À terme :

visiteur peut comprendre :

``` text
Fan message
↓
OmniFlow analysis
↓
AI decision
↓
Suggested response
```

sans données réelles.

------------------------------------------------------------------------

## 43.41 --- Demo Conversion

CTA après démo :

``` text
Start with your creator
```

------------------------------------------------------------------------

## 43.42 --- Trial Conversion Funnel

Mesurer :

``` text
Landing
↓
Signup
↓
Demo
↓
Activation
↓
Paid
↓
Retained
```

si trial retenu.

------------------------------------------------------------------------

## 43.43 --- Sales-Assisted Funnel

Pour grosses agences :

``` text
Landing
↓
Demo request
↓
Sales call
↓
Pilot
↓
Paid
```

------------------------------------------------------------------------

## 43.44 --- Self-Serve + Sales

Architecture commerciale compatible avec les deux.

------------------------------------------------------------------------

## 43.45 --- Lead Capture

Si demande de démo :

collecter seulement les informations utiles.

Exemples :

-   name
-   agency
-   email
-   creator count
-   approximate monthly volume

------------------------------------------------------------------------

## 43.46 --- CRM Integration

Future integration possible avec CRM externe.

Ne pas construire un CRM commercial complet dans OmniFlow V1.

------------------------------------------------------------------------

## 43.47 --- Lead Attribution

Conserver :

``` text
source
campaign
referral
landing variant
```

si disponible et conforme.

------------------------------------------------------------------------

## 43.48 --- UTM

Supporter les paramètres UTM pour acquisition marketing.

------------------------------------------------------------------------

## 43.49 --- Attribution Privacy

Respecter les règles de tracking applicables définies Partie 42.

------------------------------------------------------------------------

## 43.50 --- Conversion Events

Événements marketing importants :

``` text
pricing_viewed
demo_started
signup_started
signup_completed
trial_started
subscription_started
demo_requested
```

------------------------------------------------------------------------

## 43.51 --- Product Events

Relier ensuite :

``` text
activated
first_ai_value
first_sale
full_ai_enabled
```

------------------------------------------------------------------------

## 43.52 --- Source Quality

Mesurer non seulement :

``` text
signups by source
```

mais :

``` text
activated agencies by source
retained agencies by source
revenue by source
```

------------------------------------------------------------------------

## 43.53 --- Viral Coefficient

Peut être suivi plus tard.

Ne pas optimiser ce KPI avant d'avoir un referral loop réel.

------------------------------------------------------------------------

## 43.54 --- Word-of-Mouth Tracking

Lors du signup ou onboarding, option :

``` text
How did you hear about OmniFlow?
```

avec :

-   referral
-   social
-   search
-   agency owner
-   other

------------------------------------------------------------------------

## 43.55 --- Referral Attribution Window

Définir une règle claire pour attribuer un referral.

------------------------------------------------------------------------

## 43.56 --- Last Click vs Referral Code

Si code explicite :

le code peut avoir priorité selon règle commerciale définie.

------------------------------------------------------------------------

## 43.57 --- Reward Ledger

Ne pas gérer les récompenses uniquement via un champ mutable.

Créer un ledger auditable si valeur financière.

------------------------------------------------------------------------

## 43.58 --- Reward Reversal

Prévoir correction si :

-   refund
-   fraud
-   qualification invalidée

------------------------------------------------------------------------

## 43.59 --- Referral Notifications

Exemples :

``` text
Your referral signed up.
Your referral qualified.
Your reward is available.
```

------------------------------------------------------------------------

## 43.60 --- Expansion Analytics

Suivre :

``` text
Creators per agency
AI usage growth
Full AI adoption
Plan upgrades
Commission growth
```

------------------------------------------------------------------------

## 43.61 --- Net Revenue Retention

À terme, KPI B2B important :

``` text
NRR
```

Incluant expansion/contraction/churn selon définition financière
retenue.

------------------------------------------------------------------------

## 43.62 --- Gross Revenue Retention

Suivre également :

``` text
GRR
```

pour distinguer rétention pure et expansion.

------------------------------------------------------------------------

## 43.63 --- Cohorts

Analyser les agences par :

-   signup month
-   acquisition source
-   plan
-   size
-   activation quality

------------------------------------------------------------------------

## 43.64 --- Product Qualified Lead

Une agence peut devenir PQL selon signaux.

Exemple :

``` text
Multiple creators
High demo usage
High Copilot usage
Plan limit reached
```

------------------------------------------------------------------------

## 43.65 --- Sales Notification

Un PQL important peut être envoyé au workflow commercial interne.

------------------------------------------------------------------------

## 43.66 --- No Aggressive Upsell

Le produit premium doit conserver une UX propre.

Éviter :

-   popup à chaque login
-   faux compte à rebours
-   dark patterns

------------------------------------------------------------------------

## 43.67 --- Upgrade Page

Doit montrer :

-   current plan
-   usage
-   unlocked capabilities
-   pricing
-   commission conditions

------------------------------------------------------------------------

## 43.68 --- Downgrade

Prévoir une expérience claire :

-   impact
-   effective date
-   retained data
-   disabled features

------------------------------------------------------------------------

## 43.69 --- Cancellation Feedback

Réutiliser le système Partie 40 pour comprendre les raisons de churn.

------------------------------------------------------------------------

## 43.70 --- Win-Back

À terme, possibilité de campagnes de retour.

Uniquement avec règles marketing/privacy applicables.

------------------------------------------------------------------------

## 43.71 --- Product Announcements

Nouvelles fonctionnalités importantes peuvent être communiquées via :

-   in-app
-   email
-   changelog

------------------------------------------------------------------------

## 43.72 --- Changelog

Créer une page ou système simple :

``` text
New
Improved
Fixed
```

------------------------------------------------------------------------

## 43.73 --- Feature Adoption

Après release :

mesurer :

-   exposed
-   tried
-   repeated usage
-   retained usage

------------------------------------------------------------------------

## 43.74 --- Beta Invitations

Utiliser le système de feature flags et pilotes.

------------------------------------------------------------------------

## 43.75 --- Waitlist

Pour certaines features futures :

permettre une waitlist.

Cela aide à mesurer l'intérêt avant développement.

------------------------------------------------------------------------

## 43.76 --- Demand Validation

Avant gros module futur :

mesurer :

-   waitlist
-   interviews
-   feature requests
-   willingness to pay

------------------------------------------------------------------------

## 43.77 --- Marketing Future Modules

OmniFlow pourra plus tard intégrer :

-   Marketing
-   Recruitment

mais ne doit pas les construire avant validation du Chatting core.

------------------------------------------------------------------------

## 43.78 --- Cross-Sell Future Pillars

Lorsque ces piliers existeront :

``` text
Chatting customer
↓
Marketing module
↓
Recruitment module
```

peut créer une expansion naturelle.

------------------------------------------------------------------------

## 43.79 --- Unified Platform Vision

La vision long terme reste :

``` text
ONE OPERATING SYSTEM FOR CREATOR AGENCIES
```

mais le growth engine V1 doit être construit autour du Chatting.

------------------------------------------------------------------------

## 43.80 --- Marketplace Future

La marketplace modèles reste une possibilité future.

Elle nécessite une analyse spécifique :

-   legal
-   business model
-   trust
-   verification
-   marketplace liquidity

Elle ne fait pas partie du cœur V1 Chatting.

------------------------------------------------------------------------

## 43.81 --- Growth Experiments

Chaque expérimentation doit avoir :

``` text
Hypothesis
Metric
Variant
Duration
Result
Decision
```

------------------------------------------------------------------------

## 43.82 --- Landing A/B Tests

Tester :

-   headline
-   CTA
-   demo placement
-   pricing presentation
-   savings calculator

sans compromettre la cohérence de marque.

------------------------------------------------------------------------

## 43.83 --- Pricing Experiments

Les changements de prix doivent être versionnés.

Ne jamais modifier rétroactivement les conditions d'un client sans
workflow approprié.

------------------------------------------------------------------------

## 43.84 --- Commission Experiments

Le 2,5 % est la base décidée.

Toute expérimentation future doit être explicite et contractuellement
correcte.

------------------------------------------------------------------------

## 43.85 --- Referral Experiment

Avant programme complet :

tester avec un petit groupe d'agences.

------------------------------------------------------------------------

## 43.86 --- Growth Dashboard

Internal dashboard :

``` text
Traffic
Signup
Activation
Paid Conversion
Retention
Expansion
Referral
Revenue
```

------------------------------------------------------------------------

## 43.87 --- Revenue Attribution

Distinguer :

``` text
Subscription Revenue
Commission Revenue
Expansion Revenue
```

------------------------------------------------------------------------

## 43.88 --- CAC

Suivre à terme :

``` text
CAC by channel
```

------------------------------------------------------------------------

## 43.89 --- LTV

Calculer lorsque suffisamment de données réelles existent.

Ne pas présenter un LTV précis sur quelques semaines de données.

------------------------------------------------------------------------

## 43.90 --- Payback Period

KPI important pour acquisition payante.

------------------------------------------------------------------------

## 43.91 --- Referral CAC

Comparer le coût réel d'un client referral à celui des canaux payants.

------------------------------------------------------------------------

## 43.92 --- Growth Guardrail Metrics

Toute optimisation acquisition doit surveiller :

-   churn
-   support load
-   fraud
-   AI cost
-   margin

------------------------------------------------------------------------

## 43.93 --- No Growth at Negative Unit Economics

Ne pas scaler une acquisition qui augmente le nombre d'agences tout en
détruisant la marge.

------------------------------------------------------------------------

## 43.94 --- Brand Consistency

La croissance doit respecter la direction :

``` text
PREMIUM
AI
FLOW
CONTROL
PERFORMANCE
```

------------------------------------------------------------------------

## 43.95 --- Referral UX

Le programme referral doit rester premium.

Éviter une esthétique "coupon site".

------------------------------------------------------------------------

## 43.96 --- Share Links

Les liens de referral doivent être courts, stables et trackables.

------------------------------------------------------------------------

## 43.97 --- Fraud Monitoring

Alerter sur :

-   many accounts same payment identity
-   unusual referral clusters
-   rapid reward farming

selon données légalement utilisables.

------------------------------------------------------------------------

## 43.98 --- MVP Scope

P0/P1 :

``` text
Growth analytics foundations
Acquisition attribution
Activation-to-paid funnel
Expansion metrics
Pricing/upgrade UX
Referral-ready data model
```

Le programme referral public peut attendre si nécessaire.

------------------------------------------------------------------------

## 43.99 --- P2

``` text
Referral program
Savings calculator
Case studies
PQL signals
Advanced upgrade triggers
```

------------------------------------------------------------------------

## 43.100 --- P3

``` text
Affiliate program
Community loops
Advanced partner ecosystem
Cross-sell between future pillars
Marketplace growth
```

------------------------------------------------------------------------

## 43.101 --- Claude Code Deliverables

Créer :

``` text
/docs/growth/GROWTH_MODEL.md
/docs/growth/REFERRAL_SYSTEM.md
/docs/growth/EXPANSION_METRICS.md
```

------------------------------------------------------------------------

## 43.102 --- GROWTH_MODEL.md

Documenter :

-   acquisition
-   activation
-   retention
-   expansion
-   referral loops
-   guardrails

------------------------------------------------------------------------

## 43.103 --- REFERRAL_SYSTEM.md

Documenter :

-   referral states
-   attribution
-   qualification
-   rewards
-   anti-abuse
-   ledger

------------------------------------------------------------------------

## 43.104 --- EXPANSION_METRICS.md

Documenter :

-   creator expansion
-   Full AI adoption
-   upgrades
-   NRR/GRR definitions
-   cohort metrics

------------------------------------------------------------------------

## 43.105 --- Acceptance Criteria

Cette partie est correctement prise en compte lorsque :

-   acquisition peut être reliée à activation
-   activation peut être reliée à paid conversion
-   expansion par créatrice et Full AI est mesurable
-   les referrals peuvent être ajoutés sans refaire la base
-   les récompenses financières sont auditables
-   le produit ne dépend pas de dark patterns
-   les preuves commerciales reposent sur des données réelles
-   les expériences sont mesurées
-   les unit economics restent un guardrail
-   la croissance renforce la valeur du Chatting core

------------------------------------------------------------------------

## 43.106 --- Final Principle

OmniFlow ne doit pas chercher à devenir viral avant de devenir
excellent.

La séquence est :

# BUILD VALUE.

# PROVE VALUE.

# RETAIN VALUE.

# EXPAND VALUE.

# LET VALUE SPREAD.

------------------------------------------------------------------------

## PARTIE 43 --- VALIDÉE COMME GROWTH, REFERRAL & PRODUCT-LED EXPANSION

La suite du cahier des charges commence avec :

# PARTIE 44 --- DATA ANALYTICS, BI & EXECUTIVE REPORTING
