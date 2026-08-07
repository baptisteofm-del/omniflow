# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 8 --- FAN MEMORY

## 8.1 --- Objectif

Chaque fan doit disposer d'une mémoire individuelle persistante.

La Fan Memory doit permettre à OmniFlow de comprendre la relation dans
la durée et de ne pas traiter chaque nouveau message comme une
conversation isolée.

Promesse produit :

# OMNIFLOW REMEMBERS EVERY FAN.

La mémoire constitue un avantage majeur face à des équipes humaines qui
peuvent gérer des centaines de conversations et perdre une partie du
contexte historique.

## 8.2 --- Fan Memory ≠ historique brut

La Fan Memory ne doit pas être une simple copie de tous les messages.

Elle doit transformer l'historique en informations utiles, structurées,
récupérables et hiérarchisées.

Architecture conceptuelle :

**Raw Conversation** → Extraction → Validation / Confidence → Structured
Memory → Retrieval → Context Injection → Decision

L'historique brut reste disponible selon les règles de conservation
applicables, mais le Brain doit principalement travailler avec une
mémoire optimisée.

## 8.3 --- Mémoire individuelle

La mémoire doit être isolée par :

**Agency** → **Creator** → **Platform** → **Fan**

Un même fan ne doit pas automatiquement partager sa mémoire entre
plusieurs créatrices ou agences.

Toute logique future de rapprochement d'identité doit être explicitement
conçue, autorisée et validée.

## 8.4 --- Catégories principales

Prévoir plusieurs catégories de mémoire :

### PROFILE MEMORY

Qui est le fan.

### RELATIONSHIP MEMORY

Historique de sa relation avec la créatrice.

### PREFERENCE MEMORY

Ce qu'il semble aimer ou préférer.

### COMMERCIAL MEMORY

Comportement d'achat et sensibilité commerciale.

### CONVERSATION MEMORY

Sujets, événements et éléments utiles des échanges.

### TEMPORAL MEMORY

Éléments liés à une date ou à une période.

### NEGATIVE / BOUNDARY MEMORY

Ce qu'il n'aime pas, refuse ou ce qu'il faut éviter.

## 8.5 --- Profile Memory

Peut contenir lorsque ces informations ont été volontairement
communiquées et sont pertinentes :

-   prénom / pseudo
-   langue
-   timezone approximative si utile
-   centres d'intérêt
-   hobbies
-   travail ou secteur si partagé
-   préférences générales
-   éléments de contexte utiles

Ne pas chercher à constituer inutilement un profil personnel exhaustif.

Principe :

# STORE WHAT IMPROVES THE EXPERIENCE, NOT EVERYTHING POSSIBLE.

## 8.6 --- Relationship Memory

Conserver les événements relationnels utiles.

Exemples :

-   première interaction
-   ancienneté
-   surnom utilisé
-   sujets récurrents
-   moments importants mentionnés
-   promesses conversationnelles pertinentes
-   dernière conversation significative
-   dynamique générale
-   niveau de familiarité
-   habitudes de communication

L'objectif est de permettre des callbacks naturels.

## 8.7 --- Preference Memory

Peut contenir :

-   sujets préférés
-   type de conversation apprécié
-   catégories de contenus ayant suscité de l'intérêt
-   formats préférés
-   préférences déclarées
-   éléments qu'il semble ne pas apprécier

Chaque préférence doit pouvoir comporter :

-   value
-   confidence
-   source
-   last_confirmed_at

## 8.8 --- Commercial Memory

Conserver les informations commerciales utiles, lorsque disponibles :

-   nombre d'achats
-   montant total
-   panier moyen
-   dernier achat
-   fréquence d'achat
-   prix déjà acceptés
-   prix refusés
-   types de contenus achetés
-   scripts ayant converti
-   étapes ayant converti
-   remises utilisées
-   objections
-   comportement après proposition
-   tendance à négocier
-   temps moyen avant achat

Ces données alimentent Fan Intelligence mais ne doivent pas être
confondues avec les scores eux-mêmes.

## 8.9 --- Conversation Memory

Extraire les éléments qui peuvent être utiles plus tard.

Exemple :

Fan : « J'ai mon entretien lundi. »

Mémoire :

**Event: job interview** **Date: Monday** **Importance: medium/high**
**Follow-up relevance: yes**

Une conversation future peut naturellement utiliser cette information si
elle est encore pertinente.

## 8.10 --- Temporal Memory

Chaque mémoire doit pouvoir avoir une dimension temporelle.

Champs possibles :

-   occurred_at
-   created_at
-   last_confirmed_at
-   valid_until
-   temporal_relevance
-   expired

Exemple :

« Je pars à Londres ce week-end »

est une information temporaire.

Elle ne doit pas être utilisée trois mois plus tard comme si elle était
toujours actuelle.

## 8.11 --- Long-term vs Short-term

Séparer :

### SHORT-TERM MEMORY

Informations utiles dans les prochaines heures/jours.

### LONG-TERM MEMORY

Informations stables ou régulièrement utiles.

### EPISODIC MEMORY

Événements spécifiques passés.

### WORKING MEMORY

Contexte immédiat de la conversation actuelle.

Le Context Loader choisit le type de mémoire pertinent.

## 8.12 --- Memory Object

Chaque élément de mémoire doit être structuré.

Exemple conceptuel :

``` json
{
  "type": "interest",
  "category": "sport",
  "value": "football",
  "confidence": 0.94,
  "importance": 0.72,
  "source_message_id": "...",
  "created_at": "...",
  "last_confirmed_at": "...",
  "status": "active"
}
```

Le schéma exact sera défini dans la partie Database.

## 8.13 --- Confidence

Chaque mémoire inférée doit posséder un niveau de confiance.

Exemple :

Fan : « j'adore le foot »

→ confidence élevée.

Fan : « je regarde peut-être le match ce soir »

→ ne pas automatiquement conclure qu'il adore le football.

Les faits explicitement déclarés peuvent recevoir davantage de confiance
que les inférences.

## 8.14 --- Importance

Chaque mémoire doit également pouvoir recevoir un niveau d'importance.

Facteurs possibles :

-   répétition
-   intensité
-   utilité relationnelle
-   utilité commerciale
-   récence
-   déclaration explicite
-   événement important

La mémoire ne doit pas traiter de la même façon un détail anodin et un
événement personnel important.

## 8.15 --- Memory Decay

Certaines mémoires doivent perdre de la pertinence avec le temps.

Exemples :

-   humeur actuelle
-   voyage
-   disponibilité
-   intention d'achat immédiate

D'autres peuvent rester stables :

-   hobby récurrent
-   prénom
-   préférence durable

Prévoir une logique de decay configurable selon le type de mémoire.

## 8.16 --- Reinforcement

Une mémoire peut devenir plus fiable lorsqu'elle est confirmée plusieurs
fois.

Exemple :

Le fan mentionne le football dans plusieurs conversations.

→ confidence et importance peuvent augmenter.

Ne pas créer plusieurs mémoires identiques si elles peuvent être
fusionnées.

## 8.17 --- Contradictions

Si une nouvelle information contredit une ancienne mémoire :

-   ne pas conserver aveuglément les deux comme vérités actives
-   identifier la contradiction
-   privilégier la donnée récente lorsque logique
-   réduire la confiance si nécessaire
-   conserver l'historique de modification

Exemple :

ancienne préférence : **favorite team = A**

nouvelle déclaration explicite : **favorite team = B**

→ mettre à jour la mémoire active tout en gardant une trace historique
si utile.

## 8.18 --- Memory Extraction

Après certains messages, un processus d'extraction doit déterminer s'il
existe une information digne d'être mémorisée.

Ne pas appeler inutilement un modèle puissant après chaque phrase.

L'AI Model Router doit privilégier :

-   règles
-   extraction légère
-   batching lorsque pertinent
-   modèles rapides

pour cette tâche.

## 8.19 --- Memory Write Gate

Avant d'enregistrer une nouvelle mémoire, appliquer un filtre.

Questions :

-   est-ce réellement utile ?
-   est-ce suffisamment fiable ?
-   existe-t-elle déjà ?
-   est-elle contradictoire ?
-   est-elle temporaire ?
-   est-elle trop sensible ou inutile ?
-   améliore-t-elle réellement une interaction future ?

Objectif :

éviter une base de mémoire remplie de bruit.

## 8.20 --- Memory Retrieval

Lorsqu'un message arrive, ne pas injecter toute la Fan Memory.

Le Retrieval Engine doit rechercher les souvenirs les plus pertinents
selon :

-   message actuel
-   conversation récente
-   stratégie
-   décision potentielle
-   récence
-   importance
-   confidence
-   relation sémantique

Retourner uniquement un nombre limité d'éléments utiles.

## 8.21 --- Semantic Retrieval

Prévoir la possibilité d'utiliser des embeddings / recherche vectorielle
pour retrouver des souvenirs liés au sujet actuel.

Exemple :

Fan parle de son travail.

→ retrouver un souvenir concernant son entretien ou son métier.

La recherche vectorielle complète les filtres structurés ; elle ne doit
pas remplacer toute la logique de récupération.

## 8.22 --- Structured Retrieval

Certaines données doivent être récupérées directement sans recherche
sémantique.

Exemples :

-   total spent
-   last purchase
-   nickname
-   current active script
-   last offer
-   price sensitivity
-   last interaction

Utiliser une requête structurée lorsque la donnée recherchée est connue.

## 8.23 --- Memory Context Builder

Créer un composant chargé de transformer les mémoires récupérées en
contexte compact pour le Brain.

Exemple conceptuel :

**Relevant Fan Context** - Fan prefers short playful conversations. -
Mentioned a job interview scheduled for Monday. - Bought similar content
twice previously. - Last declined offer because price was too high.

Cette représentation doit rester concise.

## 8.24 --- Natural Memory Usage

Le Conversation Engine ne doit pas réciter les mémoires.

Mauvais comportement :

« Tu m'as dit le 12 mars à 14h32 que tu avais un entretien. »

Meilleur comportement :

« alors ton entretien, ça s'est bien passé ? »

La mémoire doit donner l'impression d'une continuité naturelle.

## 8.25 --- Anti-Creepy Guard

Créer des règles empêchant l'utilisation excessive ou étrange de
souvenirs.

Exemples :

-   ne pas rappeler trop de détails simultanément
-   ne pas mentionner un souvenir sans contexte pertinent
-   éviter une précision temporelle inutile
-   ne pas rappeler des informations très anciennes sans raison
-   limiter la fréquence des callbacks mémoire

La mémoire doit renforcer la relation, pas donner l'impression d'une
surveillance.

## 8.26 --- Memory Timeline

Dans la fiche fan, prévoir une timeline lisible des événements
importants.

Exemples :

-   Joined
-   First conversation
-   First purchase
-   Important preference detected
-   Script converted
-   Price objection
-   Returned after inactivity
-   Major relationship event

Cette timeline doit aider les humains à comprendre rapidement le fan.

## 8.27 --- Fan Profile Summary

Créer un résumé synthétique visible dans l'interface.

Exemple :

**Relationship** Long-term / highly engaged

**Commercial** Frequent buyer / moderate price sensitivity

**Interests** Football, travel

**Recent** Mentioned an important event this week

**Last Purchase** ...

Ce résumé doit être généré depuis les données structurées et rester
actualisable.

## 8.28 --- Human Editing

Les utilisateurs autorisés doivent pouvoir :

-   ajouter une mémoire
-   corriger une mémoire
-   supprimer une mémoire
-   confirmer une mémoire
-   marquer une mémoire comme importante
-   marquer une mémoire comme incorrecte

Chaque modification manuelle doit être auditée.

## 8.29 --- Source Traceability

Chaque mémoire automatique doit pouvoir être reliée à sa source lorsque
celle-ci existe.

Exemples :

-   message
-   transaction
-   import
-   human input
-   platform event

Cela permet de comprendre pourquoi OmniFlow croit une information.

## 8.30 --- Fan Notes

Prévoir des notes humaines distinctes de la mémoire IA.

Exemple :

**Manager note** « Fan important --- validation humaine pour custom
request \> 500 €. »

Les notes peuvent avoir :

-   author
-   visibility
-   priority
-   created_at
-   expiration éventuelle

Les notes critiques peuvent être injectées dans le Brain selon les
permissions.

## 8.31 --- Memory et Fan Scores

La mémoire alimente Fan Intelligence.

Exemples :

achats historiques → Spending Potential

réponses fréquentes → Engagement

relation ancienne → Relationship Score

refus répétés récents → Purchase Intent / Churn Risk

Mais les scores doivent être calculés séparément.

Ne pas stocker uniquement un score sans conserver les signaux qui
permettent de l'expliquer.

## 8.32 --- Memory et Decision Engine

Le Decision Engine doit pouvoir utiliser la mémoire pour améliorer ses
choix.

Exemple :

Fan a refusé deux offres récemment pour raison de prix.

→ éviter de proposer immédiatement une offre plus chère sans
justification.

Autre exemple :

Fan achète régulièrement une catégorie de média.

→ cette catégorie peut recevoir davantage de poids dans Media
Intelligence.

La mémoire informe la décision ; elle ne la dicte pas seule.

## 8.33 --- Memory et Smart Follow-ups

Certaines mémoires peuvent créer une opportunité de follow-up.

Exemple :

**Event tomorrow**

Une fois l'événement passé :

→ Smart Follow-up candidate.

Mais le système doit vérifier :

-   pertinence
-   timing
-   activité du fan
-   règles agence
-   fréquence des relances
-   état de conversation

avant toute action.

## 8.34 --- Memory et Copilot

En Copilot Mode, afficher les souvenirs pertinents à côté de la
conversation.

Ne pas surcharger l'interface.

Prévoir par exemple :

**OmniMemory** - Loves football - Bought X twice - Mentioned interview
Monday

Le chatter peut ainsi reprendre rapidement le contexte.

## 8.35 --- Memory et Full AI

En Full AI, les souvenirs pertinents sont injectés automatiquement dans
le Brain.

L'IA doit rester soumise aux mêmes règles de retrieval et d'Anti-Creepy
Guard.

## 8.36 --- Memory et Imported Conversations

Lors d'un import historique, les informations liées à un fan peuvent
initialiser sa mémoire uniquement lorsque :

-   le fan peut être identifié de manière fiable
-   les données sont suffisamment structurées
-   les règles d'import l'autorisent
-   le confidence threshold est atteint

Ne pas mélanger les souvenirs de fans différents.

## 8.37 --- Memory Versioning

Les modifications importantes doivent être historisées.

Prévoir :

-   created
-   updated
-   confirmed
-   contradicted
-   expired
-   deleted

L'état actuel doit être rapide à récupérer tout en conservant une
traçabilité raisonnable.

## 8.38 --- Privacy & Retention Controls

Prévoir une architecture permettant de gérer :

-   durée de conservation
-   suppression
-   export
-   minimisation
-   données expirées
-   suppression d'un fan
-   suppression d'une créatrice
-   suppression d'une agence

Les politiques exactes devront être définies avant production selon les
obligations applicables et les plateformes utilisées.

## 8.39 --- Memory Metrics

Mesurer en interne :

-   memories per active fan
-   retrieval rate
-   memory usage rate
-   human correction rate
-   incorrect memory rate
-   expired memory rate
-   average retrieval latency
-   AI cost of memory extraction
-   callbacks resulting in engagement
-   memory-related human edits

Ces données permettront d'améliorer le système.

## 8.40 --- Critère de réussite

Fan Memory est réussie lorsque :

-   OmniFlow se souvient réellement des éléments importants
-   le contexte reste cohérent sur plusieurs semaines ou mois
-   les chatters humains retrouvent rapidement les informations utiles
-   Full AI peut reprendre une conversation sans repartir de zéro
-   les souvenirs sont pertinents et non envahissants
-   les informations temporaires expirent
-   les contradictions sont gérées
-   les erreurs peuvent être corrigées
-   la mémoire améliore la relation et les décisions commerciales

# EVERY FAN SHOULD FEEL REMEMBERED, NOT TRACKED.

------------------------------------------------------------------------

## PARTIE 8 --- VALIDÉE COMME SPÉCIFICATION DE FAN MEMORY

La suite du cahier des charges commence avec :

# PARTIE 9 --- FAN INTELLIGENCE & SCORING
