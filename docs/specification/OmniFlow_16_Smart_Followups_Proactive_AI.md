# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 16 --- SMART FOLLOW-UPS & PROACTIVE AI

## 16.1 --- Objectif

OmniFlow ne doit pas seulement répondre lorsqu'un fan envoie un message.

Il doit pouvoir détecter les conversations qui méritent d'être relancées
et, lorsque l'agence l'autorise, agir de manière proactive.

Principe :

# DON'T JUST REPLY.

# KNOW WHEN TO RE-ENGAGE.

Le système doit être capable de :

-   détecter une conversation inactive
-   comprendre pourquoi elle s'est arrêtée
-   déterminer si une relance est pertinente
-   choisir le bon objectif
-   choisir le bon moment
-   générer une relance adaptée
-   l'envoyer automatiquement ou demander validation
-   mesurer le résultat
-   apprendre quelles relances fonctionnent

## 16.2 --- Deux niveaux

Prévoir :

### SMART FOLLOW-UP

Relance liée à une conversation ou une action précédente.

### PROACTIVE AI

Initiative conversationnelle déclenchée par un événement ou une
opportunité pertinente, même sans message récent immédiat.

La V1 doit prioriser Smart Follow-ups.

Proactive AI doit être prévue architecturalement et activée uniquement
lorsque les capacités de plateforme le permettent.

## 16.3 --- Configuration agence

Dans AI Control Center :

**Smart Follow-ups** ON / OFF

Mode :

-   AUTO
-   REQUIRE_APPROVAL
-   DISABLED

Paramètres :

-   minimum inactivity
-   maximum inactivity
-   maximum attempts
-   cooldown
-   allowed hours
-   fan segments
-   excluded segments
-   creator-specific overrides
-   commercial follow-up permissions
-   relationship follow-up permissions

## 16.4 --- Follow-up Candidate

Lorsqu'une conversation devient éligible, créer un objet :

# FOLLOW-UP CANDIDATE

Contenant :

-   agency_id
-   creator_id
-   fan_id
-   conversation_id
-   trigger
-   last interaction
-   current state
-   objective candidate
-   eligibility
-   priority
-   scheduled evaluation time

Cela permet de séparer détection et exécution.

## 16.5 --- Triggers

Exemples :

-   conversation inactive
-   offer ignored
-   script step unanswered
-   fan said "later"
-   fan disappeared during negotiation
-   fan previously engaged strongly
-   post-purchase re-engagement
-   high-value fan inactive
-   unresolved conversation
-   creator-defined trigger

Les triggers doivent être structurés.

## 16.6 --- Inactivity

L'inactivité seule n'est pas suffisante.

Le système doit analyser :

-   dernière action
-   dernier message
-   dernier auteur
-   état commercial
-   relation
-   historique des relances
-   fatigue
-   churn risk
-   engagement
-   fan behavior

Exemple :

un fan ayant explicitement refusé une offre ne doit pas recevoir
automatiquement une nouvelle sollicitation commerciale peu après.

## 16.7 --- Follow-up Classification

Avant de relancer, classifier le contexte.

Exemples :

-   RELATIONSHIP_REENGAGEMENT
-   OFFER_REMINDER
-   SCRIPT_RECOVERY
-   NEGOTIATION_RECOVERY
-   POST_PURCHASE
-   HIGH_VALUE_REENGAGEMENT
-   RETURN_LATER
-   CONVERSATION_CONTINUATION
-   DO_NOT_FOLLOW_UP

## 16.8 --- Eligibility Engine

Une relance est autorisée uniquement si :

-   Smart Follow-ups enabled
-   platform supports action
-   fan not excluded
-   cooldown respected
-   max attempts not reached
-   allowed time window
-   no conflicting active workflow
-   no clear opt-out
-   commercial fatigue acceptable
-   agency/creator rules allow it

Les règles déterministes sont vérifiées avant tout appel LLM coûteux.

## 16.9 --- Explicit Refusal

Si le fan a clairement demandé de ne pas être relancé ou a exprimé un
refus applicable :

→ bloquer les relances concernées.

Stocker un signal exploitable par le moteur.

## 16.10 --- Follow-up Objective

Chaque relance doit avoir un objectif explicite.

Exemples :

-   restart conversation
-   continue relationship
-   resume script
-   recover abandoned offer
-   resume negotiation
-   post-purchase engagement

Le Conversation Engine formule ensuite le message.

## 16.11 --- Relationship Follow-up

Une relance ne doit pas nécessairement contenir une vente.

Pour certains fans :

**Relationship Follow-up** peut être plus performant.

Le moteur peut utiliser :

-   conversation récente
-   mémoire pertinente
-   sujet non terminé
-   Model DNA

sans inventer de prétexte.

## 16.12 --- Commercial Follow-up

Si une offre a été ignorée :

le système doit décider entre :

-   reminder
-   different angle
-   relationship
-   wait
-   abandon commercial attempt

Ne pas envoyer automatiquement plusieurs variations de la même vente.

## 16.13 --- Script Follow-up

Le Script Engine peut définir :

-   follow-up delay
-   objective
-   max attempts
-   branch
-   stop condition

Le Follow-up Engine exécute cette logique en coordination avec le Script
Run.

## 16.14 --- Negotiation Follow-up

Si une négociation est inactive :

le moteur doit vérifier :

-   negotiation still active
-   price still valid
-   max rounds
-   cooldown
-   fan context

Puis décider :

-   resume
-   hold
-   stop
-   relationship

## 16.15 --- "Later" Detection

Si un fan indique :

-   later
-   tonight
-   tomorrow
-   after work

le système peut créer un rappel contextuel lorsque l'interprétation
temporelle est suffisamment fiable.

Stocker :

-   extracted time
-   timezone
-   confidence
-   source message

Si ambigu :

→ ne pas inventer un horaire précis.

## 16.16 --- Scheduling

Les relances doivent être gérées par un scheduler fiable.

Ne pas utiliser le LLM pour attendre.

Chaque job doit contenir :

-   execute_at
-   fan
-   conversation
-   trigger
-   rules version
-   status
-   idempotency key

## 16.17 --- Timezone

Respecter :

-   agency timezone
-   creator timezone si nécessaire
-   fan timezone lorsqu'elle est connue de manière fiable
-   platform constraints

Si le fuseau du fan est inconnu, utiliser une stratégie configurée par
l'agence.

## 16.18 --- Allowed Hours

Exemple :

Follow-ups allowed: 09:00--23:00

Si un job devient éligible hors plage :

→ le déplacer au prochain créneau valide selon les règles.

## 16.19 --- Priority Score

Tous les follow-ups ne doivent pas être traités de la même façon.

Créer un Priority Score utilisant éventuellement :

-   Purchase Intent
-   Relationship
-   Spending Potential
-   Churn Risk
-   engagement
-   unfinished commercial state
-   recency
-   previous follow-up response
-   fan value

Ce score aide au tri et au scheduling.

## 16.20 --- High-value Fans

Pour certains fans :

-   higher priority
-   human approval
-   manager notification
-   dedicated strategy

L'agence contrôle ces règles.

## 16.21 --- Maximum Attempts

Définir une limite stricte.

Exemple :

Maximum follow-ups for current sequence = 2.

Après limite :

→ close follow-up sequence.

Une nouvelle séquence ne peut commencer que sur un nouveau contexte
valide.

## 16.22 --- Cooldown

Après une relance sans réponse :

appliquer un cooldown.

Éviter :

-   relances trop rapprochées
-   répétition
-   spam
-   détérioration de la relation

## 16.23 --- Commercial Fatigue

Chaque follow-up commercial peut augmenter le Commercial Fatigue Score.

Si le score devient trop élevé :

→ suspendre les relances commerciales.

Le relationnel peut éventuellement rester autorisé selon les règles.

## 16.24 --- Follow-up Copy

Le Conversation Engine reçoit :

-   objective
-   context
-   Model DNA
-   memory
-   previous message
-   follow-up number
-   commercial constraints

Il génère une formulation naturelle.

Éviter les messages génériques répétés.

## 16.25 --- Memory Use

Une relance relationnelle peut utiliser un souvenir pertinent.

Exemple conceptuel :

reprendre naturellement un sujet dont le fan avait parlé.

Mais appliquer Anti-Creepy Guard.

Ne pas donner l'impression d'une surveillance excessive.

## 16.26 --- Repetition Prevention

Avant envoi :

comparer avec les relances récentes.

Éviter :

-   même phrase
-   même hook
-   même emoji pattern
-   même CTA
-   même offre répétée sans nouveau contexte

## 16.27 --- Full AI

En Full AI :

une relance peut être envoyée automatiquement si :

-   eligible
-   confidence suffisante
-   permissions valides
-   timing valide
-   validator passed

Sinon :

→ approval queue.

## 16.28 --- Copilot

En Copilot :

afficher une section :

# FOLLOW-UPS TO REVIEW

Pour chaque fan :

-   recommended message
-   reason
-   priority
-   last interaction
-   suggested time

Actions :

-   Send
-   Edit
-   Skip
-   Snooze

## 16.29 --- Follow-up Queue

Créer une queue centralisée.

Filtres :

-   creator
-   priority
-   type
-   status
-   scheduled time
-   approval required

Statuts :

-   CANDIDATE
-   SCHEDULED
-   WAITING_APPROVAL
-   SENT
-   SKIPPED
-   CANCELLED
-   EXPIRED
-   FAILED

## 16.30 --- Cancellation

Un follow-up programmé doit être annulé automatiquement si, avant son
exécution :

-   fan répond
-   achat effectué
-   script state change
-   human takeover
-   creator paused
-   Full AI disabled
-   integration disconnected
-   fan excluded

Toujours revalider au moment de l'exécution.

## 16.31 --- Revalidation

Avant d'envoyer :

# RE-CHECK CURRENT STATE.

Un job créé deux heures auparavant peut ne plus être pertinent.

Vérifier :

-   latest message
-   latest purchase
-   current rules
-   current script state
-   current permissions
-   current fatigue

## 16.32 --- Idempotency

Chaque follow-up doit avoir une clé d'idempotence.

Un retry technique ne doit pas envoyer le même message deux fois.

## 16.33 --- Retry

En cas d'erreur technique :

-   retry policy
-   exponential backoff
-   max attempts
-   error logging

Mais avant chaque retry :

vérifier si le message n'a pas déjà été envoyé.

## 16.34 --- Proactive AI Triggers

Architecture future :

-   fan becomes active / online si la plateforme expose légalement et
    techniquement ce signal
-   relevant creator event
-   new media availability
-   fan milestone
-   high churn risk
-   long inactivity
-   unfinished intent

Ne pas construire une dépendance à des données non disponibles via les
intégrations officielles.

## 16.35 --- Online Status

Si une plateforme expose officiellement un statut d'activité utilisable
:

il peut devenir un signal.

Exemple :

High Purchase Intent + Fan active + unfinished conversation

→ increase follow-up priority.

Si la plateforme ne fournit pas ce signal :

ne pas tenter de contourner ses protections.

## 16.36 --- Mass Messages vs Smart Follow-ups

Séparer clairement :

### MASS MESSAGE

Campagne envoyée à un segment.

### SMART FOLLOW-UP

Action individuelle basée sur le contexte du fan.

La V1 doit se concentrer sur le deuxième pour l'intelligence
conversationnelle.

## 16.37 --- Proactive Opportunity Detection

Le système peut périodiquement rechercher :

-   high-intent inactive fans
-   abandoned negotiations
-   abandoned scripts
-   valuable fans at churn risk
-   conversations waiting for action

Puis créer des candidates.

## 16.38 --- Cost Control

Ne pas appeler un modèle premium sur tous les fans périodiquement.

Pipeline :

1.  deterministic filters
2.  database scoring
3.  candidate shortlist
4.  lightweight model if needed
5.  premium reasoning only for ambiguous/high-value cases

Cela protège la marge OmniFlow.

## 16.39 --- Analytics

Mesurer :

-   candidates created
-   follow-ups sent
-   response rate
-   conversion after follow-up
-   revenue after follow-up
-   time to response
-   skip rate
-   approval rate
-   follow-up type performance
-   creator performance
-   segment performance

## 16.40 --- Incremental Revenue

Essayer d'estimer :

**Revenue recovered by Smart Follow-ups**

avec prudence.

Distinguer :

-   transaction survenue après follow-up
-   causalité réellement démontrée

Pour prouver l'incrémentalité, utiliser des groupes de contrôle /
expérimentations lorsque possible.

## 16.41 --- A/B Testing

Tester :

-   timing
-   message strategy
-   follow-up count
-   relationship vs commercial
-   reminder style

Mesurer :

-   response
-   conversion
-   revenue
-   opt-out / negative signal
-   long-term engagement

## 16.42 --- Control Group

Pour certaines expérimentations :

garder un pourcentage de fans éligibles sans follow-up.

Cela permet d'estimer si les relances génèrent réellement du revenu
supplémentaire.

## 16.43 --- Recommendations

OmniFlow peut signaler :

**Your second follow-up generates little incremental revenue.**

ou :

**Relationship re-engagement performs better than direct offer reminders
for this segment.**

ou :

**Most recovered revenue occurs within the first follow-up.**

Toujours afficher sample size et période.

## 16.44 --- Audit

Journaliser :

-   candidate creation
-   reason
-   scheduled time
-   approval
-   edit
-   send
-   cancellation
-   failure
-   resulting response
-   resulting purchase

## 16.45 --- Platform Compliance

Les actions proactives doivent respecter :

-   capacités officielles
-   règles de plateforme
-   permissions
-   limitations de fréquence
-   exigences applicables

Ne pas intégrer de mécanisme conçu pour contourner des limitations
techniques ou anti-spam.

## 16.46 --- Safe Failure

Si le système ne sait pas si une relance est appropriée :

→ WAIT ou → REQUIRE_APPROVAL.

Principe :

# UNCERTAIN PROACTIVITY SHOULD BECOME HUMAN REVIEW, NOT AUTOMATIC SPAM.

## 16.47 --- Dashboard Widget

Ajouter au Dashboard :

### SMART FOLLOW-UPS

-   Scheduled today
-   Waiting approval
-   Sent
-   Responses
-   Recovered revenue
-   Top-performing follow-up strategy

Permettre d'ouvrir la queue.

## 16.48 --- Critère de réussite

Smart Follow-ups & Proactive AI sont réussis lorsque :

-   OmniFlow détecte les conversations oubliées
-   il comprend le contexte avant de relancer
-   il sait quand ne pas relancer
-   les règles agence sont respectées
-   les relances sont personnalisées
-   les doublons sont empêchés
-   une réponse du fan annule les jobs devenus inutiles
-   les relances peuvent fonctionner en Copilot et Full AI
-   leur impact commercial est mesuré
-   OmniFlow peut récupérer du revenu sans transformer le produit en
    moteur de spam

# THE BEST FOLLOW-UP IS NOT THE MOST FREQUENT ONE.

# IT IS THE ONE SENT FOR THE RIGHT REASON AT THE RIGHT MOMENT.

------------------------------------------------------------------------

## PARTIE 16 --- VALIDÉE COMME SPÉCIFICATION DE SMART FOLLOW-UPS & PROACTIVE AI

La suite du cahier des charges commence avec :

# PARTIE 17 --- LEARNING ENGINE, FEEDBACK LOOPS & CONTINUOUS IMPROVEMENT
