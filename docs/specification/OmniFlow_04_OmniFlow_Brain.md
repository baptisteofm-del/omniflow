# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 4 --- OMNIFLOW BRAIN

## 4.1 --- Rôle du Brain

OmniFlow Brain constitue le cœur décisionnel du produit.

Il ne doit pas être conçu comme un simple chatbot ni comme un unique
prompt envoyé à un LLM.

Son rôle est d'orchestrer les informations, règles, modèles IA et
moteurs spécialisés nécessaires pour déterminer la meilleure action
possible dans le contexte d'une conversation.

Principe fondamental :

# MESSAGE → COMPRENDRE → DÉCIDER → AGIR → OBSERVER → APPRENDRE

Le Brain doit pouvoir fonctionner en :

-   Copilot Mode
-   Full AI Mode
-   Simulation Mode

## 4.2 --- Pipeline décisionnel

À chaque nouvel événement conversationnel pertinent, OmniFlow Brain doit
pouvoir exécuter un pipeline structuré.

Pipeline conceptuel :

1.  Receive Event
2.  Load Context
3.  Understand
4.  Update Memory
5.  Update Fan Intelligence
6.  Detect Current State
7.  Generate Candidate Strategies
8.  Apply Rules & Constraints
9.  Select Decision
10. Select Script / Media / Price si nécessaire
11. Generate Response / Action
12. Safety & Rule Validation
13. Execute ou Recommend
14. Observe Outcome
15. Record Learning Event

Toutes les étapes ne nécessitent pas obligatoirement un appel LLM.

Utiliser des règles déterministes lorsque celles-ci sont plus fiables,
rapides et économiques.

## 4.3 --- Context Loader

Avant toute décision, le Brain doit récupérer uniquement le contexte
pertinent.

Le contexte peut notamment inclure :

-   Agency Rules
-   Creator / Model DNA
-   Platform capabilities
-   Fan profile
-   Fan Memory
-   Fan Scores
-   conversation récente
-   résumé historique
-   achats précédents
-   médias précédemment envoyés
-   scripts actifs
-   étape actuelle du script
-   stratégies précédemment utilisées
-   objections précédentes
-   prix précédemment proposés
-   statut des follow-ups
-   permissions Full AI
-   expérimentations A/B actives

Ne pas envoyer systématiquement tout l'historique au modèle.

Le Context Loader doit sélectionner les informations utiles à la
décision actuelle.

## 4.4 --- Understanding Layer

Le Brain doit d'abord comprendre la situation avant de générer une
réponse.

Produire une représentation structurée pouvant inclure :

-   intent
-   sentiment
-   engagement level
-   conversation phase
-   commercial signals
-   objections
-   content request
-   custom request
-   price sensitivity signals
-   relationship signals
-   urgency
-   ambiguity
-   need for human escalation
-   relevant memory references

Les sorties structurées doivent utiliser des schémas validables.

Éviter autant que possible de faire dépendre la logique métier de texte
libre généré par un LLM.

## 4.5 --- Conversation State

Chaque conversation doit avoir un état courant exploitable par le
Decision Engine.

Exemples d'états :

-   NEW
-   RELATIONSHIP_BUILDING
-   ENGAGED
-   WARM
-   SALES_OPPORTUNITY
-   SCRIPT_ACTIVE
-   OBJECTION
-   NEGOTIATION
-   POST_PURCHASE
-   FOLLOW_UP_PENDING
-   DORMANT
-   HUMAN_REQUIRED

Ces états doivent rester extensibles.

Le Brain peut changer d'état lorsqu'un événement ou une analyse le
justifie.

## 4.6 --- Fan Intelligence Input

Le Brain doit exploiter au minimum :

-   Purchase Intent
-   Relationship Score
-   Spending Potential
-   Engagement Score
-   Churn Risk
-   OmniScore

Les scores ne doivent jamais être utilisés seuls.

Une décision commerciale doit combiner :

**scores + contexte + historique + règles + conversation actuelle.**

## 4.7 --- Candidate Actions

Avant de décider, le Brain doit pouvoir considérer plusieurs actions
candidates.

Exemples :

-   CONTINUE_RELATIONSHIP
-   ASK_QUESTION
-   BUILD_DESIRE
-   START_SCRIPT
-   CONTINUE_SCRIPT
-   RETRY_SCRIPT_STEP
-   HANDLE_OBJECTION
-   OFFER_MEDIA
-   SEARCH_MEDIA
-   OFFER_CUSTOM_CONTENT
-   NEGOTIATE
-   HOLD_PRICE
-   FOLLOW_UP
-   WAIT
-   STOP_SELLING
-   POST_PURCHASE_RELATIONSHIP
-   ESCALATE_HUMAN

Ne pas limiter l'architecture à cette liste de manière rigide.

## 4.8 --- Decision Engine

Le Decision Engine doit répondre principalement à :

# « Que doit faire OmniFlow maintenant ? »

Il doit être distinct du Conversation Engine.

Exemple :

Le Decision Engine décide :

**CONTINUE_RELATIONSHIP**

Le Conversation Engine décide ensuite :

**comment l'exprimer dans le style exact de la créatrice.**

Cette séparation est obligatoire.

Une excellente formulation ne doit jamais compenser une mauvaise
décision stratégique.

## 4.9 --- Strategy Engine

Le Brain doit pouvoir sélectionner une stratégie parmi :

-   stratégies OmniFlow
-   stratégies créées par l'agence
-   variantes A/B
-   stratégies spécifiques à une créatrice
-   stratégies spécifiques à certains segments de fans

Une stratégie définit une logique comportementale, pas uniquement une
liste de messages.

Elle peut contenir :

-   objectif
-   conditions d'entrée
-   conditions de sortie
-   actions autorisées
-   rythme commercial
-   conditions de vente
-   comportement en cas de refus
-   comportement en cas d'achat
-   règles de relance
-   règles de négociation
-   règles d'escalade

## 4.10 --- Scripts et Brain

Le Brain doit pouvoir décider :

-   s'il faut démarrer un script
-   quel script utiliser
-   quand passer à l'étape suivante
-   quand rester sur l'étape actuelle
-   quand utiliser une branche alternative
-   quand interrompre le script
-   quand revenir au relationnel
-   quand proposer autre chose

Le script ne doit jamais fonctionner comme une séquence aveugle.

Le Brain reste responsable de la stratégie.

## 4.11 --- Branches après proposition commerciale

Lorsqu'une proposition commerciale est effectuée, le Brain doit pouvoir
distinguer différents résultats.

Exemples :

### PURCHASED

→ progression normale\
→ prochaine étape éventuelle\
→ post-purchase behavior

### NOT_PURCHASED --- PRICE OBJECTION

→ appliquer les règles de négociation

### NOT_PURCHASED --- NOT READY

→ poursuivre la conversation selon la stratégie

### NOT_PURCHASED --- NO RESPONSE

→ Smart Follow-up éventuel

### NOT_PURCHASED --- DIFFERENT REQUEST

→ rechercher un autre média ou une autre offre

### NOT_PURCHASED --- LOSS OF INTEREST

→ réduire la pression commerciale / revenir au relationnel

### CUSTOM REQUEST

→ vérifier les services autorisés et les règles tarifaires

Les stratégies de relance doivent rester configurables par l'agence et
respecter les règles de plateforme, de consentement et de sécurité
applicables.

## 4.12 --- Media Intelligence

Lorsqu'un média est pertinent, le Brain doit pouvoir interroger la Media
Library.

La sélection peut utiliser :

-   demande explicite
-   préférences du fan
-   achats précédents
-   médias déjà envoyés
-   tags
-   catégorie
-   créatrice
-   prix
-   prix minimum
-   performances historiques
-   disponibilité
-   restrictions

Le Brain doit pouvoir recommander ou sélectionner un média même hors
script lorsque les règles l'autorisent.

## 4.13 --- Pricing Decision

Le Brain peut recommander un prix mais ne peut jamais contourner les
contraintes de l'agence.

Entrées possibles :

-   target price
-   minimum price
-   fan spending history
-   Spending Potential
-   contenu
-   script
-   étape
-   négociation autorisée
-   discount maximum
-   promotions autorisées
-   règles spécifiques créatrice

Le Pricing Engine doit valider le prix final avant toute action.

## 4.14 --- Negotiation

Si la négociation est activée :

Le Brain peut négocier uniquement à l'intérieur des limites configurées.

Exemple :

Target Price: 50 €\
Minimum Price: 40 €\
Negotiation: ON\
Maximum Discount: 20 %

OmniFlow ne doit jamais descendre sous 40 €.

Si aucune proposition acceptable n'est possible :

-   maintenir le prix
-   proposer une alternative autorisée
-   revenir au relationnel
-   escalader vers un humain selon les règles

## 4.15 --- Custom Requests

Le Brain doit reconnaître les demandes qui sortent de la bibliothèque
standard.

Pour chaque catégorie de service personnalisable, l'agence doit pouvoir
définir :

-   allowed / forbidden
-   target price
-   minimum price
-   negotiation allowed
-   human approval required
-   instructions spécifiques

OmniFlow ne doit jamais inventer qu'une créatrice accepte un service non
configuré comme autorisé.

## 4.16 --- Full AI Permission Check

Avant chaque action autonome, exécuter un Permission Check.

Exemple :

Decision = SEND_PAID_MEDIA

Vérifier :

-   Full AI activé ?
-   plateforme compatible ?
-   agence autorise cette action ?
-   créatrice autorise cette action ?
-   média autorisé ?
-   prix valide ?
-   script/règle valide ?
-   aucune validation humaine requise ?
-   aucune restriction active ?

Si une seule contrainte bloque l'action :

**DO NOT EXECUTE.**

Transformer l'action en recommandation ou en escalade humaine lorsque
pertinent.

## 4.17 --- Confidence

Les décisions importantes doivent produire un niveau de confiance
exploitable.

Exemple :

Decision: START_SCRIPT\
Confidence: 0.91

L'agence doit pouvoir définir des seuils d'autonomie.

Exemple :

-   ≥ 0.90 → action automatique autorisée
-   0.70--0.89 → Copilot recommendation
-   \< 0.70 → attendre ou escalader

Les seuils exacts doivent être configurables et testés via le Benchmark.

## 4.18 --- Human Escalation

Le Brain doit savoir reconnaître ses limites.

Déclencheurs possibles :

-   faible confiance
-   demande inhabituelle
-   conflit de règles
-   demande non supportée
-   problème plateforme
-   montant nécessitant validation
-   négociation hors limites
-   situation sensible
-   erreur technique
-   agence ayant configuré une validation obligatoire

Créer un état :

**HUMAN_REQUIRED**

avec :

-   raison
-   priorité
-   contexte
-   recommandation éventuelle

## 4.19 --- Conversation Engine

Une fois la décision prise, le Conversation Engine génère le message.

Il doit utiliser :

-   Model DNA
-   Agency Rules
-   Fan Memory pertinente
-   conversation récente
-   stratégie
-   décision
-   script éventuel
-   ton attendu
-   langue
-   contraintes lexicales
-   style d'écriture

Le message doit paraître cohérent avec la créatrice et avec la
conversation.

## 4.20 --- Variantes de réponse

En Copilot Mode, OmniFlow peut proposer plusieurs variantes lorsque cela
améliore l'expérience.

Exemple :

-   Recommended
-   Softer
-   More Direct

Le nombre de variantes doit rester limité pour ne pas ralentir le
chatter.

La variante recommandée doit être clairement identifiée.

## 4.21 --- Action Validator

Avant exécution, toute action sensible doit passer par un validateur
déterministe.

Le validateur doit vérifier les règles de priorité :

1.  Platform / Safety / Compliance
2.  Agency
3.  Creator
4.  Strategy
5.  Fan context
6.  Conversation
7.  Script
8.  Media / Pricing
9.  AI Decision

Un LLM ne doit jamais avoir le dernier mot sur une contrainte
déterministe.

## 4.22 --- Action Execution

Après validation :

### Copilot

→ afficher recommandation\
→ attendre humain

### Full AI

→ exécuter si autorisé

### Simulation

→ enregistrer l'action prévue sans l'exécuter

Chaque action doit obtenir un identifiant unique et un statut.

Exemples :

-   PROPOSED
-   APPROVED
-   EXECUTING
-   EXECUTED
-   BLOCKED
-   FAILED
-   CANCELLED

## 4.23 --- Observation

Après une action, OmniFlow doit observer les événements disponibles.

Exemples :

-   fan répond
-   fan achète
-   fan refuse
-   fan ignore
-   fan négocie
-   fan revient plus tard
-   fan devient inactif
-   nouvelle transaction

Ces événements alimentent :

-   Fan Memory
-   Fan Scores
-   Script State
-   Analytics
-   Learning Engine

## 4.24 --- Learning Event

Chaque cycle important doit produire un événement structuré exploitable
ultérieurement.

Exemple conceptuel :

Context\
→ Decision\
→ Action\
→ Outcome

Stocker notamment :

-   contexte utile
-   Brain version
-   models utilisés
-   strategy version
-   script version
-   décision
-   confidence
-   action
-   résultat
-   revenu éventuel
-   délai de réponse
-   intervention humaine éventuelle

Ces données alimenteront le Learning Engine et le Benchmark.

## 4.25 --- Pas d'apprentissage incontrôlé

OmniFlow ne doit pas modifier automatiquement ses règles centrales après
chaque conversation.

Le Learning Engine doit être contrôlé.

Les observations peuvent :

-   générer des insights
-   proposer des améliorations
-   alimenter des expérimentations
-   alimenter le Benchmark
-   améliorer des modèles ultérieurement

Toute modification importante de stratégie doit être :

**mesurée → testée → validée → versionnée → déployée.**

## 4.26 --- Explicabilité opérationnelle

L'interface peut afficher une explication courte et utile.

Exemple :

**Recommended: Continue relationship**

Reasons: - Purchase Intent still moderate - fan recently declined an
offer - engagement remains high

Ne jamais afficher une chaîne de pensée interne détaillée du LLM.

Utiliser uniquement des raisons structurées et prévues pour l'audit.

## 4.27 --- Brain Versioning

Chaque version majeure du Brain doit posséder un identifiant.

Exemples :

-   brain-v1.0
-   brain-v1.1
-   brain-v1.2

Les décisions doivent pouvoir être comparées entre versions dans le
Benchmark.

Ne pas écraser silencieusement une version utilisée en production.

## 4.28 --- Shadow Mode

Prévoir un Shadow Mode permettant à une nouvelle version du Brain de
fonctionner en parallèle de la version active sans contrôler les
conversations.

Exemple :

Production Brain → décision réellement utilisée

Candidate Brain → décision enregistrée uniquement

Comparer ensuite :

-   décisions
-   scores
-   recommandations
-   résultats simulés
-   benchmark

Cela permettra de tester des améliorations avec moins de risque.

## 4.29 --- Kill Switch

Prévoir un mécanisme permettant de désactiver rapidement :

-   Full AI globalement
-   Full AI pour une agence
-   Full AI pour une créatrice
-   un type d'action
-   un provider IA
-   une stratégie problématique

Le passage vers Copilot doit pouvoir être utilisé comme fallback.

## 4.30 --- Latence

Le Brain doit être conçu pour répondre suffisamment rapidement pour une
expérience de Chatting.

Mesurer séparément :

-   context loading
-   scoring
-   decision
-   generation
-   validation
-   platform execution
-   total latency

Le Model Router devra utiliser les modèles les plus rapides lorsque la
complexité de la tâche ne justifie pas un modèle supérieur.

## 4.31 --- Coût IA

Chaque cycle doit permettre d'estimer :

-   provider
-   model
-   input tokens
-   output tokens
-   coût estimé
-   latence
-   task type

Créer des analytics internes permettant de suivre :

**AI Cost per Agency**

**AI Cost per Creator**

**AI Cost per Conversation**

**AI Cost per € Revenue**

La performance commerciale doit rester compatible avec les marges
OmniFlow.

## 4.32 --- Fallbacks

Prévoir des fallbacks lorsque :

-   modèle principal indisponible
-   timeout
-   rate limit
-   réponse invalide
-   structured output invalide
-   provider indisponible

Une erreur LLM ne doit pas provoquer automatiquement une mauvaise action
commerciale.

En cas de doute :

**fail safe → recommendation / human / retry**, selon le contexte.

## 4.33 --- Brain Debugger interne

Prévoir pour l'équipe OmniFlow un outil de debugging permettant
d'inspecter un cycle sans exposer les données entre agences.

Afficher notamment :

-   event
-   context sélectionné
-   scores
-   règles appliquées
-   candidate actions
-   décision finale
-   confidence
-   modèles utilisés
-   latence
-   coûts
-   action validator
-   résultat

Cet outil sera essentiel pour améliorer le Brain.

## 4.34 --- Critère fondamental de réussite

Le Brain n'est pas jugé uniquement sur la qualité littéraire de ses
réponses.

Il doit être évalué sur sa capacité à :

-   comprendre correctement
-   prendre de bonnes décisions
-   respecter les règles
-   utiliser correctement la mémoire
-   sélectionner la bonne stratégie
-   reconnaître quand ne pas vendre
-   détecter les opportunités pertinentes
-   sélectionner les bons contenus
-   appliquer les bons prix
-   préserver la relation
-   améliorer les KPI commerciaux
-   savoir demander une intervention humaine

# OMNIFLOW BRAIN = DECISION INTELLIGENCE, NOT JUST MESSAGE GENERATION.

------------------------------------------------------------------------

## PARTIE 4 --- VALIDÉE COMME SPÉCIFICATION DU CŒUR DÉCISIONNEL

La suite du cahier des charges commence avec :

# PARTIE 5 --- AI MODEL ROUTER
