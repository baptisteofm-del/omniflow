# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 20 --- DASHBOARD, ANALYTICS & ROI COMMAND CENTER

## 20.1 --- Objectif

Le Dashboard OmniFlow doit devenir le centre de pilotage de l'agence
pour tout ce qui concerne le Chatting.

Il ne doit pas être un simple écran rempli de graphiques.

Il doit répondre rapidement à quatre questions :

1.  Combien l'agence génère-t-elle ?
2.  OmniFlow améliore-t-il réellement les performances ?
3.  Où se trouvent les opportunités ou problèmes ?
4.  Quelle action faut-il prendre maintenant ?

Principe :

# DON'T JUST SHOW DATA.

# SHOW WHAT MATTERS AND WHAT TO DO NEXT.

## 20.2 --- V1 et évolution future

Dans la V1, le Dashboard est centré sur :

-   Chatting
-   ventes
-   conversations
-   IA
-   fans
-   scripts
-   médias
-   pricing
-   négociations
-   follow-ups
-   ROI OmniFlow

Plus tard, le même Command Center pourra intégrer :

-   Marketing
-   Recruitment
-   VA Management
-   Content
-   autres modules OmniFlow

L'architecture UI doit donc être extensible.

## 20.3 --- Dashboard principal

Route recommandée :

``` text
/dashboard
```

Le Dashboard doit être la première page utile après connexion et
onboarding.

Il doit fournir une vue synthétique immédiatement compréhensible.

## 20.4 --- Filtres globaux

Prévoir des filtres persistants :

-   date range
-   creator
-   platform
-   AI mode
-   script
-   fan segment

Date ranges rapides :

-   Today
-   Yesterday
-   Last 7 Days
-   Last 30 Days
-   This Month
-   Last Month
-   Custom

## 20.5 --- Agency Scope

Par défaut :

**All Creators / All Platforms**

L'utilisateur peut ensuite filtrer.

Toutes les métriques doivent respecter :

-   agency tenant
-   role permissions
-   selected filters

## 20.6 --- KPI Header

Première zone :

### Revenue

### Sales

### Conversion Rate

### Average Order Value

### Active Conversations

### AI-attributed Revenue

Chaque KPI affiche :

-   current value
-   variation vs previous comparable period
-   mini trend si utile

## 20.7 --- Revenue

Afficher :

-   total confirmed revenue
-   period comparison
-   breakdown by creator
-   breakdown by platform

La source de vérité doit rester les transactions confirmées
synchronisées depuis les plateformes.

## 20.8 --- Sales

Nombre de transactions commerciales confirmées.

Permettre drill-down vers :

-   creator
-   fan
-   offer
-   media
-   script
-   AI/human attribution

## 20.9 --- Conversion Rate

Ne pas afficher un taux ambigu.

Définir explicitement la métrique.

Exemple :

``` text
Offer Conversion Rate =
Confirmed Purchases / Eligible Offers Sent
```

D'autres conversions peuvent exister :

-   conversation → sale
-   script entry → sale
-   follow-up → sale

Chaque métrique doit avoir sa définition.

## 20.10 --- Average Order Value

``` text
AOV =
Confirmed Revenue / Confirmed Sales
```

Afficher évolution dans le temps.

## 20.11 --- Active Conversations

Définir une fenêtre d'activité.

Exemple configurable :

conversation ayant eu une interaction dans les dernières X heures.

Ne pas confondre :

-   total conversations
-   active conversations
-   AI-controlled conversations

## 20.12 --- AI Revenue

Créer plusieurs niveaux d'attribution :

### AI AUTONOMOUS REVENUE

Vente réalisée dans une conversation gérée en Full AI.

### AI ASSISTED REVENUE

Vente où OmniFlow a fourni une suggestion ou décision utilisée.

### HUMAN-ONLY REVENUE

Vente sans contribution détectée d'OmniFlow.

Ne pas sur-attribuer les ventes à l'IA.

## 20.13 --- ROI OmniFlow

Créer un bloc majeur :

# OMNIFLOW ROI

Objectif :

montrer à l'agence la valeur économique du produit.

Métriques possibles :

-   revenue handled by OmniFlow
-   AI-attributed revenue
-   estimated chatter cost avoided
-   OmniFlow subscription
-   OmniFlow commission
-   estimated net savings
-   ROI ratio

## 20.14 --- Chatter Cost Baseline

Permettre à l'agence de définir son coût de référence.

Valeur indicative proposée lors de l'onboarding :

**10 %**

mais modifiable.

Exemple :

Historical chatter commission = 10 %.

Cette donnée sert uniquement aux estimations ROI.

## 20.15 --- Estimated Chatter Cost

Exemple :

Revenue handled = 100,000 €

Chatter baseline = 10 %

Estimated chatter cost:

10,000 €.

## 20.16 --- OmniFlow Variable Fee

Exemple :

Eligible revenue = 100,000 €

OmniFlow commission = 2.5 %

→ 2,500 €.

Ajouter abonnement selon plan.

## 20.17 --- Estimated Savings

Exemple conceptuel :

``` text
Estimated Human Chatter Cost
-
OmniFlow Variable Fee
-
OmniFlow Subscription
=
Estimated Savings
```

Afficher clairement qu'il s'agit d'une estimation lorsque le coût humain
réel n'est pas fourni.

## 20.18 --- ROI Message

Le Dashboard peut afficher :

**Estimated savings with OmniFlow this month: €X**

et :

**Your effective variable chatting cost: 2.5% + subscription**

si cela correspond au contrat du client.

Ne pas présenter une estimation comme un montant comptable certifié.

## 20.19 --- Revenue Chart

Graphique principal :

Revenue over time.

Options :

-   total
-   AI autonomous
-   AI assisted
-   human

Granularité :

-   hourly
-   daily
-   weekly

selon période.

## 20.20 --- AI vs Human Performance

Créer un bloc comparatif lorsque le volume de données est suffisant.

Comparer :

-   conversion
-   AOV
-   revenue per conversation
-   response time
-   offers per conversation

Ajouter un avertissement statistique si les cohortes ne sont pas
directement comparables.

## 20.21 --- Performance by Creator

Table :

| Creator \| Revenue \| Sales \| Conversion \| AOV \| AI Revenue \|
  Conversations \|

Actions :

-   open creator dashboard
-   compare
-   filter

## 20.22 --- Creator Detail

Route possible :

``` text
/creators/:id/analytics
```

Afficher :

-   revenue
-   platform split
-   AI performance
-   top scripts
-   top media
-   top fan segments
-   follow-ups
-   negotiation
-   Model DNA status

## 20.23 --- Platform Performance

Comparer :

-   OnlyFans
-   MYM

Métriques :

-   revenue
-   sales
-   conversion
-   AOV
-   conversations
-   AI coverage

Ne pas afficher une comparaison si les données nécessaires ne sont pas
disponibles.

## 20.24 --- AI Coverage

Métrique :

``` text
AI Coverage =
Conversations where OmniFlow participated
/
Eligible conversations
```

Distinguer :

-   Copilot
-   Full AI

## 20.25 --- Full AI Performance

Bloc :

### Full AI

-   conversations managed
-   revenue
-   conversion
-   AOV
-   human takeover rate
-   validator intervention
-   average response time

## 20.26 --- Copilot Performance

Bloc :

### Copilot

-   suggestions generated
-   acceptance rate
-   edit rate
-   ignored rate
-   assisted revenue
-   average edit magnitude

## 20.27 --- Human Takeover

Mesurer :

-   takeover count
-   takeover rate
-   reasons
-   revenue impact
-   creator
-   fan segment

Cela permet d'identifier les situations que l'IA gère encore mal.

## 20.28 --- Fan Intelligence Overview

Afficher distribution :

-   Hot
-   Warm
-   Cold
-   At Risk
-   High Value
-   VIP

Les segments réels dépendent des règles de Fan Intelligence.

Cliquer sur un segment ouvre la liste correspondante.

## 20.29 --- Opportunity Center

Créer un bloc :

# OPPORTUNITIES

Exemples :

-   high-intent fans waiting
-   abandoned negotiations
-   high-value fans inactive
-   scripts with recoverable drop-off
-   follow-ups awaiting approval
-   media opportunities

Chaque insight doit être actionnable.

## 20.30 --- Alert Center

Créer :

# ALERTS

Exemples :

-   platform disconnected
-   Full AI disabled
-   abnormal conversion drop
-   high error rate
-   commission billing issue
-   script underperformance
-   AI cost anomaly
-   media unavailable
-   follow-up backlog

Priorités :

-   INFO
-   WARNING
-   CRITICAL

## 20.31 --- Script Analytics

Table :

| Script \| Runs \| Conversion \| Revenue \| Revenue/Run \| Drop-off \|
  Trend \|

Cliquer ouvre le détail.

## 20.32 --- Script Funnel

Pour un script :

``` text
Entered
↓
Step 1 Reached
↓
Step 1 Purchased
↓
Step 2 Reached
↓
Step 2 Purchased
↓
Completed
```

Afficher :

-   count
-   conversion
-   drop-off

## 20.33 --- Script Diagnostic

OmniFlow peut afficher :

**Largest drop-off: Step 2**

Puis :

-   current price
-   media
-   copy variant
-   segment breakdown
-   suggested test

## 20.34 --- Media Analytics

Afficher :

-   top revenue media
-   top conversion media
-   most offered
-   underperforming
-   performance by price
-   performance by segment

## 20.35 --- Pricing Analytics

Afficher :

-   average offered price
-   average sold price
-   conversion by price range
-   revenue by price range
-   negotiation rate
-   average discount

## 20.36 --- Negotiation Analytics

Afficher :

-   negotiations
-   conversion after negotiation
-   average rounds
-   average discount
-   revenue recovered
-   minimum-price hits
-   top strategy

## 20.37 --- Follow-up Analytics

Afficher :

-   scheduled
-   sent
-   response rate
-   conversion
-   revenue after follow-up
-   estimated incremental revenue
-   best timing
-   best strategy

## 20.38 --- Smart Follow-up Widget

Dashboard :

**Smart Follow-ups**

-   Waiting Approval
-   Scheduled Today
-   High Priority
-   Recovered Revenue

CTA :

**Open Follow-up Queue**

## 20.39 --- Fan Table

Route :

``` text
/fans
```

Colonnes :

-   fan
-   creator
-   platform
-   status
-   Purchase Intent
-   Relationship
-   Spending Potential
-   Churn Risk
-   lifetime spend
-   last interaction
-   current strategy

## 20.40 --- Fan Detail

Afficher :

-   profile
-   scores
-   relationship summary
-   important memory
-   purchase history
-   conversation history
-   offers
-   scripts
-   media purchased
-   follow-ups
-   AI decisions

Respecter les permissions.

## 20.41 --- Revenue Attribution Detail

Pour une transaction :

afficher :

-   platform
-   creator
-   fan
-   amount
-   offer
-   media
-   script
-   mode
-   AI contribution
-   commission
-   timestamp

Permettre audit.

## 20.42 --- Commission Dashboard

Créer une section Billing/Usage.

Afficher :

-   eligible revenue
-   2.5% variable fee
-   subscription
-   current estimated invoice
-   billing period
-   payment status

Les montants doivent provenir du Commission Ledger.

## 20.43 --- Usage Dashboard

Afficher selon plan :

-   creators used / allowed
-   AI messages
-   Full AI usage
-   premium model usage
-   storage
-   integrations

Prévoir progress bars.

## 20.44 --- AI Cost --- Internal Only

Les coûts provider IA ne doivent pas nécessairement être visibles par
les clients.

Créer une vue interne OmniFlow :

-   AI cost by agency
-   AI cost by creator
-   AI cost by task
-   margin
-   anomaly

## 20.45 --- Agency Profitability --- Internal

Pour OmniFlow Admin :

``` text
Agency Revenue to OmniFlow
-
AI Cost
-
Infrastructure Allocation
-
Payment Costs
=
Estimated Gross Contribution
```

Permet d'identifier les comptes non rentables.

## 20.46 --- Insights Engine

Les analytics doivent produire des insights.

Format :

### Observation

Ce qui se passe.

### Evidence

Données.

### Recommendation

Action proposée.

### Confidence

Niveau de confiance.

## 20.47 --- Exemple d'Insight

**Step 1 conversion dropped 18% this week.**

Evidence: - 1,240 offers - conversion 31% → 25%

Potential causes: - media change - price change - audience mix

Recommendation: - compare previous media - launch controlled A/B test

Ne pas présenter une cause comme certaine sans preuve.

## 20.48 --- Insight Priority

Prioriser selon :

-   revenue impact
-   confidence
-   urgency
-   affected volume
-   actionability

Le Dashboard ne doit pas afficher 50 recommandations de même importance.

## 20.49 --- Executive Summary

En haut du Dashboard :

générer un résumé court.

Exemple conceptuel :

**Revenue is up 12% this week. Full AI handled 64% of eligible
conversations. Script A is your strongest performer, while Step 2 of
Script B is losing conversions.**

Le résumé doit être basé sur les métriques calculées, pas sur des
chiffres inventés par le LLM.

## 20.50 --- Natural Language Analytics --- Future-ready

Prévoir architecture future permettant :

**Ask OmniFlow**

Exemples :

-   Why did revenue drop yesterday?
-   Which creator has the best conversion?
-   Which script should I test next?

Le moteur doit interroger des métriques autorisées, pas improviser
depuis le contexte LLM.

## 20.51 --- Export

Prévoir export :

-   CSV
-   éventuellement PDF plus tard

Pour :

-   transactions
-   revenue
-   commissions
-   fan analytics agrégées
-   script analytics

Respecter permissions et confidentialité.

## 20.52 --- Real-time Updates

Pour les métriques opérationnelles :

mettre à jour rapidement après :

-   message
-   sale
-   follow-up
-   script transition

Mais les analytics lourds peuvent être calculés en background.

## 20.53 --- Data Freshness

Afficher éventuellement :

**Last synced X minutes ago**

si une plateforme n'est pas temps réel.

Ne pas donner l'impression que les données sont live si elles ne le sont
pas.

## 20.54 --- Analytics Architecture

Séparer :

### OPERATIONAL DATABASE

État actuel.

### EVENT DATA

Historique des actions.

### ANALYTICS LAYER

Agrégations et métriques.

Ne pas exécuter toutes les statistiques lourdes directement sur les
tables transactionnelles à chaque page load.

## 20.55 --- Metric Definitions Registry

Créer un registre interne des métriques.

Chaque métrique :

-   name
-   definition
-   formula
-   source
-   filters
-   version

Cela évite que deux pages calculent « conversion » différemment.

## 20.56 --- Historical Consistency

Si une formule change :

versionner la métrique ou recalculer explicitement l'historique.

Ne pas mélanger silencieusement plusieurs définitions.

## 20.57 --- Loading States

Dashboard premium :

-   skeleton loaders
-   smooth transitions
-   no layout jump
-   graceful empty states

L'expérience doit rester cohérente avec le design premium + AI + flow
défini pour OmniFlow.

## 20.58 --- Empty States

Pour une nouvelle agence :

ne pas afficher un dashboard vide incompréhensible.

Afficher :

-   connect platform
-   add creator
-   configure AI
-   import media
-   start first conversation

avec progression onboarding.

## 20.59 --- Mobile / Responsive

Le Dashboard doit être responsive.

Priorité :

-   desktop pour pilotage agence
-   tablette
-   mobile pour consultation rapide et actions essentielles

Les tableaux complexes peuvent devenir des cards sur mobile.

## 20.60 --- Permissions

Un Owner peut voir toutes les données.

Un Manager peut avoir un scope limité.

Un Chatter peut voir uniquement les conversations/créatrices autorisées.

Les métriques doivent être calculées selon le scope réel de
l'utilisateur.

## 20.61 --- Data Isolation

Aucune requête analytics ne doit permettre de mélanger deux agences.

Tenant isolation obligatoire au niveau backend/database.

## 20.62 --- Performance

Objectifs UX :

-   KPI essentiels rapides
-   lazy load des analyses secondaires
-   cache des agrégations
-   pagination des tables
-   background computation

Éviter un Dashboard qui déclenche des dizaines de requêtes lourdes à
chaque chargement.

## 20.63 --- Dashboard Navigation

Navigation V1 possible :

``` text
Dashboard
Inbox
Fans
Scripts
Media
Follow-ups
Analytics
Creators
Team
Integrations
Billing
Settings
```

La structure exacte sera finalisée dans la partie UX/Application.

## 20.64 --- ROI comme argument produit

Le ROI Dashboard est stratégique pour la rétention.

L'agence doit pouvoir constater concrètement :

-   combien OmniFlow a géré
-   combien OmniFlow a aidé à générer
-   combien elle paie
-   combien elle économise potentiellement par rapport à son
    organisation précédente

Cela transforme OmniFlow d'un « outil IA » en :

# REVENUE INFRASTRUCTURE.

## 20.65 --- Critère de réussite

Le Dashboard est réussi lorsque :

-   un owner comprend la performance de son agence en moins d'une minute
-   les revenus sont fiables
-   les performances AI vs Human sont mesurables
-   les scripts et médias faibles sont identifiables
-   les opportunités sont actionnables
-   les commissions sont transparentes
-   le ROI OmniFlow est visible
-   les données peuvent être filtrées par créatrice et plateforme
-   les alertes critiques remontent immédiatement
-   l'architecture peut accueillir plus tard Marketing et Recruitment

# OMNIFLOW SHOULD NOT ONLY RUN THE CHATTING.

# IT SHOULD SHOW THE AGENCY WHY IT IS WINNING.

------------------------------------------------------------------------

## PARTIE 20 --- VALIDÉE COMME SPÉCIFICATION DU DASHBOARD, ANALYTICS & ROI COMMAND CENTER

La suite du cahier des charges commence avec :

# PARTIE 21 --- TEAM, ROLES, PERMISSIONS & AGENCY WORKSPACE
