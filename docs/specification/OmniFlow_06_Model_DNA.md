# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 6 --- MODEL DNA

## 6.1 --- Objectif

Chaque créatrice gérée dans OmniFlow doit disposer d'une identité
conversationnelle propre appelée :

# MODEL DNA

Le Model DNA définit comment OmniFlow doit incarner la créatrice dans
les conversations.

L'objectif est d'éviter une IA générique qui parle de la même manière
pour tous les comptes.

Deux créatrices différentes doivent pouvoir produire deux expériences
conversationnelles clairement différentes.

Le Model DNA doit influencer la génération des messages, mais ne doit
pas remplacer les règles commerciales, de plateforme ou de sécurité.

## 6.2 --- Principe fondamental

Le Model DNA répond principalement à :

# « QUI EST LA CRÉATRICE ET COMMENT PARLE-T-ELLE ? »

Il ne doit pas répondre seul à :

# « QUE FAUT-IL FAIRE COMMERCIALEMENT ? »

Cette seconde question appartient au Strategy & Decision Engine.

Séparer strictement :

**IDENTITY / STYLE**

de

**STRATEGY / DECISION.**

## 6.3 --- Hiérarchie

Le Model DNA doit respecter la hiérarchie générale OmniFlow.

Il est inférieur aux :

-   Platform / Safety / Compliance Rules
-   Agency Rules

Il influence ensuite :

-   Conversation Engine
-   formulation des messages
-   ton
-   rythme
-   vocabulaire
-   personnalisation

Il ne peut jamais contourner une règle supérieure.

## 6.4 --- Simple Mode

L'onboarding doit proposer un mode simple permettant de configurer
rapidement une créatrice.

Exemples de paramètres :

-   langue principale
-   âge/persona public pertinent
-   tonalité principale
-   niveau d'énergie
-   style relationnel
-   style de flirt
-   niveau d'emojis
-   longueur moyenne des messages
-   niveau de slang
-   quelques expressions favorites
-   sujets à éviter
-   rythme commercial général

L'objectif est de rendre la première configuration rapide.

## 6.5 --- Advanced Mode

L'agence doit ensuite pouvoir ouvrir une configuration avancée beaucoup
plus précise.

Le mode avancé doit être organisé en sections afin d'éviter une page
illisible.

Sections recommandées :

1.  Identity
2.  Personality
3.  Writing Style
4.  Vocabulary
5.  Emotional Style
6.  Relationship Style
7.  Conversation Habits
8.  Commercial Tone
9.  Boundaries
10. Knowledge / Facts
11. Voice Notes
12. Imported Conversation Insights

## 6.6 --- Identity

Stocker les informations nécessaires pour maintenir une identité
cohérente.

Exemples :

-   display name
-   bio courte
-   langue(s)
-   timezone ou zone générale si pertinente
-   informations publiques utiles
-   centres d'intérêt
-   hobbies
-   préférences
-   éléments récurrents de personnalité
-   informations que la créatrice souhaite utiliser dans les
    conversations

Ne pas demander ni stocker des informations inutiles au fonctionnement
du produit.

## 6.7 --- Personality Traits

Permettre de régler des traits sur des échelles.

Exemples :

**Playful**\
0--100

**Affectionate**\
0--100

**Confident**\
0--100

**Teasing**\
0--100

**Romantic**\
0--100

**Mysterious**\
0--100

**Energetic**\
0--100

**Direct**\
0--100

**Shy / Reserved**\
0--100

**Humorous**\
0--100

Ces valeurs servent de paramètres comportementaux, pas de scores
psychologiques scientifiques.

## 6.8 --- Writing Style

Configurer notamment :

-   longueur moyenne des messages
-   phrases courtes / longues
-   fréquence des messages multiples
-   ponctuation
-   majuscules
-   minuscules
-   contractions
-   fautes volontaires éventuelles
-   style très écrit ou très spontané
-   utilisation des points
-   utilisation des points d'exclamation
-   utilisation des points de suspension
-   fréquence des questions
-   rythme de réponse simulé si pertinent et autorisé

## 6.9 --- Emoji Profile

Créer un profil emoji.

Configurer :

-   emoji usage : OFF / LOW / MEDIUM / HIGH
-   emojis favoris
-   emojis interdits
-   fréquence maximale
-   contextes préférés
-   répétition autorisée ou non

Le système doit éviter de mettre artificiellement les mêmes emojis dans
chaque message.

## 6.10 --- Vocabulary Profile

Permettre de définir :

-   expressions favorites
-   surnoms utilisés
-   mots fréquemment utilisés
-   slang
-   abréviations
-   expressions interdites
-   mots que la créatrice n'utiliserait jamais
-   vocabulaire spécifique par langue

Le Conversation Engine doit utiliser ces éléments naturellement et non
les injecter mécaniquement.

## 6.11 --- Nickname Rules

Configurer comment la créatrice appelle les fans.

Exemples :

-   prénom
-   babe
-   baby
-   handsome
-   surnom personnalisé
-   aucun surnom

Permettre de définir :

-   surnoms autorisés
-   fréquence
-   conditions éventuelles
-   surnoms interdits

La mémoire du fan peut contenir un surnom spécifique si celui-ci a été
établi dans la relation.

## 6.12 --- Message Length Profile

Prévoir plusieurs préférences :

-   very short
-   short
-   medium
-   long
-   adaptive

En mode adaptive, la longueur doit dépendre notamment :

-   du message reçu
-   de l'étape de conversation
-   de la relation
-   de la stratégie
-   du contexte

Éviter les réponses systématiquement longues typiques d'un assistant IA.

## 6.13 --- Energy Level

Configurer l'énergie générale :

-   calm
-   balanced
-   energetic
-   very energetic

L'énergie doit influencer :

-   ponctuation
-   rythme
-   longueur
-   emojis
-   enthousiasme

## 6.14 --- Relationship Style

Configurer comment la créatrice développe la relation.

Paramètres possibles :

-   warmth
-   curiosity
-   affection
-   teasing
-   emotional closeness
-   frequency of personal questions
-   fan name usage
-   callback to previous memories
-   reassurance style
-   post-purchase warmth

Le but est que la mémoire soit utilisée naturellement.

Exemple :

Au lieu d'afficher seulement une fiche indiquant que le fan aime le
football, OmniFlow peut réutiliser cette information plus tard lorsque
cela est pertinent.

## 6.15 --- Memory Usage Style

Configurer la manière dont OmniFlow réutilise les souvenirs.

Niveaux possibles :

-   subtle
-   balanced
-   strong

Le système doit éviter l'effet inquiétant où la créatrice rappelle trop
souvent des détails anciens.

Les souvenirs doivent être utilisés uniquement lorsqu'ils rendent la
conversation plus naturelle ou pertinente.

## 6.16 --- Question Style

Configurer :

-   fréquence des questions
-   questions ouvertes / directes
-   curiosité
-   questions personnelles autorisées
-   sujets à éviter

OmniFlow doit éviter l'effet interview où chaque réponse se termine par
une question.

## 6.17 --- Flirt / Intimacy Style

Prévoir des paramètres de ton adaptés au contexte commercial de la
plateforme, dans les limites des règles applicables.

Configurer par exemple :

-   flirt intensity
-   teasing intensity
-   directness
-   progression speed
-   boundaries
-   prohibited themes

Les paramètres ne doivent jamais contourner les règles de plateforme, de
sécurité ou les restrictions applicables.

## 6.18 --- Commercial Tone

Le Model DNA peut influencer la manière de présenter une offre.

Exemples :

-   soft
-   playful
-   confident
-   direct
-   premium
-   teasing

Mais le moment où une vente doit être proposée appartient au Decision
Engine.

Le Model DNA contrôle :

**COMMENT vendre**

et non :

**QUAND vendre.**

## 6.19 --- Sales Pressure Preference

Permettre à l'agence de choisir une préférence générale :

-   conservative
-   balanced
-   assertive

Cette préférence doit être utilisée par le Strategy Engine comme un
paramètre, mais ne doit jamais autoriser des comportements contraires
aux règles supérieures.

Les relances doivent rester respectueuses et ne pas reposer sur des
tactiques coercitives, trompeuses ou abusives.

## 6.20 --- Post-Purchase Style

Configurer le comportement après achat.

Exemples :

-   niveau de remerciement
-   enthousiasme
-   relationnel après achat
-   délai avant nouvelle proposition
-   style de continuation

L'objectif est d'éviter qu'OmniFlow enchaîne mécaniquement une nouvelle
vente immédiatement après chaque achat.

## 6.21 --- Boundaries

Chaque créatrice doit pouvoir définir des limites claires.

Exemples :

-   sujets interdits
-   demandes refusées
-   services non disponibles
-   types de contenus non proposés
-   promesses interdites
-   informations privées à ne jamais partager
-   expressions à ne jamais utiliser

Ces limites doivent être transformées en contraintes déterministes
lorsque possible.

## 6.22 --- Creator Facts

Créer une base de faits validés concernant la persona conversationnelle.

Chaque fait doit pouvoir contenir :

-   fact
-   category
-   source
-   verified status
-   created_at
-   updated_at

Exemples de catégories :

-   hobbies
-   preferences
-   routine
-   favorites
-   public biography
-   conversation facts

Le modèle ne doit pas inventer des informations contradictoires avec ces
faits.

## 6.23 --- Fact Priority

Lorsque plusieurs sources donnent des informations différentes, utiliser
une priorité explicite.

Exemple :

1.  Agency manually verified fact
2.  Creator manually verified fact
3.  Current Model DNA setting
4.  Imported conversation inference
5.  AI inference

Une inférence historique ne doit jamais écraser un fait explicitement
validé.

## 6.24 --- Imported Conversations

L'agence doit pouvoir importer des conversations historiques pour aider
OmniFlow à comprendre le style de la créatrice.

Objectifs :

-   détecter vocabulaire
-   détecter expressions
-   détecter longueur
-   détecter ponctuation
-   détecter emojis
-   détecter énergie
-   détecter style relationnel
-   détecter habitudes conversationnelles
-   extraire certains faits pertinents

IMPORTANT :

# LES CONVERSATIONS IMPORTÉES NE SONT PAS UNE VÉRITÉ STRATÉGIQUE.

Une mauvaise équipe de chatters peut avoir produit de mauvaises
conversations.

OmniFlow ne doit pas reproduire automatiquement leurs décisions
commerciales.

## 6.25 --- Style Extraction

Après importation, OmniFlow peut produire une analyse.

Exemple :

**Detected Style**

Message length: Short\
Emoji usage: Medium\
Energy: High\
Question frequency: Medium\
Favorite expressions: \[...\]\
Common nicknames: \[...\]\
Punctuation style: \[...\]\
Tone: Playful / Affectionate

L'agence doit pouvoir :

-   accepter
-   modifier
-   rejeter

chaque recommandation importante.

## 6.26 --- Strategy Contamination Prevention

Lors de l'analyse des conversations historiques, séparer :

### STYLE SIGNALS

Utilisables pour Model DNA.

### FACT SIGNALS

Utilisables après validation ou avec niveau de confiance.

### STRATEGY SIGNALS

Ne doivent pas être copiés automatiquement.

Exemple :

Si les anciens chatters attendaient 40 messages avant toute proposition,
cela ne signifie pas qu'OmniFlow doit reproduire ce comportement.

## 6.27 --- Explicit Settings Override History

Les paramètres explicites actuels de l'agence doivent être prioritaires
sur les conversations historiques.

Exemple :

Historique :

**vente très lente**

Nouvelle configuration agence :

**sales pace = assertive**

→ OmniFlow doit suivre la nouvelle configuration.

Le passé sert à comprendre la créatrice, pas à emprisonner OmniFlow dans
l'ancien process.

## 6.28 --- Model DNA Preview

Créer une fonction de preview.

L'agence peut entrer un exemple de message fan.

OmniFlow génère une réponse avec le Model DNA actuel.

Permettre :

-   regenerate
-   compare
-   edit settings
-   test another message

Cela facilite la configuration avant activation.

## 6.29 --- DNA Test Suite

Prévoir une série de situations de test.

Exemples :

-   nouveau fan
-   compliment
-   conversation casual
-   fan très engagé
-   objection
-   après achat
-   fan ancien qui revient

L'agence peut visualiser comment la créatrice répondrait dans plusieurs
contextes.

## 6.30 --- DNA Confidence

Lorsque le Model DNA est principalement généré depuis des conversations
importées, afficher un niveau de confiance sur les caractéristiques
détectées.

Exemple :

**Emoji Usage: HIGH --- Confidence 94 %**

**Humor: MEDIUM --- Confidence 61 %**

L'agence peut corriger les éléments faibles.

## 6.31 --- Model DNA Versioning

Chaque modification importante doit créer une version.

Exemples :

-   dna-v1
-   dna-v2
-   dna-v3

Conserver :

-   modifications
-   auteur
-   timestamp
-   paramètres précédents
-   paramètres nouveaux

Permettre un rollback si nécessaire.

## 6.32 --- Performance par DNA Version

À terme, relier les versions du Model DNA aux analytics.

Mesurer éventuellement :

-   engagement
-   response rate
-   conversion
-   revenue per active fan
-   human edits
-   satisfaction interne agence

Attention :

Une corrélation ne doit pas être automatiquement interprétée comme
causalité.

Utiliser A/B Testing lorsque nécessaire.

## 6.33 --- Human Editing Feedback

En Copilot Mode, si un chatter modifie une réponse proposée, enregistrer
la différence.

Cela peut fournir un signal sur :

-   ton
-   longueur
-   vocabulaire
-   style
-   erreurs

Mais :

# NE PAS APPRENDRE AUTOMATIQUEMENT DE CHAQUE MODIFICATION.

Un chatter peut lui-même être mauvais.

Les modifications doivent être agrégées et analysées avant d'influencer
le Model DNA.

## 6.34 --- Agency Templates

Permettre ultérieurement à une agence de créer des templates de Model
DNA.

Exemple :

-   Soft Girlfriend Style
-   Playful Style
-   Premium Style

Puis appliquer un template à une nouvelle créatrice avant
personnalisation.

Cette fonctionnalité peut être simple en V1 mais l'architecture doit la
permettre.

## 6.35 --- Language Profiles

Une créatrice peut parler plusieurs langues.

Prévoir des paramètres spécifiques par langue lorsque nécessaire :

-   expressions
-   slang
-   surnoms
-   ponctuation
-   niveau de formalité
-   emojis

Éviter une traduction littérale du style anglais vers le français ou
inversement.

## 6.36 --- Voice Notes

Si les intégrations permettent les messages vocaux ou si OmniFlow génère
du texte destiné à être transformé en audio, le Model DNA doit pouvoir
définir :

-   style vocal
-   longueur
-   énergie
-   vocabulaire
-   rythme
-   situations où proposer/utiliser un voice note

La génération audio réelle sera traitée séparément si elle est incluse
techniquement.

## 6.37 --- Model DNA dans le Context Loader

Le Context Loader ne doit pas envoyer toute la configuration DNA à
chaque appel si elle est volumineuse.

Créer une représentation optimisée utilisable par le Conversation
Engine.

Exemple :

**DNA Runtime Profile**

contenant uniquement les paramètres nécessaires à la génération
actuelle.

## 6.38 --- DNA vs Agency Rules

Exemple :

Model DNA :

**Very playful**

Agency Rule :

**No aggressive selling**

Le style peut rester playful.

La règle commerciale reste prioritaire.

Autre exemple :

Model DNA :

**Negotiation tone = playful**

Agency Rule :

**Negotiation OFF**

→ aucune négociation.

## 6.39 --- DNA vs Fan Personalization

Le Model DNA représente la créatrice.

La Fan Memory représente le fan.

La réponse finale doit combiner :

# MODEL DNA × FAN MEMORY × CURRENT CONTEXT × DECISION

Exemple :

La créatrice conserve toujours son style.

Mais elle ne parle pas exactement de la même manière à :

-   un nouveau fan
-   un fan fidèle
-   un gros acheteur
-   un fan qui revient après plusieurs semaines

La personnalisation ne doit pas détruire l'identité de la créatrice.

## 6.40 --- Critère de réussite

Le Model DNA est réussi lorsque :

-   la créatrice possède une identité reconnaissable
-   le ton reste cohérent sur la durée
-   les réponses ne ressemblent pas à un assistant générique
-   les informations validées restent cohérentes
-   le style s'adapte au contexte sans disparaître
-   les conversations historiques améliorent l'identité sans contaminer
    la stratégie
-   les paramètres explicites de l'agence restent prioritaires
-   l'agence peut facilement comprendre et modifier le comportement

# OMNIFLOW SHOULD NOT SOUND LIKE AI.

# IT SHOULD SOUND LIKE THE CREATOR'S CONFIGURED PERSONA.

------------------------------------------------------------------------

## PARTIE 6 --- VALIDÉE COMME SPÉCIFICATION DU MODEL DNA

La suite du cahier des charges commence avec :

# PARTIE 7 --- IMPORTATION & ANALYSE DES CONVERSATIONS
