# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 13 --- SCRIPT ENGINE & BRANCHING SYSTEM

## 13.1 --- Objectif

Le Script Engine doit permettre aux agences de construire, importer,
modifier, tester et analyser des scénarios commerciaux structurés.

Un script OmniFlow n'est pas une simple suite de messages.

Il doit fonctionner comme un workflow dynamique capable de réagir aux
actions du fan.

Principe :

# A SCRIPT IS A DECISION TREE, NOT A TEXT DOCUMENT.

Le système doit permettre de gérer :

-   plusieurs étapes
-   médias
-   prix
-   messages
-   relances
-   conditions
-   achats
-   refus
-   objections
-   négociation
-   délais
-   sorties
-   validation humaine
-   branches alternatives

## 13.2 --- Structure générale

Structure conceptuelle :

``` text
SCRIPT
│
├── ENTRY CONDITIONS
│
├── STEP 1
│   ├── MESSAGE
│   ├── MEDIA
│   ├── PRICE
│   └── BRANCHES
│       ├── PURCHASED
│       ├── PRICE OBJECTION
│       ├── HESITATION
│       ├── NO RESPONSE
│       ├── REFUSAL
│       └── CUSTOM REQUEST
│
├── STEP 2
│   └── ...
│
└── EXIT CONDITIONS
```

## 13.3 --- Script Sources

Prévoir deux catégories principales :

### OMNIFLOW SCRIPTS

Scripts créés, testés et versionnés par OmniFlow.

### AGENCY SCRIPTS

Scripts créés ou importés par l'agence.

Le mode de stratégie défini dans Agency Settings détermine lesquels
peuvent être utilisés.

## 13.4 --- Script Object

Chaque script doit contenir au minimum :

-   id
-   agency_id ou OmniFlow ownership
-   name
-   description
-   objective
-   status
-   creator assignments
-   eligibility rules
-   entry node
-   version
-   created_at
-   updated_at

Statuts possibles :

-   DRAFT
-   TESTING
-   ACTIVE
-   PAUSED
-   ARCHIVED

## 13.5 --- Entry Conditions

Un script ne peut être lancé que si ses conditions d'entrée sont
satisfaites.

Exemples :

-   Purchase Intent minimum
-   Relationship minimum
-   Spending Potential
-   fan segment
-   creator
-   content affinity
-   no active script
-   commercial fatigue maximum
-   cooldown respected
-   platform compatible
-   specific trigger
-   agency rule

Les conditions doivent être évaluées côté système.

## 13.6 --- Script Priority

Plusieurs scripts peuvent être éligibles simultanément.

Prévoir :

-   priority
-   performance score
-   strategy preference
-   A/B assignment
-   contextual relevance

Le Sales Strategy Engine sélectionne le script final.

## 13.7 --- Node Types

Prévoir une architecture extensible de nodes.

Types initiaux :

-   START
-   MESSAGE
-   PAID_MEDIA
-   FREE_MEDIA
-   CONDITION
-   WAIT
-   PURCHASE_CHECK
-   OBJECTION
-   NEGOTIATION
-   FOLLOW_UP
-   HUMAN_APPROVAL
-   CUSTOM_REQUEST
-   ACTION
-   END

Tous les nodes ne nécessitent pas un appel LLM.

## 13.8 --- Message Node

Un Message Node peut contenir :

-   text
-   template
-   generation mode
-   objective
-   Model DNA adaptation
-   variables
-   allowed variants

Modes :

### LOCKED

Texte exact.

### ADAPTIVE

Texte fourni mais légèrement adapté.

### DYNAMIC

OmniFlow génère la formulation selon l'objectif.

## 13.9 --- Paid Media Node

Contient :

-   media_id ou media selector
-   target price
-   minimum price
-   caption
-   generation mode
-   negotiation permission
-   fallback media
-   purchase condition

Le média et le prix doivent être validés avant exécution.

## 13.10 --- Media Selector

Au lieu de sélectionner un média fixe, un node peut demander à Media
Intelligence de choisir un contenu.

Exemple :

``` text
Media Selector:
category = X
minimum relevance = 80
price range = 30–50
creator = current
```

Cela permet des scripts plus dynamiques.

## 13.11 --- Price Configuration

Chaque étape payante peut définir :

-   fixed price
-   target price
-   minimum price
-   pricing rule reference
-   dynamic pricing allowed
-   negotiation allowed

La règle la plus restrictive doit être appliquée avec Agency / Creator /
Media Rules.

## 13.12 --- Purchase Branch

Après une offre payante :

``` text
IF PURCHASED
→ next node
```

L'achat doit être confirmé par une donnée fiable de plateforme avant de
poursuivre la branche.

Ne jamais considérer une intention ou un message comme une transaction
confirmée.

## 13.13 --- Not Purchased

L'absence d'achat ne doit pas immédiatement être considérée comme un
refus.

Différencier :

-   pending
-   ignored
-   objection
-   explicit refusal
-   negotiation
-   conversation moved elsewhere

Le système doit attendre ou classifier selon le contexte.

## 13.14 --- Objection Branches

Branches possibles :

-   PRICE_TOO_HIGH
-   NOT_NOW
-   HESITATION
-   CONTENT_MISMATCH
-   TRUST
-   WANTS_DISCOUNT
-   NOT_INTERESTED
-   UNKNOWN

Chaque branche peut pointer vers un workflow spécifique.

## 13.15 --- Price Objection Example

Exemple :

``` text
STEP 1 — €30
│
└── PRICE_TOO_HIGH
    │
    ├── Negotiation allowed?
    │      ├── YES → NEGOTIATION NODE
    │      └── NO → ALTERNATIVE NODE
    │
    └── Possible relationship recovery
```

Le script ne doit pas contourner le minimum price.

## 13.16 --- Hesitation Branch

Une hésitation peut conduire à :

-   reassurance
-   additional context
-   wait
-   relationship
-   alternative content

Le comportement dépend des stratégies autorisées.

## 13.17 --- Explicit Refusal Branch

Un refus clair doit être respecté.

Options possibles :

-   return to relationship
-   stop script
-   cooldown
-   end commercial sequence

Éviter les boucles où le fan est ramené sans cesse vers la même offre.

## 13.18 --- No Response Branch

Après un délai défini :

-   no action
-   Smart Follow-up candidate
-   relationship follow-up
-   script follow-up
-   terminate script

Le nombre de relances doit respecter Agency Settings.

## 13.19 --- Follow-up Node

Contient :

-   delay
-   objective
-   message mode
-   maximum attempts
-   stop conditions
-   allowed time window
-   next node

Le scheduler exécute le délai.

Le LLM ne gère pas directement l'attente.

## 13.20 --- Wait Node

Un Wait Node peut attendre :

-   durée
-   événement
-   réponse
-   achat
-   validation humaine

Exemples :

**Wait 30 min** **Wait until fan responds** **Wait until purchase
event**

Prévoir timeouts.

## 13.21 --- Condition Node

Permet des branches selon :

-   fan score
-   purchase
-   price sensitivity
-   segment
-   relationship
-   media availability
-   time
-   platform
-   creator
-   previous action
-   custom variable

Exemple :

``` text
IF Spending Potential >= 80
→ Premium Offer

ELSE
→ Standard Offer
```

## 13.22 --- Human Approval Node

Bloque le workflow jusqu'à :

-   APPROVED
-   REJECTED
-   MODIFIED
-   TIMEOUT

Utilisable pour :

-   grosse transaction
-   custom request
-   VIP
-   prix exceptionnel
-   situation ambiguë

## 13.23 --- Negotiation Node

Le node appelle le Negotiation Engine.

Il doit contenir ou référencer :

-   target price
-   minimum price
-   max rounds
-   discount rules
-   approval threshold

La sortie détermine :

-   new offer
-   hold price
-   alternative
-   stop negotiation

## 13.24 --- Custom Request Node

Lorsqu'une demande personnalisée est détectée :

-   classify request
-   check creator permissions
-   check service availability
-   calculate valid pricing range
-   require approval if configured
-   negotiate if allowed
-   store request

Le script peut ensuite reprendre ou se terminer.

## 13.25 --- Exit Conditions

Un script doit pouvoir se terminer lorsque :

-   completed
-   fan refuses
-   maximum attempts reached
-   commercial fatigue too high
-   agency rule
-   human stop
-   creator unavailable
-   platform disconnected
-   another strategy takes priority

Statut final du run :

-   COMPLETED
-   CONVERTED
-   STOPPED
-   FAILED
-   EXPIRED
-   HUMAN_TAKEOVER

## 13.26 --- Script Run

Chaque exécution d'un script doit créer un :

# SCRIPT RUN

Stocker :

-   fan
-   creator
-   script
-   script version
-   current node
-   start time
-   status
-   branch history
-   offers
-   purchases
-   revenue
-   AI decisions
-   human interventions

Cela permet de reprendre exactement un workflow.

## 13.27 --- Persistence

Un script doit survivre :

-   refresh
-   reconnexion
-   redémarrage worker
-   changement d'appareil
-   délai long

Ne jamais stocker l'état uniquement dans le frontend.

## 13.28 --- Idempotency

Chaque transition critique doit être idempotente.

Exemple :

un webhook de paiement reçu deux fois ne doit pas faire avancer le
script deux fois.

Utiliser :

-   event IDs
-   idempotency keys
-   transition guards

## 13.29 --- Script Locking

Éviter que deux workers traitent simultanément le même Script Run.

Utiliser un mécanisme de verrouillage ou transaction adapté à la stack.

## 13.30 --- Manual Override

Un utilisateur autorisé peut :

-   pause
-   resume
-   skip node
-   stop
-   choose branch
-   change strategy
-   take over

Chaque action doit être auditée.

## 13.31 --- Copilot Mode

En Copilot :

OmniFlow peut afficher :

**Recommended next step** → Send Step 2

avec :

-   reason
-   preview
-   price
-   media
-   expected branch

Le chatter valide ou choisit une autre action autorisée.

## 13.32 --- Full AI Mode

En Full AI :

le Script Engine peut avancer automatiquement si :

-   permissions valides
-   confidence suffisante
-   action autorisée
-   validators passed

Sinon :

→ approval / human escalation.

## 13.33 --- Script Builder

Créer une interface permettant à l'agence de construire un script.

Pour chaque étape :

-   name
-   objective
-   message
-   media
-   price
-   conditions
-   branches
-   next step

L'interface V1 peut être structurée en formulaires et cartes.

Ne pas bloquer le développement sur un éditeur node-based sophistiqué.

## 13.34 --- Visual Flow --- Evolution

Prévoir l'architecture pour ajouter ensuite un canvas visuel.

Exemple :

``` text
[Start]
   ↓
[Build Interest]
   ↓
[Offer €15]
 ↙         ↘
Paid      Not Paid
 ↓           ↓
[€25]     [Recovery]
```

La donnée doit être stockée comme graphe/workflow indépendant de la
représentation UI.

## 13.35 --- Script Templates

Permettre de dupliquer :

-   OmniFlow template
-   Agency template
-   existing script

Actions :

-   Duplicate
-   Rename
-   Customize
-   Assign Creator

## 13.36 --- Import Script

Prévoir à terme l'import de scripts existants.

L'IA peut aider à transformer un document en structure OmniFlow.

Mais le résultat doit être revu avant activation.

## 13.37 --- Script Preview

Avant activation :

simuler le parcours.

L'agence peut sélectionner :

-   fan profile
-   scores
-   objection
-   purchase / no purchase

et voir la branche suivie.

## 13.38 --- Validation du graphe

Avant activation, vérifier :

-   start node exists
-   no broken references
-   no impossible branches
-   end path exists
-   prices valid
-   media exists
-   permissions valid
-   no infinite loops non contrôlées
-   follow-up limits respected

Bloquer l'activation en cas d'erreur critique.

## 13.39 --- Loop Protection

Les workflows peuvent créer accidentellement des boucles.

Prévoir :

-   max node executions
-   max repeated branch
-   max commercial attempts
-   loop detection

Si limite dépassée :

→ STOP + alert.

## 13.40 --- Script Analytics

Pour chaque script :

-   entries
-   completed runs
-   conversion
-   revenue
-   revenue per run
-   average order value
-   average completion time
-   drop-off
-   branch distribution
-   creator performance
-   segment performance

## 13.41 --- Step Analytics

Pour chaque étape :

-   reached
-   offers sent
-   purchases
-   unlock rate
-   revenue
-   average price
-   objection rate
-   no-response rate
-   negotiation rate
-   exit rate

Cela permet de localiser précisément les problèmes.

## 13.42 --- Branch Analytics

Exemple :

**Price Objection Branch**

Entered: 420\
Recovered: 138\
Converted: 92\
Revenue: ...

Comparer les différentes stratégies de récupération.

## 13.43 --- Script Health Score

Créer éventuellement un score synthétique interne.

Facteurs :

-   conversion
-   revenue
-   drop-off
-   sample size
-   errors
-   branch failures
-   trend

Ce score ne doit pas remplacer les métriques détaillées.

## 13.44 --- AI Recommendations

OmniFlow peut détecter :

**Step 2 underperforming**

Puis proposer :

-   test lower price
-   test different media
-   change copy
-   increase pre-offer engagement
-   change branch
-   run A/B test

Toute recommandation doit être justifiée par des données observables.

## 13.45 --- A/B Test au niveau Script

Tester :

-   Script A vs B
-   Step copy A vs B
-   Media A vs B
-   Price A vs B
-   Branch A vs B

L'architecture doit permettre d'isoler la variable testée autant que
possible.

## 13.46 --- Versioning

Chaque publication crée une version immuable.

Exemple :

Script v1 Script v2 Script v3

Un Script Run commencé en v2 doit continuer avec v2 sauf migration
explicitement conçue.

## 13.47 --- Draft vs Published

Modifier un script actif doit créer un draft.

Workflow :

**Active v3** → Edit → **Draft v4** → Test → Publish → **Active v4**

Ne pas modifier directement la version active utilisée par des
conversations en cours.

## 13.48 --- Permissions

Définir qui peut :

-   create
-   edit
-   publish
-   pause
-   archive
-   view analytics
-   override active run

Les permissions détaillées seront intégrées au système Team & Roles.

## 13.49 --- Critère de réussite

Le Script Engine est réussi lorsque :

-   l'agence peut reproduire ses scénarios commerciaux
-   chaque étape peut avoir un média et un prix
-   les scripts réagissent aux achats et objections
-   les branches sont configurables
-   Full AI peut les exécuter sans perdre l'état
-   Copilot peut guider les chatters
-   les prix minimums sont toujours respectés
-   les boucles sont empêchées
-   chaque étape est mesurable
-   les scripts peuvent être améliorés grâce aux données
-   les versions restent traçables

# BUILD THE FLOW.

# LET OMNIFLOW CHOOSE THE RIGHT PATH.

------------------------------------------------------------------------

## PARTIE 13 --- VALIDÉE COMME SPÉCIFICATION DU SCRIPT ENGINE & BRANCHING SYSTEM

La suite du cahier des charges commence avec :

# PARTIE 14 --- MEDIA LIBRARY & MEDIA INTELLIGENCE
