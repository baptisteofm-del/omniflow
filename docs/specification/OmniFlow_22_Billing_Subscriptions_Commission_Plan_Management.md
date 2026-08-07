# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 22 --- BILLING, SUBSCRIPTIONS, COMMISSION & PLAN MANAGEMENT

## 22.1 --- Objectif

OmniFlow doit monétiser le Chatting avec un modèle hybride :

1.  abonnement mensuel
2.  commission variable de 2,5 % sur les ventes éligibles

La commission de 2,5 % doit être clairement communiquée au client avant
souscription et visible dans l'espace Billing.

Principe :

# LOWER FIXED COST.

# ALIGN OMNIFLOW WITH THE AGENCY'S REVENUE.

L'objectif commercial est de montrer qu'une agence peut remplacer ou
réduire une structure de chatting humain coûtant fréquemment autour de
10 % ou davantage, tout en bénéficiant d'une infrastructure IA, de
mémoire, d'analytics et d'automatisation.

## 22.2 --- Pricing V1

Prévoir initialement deux offres payantes.

Les montants exacts doivent être configurables sans refactor.

Exemple de structure :

### PLAN 1 --- COPILOT

Pour les agences souhaitant conserver des chatters humains assistés par
OmniFlow.

Inclut notamment :

-   AI Copilot
-   Fan Intelligence
-   long-term memory
-   scripts
-   media library
-   pricing tools
-   analytics
-   smart recommendations

### PLAN 2 --- FULL AI

Offre premium et offre à mettre commercialement en avant.

Inclut :

-   tout Copilot
-   autonomous AI chatting
-   autonomous decision engine
-   smart follow-ups
-   automated script execution
-   automated media/offers lorsque l'intégration le permet
-   advanced AI capabilities
-   higher automation limits

Les noms commerciaux et prix finaux pourront évoluer.

## 22.3 --- Pricing Configuration

Ne pas hardcoder les prix dans plusieurs composants.

Créer une configuration centrale contenant :

-   plan ID
-   display name
-   monthly price
-   annual price éventuel
-   included features
-   usage limits
-   commission rate
-   active/inactive
-   provider price IDs

## 22.4 --- Commission Rate

V1 :

# 2.5 %

Le taux doit être stocké comme configuration contractuelle de
l'abonnement.

Ne pas recalculer l'historique si le tarif change plus tard.

Chaque période doit conserver le taux applicable.

## 22.5 --- Commission Base

La commission doit être calculée uniquement à partir de revenus
considérés comme éligibles selon le contrat OmniFlow.

La définition exacte doit être claire juridiquement et techniquement.

Exemple possible :

revenus issus de ventes confirmées gérées ou attribuables au périmètre
Chatting OmniFlow.

Ne pas implémenter une définition ambiguë sans validation
commerciale/juridique.

## 22.6 --- Commission Ledger

Créer un :

# COMMISSION LEDGER

Pour chaque vente éligible :

-   agency_id
-   creator_id
-   platform
-   transaction_id
-   gross amount
-   currency
-   commission rate
-   commission amount
-   status
-   billing period
-   created_at

## 22.7 --- Calcul

Exemple :

``` text
Confirmed Eligible Sale = €50
Commission Rate = 2.5%

OmniFlow Fee = €1.25
```

Calcul côté serveur avec précision monétaire adaptée.

Éviter les floats imprécis pour les montants financiers.

## 22.8 --- 100,000 € Example

Exemple commercial :

``` text
Agency Revenue = €100,000

Traditional chatter cost at 10%:
€10,000

OmniFlow variable fee at 2.5%:
€2,500
```

Différence variable brute :

``` text
€7,500
```

avant prise en compte de l'abonnement OmniFlow et des autres coûts
éventuels.

## 22.9 --- Économie proportionnelle

La différence en euros augmente avec le volume de chiffre d'affaires
lorsque les taux restent constants.

Le terme « exponentiel » ne doit pas être utilisé pour ce calcul.

Il s'agit d'une croissance :

# PROPORTIONNELLE / LINÉAIRE.

Exemple :

``` text
€10k revenue → €750 variable difference
€50k revenue → €3,750
€100k revenue → €7,500
€200k revenue → €15,000
```

sur la base de 10 % vs 2,5 %, hors abonnement et autres coûts.

## 22.10 --- Transparence Pricing

Afficher clairement sur la Pricing Page :

**+ 2.5% on eligible sales**

ou formulation contractuellement validée.

Ajouter une explication courte :

**Traditional chatters can cost around 10--20% of sales. OmniFlow aligns
its pricing with your growth at a fraction of that variable cost.**

Les affirmations marketing devront être justifiables et formulées sans
promesse trompeuse.

## 22.11 --- Pricing Calculator

Ajouter éventuellement sur la landing page un calculateur interactif.

Inputs :

-   monthly chatting revenue
-   current chatter commission %

Outputs :

-   estimated current chatter cost
-   OmniFlow variable fee
-   OmniFlow subscription
-   estimated difference

Excellent élément de conversion.

## 22.12 --- Billing Provider

Prévoir Stripe ou un autre provider adapté pour :

-   subscriptions
-   invoices
-   payment methods
-   tax handling selon configuration
-   usage/variable billing si supporté
-   failed payments

L'intégration exacte doit être confirmée selon la structure juridique et
le modèle commercial.

## 22.13 --- Subscription Lifecycle

Statuts internes :

-   TRIALING
-   ACTIVE
-   PAST_DUE
-   CANCELED
-   UNPAID
-   PAUSED

Synchroniser avec le provider de paiement.

## 22.14 --- Checkout

Flow :

``` text
Pricing
↓
Choose Plan
↓
Checkout
↓
Payment
↓
Webhook Confirmation
↓
Subscription Activated
↓
Onboarding
```

Ne pas activer une offre uniquement sur un redirect frontend.

Attendre une confirmation fiable du provider.

## 22.15 --- Webhooks Billing

Traiter notamment :

-   checkout completed
-   subscription created
-   subscription updated
-   subscription canceled
-   invoice paid
-   invoice failed
-   payment method changes

Vérifier la signature.

Rendre le traitement idempotent.

## 22.16 --- Billing Customer

Chaque Agency possède un billing customer.

Ne pas rattacher la facturation principale à un simple user si
l'abonnement concerne le workspace agence.

## 22.17 --- Billing Page

Route :

``` text
/billing
```

Afficher :

-   current plan
-   subscription price
-   commission rate
-   eligible revenue
-   current variable fee estimate
-   billing period
-   invoices
-   payment method
-   usage
-   upgrade
-   cancel

## 22.18 --- Current Period Estimate

Avant clôture :

afficher :

**Estimated variable fee this period**

Puis, une fois la période clôturée :

**Final variable fee**

Distinguer estimation et montant final.

## 22.19 --- Commission Reconciliation

Avant facturation définitive :

réconcilier les transactions plateforme.

Vérifier :

-   duplicates
-   refunds
-   reversals
-   currency
-   transaction status
-   eligibility

Puis figer le ledger de la période.

## 22.20 --- Direct Deduction vs Billing

Ne pas supposer qu'OmniFlow peut techniquement retirer 2,5 % directement
de chaque vente OnlyFans/MYM.

Cela dépend des capacités et accords des plateformes.

V1 doit supporter au minimum :

``` text
Platform Sale
↓
OmniFlow detects confirmed transaction
↓
Commission Ledger
↓
Periodic Billing
```

Si un mécanisme officiel de split/payment direct devient disponible, il
pourra être ajouté plus tard.

## 22.21 --- Billing Frequency

Pour la commission variable, prévoir une facturation :

-   mensuelle par défaut

ou une autre cadence validée commercialement.

Éviter de créer une facture/paiement distinct à chaque micro-transaction
si cela génère des frais et une UX inutiles.

## 22.22 --- Usage-based Billing

Si le provider le permet et que cela correspond au modèle retenu :

reporter la base éligible ou le montant de commission comme usage.

Mais conserver le Commission Ledger OmniFlow comme source interne
d'audit.

## 22.23 --- Solvabilité / Risque de paiement

Le modèle variable n'est pas totalement sans risque si OmniFlow facture
après que l'agence a déjà encaissé les ventes.

Risques :

-   carte refusée
-   carte expirée
-   fonds insuffisants
-   contestation
-   agence qui quitte avant paiement

Prévoir des mécanismes de réduction du risque.

## 22.24 --- Payment Method Required

Une méthode de paiement valide doit être requise pour utiliser le
service payant.

Pour Full AI et les comptes à fort volume :

ne pas permettre une accumulation illimitée de commission sans moyen de
paiement valide.

## 22.25 --- Billing Threshold

Prévoir éventuellement un seuil de facturation variable.

Exemple conceptuel :

si la commission non facturée dépasse un certain montant :

→ facturer avant la fin du mois.

Les seuils doivent être configurables.

Cela réduit l'exposition financière.

## 22.26 --- High-volume Agencies

Pour une agence générant beaucoup de volume :

options futures :

-   lower billing threshold
-   weekly variable billing
-   deposit / balance
-   invoice terms
-   custom enterprise agreement

Pas nécessairement exposé en self-service V1.

## 22.27 --- Failed Payment

Workflow :

1.  payment fails
2.  mark invoice failed
3.  notify agency
4.  retry according to provider policy
5.  grace period
6.  restrict selected paid features
7.  suspend if unresolved

Ne pas supprimer les données immédiatement.

## 22.28 --- Grace Period

Prévoir une période de grâce configurable.

Pendant la période :

-   warning visible
-   billing CTA
-   certaines automatisations peuvent être limitées selon politique

Pour éviter d'accumuler davantage de commission impayée, Full AI peut
être suspendu avant l'accès lecture.

## 22.29 --- Past Due Restrictions

Ordre possible :

1.  warning
2.  prevent new Full AI activation
3.  stop proactive paid actions
4.  switch to read-only / limited mode
5.  suspend workspace

Les règles finales doivent être définies commercialement.

## 22.30 --- Refund Handling

Si une transaction plateforme éligible est remboursée avant clôture :

→ réduire la base.

Si remboursement après facturation :

→ créer un credit adjustment sur période suivante ou mécanisme
équivalent.

Conserver la traçabilité.

## 22.31 --- Multi-currency

OnlyFans/MYM ou les agences peuvent utiliser différentes devises.

Stocker :

-   original amount
-   original currency
-   billing currency
-   conversion rate source
-   converted amount
-   conversion timestamp

Définir une politique stable pour le calcul de commission.

## 22.32 --- Taxes

Ne pas coder des règles fiscales manuellement sans nécessité.

Utiliser les capacités du provider de paiement et les paramètres de
l'entité juridique.

Prévoir :

-   VAT
-   invoice information
-   business details
-   tax IDs

selon marchés servis.

## 22.33 --- Invoice Detail

Une facture doit distinguer clairement :

-   subscription
-   variable OmniFlow fee
-   taxes
-   credits
-   total

Permettre d'accéder au détail du calcul variable.

## 22.34 --- Commission Detail

Depuis une facture :

ouvrir :

# VARIABLE FEE DETAILS

Afficher les transactions ou agrégations ayant servi au calcul.

Filtres :

-   creator
-   platform
-   date

Cela réduit les litiges.

## 22.35 --- Plan Limits

Chaque plan peut définir :

-   number of creators
-   number of seats
-   AI messages
-   Copilot
-   Full AI
-   advanced analytics
-   premium model allowance
-   integrations

Éviter une architecture où les limites sont uniquement frontend.

## 22.36 --- Entitlements

Créer un système :

# ENTITLEMENTS

Exemple :

``` text
feature.full_ai = true
feature.copilot = true
limit.creators = 10
limit.seats = 20
```

Le backend vérifie les entitlements.

## 22.37 --- Upgrade

Upgrade :

-   immédiat
-   nouvelles features disponibles après confirmation provider
-   proration selon configuration billing

Afficher clairement l'impact tarifaire.

## 22.38 --- Downgrade

Downgrade :

souvent à la fin de période.

Avant confirmation :

indiquer ce qui sera perdu.

Exemple :

-   Full AI disabled
-   creator limit reduced
-   premium features removed

Ne pas supprimer automatiquement les données excédentaires.

## 22.39 --- Over-limit

Si une agence downgrade sous son nombre actuel de créatrices :

-   conserver les données
-   empêcher nouveaux ajouts
-   demander de choisir les créatrices actives si nécessaire

Éviter la suppression destructive.

## 22.40 --- Trial

Si un essai est utilisé :

définir :

-   duration
-   payment method required yes/no
-   Full AI availability
-   commission during trial
-   usage limits

Ces paramètres doivent être configurables.

## 22.41 --- Cancellation Flow

Lorsqu'une agence clique :

**Cancel Subscription**

ne pas annuler immédiatement sans comprendre la raison.

Flow :

1.  ask reason
2.  collect structured feedback
3.  show relevant retention option si autorisé
4.  confirm cancellation
5.  explain end date
6.  preserve export/access rules

## 22.42 --- Cancellation Reasons

Exemples :

-   too expensive
-   AI quality
-   missing feature
-   platform integration issue
-   not using enough
-   switching competitor
-   closing agency
-   other

Stocker les raisons pour Product Analytics.

## 22.43 --- Retention Offer

Selon la raison :

possibilité de proposer :

-   temporary discount
-   downgrade
-   pause
-   support call
-   additional onboarding

Ne pas rendre l'annulation volontairement difficile.

## 22.44 --- Cancel at Period End

Par défaut :

``` text
cancel_at_period_end = true
```

si compatible avec le provider et la politique commerciale.

Afficher :

**Access until \[date\].**

## 22.45 --- Reactivation

Avant fin de période :

**Keep OmniFlow**

→ remove scheduled cancellation.

## 22.46 --- Plan Comparison UI

La page pricing doit rendre la décision simple.

Mettre visuellement en avant :

# FULL AI

avec :

-   recommended badge
-   strongest value proposition
-   clear feature difference

Éviter une comparaison de 50 lignes illisibles.

## 22.47 --- Pricing Psychology

L'offre Copilot sert notamment à :

-   rendre l'entrée accessible
-   créer un point de comparaison
-   démontrer la valeur du Full AI

L'offre Full AI doit paraître être le choix logique pour une agence
souhaitant réellement réduire ses coûts humains et automatiser le
chatting.

## 22.48 --- Future Third Plan

L'architecture doit permettre plus tard :

-   Starter
-   Enterprise
-   Custom

sans migration complexe.

Ne pas ajouter un troisième plan uniquement pour remplir la pricing
page.

## 22.49 --- Enterprise

Future :

-   custom commission
-   volume discount
-   dedicated support
-   custom limits
-   SLA
-   invoicing terms
-   multiple workspaces

Les contrats custom doivent pouvoir override la configuration standard.

## 22.50 --- Promotional Codes

Support éventuel :

-   percentage discount
-   fixed discount
-   duration
-   expiration

Utiliser les capacités provider lorsque possible.

## 22.51 --- Referral / Affiliate Future

Prévoir que le billing puisse plus tard supporter :

-   agency referral
-   affiliate
-   creator
-   partner

Mais ne pas complexifier la V1 sans besoin.

## 22.52 --- Billing Audit

Journaliser :

-   plan changed
-   commission rate changed
-   invoice created
-   payment failed
-   credit issued
-   subscription canceled
-   subscription reactivated

Avec actor lorsque l'action vient d'un utilisateur.

## 22.53 --- Internal Revenue Dashboard

OmniFlow Admin doit pouvoir suivre :

-   MRR
-   subscription revenue
-   variable commission revenue
-   total revenue
-   ARPA
-   churn
-   failed payments
-   commission by agency
-   gross contribution estimate

## 22.54 --- MRR

MRR doit inclure principalement le revenu récurrent contractuel des
abonnements.

La commission variable doit être suivie séparément afin de ne pas
masquer la nature du revenu.

Afficher par exemple :

``` text
Subscription MRR
Variable Revenue
Total Monthly Revenue
```

## 22.55 --- Forecast

Future :

estimer :

-   next month subscription revenue
-   variable commission based on recent volume
-   churn risk

Ne pas présenter les prévisions comme garanties.

## 22.56 --- Billing Security

Aucune donnée carte complète ne doit être stockée directement par
OmniFlow.

Utiliser le provider de paiement.

Ne jamais logger :

-   card details
-   payment secrets
-   webhook secrets

## 22.57 --- Webhook Idempotency

Chaque événement billing doit être traité une seule fois logiquement.

Stocker provider event ID.

Si reçu deux fois :

→ ne pas doubler une facture, un crédit ou une activation.

## 22.58 --- Source of Truth

Séparer :

### PLATFORM TRANSACTIONS

Source des ventes agence.

### OMNIFLOW COMMISSION LEDGER

Source du calcul variable.

### BILLING PROVIDER

Source de l'état de paiement/facturation externe.

Réconcilier ces trois niveaux.

## 22.59 --- Billing Jobs

Prévoir des jobs :

-   transaction reconciliation
-   commission aggregation
-   billing period close
-   usage reporting
-   failed payment handling
-   subscription sync

Tous doivent être idempotents.

## 22.60 --- Testing

Tester au minimum :

-   new subscription
-   upgrade
-   downgrade
-   cancellation
-   reactivation
-   failed payment
-   commission calculation
-   duplicate transaction
-   refund
-   multi-currency
-   duplicate webhook
-   plan limit
-   commission rate change
-   agency with no sales
-   high-volume agency

## 22.61 --- Demo / Development Mode

Le développement doit utiliser :

-   billing test mode
-   fake platform transactions
-   mock commission ledger

Aucun paiement réel nécessaire pour tester les flows.

## 22.62 --- Pricing Page Messaging

Le message principal ne doit pas être uniquement :

**AI Chatting Software**

Mais plutôt une proposition économique claire :

**Replace expensive chatting operations with AI built to sell, remember
and improve.**

Puis démontrer :

-   2.5% variable fee
-   subscription
-   comparison with typical human chatter commission
-   ROI calculator

La copy finale sera définie dans la partie Landing Page.

## 22.63 --- Commission Visibility

La commission de 2,5 % doit apparaître :

-   pricing
-   checkout
-   billing
-   contractual terms

Éviter tout dark pattern ou coût surprise.

La transparence peut devenir un argument commercial.

## 22.64 --- Critère de réussite

Billing & Plan Management sont réussis lorsque :

-   OmniFlow peut facturer un abonnement
-   la commission de 2,5 % est calculée de manière fiable
-   chaque vente éligible est auditable
-   les refunds sont correctement traités
-   les commissions impayées sont limitées
-   l'agence voit clairement ce qu'elle paie
-   le ROI peut être comparé au coût d'un chatter
-   Copilot et Full AI sont contrôlés par entitlements
-   upgrade/downgrade fonctionnent proprement
-   l'annulation collecte du feedback sans bloquer artificiellement le
    client
-   le modèle peut évoluer vers Enterprise
-   la marge OmniFlow peut être suivie

# OMNIFLOW SHOULD MAKE MORE WHEN ITS CUSTOMERS MAKE MORE.

# BUT THE CUSTOMER MUST ALWAYS UNDERSTAND WHAT THEY ARE PAYING FOR.

------------------------------------------------------------------------

## PARTIE 22 --- VALIDÉE COMME SPÉCIFICATION DE BILLING, SUBSCRIPTIONS, COMMISSION & PLAN MANAGEMENT

La suite du cahier des charges commence avec :

# PARTIE 23 --- LANDING PAGE, BRAND EXPERIENCE & CONVERSION SYSTEM
