# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 7 --- IMPORTATION & ANALYSE DES CONVERSATIONS

## 7.1 --- Objectif

OmniFlow doit permettre à une agence d'importer des conversations
historiques afin d'accélérer la configuration d'une créatrice et
d'enrichir les systèmes suivants :

-   Model DNA
-   Creator Facts
-   Fan Memory lorsque l'identité du fan peut être reliée de manière
    fiable
-   analyse du style
-   analyse conversationnelle
-   Benchmark, uniquement après sélection/validation
-   analytics historiques lorsque les données sont suffisamment fiables

L'importation ne doit jamais être traitée comme un entraînement
automatique de l'IA.

Principe fondamental :

# IMPORTER ≠ COPIER ≠ ENTRAÎNER AUTOMATIQUEMENT

OmniFlow doit analyser les données historiques, extraire les
informations utiles, évaluer leur fiabilité et laisser les règles
actuelles de l'agence rester prioritaires.

## 7.2 --- Cas d'usage principal

Une agence connecte une créatrice à OmniFlow.

Elle possède déjà plusieurs semaines ou mois de conversations.

Au lieu de configurer entièrement le Model DNA manuellement, l'agence
peut fournir un échantillon de conversations.

OmniFlow analyse alors notamment :

-   manière d'écrire
-   longueur des messages
-   expressions
-   emojis
-   ponctuation
-   surnoms
-   énergie
-   habitudes conversationnelles
-   informations récurrentes sur la créatrice
-   signaux relationnels
-   types de situations rencontrées

Puis OmniFlow propose une configuration.

L'agence conserve la validation finale.

## 7.3 --- Sources d'importation

Prévoir une architecture capable de supporter plusieurs sources.

Exemples :

-   import automatique via plateforme si officiellement disponible
-   fichier exporté
-   JSON
-   CSV
-   format structuré interne
-   copier/coller contrôlé
-   migration depuis une autre source autorisée

Les formats réellement activés en V1 dépendront des capacités techniques
disponibles.

L'architecture d'import ne doit pas dépendre d'un seul format.

## 7.4 --- Import Wizard

Créer un workflow d'importation guidé.

Étapes conceptuelles :

1.  Select Creator
2.  Select Source
3.  Upload / Connect
4.  Parse
5.  Validate Structure
6.  Preview
7.  Analyze
8.  Review Findings
9.  Accept / Modify / Reject
10. Apply to Model DNA / Facts

Afficher clairement ce qui sera importé avant application.

## 7.5 --- Validation des données

Avant analyse, vérifier autant que possible :

-   format valide
-   participants identifiables
-   ordre chronologique
-   timestamps
-   messages vides
-   doublons
-   corruption
-   encodage
-   pièces jointes
-   identifiants
-   volume

Les données invalides ne doivent pas contaminer silencieusement le Model
DNA.

## 7.6 --- Normalisation

Convertir les différentes sources vers un format conversationnel interne
commun.

Exemple conceptuel :

``` json
{
  "conversation_id": "...",
  "platform": "...",
  "participants": [],
  "messages": [
    {
      "sender_type": "creator",
      "timestamp": "...",
      "text": "...",
      "media_refs": [],
      "transaction_refs": []
    }
  ]
}
```

Le reste d'OmniFlow doit travailler avec ce format normalisé plutôt
qu'avec les formats propriétaires de chaque source.

## 7.7 --- Déduplication

Le même historique peut être importé plusieurs fois.

Prévoir une logique permettant d'éviter :

-   doubles conversations
-   doubles messages
-   doubles transactions
-   double extraction de faits

Utiliser lorsque possible :

-   platform IDs
-   message IDs
-   timestamps
-   hashes
-   fingerprints

## 7.8 --- Séparation des signaux

Toute analyse historique doit séparer au minimum :

### STYLE SIGNALS

Comment la créatrice semble parler.

### FACT SIGNALS

Informations potentiellement vraies concernant sa persona.

### FAN SIGNALS

Informations spécifiques à un fan identifiable.

### STRATEGY SIGNALS

Décisions commerciales prises historiquement.

### PERFORMANCE SIGNALS

Résultats observables associés aux actions historiques.

Cette séparation est obligatoire.

## 7.9 --- Style Signals

Extraire notamment :

-   message length
-   punctuation
-   emoji usage
-   favorite emojis
-   vocabulary
-   slang
-   nicknames
-   capitalization
-   question frequency
-   energy
-   affection
-   teasing
-   directness
-   humor
-   recurring expressions

Ces signaux peuvent alimenter les recommandations Model DNA.

## 7.10 --- Fact Signals

Détecter les informations répétées concernant la créatrice.

Exemples :

-   hobbies
-   préférences
-   éléments de persona
-   habitudes déclarées
-   centres d'intérêt

Chaque fait extrait doit posséder :

-   source
-   confidence
-   occurrences
-   contradictions éventuelles
-   validation status

Une information extraite ne doit pas devenir automatiquement un fait
vérifié.

## 7.11 --- Fan Signals

Lorsque les conversations peuvent être reliées de manière fiable à un
fan précis, extraire potentiellement :

-   prénom
-   centres d'intérêt
-   préférences
-   historique relationnel
-   informations personnelles volontairement partagées
-   achats
-   objections
-   sensibilité au prix
-   habitudes
-   sujets importants

Ces données peuvent initialiser Fan Memory après validation et selon les
règles de conservation applicables.

## 7.12 --- Strategy Signals

Les décisions commerciales historiques peuvent être analysées mais ne
doivent pas être copiées automatiquement.

Exemples :

-   moment de proposition
-   script utilisé
-   prix
-   relance
-   objection handling
-   rythme de vente
-   négociation

Elles peuvent servir à comprendre :

**ce qui a été fait**

mais pas automatiquement :

**ce qu'OmniFlow doit faire.**

## 7.13 --- Performance Signals

Lorsque les données le permettent, relier les actions historiques à des
résultats observables.

Exemples :

-   achat
-   absence d'achat
-   montant
-   réponse
-   délai de réponse
-   répétition d'achat
-   abandon
-   engagement ultérieur

Cela permet de distinguer une pratique historique fréquente d'une
pratique réellement performante.

## 7.14 --- Mauvais chatters

Le système doit explicitement considérer que les conversations importées
peuvent provenir de chatters peu performants.

Ne jamais utiliser :

**fréquence historique = qualité.**

Exemple :

Une agence a historiquement utilisé une relance agressive dans 80 % des
conversations.

Cela ne signifie pas que cette stratégie doit devenir la stratégie
OmniFlow.

Le système peut constater le pattern, mais ne doit pas le transformer
automatiquement en règle.

## 7.15 --- Priorité des paramètres actuels

Ordre de priorité pour la configuration actuelle :

1.  règles plateforme / sécurité / conformité
2.  Agency Rules explicites
3.  paramètres Creator / Model DNA explicitement validés
4.  stratégies OmniFlow validées
5.  informations historiques validées
6.  inférences issues des imports

Exemple :

Historique : vente lente.

Agency Setting : sales pace = assertive.

→ suivre le réglage actuel de l'agence.

## 7.16 --- Contradictions

OmniFlow doit détecter les contradictions dans les conversations
historiques.

Exemple :

Conversation A : une information donnée au fan.

Conversation B : information différente.

Le système doit :

-   marquer la contradiction
-   réduire la confiance
-   demander validation si l'information est importante
-   éviter de transformer automatiquement l'une des versions en vérité

## 7.17 --- Confidence Scoring

Chaque élément extrait doit pouvoir recevoir un niveau de confiance.

Exemple :

**Favorite emoji: 🖤 --- 96 %**

**Frequently uses "babyy" --- 88 %**

**Possible hobby: tennis --- 54 %**

Les seuils de proposition automatique doivent être configurables.

## 7.18 --- Evidence

Pour les recommandations importantes, permettre à l'agence de voir des
exemples ayant conduit à l'analyse.

Exemple :

**Detected expression: "babyyy"**

Observed in: - 14 conversations - 38 creator messages

Éviter d'exposer inutilement des données sensibles dans l'interface.

## 7.19 --- Review Screen

Après analyse, afficher les résultats par catégories.

Exemple :

### Writing Style

12 recommendations

### Personality

7 recommendations

### Vocabulary

18 recommendations

### Creator Facts

9 detected

### Conflicts

2 detected

L'agence peut :

-   Accept All Safe Suggestions
-   Review Individually
-   Reject
-   Edit

Les faits importants doivent demander davantage de validation que les
simples préférences stylistiques.

## 7.20 --- Diff avant application

Avant de modifier un Model DNA existant, montrer les différences.

Exemple :

**Emoji Usage** Current: LOW Detected: MEDIUM

**Message Length** Current: MEDIUM Detected: SHORT

Actions :

-   Keep Current
-   Apply Detected
-   Customize

Ne jamais écraser silencieusement une configuration existante.

## 7.21 --- Import Job

Les imports volumineux doivent être traités en tâche asynchrone.

États :

-   UPLOADED
-   VALIDATING
-   PARSING
-   NORMALIZING
-   ANALYZING
-   REVIEW_REQUIRED
-   APPLIED
-   FAILED
-   CANCELLED

Afficher la progression à l'utilisateur.

## 7.22 --- Batch Analysis

Ne pas analyser chaque message avec un modèle puissant individuellement.

Utiliser :

-   preprocessing
-   statistiques
-   batching
-   modèles rapides
-   échantillonnage intelligent
-   modèles plus puissants uniquement pour synthèse/ambiguïtés

L'AI Model Router doit optimiser le coût de cette opération.

## 7.23 --- Sampling

Pour des historiques extrêmement volumineux, permettre un
échantillonnage représentatif.

L'échantillon doit chercher à couvrir :

-   conversations récentes
-   conversations anciennes
-   fans différents
-   conversations courtes
-   conversations longues
-   ventes
-   non-ventes
-   différents horaires
-   différents contextes

Éviter de baser le Model DNA sur 20 conversations presque identiques.

## 7.24 --- Recency Weight

Le style récent peut être plus représentatif que le style ancien.

Prévoir une pondération temporelle configurable.

Mais une règle explicitement définie par l'agence reste prioritaire sur
la récence.

## 7.25 --- Chatter Attribution

Lorsque l'information existe, conserver quel chatter a envoyé chaque
message historique.

Cela permettra de détecter :

-   variations de style
-   différences entre chatters
-   performances
-   contamination du persona
-   incohérences

Le système ne doit pas supposer que tous les messages envoyés depuis un
compte représentent parfaitement la créatrice.

## 7.26 --- Style Consistency Analysis

Comparer les chatters entre eux.

Exemple :

**Chatter A** DNA Fidelity: 91 %

**Chatter B** DNA Fidelity: 63 %

Cela pourra devenir ultérieurement un outil de management.

En V1, conserver l'architecture et les données nécessaires lorsque
disponibles.

## 7.27 --- Conversation Quality Flag

Permettre à l'agence ou à l'équipe OmniFlow de marquer une conversation
:

-   EXCELLENT
-   GOOD
-   NEUTRAL
-   POOR
-   DO_NOT_LEARN

Ces labels peuvent aider à construire les datasets de référence.

Une conversation marquée DO_NOT_LEARN ne doit pas servir d'exemple
positif.

## 7.28 --- Benchmark Candidate

Une conversation importée peut être proposée comme candidate au
Benchmark.

Mais elle ne doit intégrer le **Gold Dataset** qu'après validation.

Workflow :

Imported Conversation → Candidate → Human Review → Benchmark Approved

## 7.29 --- Anonymisation / minimisation

Lorsque des conversations sont utilisées pour des tests internes ou des
benchmarks, prévoir des mécanismes de minimisation ou pseudonymisation
lorsque cela est approprié.

Ne conserver que les données nécessaires à l'objectif.

Les exigences exactes de protection et de conservation des données
devront être validées avant production.

## 7.30 --- Suppression

L'architecture doit permettre de supprimer les données importées
conformément aux règles applicables et aux besoins de l'agence.

La suppression d'un import brut ne doit pas créer de références cassées
silencieuses.

Définir clairement la relation entre :

-   raw import
-   normalized data
-   extracted facts
-   memories
-   benchmark copies

## 7.31 --- Raw vs Processed Data

Séparer :

### RAW IMPORT

Donnée originale importée.

### NORMALIZED DATA

Format interne.

### DERIVED DATA

Analyses, tags, scores, faits proposés.

Cela permet de réanalyser ultérieurement avec une nouvelle version du
système sans réimporter les fichiers lorsque leur conservation est
autorisée.

## 7.32 --- Analysis Versioning

Chaque analyse doit enregistrer :

-   parser version
-   extraction prompt version
-   model
-   Model Router config
-   analysis version
-   timestamp

Une nouvelle version d'OmniFlow peut ainsi réanalyser un ancien import
et comparer les résultats.

## 7.33 --- Import Analytics

Pour chaque import, suivre :

-   conversations
-   messages
-   creator messages
-   fan messages
-   période couverte
-   nombre de fans
-   erreurs
-   doublons
-   recommandations générées
-   recommandations acceptées
-   recommandations rejetées
-   coût IA
-   temps de traitement

## 7.34 --- Onboarding Recommendation

Lorsqu'une nouvelle agence configure une créatrice, proposer deux
chemins :

### QUICK SETUP

Configuration manuelle rapide du Model DNA.

### LEARN FROM HISTORY

Importer des conversations puis configurer le Model DNA avec l'aide
d'OmniFlow.

Les deux chemins doivent conduire au même système Model DNA final.

## 7.35 --- Import sans blocage

L'agence ne doit pas être obligée d'importer des conversations pour
utiliser OmniFlow.

Le produit doit fonctionner avec :

-   configuration manuelle
-   templates OmniFlow
-   import historique
-   combinaison des trois

## 7.36 --- Future Continuous Learning

Prévoir l'architecture pour qu'à terme OmniFlow puisse analyser
progressivement les nouvelles conversations.

Mais cela doit rester distinct de l'import initial.

Les conversations de production alimenteront :

-   Fan Memory
-   Analytics
-   Learning Events
-   performance analysis

Elles ne doivent toujours pas modifier automatiquement les règles
centrales sans validation.

## 7.37 --- Sécurité des imports

Les fichiers importés doivent être traités comme non fiables.

Prévoir :

-   validation de type
-   limite de taille
-   contrôle de format
-   noms de fichiers sécurisés
-   stockage privé
-   parsing isolé
-   protection contre contenu malformé
-   suppression contrôlée

Ne jamais exécuter du contenu contenu dans un fichier importé.

## 7.38 --- UX de résultat

Le résultat de l'import doit donner une sensation claire de valeur.

Exemple :

# OmniFlow analyzed 12,482 messages.

**We found:**

-   14 recurring expressions
-   7 strong personality traits
-   23 creator facts to review
-   4 inconsistencies
-   9 conversation habits
-   3 high-confidence style patterns

CTA :

**Review your Model DNA**

L'objectif est que l'agence comprenne immédiatement ce qu'OmniFlow a
appris.

## 7.39 --- Principe qualité

L'importation doit enrichir OmniFlow sans diminuer sa qualité.

Règle :

# HISTORY PROVIDES CONTEXT. OMNIFLOW PROVIDES INTELLIGENCE.

Les données historiques peuvent expliquer :

-   qui est la créatrice
-   comment elle parle
-   qui sont les fans
-   ce qui s'est produit

Mais OmniFlow doit toujours être libre d'appliquer une meilleure
stratégie lorsque le système et les paramètres actuels le justifient.

## 7.40 --- Critère de réussite

Le système d'importation est réussi lorsque :

-   une agence peut exploiter son historique sans configuration manuelle
    interminable
-   le Model DNA devient plus précis
-   les faits sont contrôlés
-   les contradictions sont détectées
-   les mauvais comportements historiques ne deviennent pas
    automatiquement des règles
-   les paramètres actuels restent prioritaires
-   les données peuvent être réanalysées
-   les coûts restent maîtrisés
-   les imports sont auditables et sécurisés

------------------------------------------------------------------------

## PARTIE 7 --- VALIDÉE COMME SPÉCIFICATION DE L'IMPORTATION & ANALYSE DES CONVERSATIONS

La suite du cahier des charges commence avec :

# PARTIE 8 --- FAN MEMORY
