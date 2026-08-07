# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 11 --- CONVERSATION ENGINE

## 11.1 --- Objectif

Le Conversation Engine est responsable de transformer une décision
stratégique d'OmniFlow Brain en message naturel, cohérent et adapté à la
créatrice.

Principe :

# DECISION ENGINE = WHAT TO DO

# CONVERSATION ENGINE = HOW TO SAY IT

Le Conversation Engine ne doit pas décider seul :

-   quand vendre
-   quel script lancer
-   quel prix appliquer
-   si une négociation est autorisée
-   si un média peut être envoyé
-   si une relance est autorisée

Ces décisions proviennent des moteurs spécialisés et des règles
OmniFlow.

## 11.2 --- Entrées principales

Le Conversation Engine peut recevoir :

-   Decision
-   Model DNA Runtime Profile
-   Agency Rules pertinentes
-   Fan Memory pertinente
-   Fan Intelligence
-   conversation récente
-   current conversation state
-   strategy
-   script step
-   media context
-   pricing context
-   objection context
-   language
-   platform constraints
-   output constraints

Le contexte doit être préparé avant l'appel au modèle.

## 11.3 --- Sortie

La sortie doit être structurée.

Exemple conceptuel :

``` json
{
  "message": "...",
  "language": "fr",
  "tone": "playful",
  "confidence": 0.94,
  "memory_used": ["memory_id"],
  "requires_validation": false
}
```

Le texte final ne doit pas être exécuté directement avant validation
lorsque l'action concernée nécessite des contrôles.

## 11.4 --- Naturalness

Les messages doivent éviter les caractéristiques typiques d'un assistant
générique :

-   réponses inutilement longues
-   structure trop parfaite
-   répétition systématique du message du fan
-   phrases explicatives
-   ton de service client
-   ponctuation trop formelle
-   questions artificielles à chaque réponse
-   utilisation mécanique d'emojis
-   vocabulaire incompatible avec la créatrice

Le Benchmark doit inclure une dimension de naturel conversationnel.

## 11.5 --- Model DNA Fidelity

Chaque génération doit respecter le Model DNA actif.

Vérifier notamment :

-   longueur
-   énergie
-   vocabulaire
-   expressions
-   emojis
-   surnoms
-   ponctuation
-   niveau de directness
-   chaleur relationnelle
-   langue
-   style commercial

La fidélité au DNA doit pouvoir être évaluée automatiquement et via
Benchmark.

## 11.6 --- Adaptation au fan

Le style de la créatrice reste stable, mais la réponse doit s'adapter au
fan.

Facteurs :

-   ancienneté
-   Relationship Score
-   engagement
-   mémoire
-   langue
-   ton du fan
-   contexte actuel
-   historique commercial

Principe :

# SAME CREATOR, DIFFERENT RELATIONSHIP.

## 11.7 --- Conversation Continuity

Le moteur doit produire une réponse cohérente avec les derniers
échanges.

Il doit comprendre :

-   à quoi répond le fan
-   quel sujet est actif
-   si une question est en attente
-   si une offre vient d'être faite
-   si le fan a changé de sujet
-   si une promesse conversationnelle existe
-   si un script est actif

Éviter les réponses qui donnent l'impression d'un reset de contexte.

## 11.8 --- Response Length

La longueur doit être adaptative.

Facteurs :

-   Model DNA
-   longueur du message reçu
-   contexte
-   conversation phase
-   décision
-   stratégie
-   plateforme

Un simple :

« tu fais quoi ? »

ne doit généralement pas produire un paragraphe.

## 11.9 --- Multi-message Output

Certaines créatrices peuvent naturellement envoyer plusieurs petits
messages plutôt qu'un seul.

Prévoir une sortie possible :

``` json
{
  "messages": [
    "...",
    "..."
  ]
}
```

Le Model DNA doit définir :

-   fréquence
-   nombre maximum
-   contextes

Ne pas découper artificiellement toutes les réponses.

## 11.10 --- Timing Metadata

Le Conversation Engine peut proposer des métadonnées de timing :

-   immediate
-   short_delay
-   natural_delay

Mais l'exécution réelle du timing appartient à l'Action Engine /
Automation Layer.

Ne pas demander au LLM de dormir ou d'attendre.

## 11.11 --- Language Detection

Détecter la langue du fan lorsque nécessaire.

Le système doit pouvoir :

-   répondre dans la langue appropriée
-   respecter les langues autorisées de la créatrice
-   utiliser un fallback
-   conserver le style propre à chaque langue

Éviter les traductions littérales qui détruisent le Model DNA.

## 11.12 --- Code-switching

Lorsque le Model DNA l'autorise, le moteur peut utiliser un mélange
naturel de langues.

Exemple :

français + expressions anglaises.

Cela doit être configuré et cohérent avec la créatrice.

## 11.13 --- Relationship Messages

Lorsque la décision est :

**CONTINUE_RELATIONSHIP**

le moteur doit privilégier :

-   continuité
-   intérêt naturel
-   callbacks mémoire pertinents
-   personnalité
-   conversation authentique

Il ne doit pas ajouter artificiellement une vente.

## 11.14 --- Build Desire

Lorsque la décision est :

**BUILD_DESIRE**

le moteur doit suivre la stratégie fournie par le Brain.

Il ne doit pas déclencher lui-même une offre payante si la décision ne
l'autorise pas.

## 11.15 --- Commercial Message

Lorsqu'une vente est autorisée, le moteur reçoit les éléments validés :

-   offer type
-   script step
-   media
-   price
-   strategy
-   tone

Il est responsable de formuler la proposition de manière cohérente avec
le Model DNA.

Le prix et le média ne doivent pas être modifiés librement par le
modèle.

## 11.16 --- Script Copy

Chaque étape de script peut contenir :

-   agency-provided copy
-   OmniFlow copy
-   editable template
-   variables
-   alternative variants

Le Conversation Engine peut adapter la formulation uniquement selon les
permissions du script.

Modes possibles :

### LOCKED COPY

Texte exact.

### LIGHT ADAPTATION

Adaptation légère au fan / DNA.

### DYNAMIC

Génération libre dans les limites de l'étape.

## 11.17 --- Variables

Prévoir des variables contrôlées.

Exemples :

-   fan first name
-   nickname
-   creator name
-   price
-   content description
-   relevant memory
-   previous purchase
-   script context

Les variables doivent être résolues côté système lorsque possible.

Ne pas laisser le modèle inventer une valeur financière.

## 11.18 --- Objection Handling

Le Brain fournit :

-   objection type
-   selected strategy
-   commercial constraints

Le Conversation Engine formule la réponse.

Exemples d'objections :

-   price
-   timing
-   hesitation
-   content mismatch
-   trust
-   no interest

Les réponses doivent rester respectueuses et non coercitives.

## 11.19 --- Negotiation Messages

Si Negotiation Engine autorise une proposition :

le Conversation Engine reçoit :

-   current price
-   proposed price
-   minimum allowed
-   negotiation round
-   strategy

Il formule la réponse.

Il ne peut pas changer le prix fourni.

## 11.20 --- Refusal Handling

Si le fan refuse clairement :

le moteur doit respecter la décision du Brain.

Selon stratégie :

-   continuer relationnellement
-   changer de sujet
-   attendre
-   proposer une alternative uniquement si autorisée

Éviter de répéter mécaniquement la même offre.

## 11.21 --- No-response Handling

Le Conversation Engine ne décide pas seul de relancer.

Smart Follow-up Engine décide :

**FOLLOW_UP**

puis fournit :

-   reason
-   objective
-   context
-   allowed tone

Le Conversation Engine rédige le message.

## 11.22 --- Post-purchase

Après achat, le message doit prendre en compte :

-   Model DNA
-   type d'achat
-   relation
-   script
-   post-purchase rules

Éviter une réponse purement transactionnelle.

Le système doit pouvoir poursuivre naturellement la relation.

## 11.23 --- Memory Callbacks

Les souvenirs récupérés peuvent être utilisés lorsqu'ils sont
pertinents.

Règles :

-   maximum raisonnable par réponse
-   pertinence contextuelle
-   Anti-Creepy Guard
-   ne pas exposer la source technique
-   ne pas rappeler inutilement des détails sensibles

## 11.24 --- Fact Consistency

Avant génération, injecter les Creator Facts pertinents.

Après génération, un validator peut vérifier certaines contradictions
critiques.

Exemple :

Creator Fact : lives in Paris.

Le moteur ne doit pas inventer : « ici à Londres ».

Les faits variables ou de persona doivent être gérés avec leurs règles
temporelles.

## 11.25 --- Hallucination Control

Le moteur ne doit pas inventer :

-   disponibilité d'un service
-   prix
-   contenu existant
-   transaction
-   souvenir
-   fait important sur la créatrice
-   action déjà effectuée

Lorsque l'information manque :

-   répondre sans inventer
-   demander si pertinent
-   escalader si nécessaire

## 11.26 --- Media Description

Lorsqu'un média est proposé, la description doit provenir :

-   des métadonnées validées
-   du script
-   d'une description autorisée

Le modèle ne doit pas promettre un contenu différent de ce que contient
réellement le média.

## 11.27 --- Response Validator

Avant envoi, valider :

-   décision respectée
-   prix correct
-   média correct
-   script correct
-   permissions
-   langue
-   Model DNA
-   forbidden expressions
-   creator boundaries
-   agency rules
-   platform rules
-   hallucination checks lorsque possible

Certaines validations doivent être déterministes.

## 11.28 --- Regeneration

Si une réponse échoue au validator :

1.  identifier la raison
2.  régénérer avec contrainte corrective
3.  revalider
4.  fallback si nouvel échec

Limiter le nombre de régénérations.

Après plusieurs échecs :

→ Copilot / Human Required.

## 11.29 --- Copilot Suggestions

En Copilot Mode, afficher une réponse principale.

Optionnellement :

-   Softer
-   More Direct

ou :

-   Regenerate

Éviter de proposer trop de choix.

L'objectif est d'accélérer le chatter.

## 11.30 --- Human Edit Tracking

Lorsque le chatter modifie une suggestion :

enregistrer :

-   original suggestion
-   final sent version
-   edit distance
-   type d'édition lorsque détectable
-   user
-   outcome

Ces données alimentent l'analyse qualité.

Elles ne doivent pas entraîner automatiquement le modèle.

## 11.31 --- Quick Actions

L'interface peut proposer :

-   Make shorter
-   More playful
-   More direct
-   More affectionate
-   Regenerate

Ces actions modifient uniquement la formulation, pas la stratégie.

Si l'utilisateur veut changer l'action commerciale, cela doit passer par
le Brain / workflow approprié.

## 11.32 --- Manual Message

Le chatter doit toujours pouvoir écrire son propre message en Copilot.

OmniFlow peut éventuellement :

-   analyser avant envoi
-   signaler un conflit de règle
-   suggérer une amélioration

selon les paramètres agence.

Ne pas bloquer inutilement le travail humain sauf contrainte critique.

## 11.33 --- Draft Mode

Prévoir la possibilité de générer un brouillon sans l'envoyer.

Particulièrement utile pour :

-   custom requests
-   VIP fans
-   situations complexes
-   tests

## 11.34 --- Streaming

Si la stack et le provider le permettent, utiliser le streaming pour
améliorer la perception de vitesse en Copilot.

Mais ne pas afficher une réponse partielle comme action finale avant
validation.

## 11.35 --- Latency Targets

Instrumenter :

-   context preparation
-   model latency
-   validation
-   total suggestion latency

L'objectif est de rendre Copilot suffisamment rapide pour être
réellement utilisé par les chatters.

Les objectifs chiffrés seront définis après tests réels.

## 11.36 --- Response Cache

Ne pas mettre en cache des réponses conversationnelles dynamiques.

Un message doit tenir compte du contexte actuel.

Le cache peut être utilisé pour des éléments statiques du Model DNA ou
des règles, mais pas pour recycler aveuglément des réponses.

## 11.37 --- Duplicate Prevention

Avant envoi automatique, vérifier qu'un message identique ou quasiment
identique n'a pas déjà été envoyé récemment par erreur.

Cela protège contre :

-   retries
-   double events
-   double clicks
-   duplicated webhooks

## 11.38 --- Repetition Detection

Détecter si OmniFlow répète trop souvent :

-   même expression
-   même structure
-   même surnom
-   même question
-   même CTA
-   même formulation commerciale

Le Model DNA doit rester cohérent sans devenir répétitif.

## 11.39 --- Conversation Quality Metrics

Mesurer :

-   AI suggestion acceptance
-   edit rate
-   regeneration rate
-   validator failure rate
-   human takeover rate
-   response latency
-   response rate
-   downstream conversion
-   DNA fidelity
-   repetition rate

Ces métriques alimentent le Learning Engine.

## 11.40 --- Feedback Controls

Permettre aux utilisateurs autorisés de signaler une suggestion :

-   Good
-   Bad
-   Wrong tone
-   Wrong strategy
-   Incorrect fact
-   Too long
-   Too short
-   Other

Le feedback doit être enregistré avec le contexte et les versions
utilisées.

## 11.41 --- Benchmark

Créer des scénarios de Benchmark pour :

-   nouveau fan
-   ancien fan
-   relationnel
-   opportunité commerciale
-   objection
-   négociation
-   post-purchase
-   mémoire
-   retour après absence
-   script actif
-   changement de sujet
-   message ambigu

Évaluer séparément :

-   décision
-   formulation

Une bonne phrase basée sur une mauvaise décision doit rester considérée
comme une erreur stratégique.

## 11.42 --- Conversation Engine Versioning

Versionner :

-   generation prompts
-   formatting rules
-   validators
-   Model Router policy
-   style adapters

Chaque message généré doit pouvoir être relié à la configuration
utilisée.

## 11.43 --- Shadow Testing

Une nouvelle version du Conversation Engine peut générer une réponse en
parallèle sans l'envoyer.

Comparer :

**Production Response** vs **Candidate Response**

sur :

-   naturalness
-   DNA fidelity
-   rule compliance
-   human preference
-   Benchmark score

## 11.44 --- Principle of Minimum Necessary Generation

Le LLM ne doit générer que ce dont OmniFlow a besoin.

Si le système connaît déjà :

-   action
-   média
-   prix
-   stratégie

le modèle doit uniquement formuler le message.

Ne pas lui redemander de redécider inutilement ces éléments.

Cela réduit :

-   erreurs
-   coût
-   latence
-   incohérences

## 11.45 --- Critère de réussite

Le Conversation Engine est réussi lorsque :

-   les messages paraissent naturels
-   chaque créatrice possède une voix distincte
-   la mémoire est utilisée subtilement
-   le contexte est respecté
-   les messages sont courts lorsque nécessaire
-   les ventes restent cohérentes avec la stratégie
-   aucun prix ou média n'est inventé
-   les réponses peuvent être validées avant exécution
-   les chatters gagnent réellement du temps
-   Full AI peut maintenir une conversation cohérente dans la durée

# THE BRAIN CHOOSES THE MOVE.

# THE CONVERSATION ENGINE MAKES IT FEEL HUMAN.

------------------------------------------------------------------------

## PARTIE 11 --- VALIDÉE COMME SPÉCIFICATION DU CONVERSATION ENGINE

La suite du cahier des charges commence avec :

# PARTIE 12 --- SALES STRATEGY ENGINE
