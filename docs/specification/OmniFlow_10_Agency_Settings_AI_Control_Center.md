# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 10 --- AGENCY SETTINGS & AI CONTROL CENTER

## 10.1 --- Objectif

L'agence doit conserver un contrôle précis sur la manière dont OmniFlow
fonctionne.

Principe produit :

# YOUR AGENCY. YOUR RULES. OMNIFLOW INTELLIGENCE.

OmniFlow apporte :

-   intelligence
-   mémoire
-   analyse
-   décision
-   automatisation

L'agence définit :

-   ses règles
-   ses limites
-   son niveau d'autonomie
-   ses stratégies
-   ses prix
-   ses permissions
-   ses créatrices
-   ses exceptions

L'objectif est d'obtenir une IA puissante sans transformer le produit en
boîte noire incontrôlable.

## 10.2 --- AI Control Center

Créer une section centrale :

# AI CONTROL CENTER

Elle doit permettre de comprendre rapidement :

-   quel mode est actif
-   quelles créatrices utilisent Full AI
-   quelles actions sont automatisées
-   quelles actions nécessitent une validation
-   quelles règles sont actives
-   quels seuils de confiance sont utilisés
-   quels scripts sont actifs
-   quelles limitations sont appliquées
-   si une anomalie nécessite une intervention

L'interface doit être claire malgré la profondeur des réglages.

## 10.3 --- Configuration hiérarchique

Les règles doivent fonctionner selon plusieurs niveaux.

### GLOBAL OMNIFLOW RULES

Règles système non modifiables par l'agence.

### AGENCY RULES

Valeurs par défaut de l'agence.

### CREATOR OVERRIDES

Exceptions propres à une créatrice.

### FAN OVERRIDES

Exceptions particulières pour certains fans lorsque nécessaire.

Hiérarchie :

**System** → **Agency** → **Creator** → **Fan**

Une règle inférieure peut personnaliser une règle supérieure uniquement
lorsque cette règle est explicitement overridable.

## 10.4 --- Inheritance System

Une créatrice doit pouvoir hériter des paramètres de l'agence.

Exemple :

Agency: Negotiation = ON\
Max Discount = 15 %

Creator A: Use Agency Default

Creator B: Override\
Negotiation = OFF

Afficher clairement :

-   inherited
-   overridden
-   locked

Cela évite de reconfigurer chaque créatrice manuellement.

## 10.5 --- Mode global

Pour chaque créatrice, permettre :

### COPILOT

OmniFlow recommande.

### FULL AI

OmniFlow peut exécuter les actions autorisées.

### SIMULATION

OmniFlow décide mais n'agit pas.

### PAUSED

Aucune automatisation active.

Le changement de mode doit être journalisé.

## 10.6 --- Full AI Master Switch

Créer un interrupteur principal par créatrice :

# FULL AI --- ON / OFF

L'activation doit afficher clairement les catégories d'actions
actuellement autorisées.

Ne pas considérer Full AI comme une permission universelle.

Full AI signifie :

> OmniFlow peut exécuter uniquement les actions explicitement
> autorisées.

## 10.7 --- Action Permissions

Permettre de configurer individuellement des actions.

Exemples :

-   SEND_TEXT_MESSAGE
-   SEND_FOLLOW_UP
-   START_SCRIPT
-   CONTINUE_SCRIPT
-   SEND_MEDIA
-   SEND_PAID_MEDIA
-   OFFER_CUSTOM_CONTENT
-   NEGOTIATE
-   APPLY_DISCOUNT
-   END_SCRIPT
-   ESCALATE_HUMAN

Pour chaque action :

-   AUTO
-   REQUIRE_APPROVAL
-   DISABLED

Cette structure doit rester extensible.

## 10.8 --- Confidence Thresholds

L'agence doit pouvoir définir des seuils d'autonomie.

Exemple :

**Auto execute** Confidence ≥ 90 %

**Require approval** 70--89 %

**Do not execute** \< 70 %

Prévoir des valeurs par défaut OmniFlow.

Permettre éventuellement des seuils différents selon le type d'action.

Exemple :

Text Reply: 85 %

Paid Offer: 92 %

Negotiation: 95 %

## 10.9 --- Sales Pace

Permettre de choisir une préférence commerciale générale.

Exemples :

### CONSERVATIVE

Priorité au relationnel.

### BALANCED

Équilibre relation / opportunité commerciale.

### ASSERTIVE

OmniFlow saisit plus rapidement les opportunités commerciales
pertinentes.

Ces modes doivent modifier des paramètres internes mesurables et
versionnés.

Ne pas les implémenter uniquement comme une phrase ajoutée au prompt.

## 10.10 --- Relationship vs Sales Balance

Prévoir éventuellement un contrôle visuel :

**Relationship ←────────→ Sales**

Le slider doit correspondre à une configuration réelle :

-   minimum relationship signals
-   offer cooldown
-   required Purchase Intent
-   follow-up behavior
-   strategy preferences

Ne pas permettre à ce slider de contourner les règles de sécurité ou de
plateforme.

## 10.11 --- Offer Cooldown

Configurer le temps minimum ou les conditions avant de reproposer une
offre.

Exemples :

-   after decline
-   after purchase
-   after ignored offer
-   after negotiation failure

Les règles peuvent être temporelles ou contextuelles.

Exemple :

**No new paid offer within X minutes after decline**, sauf si le fan
demande explicitement autre chose.

## 10.12 --- Commercial Fatigue Controls

Permettre de définir :

-   maximum offers per conversation window
-   maximum follow-ups
-   cooldown
-   stop conditions
-   return-to-relationship conditions

Le Brain doit utiliser ces règles pour éviter une pression excessive.

## 10.13 --- Follow-up Settings

Configurer :

-   Smart Follow-ups ON/OFF
-   automatic / approval required
-   minimum inactivity
-   maximum follow-ups
-   cooldown
-   allowed time windows
-   timezone behavior
-   eligible fan segments
-   excluded fan segments
-   stop after response
-   stop after opt-out / applicable signal

Les détails du moteur seront définis dans sa partie dédiée.

## 10.14 --- Script Settings

L'agence doit pouvoir :

-   activer/désactiver un script
-   choisir OmniFlow Strategy ou Agency Strategy
-   assigner un script à une créatrice
-   définir conditions d'entrée
-   définir conditions de sortie
-   autoriser l'IA à sélectionner le script
-   exiger validation humaine
-   activer A/B Testing
-   définir priorité

Le Brain ne doit jamais lancer un script désactivé.

## 10.15 --- Pricing Rules

Créer une configuration commerciale claire.

Paramètres possibles :

-   default target price
-   minimum price
-   creator-specific pricing
-   media-specific pricing
-   script-specific pricing
-   custom content pricing
-   discount permissions
-   negotiation permissions

La hiérarchie des prix doit être explicite.

Exemple :

**Media-specific rule** peut remplacer **Creator default** qui peut
remplacer **Agency default**.

## 10.16 --- Negotiation Settings

L'agence doit pouvoir configurer :

**Negotiation** ON / OFF

Si ON :

-   maximum discount %
-   absolute minimum price
-   number of negotiation rounds
-   allowed content types
-   excluded content
-   require approval above/below threshold
-   allowed strategies

Exemple :

Displayed Price: 50 €\
Maximum Discount: 20 %\
Minimum Price: 42 €

La règle la plus restrictive gagne.

Dans cet exemple, le prix ne peut pas descendre sous 42 €, même si 20 %
permettrait 40 €.

## 10.17 --- Custom Content / Services

Créer une liste configurable de catégories autorisées.

Pour chaque catégorie :

-   enabled
-   description
-   target price
-   minimum price
-   negotiation
-   human approval
-   availability
-   creator-specific instructions

Si une catégorie n'est pas activée :

OmniFlow ne doit jamais promettre sa disponibilité.

## 10.18 --- Media Rules

L'agence doit pouvoir définir :

-   médias disponibles
-   creator ownership
-   default price
-   minimum price
-   negotiation
-   allowed contexts
-   excluded contexts
-   reusable
-   script-only
-   standalone allowed
-   approval required

Ces paramètres seront liés à Media Library.

## 10.19 --- Conversation Style

Les réglages généraux d'agence peuvent définir des valeurs par défaut :

-   response length
-   emoji level
-   directness
-   warmth
-   flirt level
-   question frequency
-   commercial tone
-   language behavior

Le Model DNA de chaque créatrice peut ensuite personnaliser ces valeurs.

## 10.20 --- Strategy Preferences

Permettre à l'agence de choisir :

### OMNIFLOW RECOMMENDED

Utiliser les stratégies OmniFlow validées.

### AGENCY STRATEGIES

Utiliser principalement les stratégies créées par l'agence.

### HYBRID

Le Brain peut choisir entre les deux selon les performances et règles.

L'agence doit pouvoir désactiver certaines stratégies OmniFlow si elle
ne souhaite pas les utiliser.

## 10.21 --- Objection Handling Preferences

Configurer les comportements autorisés face à :

-   price objection
-   timing objection
-   hesitation
-   content mismatch
-   no response
-   explicit refusal

L'agence peut choisir parmi des stratégies validées ou créer les
siennes.

Le système doit éviter les tactiques coercitives, trompeuses ou
abusives.

## 10.22 --- Post-Purchase Rules

Configurer :

-   immediate thank-you behavior
-   relationship continuation
-   next offer cooldown
-   upsell permission
-   script continuation
-   follow-up timing

L'achat ne doit pas automatiquement déclencher une nouvelle vente.

## 10.23 --- Human Approval Rules

Permettre d'imposer une validation humaine selon :

-   action
-   prix
-   fan segment
-   creator
-   custom request
-   confidence
-   negotiation
-   VIP status
-   unusual situation

Exemple :

**Custom request \> 300 €** → Manager approval required.

## 10.24 --- High-Value Fan Rules

Pour certains segments :

-   disable automatic follow-ups
-   manager approval
-   priority routing
-   special pricing
-   dedicated strategies
-   notification on message
-   notification on purchase

Les règles doivent être configurables.

## 10.25 --- Working Hours

Permettre à l'agence de définir :

-   timezone
-   operating hours
-   Full AI active hours
-   follow-up hours
-   notification hours

Le système doit gérer correctement les fuseaux horaires.

Une agence peut autoriser Full AI 24/7.

## 10.26 --- Language Settings

Configurer :

-   supported languages
-   default language
-   automatic language detection
-   fallback language
-   creator-specific language profiles

OmniFlow doit conserver le style de la créatrice dans chaque langue
configurée.

## 10.27 --- Platform-specific Rules

Certaines règles peuvent différer selon la plateforme.

Exemple :

OnlyFans: Capability A available.

MYM: Capability A unavailable.

Le Control Center doit refléter les capacités réelles de chaque
connexion.

Une option impossible doit apparaître comme indisponible avec une
explication.

## 10.28 --- Notifications

Configurer les alertes :

-   human escalation
-   high-value opportunity
-   failed action
-   integration disconnected
-   payment issue
-   unusual AI behavior
-   custom request
-   large transaction
-   benchmark warning

Canaux initiaux selon infrastructure :

-   in-app
-   email

Architecture extensible vers d'autres canaux.

## 10.29 --- Kill Switches

Prévoir :

### Global OmniFlow Kill Switch

Interne équipe OmniFlow.

### Agency Full AI Kill Switch

Désactive toutes les automatisations de l'agence.

### Creator Kill Switch

Désactive Full AI pour une créatrice.

### Action Kill Switch

Désactive un type d'action.

Ces contrôles doivent agir rapidement.

## 10.30 --- Emergency Fallback

Si Full AI est désactivé à cause d'une anomalie :

le système doit pouvoir basculer vers :

**COPILOT**

plutôt que rendre l'outil inutilisable.

Afficher clairement le changement de mode.

## 10.31 --- Settings Validation

Une configuration incohérente doit être détectée.

Exemple :

Negotiation = ON\
Maximum Discount = 30 %\
Minimum Price = 95 €\
Target Price = 100 €

Le système doit comprendre que la remise réellement disponible n'est que
de 5 %.

Autre exemple :

Full AI = ON\
SEND_PAID_MEDIA = AUTO\
Platform Capability = unavailable

→ action impossible.

## 10.32 --- Conflict Resolver

Lorsqu'une règle entre en conflit avec une autre, appliquer une
hiérarchie déterministe.

Principe :

# MOST RESTRICTIVE VALID RULE WINS

lorsqu'il s'agit de permissions, limites de prix ou contraintes.

Exemple :

Agency minimum = 40 €\
Creator minimum = 45 €\
Media minimum = 50 €

→ minimum final = 50 €.

## 10.33 --- Settings Preview

Avant activation Full AI, afficher un résumé :

**OmniFlow will be allowed to:**

✓ Reply automatically\
✓ Start approved scripts\
✓ Send approved paid media\
✓ Negotiate up to 10 %

**OmniFlow will NOT be allowed to:**

✗ Offer custom content without approval\
✗ Go below media minimum prices\
✗ Contact excluded fan segments

CTA :

**Activate Full AI**

## 10.34 --- Simulation Before Activation

Pour une nouvelle agence ou créatrice, proposer :

# TEST IN SIMULATION

Le Brain fonctionne sur des conversations test/historiques sans envoyer
d'actions.

L'agence peut vérifier :

-   réponses
-   décisions
-   scripts
-   médias
-   prix
-   négociation
-   escalades

avant activation.

## 10.35 --- Recommended Defaults

OmniFlow doit proposer des réglages recommandés.

L'utilisateur ne doit pas devoir comprendre 100 paramètres avant de
commencer.

Prévoir :

### Recommended Setup

Configuration optimisée par OmniFlow.

Puis :

### Advanced Controls

pour les agences souhaitant personnaliser davantage.

## 10.36 --- Presets

Prévoir des presets commerciaux.

Exemples :

-   Relationship First
-   Balanced
-   Revenue Focused

Chaque preset correspond à un ensemble réel de paramètres.

Afficher les changements avant application.

## 10.37 --- Settings Search

Comme le nombre de paramètres deviendra important, prévoir une recherche
dans les settings.

Exemple :

Search: **negotiation**

→ afficher directement les paramètres concernés.

## 10.38 --- Change History

Toute modification importante doit être enregistrée.

Stocker :

-   setting
-   old value
-   new value
-   user
-   timestamp
-   scope
-   reason éventuelle

Permettre de comprendre une variation soudaine de performance.

## 10.39 --- Rollback

Permettre de restaurer une configuration précédente lorsque possible.

Exemple :

Agency Settings v12 → performance dégradée → restore v11

Le rollback doit lui-même créer une nouvelle entrée d'audit.

## 10.40 --- Settings Versioning

Créer un identifiant de version pour les configurations utilisées par le
Brain.

Chaque décision importante peut ainsi enregistrer :

**agency_settings_version** **creator_settings_version**

Cela facilite :

-   debugging
-   Benchmark
-   analytics
-   A/B Testing

## 10.41 --- Permissions

Tous les utilisateurs ne doivent pas pouvoir modifier les règles
critiques.

Exemple :

Owner: full access

Admin: configurable

Manager: limited operational settings

Chatter: read / no critical settings

Les détails seront définis dans Team & Permissions.

## 10.42 --- AI Control Center Dashboard

Afficher notamment :

-   Full AI status
-   creators automated
-   messages handled by AI
-   AI-assisted conversations
-   autonomous sales
-   pending approvals
-   human escalations
-   blocked actions
-   average confidence
-   recent configuration changes
-   integration health

L'objectif est de donner à l'agence le sentiment de contrôler une
infrastructure intelligente.

## 10.43 --- Agency-level vs Creator-level Analytics

Permettre de voir si certaines configurations fonctionnent mieux selon
les créatrices.

Exemple :

Creator A: Balanced strategy Conversion X

Creator B: Revenue Focused Conversion Y

Ne pas conclure automatiquement que la différence provient uniquement
des réglages.

Utiliser A/B Testing lorsque nécessaire.

## 10.44 --- Safe Defaults

Lorsqu'un réglage manque ou est invalide :

OmniFlow doit utiliser un fallback sûr.

Exemple :

minimum price missing → ne pas autoriser une négociation autonome tant
qu'une règle valide n'existe pas.

Principe :

# UNCERTAINTY SHOULD REDUCE AUTONOMY, NOT INCREASE IT.

## 10.45 --- Critère de réussite

Le Control Center est réussi lorsque :

-   une nouvelle agence peut démarrer rapidement
-   une agence avancée peut contrôler précisément OmniFlow
-   les règles restent compréhensibles
-   Full AI n'agit jamais au-delà des permissions
-   les conflits sont résolus de manière déterministe
-   les paramètres sont versionnés
-   les changements sont auditables
-   les créatrices peuvent hériter des règles globales
-   les exceptions sont faciles à gérer
-   l'agence conserve réellement le contrôle du système

# OMNIFLOW DECIDES INSIDE THE BOUNDARIES THE AGENCY DEFINES.

------------------------------------------------------------------------

## PARTIE 10 --- VALIDÉE COMME SPÉCIFICATION DE L'AGENCY SETTINGS & AI CONTROL CENTER

La suite du cahier des charges commence avec :

# PARTIE 11 --- CONVERSATION ENGINE
