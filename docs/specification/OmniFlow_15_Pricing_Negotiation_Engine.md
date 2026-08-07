# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 15 --- PRICING & NEGOTIATION ENGINE

## 15.1 --- Objectif

Le Pricing & Negotiation Engine doit permettre à OmniFlow de déterminer,
valider et négocier les prix dans les limites définies par l'agence.

Il doit fonctionner avec :

-   Sales Strategy Engine
-   Script Engine
-   Media Intelligence
-   Fan Intelligence
-   Agency Settings
-   Creator Settings
-   Conversation Engine
-   Full AI / Copilot

Principe :

# THE AI CAN NEGOTIATE.

# IT CAN NEVER INVENT ITS OWN LIMITS.

## 15.2 --- Responsabilités

Le moteur doit notamment :

-   résoudre le prix applicable
-   déterminer le prix cible
-   déterminer le prix minimum
-   vérifier si une négociation est autorisée
-   calculer la marge de négociation
-   choisir une stratégie de prix
-   proposer une contre-offre valide
-   gérer plusieurs rounds
-   empêcher tout prix interdit
-   journaliser les décisions
-   mesurer la performance

## 15.3 --- Sources de règles de prix

Un prix peut être influencé par plusieurs niveaux :

### AGENCY DEFAULT

Règle générale.

### CREATOR DEFAULT

Règle propre à la créatrice.

### MEDIA RULE

Règle du média.

### BUNDLE RULE

Règle du bundle.

### SCRIPT STEP RULE

Règle de l'étape du script.

### CUSTOM SERVICE RULE

Règle d'un service personnalisé.

### MANUAL OVERRIDE

Override explicite autorisé.

Toutes les règles doivent être résolues avant l'action.

## 15.4 --- Hiérarchie et contraintes

Le système doit distinguer :

-   valeur par défaut
-   override
-   minimum absolu
-   maximum éventuel
-   permission de négociation

Pour les limites de sécurité commerciale :

# THE MOST RESTRICTIVE VALID LIMIT WINS.

Exemple :

Agency minimum = 30 €\
Creator minimum = 35 €\
Media minimum = 40 €\
Script minimum = 38 €

→ minimum applicable = 40 €.

## 15.5 --- Target Price

Le Target Price représente le prix que l'agence souhaite idéalement
obtenir.

Exemple :

Target Price = 50 €.

Ce n'est pas nécessairement le minimum autorisé.

## 15.6 --- Minimum Price

Le Minimum Price est une contrainte dure.

Exemple :

Target = 50 €\
Minimum = 40 €

OmniFlow peut éventuellement négocier entre 50 € et 40 €.

Il ne peut jamais proposer 39 €.

Le contrôle doit être déterministe et effectué côté serveur.

## 15.7 --- Fixed Price

Certaines offres peuvent être non négociables.

Configuration :

**Fixed Price = 50 €** **Negotiation = OFF**

Le modèle ne doit jamais proposer une remise.

## 15.8 --- Maximum Discount

L'agence peut définir une remise maximale.

Exemple :

Target = 50 €\
Maximum Discount = 20 %

→ limite théorique = 40 €.

Si Minimum Price = 45 € :

→ limite réelle = 45 €.

Calcul :

``` text
discount_floor = target_price × (1 - max_discount)
effective_minimum = max(configured_minimum, discount_floor)
```

## 15.9 --- Negotiation Permission

La négociation doit être autorisée à tous les niveaux nécessaires.

Exemple :

Agency = ON\
Creator = ON\
Media = OFF

→ Negotiation OFF.

Une règle restrictive doit bloquer la négociation.

## 15.10 --- Negotiation Trigger

Le moteur ne doit pas négocier automatiquement parce que c'est
techniquement possible.

Le Sales Strategy Engine décide si la négociation est pertinente.

Signaux :

-   objection prix
-   demande de réduction
-   Price Sensitivity
-   Spending Potential
-   historique
-   marge disponible
-   nombre de rounds
-   commercial fatigue

## 15.11 --- Negotiation State

Chaque négociation doit avoir un état persistant.

Stocker :

-   initial price
-   current price
-   minimum
-   fan offers
-   OmniFlow offers
-   rounds
-   start time
-   status
-   strategy
-   final result

Statuts :

-   ACTIVE
-   ACCEPTED
-   DECLINED
-   EXPIRED
-   STOPPED
-   HUMAN_TAKEOVER

## 15.12 --- Negotiation Rounds

Configurer :

-   maximum rounds
-   minimum decrement
-   maximum decrement
-   whether same price can be held
-   whether alternative offer is allowed

Exemple :

Max rounds = 3.

Après 3 rounds sans accord :

→ stop / alternative / relationship selon stratégie.

## 15.13 --- Progressive Concessions

Si une baisse est autorisée, éviter de donner immédiatement la remise
maximale.

Exemple :

Target 50 € Minimum 40 €

Round 1 → 48 € Round 2 → 45 € Round 3 → 42 €

Ce n'est qu'un exemple.

La logique réelle doit être configurable et testée.

## 15.14 --- Hold Price

Le moteur doit pouvoir choisir :

**HOLD_PRICE**

au lieu de toujours baisser.

Exemple :

Fan demande : « 30 ? »

Target = 50 € Minimum = 40 €

OmniFlow peut conserver 50 € ou faire une contre-offre selon stratégie.

## 15.15 --- Fan Offer Parsing

Le système doit détecter les propositions de prix dans les messages.

Exemple :

« je te le prends pour 35 »

→ Fan Offer = 35 €.

Le parsing doit gérer :

-   symboles
-   formats
-   langue
-   devise

Si ambigu :

→ ne pas exécuter automatiquement.

## 15.16 --- Currency

Chaque offre doit avoir une devise explicite.

Ne pas supposer que tous les montants sont en euros.

Stocker les montants dans un format sûr adapté aux paiements, idéalement
en unité monétaire minimale lorsque pertinent.

## 15.17 --- Currency Conversion

Si plusieurs devises sont supportées à terme :

séparer :

-   display currency
-   transaction currency
-   reporting currency

Ne pas appliquer une conversion inventée par le LLM.

## 15.18 --- Fan Price Sensitivity

Fan Intelligence fournit :

-   LOW
-   MEDIUM
-   HIGH
-   UNKNOWN

Ce signal peut influencer la stratégie.

Mais il ne modifie jamais directement le minimum autorisé.

## 15.19 --- Spending Potential

Spending Potential peut influencer :

-   offer tier
-   target price selection
-   bundle selection
-   strategy

Mais ne doit pas conduire à des prix arbitraires ou incohérents.

Les règles de pricing doivent rester transparentes pour l'agence.

## 15.20 --- Historical Accepted Price

Utiliser éventuellement :

-   average accepted price
-   max accepted price
-   recent accepted price
-   category-specific accepted price

comme signaux.

Exemple :

un fan ayant régulièrement accepté des offres premium peut être éligible
à un script premium.

## 15.21 --- Price Personalization Boundaries

La personnalisation de prix doit rester encadrée.

Ne pas utiliser d'attributs personnels sensibles.

Utiliser uniquement des signaux commerciaux pertinents et autorisés.

L'agence doit pouvoir comprendre les règles utilisées.

## 15.22 --- Script Pricing

Une étape de script peut définir :

-   fixed price
-   target
-   minimum
-   dynamic allowed
-   negotiation allowed

Exemple :

Step 1 = 15 € Step 2 = 25 € Step 3 = 50 €

Le Script Engine transmet ces contraintes au Pricing Engine.

## 15.23 --- Standalone Media Pricing

Pour un média hors script :

Media Intelligence fournit :

-   media
-   default price
-   target price
-   minimum price
-   negotiation permission

Pricing Engine résout le prix final autorisé.

## 15.24 --- Bundle Pricing

Un bundle peut avoir un prix indépendant de la somme de ses médias.

Stocker :

-   bundle target
-   bundle minimum
-   discount logic
-   negotiation permission

Ne pas recalculer automatiquement le bundle depuis les médias sauf si
configuré.

## 15.25 --- Custom Content Pricing

Pour une demande personnalisée :

le système vérifie :

-   service enabled
-   creator-specific pricing
-   target
-   minimum
-   complexity modifiers éventuels
-   approval threshold
-   negotiation permission

Si le prix ne peut pas être déterminé avec confiance :

→ Human Approval.

## 15.26 --- Live / Custom Service Pricing

Même principe pour les services autorisés.

L'agence définit :

-   base price
-   minimum
-   unit éventuelle
-   duration tiers éventuels
-   negotiation
-   approval

Exemple conceptuel :

15 minutes\
30 minutes\
60 minutes

Les valeurs réelles appartiennent à l'agence.

## 15.27 --- Human Approval Threshold

Exemples :

-   discount \> 15 %
-   custom request \> 300 €
-   unusual price
-   VIP fan
-   low confidence
-   missing pricing rule

→ Human Approval.

## 15.28 --- Pricing Validator

Avant toute offre :

vérifier côté serveur :

-   amount valid
-   currency valid
-   target source
-   minimum
-   maximum discount
-   negotiation permission
-   script rule
-   media rule
-   creator rule
-   agency rule
-   platform constraint

Le LLM ne peut pas contourner ce validator.

## 15.29 --- Conversation Engine Contract

Le Conversation Engine reçoit un prix déjà validé.

Exemple :

``` json
{
  "action": "NEGOTIATION_COUNTER_OFFER",
  "price": 45,
  "currency": "EUR",
  "price_locked": true
}
```

Il formule le message.

Il ne recalcule pas le montant.

## 15.30 --- Offer ID

Chaque offre commerciale doit recevoir un identifiant.

Stocker :

-   fan
-   creator
-   media / service
-   script
-   price
-   currency
-   timestamp
-   strategy
-   negotiation state
-   status

Cela permet d'associer correctement une transaction à une offre.

## 15.31 --- Offer Status

Statuts possibles :

-   CREATED
-   SENT
-   VIEWED si disponible
-   PURCHASED
-   DECLINED
-   EXPIRED
-   CANCELLED
-   SUPERSEDED

## 15.32 --- Transaction Matching

Une transaction doit être associée à l'offre correspondante lorsque
possible.

Ne pas se baser uniquement sur la proximité temporelle si un identifiant
fiable existe.

Cela est essentiel pour :

-   commission OmniFlow
-   analytics
-   script conversion
-   media performance

## 15.33 --- OmniFlow Commission

Le modèle commercial prévu pour OmniFlow inclut :

-   abonnement SaaS
-   commission de 2,5 % sur les ventes concernées par le service, selon
    les conditions commerciales finales

Le système doit donc pouvoir identifier précisément les transactions
auxquelles la commission s'applique.

Les modalités juridiques, contractuelles, fiscales et techniques exactes
doivent être validées avant mise en production.

## 15.34 --- Commission Ledger

Prévoir un ledger interne.

Pour chaque transaction éligible :

-   transaction_id
-   agency_id
-   creator_id
-   gross amount
-   currency
-   commission rate
-   commission amount
-   status
-   billing reference
-   timestamp

Ne pas calculer la facturation uniquement depuis le frontend.

## 15.35 --- Commission Calculation

Exemple :

Sale = 100 € Commission = 2.5 %

→ OmniFlow fee = 2.50 €.

Pour 100 000 € de ventes éligibles :

→ 2 500 €.

Utiliser une arithmétique monétaire précise.

## 15.36 --- Commission Transparency

Le pricing commercial d'OmniFlow doit afficher clairement la commission
applicable avant souscription et dans les documents contractuels
appropriés.

La proposition de valeur peut expliquer que 2,5 % reste
significativement inférieur au coût variable d'un chatter rémunéré, par
exemple, 10 % ou davantage des ventes selon l'organisation de l'agence.

Ne pas concevoir une interface destinée à dissimuler un coût
obligatoire.

## 15.37 --- Billing Protection

Si la commission ne peut pas être prélevée directement sur la
transaction de la plateforme, prévoir un système de facturation séparé.

Possibilités selon architecture et accords :

-   metered billing
-   invoice
-   payment method on file
-   periodic settlement

Le choix final dépendra des intégrations disponibles.

## 15.38 --- Failed Billing

Prévoir :

-   payment retry
-   grace period
-   agency notification
-   billing status
-   restricted access si nécessaire
-   audit

Ne pas interrompre brutalement une conversation active au milieu d'une
action critique sans stratégie de fallback.

## 15.39 --- Revenue Attribution

Distinguer :

-   AI autonomous sale
-   AI-assisted sale
-   human-only sale
-   script sale
-   standalone media sale
-   negotiated sale

Cela permet de démontrer le ROI OmniFlow.

## 15.40 --- Pricing Analytics

Mesurer :

-   average offer price
-   average sold price
-   discount rate
-   negotiation rate
-   negotiation conversion
-   revenue after negotiation
-   conversion by price
-   conversion by price bucket
-   revenue by price bucket
-   minimum-price hits

## 15.41 --- Negotiation Analytics

Pour chaque stratégie :

-   negotiations started
-   rounds
-   average first offer
-   average final price
-   acceptance
-   revenue
-   discount
-   fan segment
-   media
-   creator

## 15.42 --- Price Elasticity Experiments

Avec suffisamment de données, OmniFlow peut tester plusieurs prix dans
des plages autorisées.

Exemple :

Price A vs Price B.

Mesurer :

-   conversion
-   revenue per offer
-   total revenue
-   downstream behavior

Ne pas optimiser uniquement le taux de conversion.

## 15.43 --- Revenue per Offer

Exemple :

Price A: 20 € Conversion 40 % Expected revenue / offer = 8 €.

Price B: 30 € Conversion 32 % Expected revenue / offer = 9.60 €.

Le prix avec la meilleure conversion n'est pas nécessairement celui qui
maximise le revenu.

## 15.44 --- A/B Testing Guardrails

Les tests doivent respecter :

-   minimum price
-   allowed price range
-   agency permission
-   sample size
-   stable assignment
-   auditability

Les prix testés doivent être explicables.

## 15.45 --- Pricing Recommendations

OmniFlow peut signaler :

**Step 1 may be underpriced.**

ou :

**Conversion drops sharply above this price range.**

ou :

**Negotiation improves revenue for this segment.**

Les recommandations doivent afficher :

-   sample size
-   period
-   observed impact
-   confidence

## 15.46 --- Pricing Versioning

Versionner les règles.

Exemple :

pricing-policy-v1\
pricing-policy-v2

Chaque offre doit conserver :

-   policy version
-   resolved constraints
-   final amount

## 15.47 --- Audit

Journaliser :

-   price creation
-   price change
-   minimum change
-   negotiation permission
-   discount
-   manual override
-   AI counter-offer
-   final transaction

Les changements critiques doivent indiquer l'utilisateur ou le système
responsable.

## 15.48 --- Safe Failure

Si les règles sont incohérentes ou absentes :

OmniFlow ne doit pas improviser.

Exemple :

Target Price exists\
Minimum Price missing\
Negotiation ON

→ négociation autonome désactivée jusqu'à résolution ou utilisation
d'une règle sûre explicitement définie.

Principe :

# NO VALID PRICE RULE = NO AUTONOMOUS PRICE DECISION.

## 15.49 --- Critère de réussite

Pricing & Negotiation Engine est réussi lorsque :

-   l'agence définit clairement ses limites
-   OmniFlow peut vendre au prix cible
-   OmniFlow peut négocier si autorisé
-   aucun minimum n'est violé
-   les contre-offres restent cohérentes
-   les négociations sont mesurables
-   les transactions sont correctement attribuées
-   la commission OmniFlow peut être calculée précisément
-   les prix peuvent être optimisés avec les données
-   le Conversation Engine ne peut jamais inventer un prix

# PRICING IS A SYSTEM RULE.

# LANGUAGE IS AN AI TASK.

# NEVER MIX THE TWO.

------------------------------------------------------------------------

## PARTIE 15 --- VALIDÉE COMME SPÉCIFICATION DU PRICING & NEGOTIATION ENGINE

La suite du cahier des charges commence avec :

# PARTIE 16 --- SMART FOLLOW-UPS & PROACTIVE AI
