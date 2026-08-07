# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 14 --- MEDIA LIBRARY & MEDIA INTELLIGENCE

## 14.1 --- Objectif

OmniFlow doit intégrer une bibliothèque média centralisée permettant aux
agences de stocker, organiser, rechercher, tarifer et utiliser les
contenus associés à chaque créatrice.

La Media Library ne doit pas être un simple espace de stockage.

Elle doit alimenter un moteur :

# MEDIA INTELLIGENCE

capable d'aider OmniFlow à sélectionner le bon contenu selon :

-   le fan
-   la conversation
-   la demande
-   le script
-   les préférences
-   l'historique d'achat
-   le prix
-   les règles agence
-   les performances historiques

Principe :

# THE RIGHT MEDIA FOR THE RIGHT FAN AT THE RIGHT MOMENT.

## 14.2 --- Séparation des bibliothèques

Prévoir au minimum une séparation logique entre :

### CHATTING MEDIA

Contenus destinés aux conversations et ventes.

### MARKETING MEDIA

Contenus destinés au marketing, réseaux sociaux et futurs modules
OmniFlow.

La V1 Chatting doit prioriser la bibliothèque Chatting.

L'architecture générale doit néanmoins permettre l'ajout futur du
Marketing sans reconstruire le stockage.

## 14.3 --- Organisation

Structure possible :

**Agency** → **Creator** → **Library** → **Folders / Collections** →
**Media**

Une agence ne doit jamais voir les médias d'une autre agence.

## 14.4 --- Types de médias

Prévoir une architecture extensible :

-   image
-   video
-   audio
-   voice note
-   GIF si supporté
-   bundle / set
-   external platform reference

Les types réellement envoyables dépendent des capacités de chaque
plateforme.

## 14.5 --- Media Object

Chaque média doit pouvoir contenir :

-   id
-   agency_id
-   creator_id
-   storage reference
-   media type
-   title interne
-   description interne
-   tags
-   category
-   folder
-   duration si applicable
-   dimensions si applicable
-   file size
-   target price
-   minimum price
-   standalone allowed
-   script-only
-   negotiation allowed
-   active / archived
-   created_at
-   updated_at

## 14.6 --- Upload

L'agence doit pouvoir :

-   uploader un média
-   uploader plusieurs médias
-   glisser-déposer
-   assigner à une créatrice
-   choisir un dossier
-   définir les paramètres commerciaux
-   ajouter des tags

Prévoir une progression d'upload et une gestion claire des erreurs.

## 14.7 --- Storage

Les fichiers doivent être stockés dans un stockage privé adapté.

Ne jamais rendre les médias privés accessibles via une URL publique
permanente non protégée.

Prévoir :

-   private buckets
-   signed URLs / temporary access
-   access control
-   tenant isolation
-   audit
-   deletion

La stack exacte sera définie dans la partie Infrastructure.

## 14.8 --- Preview

L'interface doit permettre de prévisualiser les médias selon les
permissions de l'utilisateur.

Pour les vidéos :

-   thumbnail
-   duration
-   preview player

Pour les images :

-   thumbnail
-   full preview

Pour l'audio :

-   duration
-   player

## 14.9 --- Folders

Permettre de créer des dossiers.

Exemples :

-   Script 1
-   Script 2
-   Premium
-   Custom
-   Casual
-   Voice Notes

Les dossiers sont destinés à l'organisation humaine.

La logique IA doit principalement utiliser tags + métadonnées +
performances.

## 14.10 --- Collections

Prévoir des collections logiques indépendantes des dossiers.

Un média peut appartenir à plusieurs collections.

Exemples :

-   Best Sellers
-   New Content
-   High Ticket
-   Script A
-   Returning Fans

## 14.11 --- Tags

Les tags sont essentiels pour Media Intelligence.

Exemples conceptuels :

-   content category
-   outfit
-   setting
-   mood
-   intensity
-   format
-   premium level
-   custom-like
-   theme

Le système de tags doit être extensible et configurable.

## 14.12 --- AI Auto-tagging

Lorsqu'un média est importé, OmniFlow peut proposer automatiquement :

-   description
-   tags
-   category
-   characteristics

Mais l'agence doit pouvoir :

-   validate
-   edit
-   reject

Les tags utilisés pour des décisions commerciales importantes doivent
être suffisamment fiables.

## 14.13 --- Metadata Extraction

Extraire automatiquement lorsque possible :

-   type
-   size
-   duration
-   dimensions
-   codec
-   thumbnail
-   upload date

Ces données ne nécessitent pas de LLM.

## 14.14 --- Media Description

Chaque média doit posséder une description exploitable par l'IA.

Deux champs possibles :

### INTERNAL DESCRIPTION

Description précise pour OmniFlow et l'agence.

### SALES DESCRIPTION

Description ou angle pouvant aider à présenter le média.

Le Sales Description ne doit pas contenir d'affirmations fausses par
rapport au contenu réel.

## 14.15 --- Pricing

Chaque média peut définir :

-   target price
-   minimum price
-   default price
-   negotiation allowed
-   maximum discount
-   currency

La hiérarchie doit respecter :

Agency Rules → Creator Rules → Media Rules → Script Rules

La règle la plus restrictive applicable doit être respectée.

## 14.16 --- Prix cible vs minimum

Exemple :

**Target Price** 50 €

**Minimum Price** 40 €

Le Brain peut viser 50 €.

Si négociation autorisée, le Negotiation Engine peut descendre dans la
plage valide.

Il ne peut jamais descendre sous 40 €.

## 14.17 --- Standalone Media

Chaque média doit définir :

**Standalone Allowed** YES / NO

YES : Media Intelligence peut le proposer hors script lorsque pertinent.

NO : Le média ne peut être utilisé que dans les contextes autorisés.

## 14.18 --- Script-only Media

Un média peut être réservé à un ou plusieurs scripts.

Exemple :

**Script-only = Script Premium V3**

Media Intelligence ne doit pas le sélectionner pour une vente spontanée.

## 14.19 --- Media Availability

Statuts possibles :

-   ACTIVE
-   PAUSED
-   ARCHIVED
-   UNAVAILABLE

Un média indisponible ne doit jamais être proposé.

## 14.20 --- Media Intelligence Inputs

Pour sélectionner un média, utiliser notamment :

-   fan request
-   current conversation
-   Content Affinity
-   purchase history
-   previously sent media
-   previously purchased media
-   previously declined media
-   script
-   creator
-   price range
-   Spending Potential
-   Price Sensitivity
-   Agency Rules
-   media performance

## 14.21 --- Media Candidate Retrieval

Pipeline recommandé :

1.  filter by creator
2.  filter by availability
3.  filter by permissions
4.  filter by script/context
5.  filter by price constraints
6.  retrieve semantically relevant media
7.  rank candidates
8.  validate final candidate

Ne pas envoyer toute la Media Library au LLM.

## 14.22 --- Semantic Search

Prévoir une recherche sémantique sur :

-   descriptions
-   tags
-   categories
-   sales descriptions

Exemple :

Fan demande un type précis de contenu.

→ retrouver les médias correspondant le mieux à cette demande.

La recherche doit rester limitée aux médias de la bonne
créatrice/agence.

## 14.23 --- Ranking

Chaque candidat peut recevoir un score basé sur :

-   semantic relevance
-   fan affinity
-   historical conversion
-   price fit
-   novelty
-   script relevance
-   creator rules
-   recency
-   availability

La formule doit être versionnée.

## 14.24 --- Duplicate Sale Awareness

OmniFlow doit savoir si un média a déjà été :

-   sent
-   offered
-   purchased

par ce fan.

Le système peut alors éviter de vendre involontairement exactement le
même média comme s'il était nouveau.

Le comportement dépendra des règles agence et du contexte.

## 14.25 --- Purchase History Integration

Pour chaque média :

-   fans offered
-   fans purchased
-   price sold
-   date
-   script
-   strategy

Cela permet d'améliorer la sélection future.

## 14.26 --- Media Performance

Mesurer :

-   offers
-   purchases
-   conversion rate
-   revenue
-   average sold price
-   negotiation rate
-   objection rate
-   performance by creator
-   performance by fan segment
-   performance by script
-   performance by price

## 14.27 --- Media Performance ≠ qualité absolue

Un média peut mal performer parce qu'il a été :

-   mal présenté
-   proposé trop cher
-   proposé au mauvais moment
-   montré au mauvais segment

Ne pas conclure automatiquement :

**low conversion = bad media.**

Media Intelligence doit analyser le contexte.

## 14.28 --- Content Affinity

Fan Intelligence peut produire des affinités par catégories.

Media Intelligence les utilise pour le ranking.

Exemple :

Fan affinity: Category A = 90 Category B = 35

Si deux médias sont autrement similaires, Category A peut être
priorisée.

## 14.29 --- Novelty Score

Créer un signal permettant de favoriser du contenu que le fan n'a pas
déjà vu.

Facteurs :

-   déjà envoyé
-   déjà acheté
-   similarité avec contenu récent
-   récence

Cela réduit la répétition.

## 14.30 --- Similarity Detection

Prévoir à terme une détection de médias similaires.

Objectifs :

-   éviter les doublons
-   détecter plusieurs versions du même contenu
-   éviter de revendre accidentellement un quasi-doublon
-   organiser la bibliothèque

Techniques possibles :

-   hashes
-   perceptual hashes
-   embeddings visuels

La V1 peut commencer simplement.

## 14.31 --- Media Bundles

Permettre de créer un bundle contenant plusieurs médias.

Exemple :

**Bundle Premium** - media A - media B - media C

Le bundle possède :

-   target price
-   minimum price
-   description
-   tags
-   permissions

## 14.32 --- Bundle Intelligence

Media Intelligence peut sélectionner un bundle lorsque :

-   demande adaptée
-   fan compatible
-   Spending Potential
-   prix valide
-   bundle actif

Les performances du bundle doivent être suivies séparément.

## 14.33 --- Media Request Detection

Le Conversation / Understanding layer doit pouvoir détecter qu'un fan
demande un contenu particulier.

Le système transforme la demande en requête structurée.

Exemple conceptuel :

``` json
{
  "intent": "MEDIA_REQUEST",
  "category": "...",
  "attributes": ["..."],
  "confidence": 0.91
}
```

Media Intelligence recherche ensuite les candidats.

## 14.34 --- No Matching Media

Si aucun média suffisamment pertinent n'existe :

ne pas inventer.

Options :

-   continue conversation
-   propose alternative
-   custom request flow
-   human escalation

selon les règles.

## 14.35 --- Custom Content Bridge

Media Intelligence doit pouvoir transmettre :

**NO_MATCH / CUSTOM_REQUEST_CANDIDATE**

au Sales Strategy Engine.

Le système vérifie alors si les demandes personnalisées sont autorisées.

## 14.36 --- Human Selection

En Copilot, le chatter peut ouvrir :

**Recommended Media**

avec :

-   preview
-   relevance
-   price
-   previous fan interaction
-   performance

Puis choisir un autre média.

## 14.37 --- Full AI Selection

En Full AI, le média peut être sélectionné automatiquement uniquement si
:

-   confidence suffisante
-   permissions valides
-   price valid
-   content match valid
-   media available
-   platform capability valid

Sinon :

→ human approval.

## 14.38 --- Search UI

L'agence doit pouvoir rechercher par :

-   filename / title
-   description
-   tags
-   category
-   creator
-   folder
-   price
-   status
-   script
-   performance

Prévoir recherche textuelle + filtres.

## 14.39 --- Sort

Permettre de trier :

-   newest
-   oldest
-   highest revenue
-   highest conversion
-   most sold
-   target price
-   recently used

## 14.40 --- Bulk Actions

Pour plusieurs médias :

-   move folder
-   add tag
-   remove tag
-   change status
-   assign collection
-   archive
-   update negotiation permission

Les modifications de prix en masse doivent demander une validation
claire.

## 14.41 --- Media Detail Page

Afficher :

-   preview
-   metadata
-   tags
-   pricing
-   permissions
-   scripts
-   performance
-   sales history agrégée
-   AI recommendations
-   change history

## 14.42 --- Media Version / Replacement

Si un média est remplacé :

ne pas casser les Script Runs historiques.

Conserver une référence vers le média réellement utilisé.

Un nouveau fichier peut créer une nouvelle version ou un nouvel asset
selon le cas.

## 14.43 --- Deletion

Si un média a déjà été utilisé :

préférer généralement **ARCHIVE** plutôt qu'une suppression destructive
immédiate.

Si suppression demandée :

gérer les références historiques sans casser les analytics.

## 14.44 --- Access Control

Les rôles doivent déterminer qui peut :

-   view
-   upload
-   edit metadata
-   edit pricing
-   delete/archive
-   assign to scripts
-   view performance

Les médias privés nécessitent un contrôle strict.

## 14.45 --- Audit Log

Journaliser notamment :

-   upload
-   archive
-   delete
-   price change
-   minimum price change
-   negotiation change
-   script assignment
-   tag changes

## 14.46 --- Performance Recommendation

OmniFlow peut proposer :

**Media A performs strongly with returning buyers.**

ou :

**Media B has high interest but low conversion at current price.
Consider testing another price.**

Ces recommandations doivent s'appuyer sur un volume suffisant.

## 14.47 --- A/B Testing

Permettre de tester :

-   media A vs media B
-   caption A vs B
-   price A vs B
-   bundle A vs B

L'expérience doit être reliée aux Script / Strategy analytics.

## 14.48 --- Media Security

Avant production :

-   stockage privé
-   contrôle des accès
-   URLs temporaires
-   isolation tenant
-   logs
-   backups adaptés
-   règles de suppression
-   validation des uploads
-   restrictions de type/taille

Ne jamais faire confiance au nom ou MIME type fourni uniquement par le
client.

## 14.49 --- Critère de réussite

Media Library & Media Intelligence sont réussies lorsque :

-   l'agence retrouve facilement son contenu
-   chaque média possède des règles commerciales claires
-   OmniFlow peut comprendre ce qui est disponible
-   le Brain peut sélectionner un média hors script
-   les médias déjà achetés sont connus
-   les demandes spécifiques peuvent être recherchées
-   aucun média indisponible n'est proposé
-   aucun prix minimum n'est violé
-   les performances sont mesurées
-   les recommandations deviennent meilleures avec les données
-   Copilot et Full AI utilisent la même intelligence média

# THE LIBRARY STORES CONTENT.

# MEDIA INTELLIGENCE KNOWS WHEN TO USE IT.

------------------------------------------------------------------------

## PARTIE 14 --- VALIDÉE COMME SPÉCIFICATION DE MEDIA LIBRARY & MEDIA INTELLIGENCE

La suite du cahier des charges commence avec :

# PARTIE 15 --- PRICING & NEGOTIATION ENGINE
