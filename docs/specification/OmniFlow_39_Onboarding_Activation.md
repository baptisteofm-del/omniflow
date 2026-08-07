# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 39 --- ONBOARDING & ACTIVATION

## 39.1 --- Objectif

L'onboarding OmniFlow doit amener une agence de :

``` text
ACCOUNT CREATED
```

à :

``` text
FIRST REAL VALUE
```

le plus rapidement possible.

Le but n'est pas de présenter toutes les fonctionnalités.

Le but est de rendre le Chatting opérationnel.

------------------------------------------------------------------------

## 39.2 --- Activation Definition

Une agence ne doit pas être considérée comme activée uniquement parce
qu'elle a créé un compte.

Activation conceptuelle :

``` text
Agency created
+
Creator configured
+
AI configured
+
Conversation environment available
+
First AI-assisted interaction completed
```

------------------------------------------------------------------------

## 39.3 --- Primary Activation Goal

Premier moment de valeur :

# SEE OMNIFLOW UNDERSTAND A FAN AND GENERATE A HIGH-QUALITY, CREATOR-ALIGNED RESPONSE.

Puis deuxième moment :

# SEE OMNIFLOW MAKE A USEFUL SALES DECISION.

------------------------------------------------------------------------

## 39.4 --- Onboarding Philosophy

``` text
MINIMUM REQUIRED SETUP
↓
FIRST VALUE
↓
ADVANCED CONFIGURATION
```

Ne pas demander 50 paramètres avant que l'utilisateur voie le produit
fonctionner.

------------------------------------------------------------------------

## 39.5 --- Progressive Onboarding

Séparer :

### Required

Ce qui est nécessaire pour démarrer.

### Recommended

Ce qui améliore la qualité.

### Advanced

Ce qui peut être configuré plus tard.

------------------------------------------------------------------------

## 39.6 --- First-Time Flow

Proposition :

``` text
Create Account
↓
Create Agency
↓
Create First Creator
↓
Configure Creator DNA
↓
Choose AI Mode
↓
Configure Commercial Basics
↓
Connect Platform OR Demo Environment
↓
Test Conversation
↓
Enter Inbox
```

------------------------------------------------------------------------

## 39.7 --- Signup

Collecter uniquement les informations nécessaires.

Éviter les formulaires longs avant activation.

------------------------------------------------------------------------

## 39.8 --- Agency Creation

Minimum :

-   agency name
-   timezone
-   primary language
-   owner identity

Les autres paramètres peuvent venir plus tard.

------------------------------------------------------------------------

## 39.9 --- Creator Setup

Créer la première créatrice.

Minimum :

-   display name
-   language
-   basic personality
-   basic chatting style

------------------------------------------------------------------------

## 39.10 --- Creator DNA Quick Setup

Proposer un setup simple avec contrôles compréhensibles.

Exemples :

``` text
Warmth
Flirt
Directness
Sales Aggressiveness
Message Length
Emoji Usage
```

------------------------------------------------------------------------

## 39.11 --- Advanced Creator DNA

Les réglages détaillés restent accessibles après onboarding.

Ne pas forcer l'utilisateur à remplir chaque champ.

------------------------------------------------------------------------

## 39.12 --- AI Style Preview

Pendant configuration, permettre un preview.

Exemple :

``` text
Fan:
"what are you doing tonight?"

OmniFlow preview:
"..."
```

Cela aide l'agence à comprendre immédiatement l'effet des réglages.

------------------------------------------------------------------------

## 39.13 --- Preview Regeneration

L'utilisateur peut modifier un réglage puis régénérer l'exemple.

Objectif :

rendre Creator DNA tangible.

------------------------------------------------------------------------

## 39.14 --- Conversation Import

Proposer l'import de conversations comme option recommandée, pas comme
blocage.

Message produit :

``` text
Import past conversations to help OmniFlow understand the creator and fan context.
```

------------------------------------------------------------------------

## 39.15 --- Import Warning

Expliquer que les conversations servent de contexte et de signal, mais
que les réglages actuels de l'agence restent prioritaires.

------------------------------------------------------------------------

## 39.16 --- Commercial Setup

Pendant onboarding, demander seulement les règles critiques.

Exemples :

``` text
Negotiation allowed?
Maximum discount?
Custom content allowed?
Live sessions allowed?
```

------------------------------------------------------------------------

## 39.17 --- Default Safe Settings

Si l'agence ignore certains paramètres :

utiliser des defaults conservateurs.

Ne pas activer automatiquement des comportements commerciaux risqués.

------------------------------------------------------------------------

## 39.18 --- Script Setup

Ne pas obliger l'agence à créer un script complexe avant première
utilisation.

Options :

``` text
Use starter template
Import/create later
```

------------------------------------------------------------------------

## 39.19 --- Starter Strategy

OmniFlow peut fournir une stratégie de démonstration ou starter flow.

Elle doit être clairement identifiable comme template modifiable.

------------------------------------------------------------------------

## 39.20 --- Media Setup

L'agence peut uploader quelques médias pendant onboarding, mais cela ne
doit pas nécessairement bloquer la découverte de Copilot.

------------------------------------------------------------------------

## 39.21 --- Platform Connection

Si un connecteur réel est disponible :

proposer la connexion.

Sinon :

# DO NOT BLOCK ACTIVATION.

------------------------------------------------------------------------

## 39.22 --- Demo / Mock Environment

Permettre de tester OmniFlow avec une conversation simulée.

C'est essentiel pour :

-   onboarding
-   sales demo
-   QA
-   platform-blocked development

------------------------------------------------------------------------

## 39.23 --- Demo Fan

Créer un fan synthétique.

Exemple de scénarios :

``` text
New Fan
Warm Fan
High Spender
Negotiator
Relationship-heavy Fan
```

------------------------------------------------------------------------

## 39.24 --- Interactive Demo

L'utilisateur doit pouvoir envoyer des messages en tant que fan et
observer :

-   fan analysis
-   memory
-   score
-   AI reply
-   sales decision

------------------------------------------------------------------------

## 39.25 --- Copilot First

Le premier mode présenté devrait généralement être Copilot.

Pourquoi :

-   confiance
-   compréhension
-   contrôle
-   faible risque

------------------------------------------------------------------------

## 39.26 --- Full AI Introduction

Présenter Full AI après que l'utilisateur a compris Copilot.

Ne pas pousser immédiatement l'agence à déléguer toute la conversation.

------------------------------------------------------------------------

## 39.27 --- Full AI Readiness

Avant activation Full AI, vérifier les paramètres nécessaires.

Checklist :

``` text
Creator DNA configured
Pricing rules configured
Commercial permissions configured
Human takeover available
Platform capabilities compatible
```

------------------------------------------------------------------------

## 39.28 --- Full AI Confirmation

Activation Full AI doit être explicite.

Afficher clairement ce que l'IA pourra faire.

------------------------------------------------------------------------

## 39.29 --- Activation Checklist UI

Afficher une checklist visible.

Exemple :

``` text
✓ Agency created
✓ Creator added
✓ AI personality configured
○ Add media
○ Connect platform
○ Run first AI conversation
```

------------------------------------------------------------------------

## 39.30 --- Checklist Progress

La checklist doit montrer la progression sans bloquer inutilement.

------------------------------------------------------------------------

## 39.31 --- Recommended Next Action

À chaque étape, OmniFlow doit proposer une seule action principale.

Éviter un dashboard vide avec 12 CTA concurrents.

------------------------------------------------------------------------

## 39.32 --- Empty Dashboard

Avant données réelles :

afficher un état guidé.

Exemple :

``` text
Your workspace is ready.
Start by creating your first creator.
```

------------------------------------------------------------------------

## 39.33 --- Empty Inbox

Exemple :

``` text
No conversations yet.
Connect a platform or try a demo conversation.
```

------------------------------------------------------------------------

## 39.34 --- Empty Media Library

Exemple :

``` text
Add media to let OmniFlow recommend and sell content.
```

------------------------------------------------------------------------

## 39.35 --- Empty Scripts

Exemple :

``` text
Create your first sales flow or start from an OmniFlow template.
```

------------------------------------------------------------------------

## 39.36 --- Setup Persistence

L'onboarding doit pouvoir être quitté et repris.

Ne pas perdre la progression.

------------------------------------------------------------------------

## 39.37 --- Skip

Permettre de skip les étapes non essentielles.

Les étapes critiques ne doivent pas être contournées si elles sont
nécessaires à une fonctionnalité.

------------------------------------------------------------------------

## 39.38 --- Setup Status

Conceptual state :

``` text
NOT_STARTED
IN_PROGRESS
CORE_COMPLETE
ADVANCED_COMPLETE
```

------------------------------------------------------------------------

## 39.39 --- Activation Events

Capturer :

``` text
signup_completed
agency_created
creator_created
creator_dna_completed
demo_started
first_ai_suggestion_generated
first_ai_message_sent
platform_connected
first_real_conversation
first_sale_tracked
full_ai_enabled
```

------------------------------------------------------------------------

## 39.40 --- Activation Funnel

Dashboard interne produit :

``` text
Visitors
↓
Signup
↓
Agency Created
↓
Creator Created
↓
AI Configured
↓
First AI Interaction
↓
Platform Connected
↓
First Real Conversation
↓
First Sale
```

------------------------------------------------------------------------

## 39.41 --- Drop-Off Analysis

Mesurer où les agences abandonnent.

Exemple :

si beaucoup créent un compte mais ne créent pas de créatrice,
l'onboarding doit être amélioré.

------------------------------------------------------------------------

## 39.42 --- Time to Value

KPI :

``` text
TIME TO FIRST AI VALUE
```

et, plus tard :

``` text
TIME TO FIRST REAL AI-ASSISTED SALE
```

------------------------------------------------------------------------

## 39.43 --- Activation Rate

Définir précisément l'événement d'activation dans analytics.

Ne pas changer la définition sans versionner/interpréter les données.

------------------------------------------------------------------------

## 39.44 --- Demo vs Real Activation

Distinguer :

``` text
DEMO_ACTIVATED
REAL_ACTIVATED
```

------------------------------------------------------------------------

## 39.45 --- Trial

Si un essai est proposé :

le trial doit permettre d'atteindre le moment de valeur.

Ne pas bloquer la fonctionnalité principale avant que l'utilisateur
comprenne son intérêt.

------------------------------------------------------------------------

## 39.46 --- Paywall Strategy

Les limites exactes dépendent du pricing final.

Mais le paywall doit être aligné avec :

-   plans
-   Copilot
-   Full AI
-   usage
-   creators

------------------------------------------------------------------------

## 39.47 --- Upgrade Context

Présenter l'upgrade au moment où l'utilisateur comprend la valeur.

Exemple :

``` text
Unlock Full AI for autonomous conversations.
```

plutôt qu'un pop-up générique immédiatement après signup.

------------------------------------------------------------------------

## 39.48 --- Premium Plan Positioning

L'offre supérieure doit apparaître comme le produit complet,
particulièrement si Full AI y est réservé.

------------------------------------------------------------------------

## 39.49 --- Pricing Transparency

Rappeler clairement :

``` text
subscription
+
applicable 2.5% commission
```

selon le modèle final.

------------------------------------------------------------------------

## 39.50 --- No Surprise Billing

Aucune commission ou condition importante ne doit apparaître pour la
première fois après activation.

------------------------------------------------------------------------

## 39.51 --- Onboarding Education

Expliquer progressivement :

-   Copilot
-   Full AI
-   memory
-   fan scores
-   scripts
-   pricing rules

sans créer une formation interminable.

------------------------------------------------------------------------

## 39.52 --- Contextual Education

Préférer :

``` text
Learn when needed
```

à :

``` text
Watch a 30-minute tutorial before using OmniFlow
```

------------------------------------------------------------------------

## 39.53 --- Tooltips

Utiliser pour les concepts courts.

Ne pas cacher des règles commerciales importantes uniquement dans un
tooltip.

------------------------------------------------------------------------

## 39.54 --- Product Tours

Un tour interactif peut montrer :

-   Inbox
-   fan panel
-   AI suggestion
-   memory
-   sales state

Il doit pouvoir être fermé.

------------------------------------------------------------------------

## 39.55 --- Sample Data

Dans Demo Workspace :

utiliser des données synthétiques clairement identifiées.

Ne jamais mélanger sample data et production analytics.

------------------------------------------------------------------------

## 39.56 --- Demo Reset

Permettre de réinitialiser les scénarios de démo.

------------------------------------------------------------------------

## 39.57 --- Agency Template

Future possibility :

préconfigurer certains settings par type d'agence.

Pas nécessaire au premier MVP.

------------------------------------------------------------------------

## 39.58 --- Creator Template

Possible starter presets :

``` text
Warm
Playful
Direct
Premium
```

Mais ils doivent rester modifiables.

------------------------------------------------------------------------

## 39.59 --- AI Setup Assistant

OmniFlow peut utiliser une IA pour aider l'agence à configurer Creator
DNA.

Exemple :

l'agence décrit la créatrice en langage naturel, OmniFlow propose les
réglages structurés.

------------------------------------------------------------------------

## 39.60 --- AI Configuration Review

Après setup :

afficher un résumé.

Exemple :

``` text
Tone: playful and warm
Sales style: medium
Negotiation: enabled up to 15%
Custom content: enabled
```

------------------------------------------------------------------------

## 39.61 --- Missing Configuration Warnings

Si une feature nécessite une configuration manquante :

expliquer exactement ce qui manque.

------------------------------------------------------------------------

## 39.62 --- Readiness Score

Possible UX :

``` text
Creator setup 80% ready
```

Mais éviter un score artificiel si aucune logique utile derrière.

------------------------------------------------------------------------

## 39.63 --- Multiple Creators

Après activation du premier creator :

l'ajout des suivants doit être beaucoup plus rapide.

------------------------------------------------------------------------

## 39.64 --- Duplicate Settings

Permettre éventuellement de dupliquer certains réglages d'une créatrice
vers une autre.

Toujours demander confirmation avant copier des éléments sensibles.

------------------------------------------------------------------------

## 39.65 --- Team Onboarding

Après owner activation :

inviter :

-   managers
-   chatters

avec permissions adaptées.

------------------------------------------------------------------------

## 39.66 --- Invite Flow

Invitation :

``` text
Email
Role
Creator Scope
```

------------------------------------------------------------------------

## 39.67 --- Team Member First Experience

Un chatter invité doit arriver directement sur son espace utile.

Ne pas lui faire refaire l'onboarding owner.

------------------------------------------------------------------------

## 39.68 --- Permission Education

Lors de l'invitation :

expliquer brièvement les droits accordés.

------------------------------------------------------------------------

## 39.69 --- Billing Onboarding

Collecter les informations de paiement au moment défini par la stratégie
commerciale.

Le produit doit supporter :

-   trial if retained
-   direct paid signup if retained

sans mélanger logique d'activation et logique de sécurité.

------------------------------------------------------------------------

## 39.70 --- Cancellation Is Not Onboarding

Ne pas surcharger cette partie avec le retention/cancellation flow.

Il doit être traité dans le lifecycle/billing approprié.

------------------------------------------------------------------------

## 39.71 --- Error Recovery

Chaque étape d'onboarding doit gérer :

-   API failure
-   upload failure
-   connector failure
-   AI failure

sans faire recommencer tout le parcours.

------------------------------------------------------------------------

## 39.72 --- Platform Connection Failure

Si le connecteur échoue :

proposer :

``` text
Retry
View reason
Continue with Demo
```

------------------------------------------------------------------------

## 39.73 --- AI Preview Failure

Si provider indisponible :

conserver la configuration saisie et permettre retry.

------------------------------------------------------------------------

## 39.74 --- Analytics Privacy

Les événements d'onboarding ne doivent pas contenir inutilement des
conversations ou données privées.

------------------------------------------------------------------------

## 39.75 --- Onboarding Notifications

Limiter les emails d'onboarding.

Possible :

-   welcome
-   incomplete setup reminder
-   trial ending

selon stratégie finale.

------------------------------------------------------------------------

## 39.76 --- Incomplete Setup Reminder

Seulement si utile.

Exemple :

``` text
Your creator is configured. Connect a platform to start using OmniFlow on real conversations.
```

------------------------------------------------------------------------

## 39.77 --- Activation Celebration

Lors du premier vrai moment de valeur :

utiliser un feedback positif discret.

Ne pas transformer le produit premium en interface gamifiée excessive.

------------------------------------------------------------------------

## 39.78 --- First Sale Moment

Quand OmniFlow contribue à une première vente :

cela peut devenir un moment produit important.

Afficher clairement :

-   sale
-   attribution
-   AI mode
-   amount

------------------------------------------------------------------------

## 39.79 --- Onboarding Performance

Les pages d'onboarding doivent être rapides.

Ne pas charger l'ensemble du dashboard avant nécessité.

------------------------------------------------------------------------

## 39.80 --- Mobile

La création de compte et les étapes simples doivent fonctionner sur
mobile.

La configuration avancée peut rester optimisée desktop si nécessaire.

------------------------------------------------------------------------

## 39.81 --- Accessibility

Tous les contrôles d'onboarding doivent être accessibles au clavier et
correctement labellisés.

------------------------------------------------------------------------

## 39.82 --- Security

Un onboarding incomplet ne doit jamais contourner :

-   authorization
-   tenant isolation
-   billing rules
-   platform permissions

------------------------------------------------------------------------

## 39.83 --- Onboarding API

Les endpoints doivent permettre des updates progressifs et idempotents
lorsque pertinent.

------------------------------------------------------------------------

## 39.84 --- Setup Drafts

Les configurations complexes peuvent être enregistrées en draft avant
activation.

------------------------------------------------------------------------

## 39.85 --- Creator Activation

Conceptuellement :

``` text
DRAFT
READY
ACTIVE
ARCHIVED
```

selon architecture finale.

------------------------------------------------------------------------

## 39.86 --- Full AI Activation State

Séparer le statut creator du statut Full AI.

Exemple :

``` text
Creator ACTIVE
Full AI DISABLED
```

------------------------------------------------------------------------

## 39.87 --- Checklist Completion

Ne pas confondre :

``` text
ONBOARDING COMPLETE
```

avec :

``` text
PRODUCT MASTERED
```

------------------------------------------------------------------------

## 39.88 --- Internal Onboarding Dashboard

Admin OmniFlow doit pouvoir voir agrégats :

-   signup
-   activation
-   drop-off
-   time to value
-   connector success

------------------------------------------------------------------------

## 39.89 --- Support Trigger

Si une agence reste bloquée longtemps à une étape critique, elle peut
être identifiée pour support.

------------------------------------------------------------------------

## 39.90 --- No Manual Dependency

Le produit doit pouvoir onboarder une agence sans intervention humaine
systématique.

Le support humain reste disponible mais ne doit pas être obligatoire
pour chaque compte.

------------------------------------------------------------------------

## 39.91 --- Enterprise/High-Value Onboarding

Plus tard, des agences importantes peuvent recevoir un onboarding
assisté.

Architecture produit identique autant que possible.

------------------------------------------------------------------------

## 39.92 --- Onboarding Test Scenarios

Tester :

``` text
New user → Demo
New user → Real connector
User exits midway → returns
Connector fails
AI preview fails
Invitation flow
Multiple creators
Upgrade during onboarding
```

------------------------------------------------------------------------

## 39.93 --- E2E Activation Test

``` text
Signup
↓
Agency
↓
Creator
↓
DNA
↓
Commercial Settings
↓
Demo
↓
Copilot
↓
First AI Send
↓
Activated
```

------------------------------------------------------------------------

## 39.94 --- Activation Acceptance

L'onboarding est réussi lorsque :

-   l'agence comprend rapidement le produit
-   le setup minimal est court
-   Creator DNA est compréhensible
-   Demo permet de tester sans connecteur
-   Copilot démontre la qualité IA
-   Full AI est présenté progressivement
-   les règles commerciales critiques sont configurées
-   la progression est sauvegardée
-   les erreurs ne détruisent pas le setup
-   les événements d'activation sont mesurés

------------------------------------------------------------------------

## 39.95 --- Claude Code Deliverables

Créer :

``` text
/docs/product/ONBOARDING.md
/docs/analytics/ACTIVATION_FUNNEL.md
```

------------------------------------------------------------------------

## 39.96 --- ONBOARDING.md

Documenter :

-   steps
-   required fields
-   optional steps
-   demo flow
-   full AI readiness
-   empty states
-   errors
-   resume behavior

------------------------------------------------------------------------

## 39.97 --- ACTIVATION_FUNNEL.md

Documenter :

-   activation definition
-   events
-   funnel
-   demo vs real activation
-   time-to-value metrics
-   drop-off metrics

------------------------------------------------------------------------

## 39.98 --- Final Principle

L'onboarding ne doit pas montrer tout OmniFlow.

Il doit faire comprendre une chose :

# THIS AI UNDERSTANDS MY CREATOR, MY FAN AND MY SALES OBJECTIVE.

Puis permettre à l'agence d'atteindre cette valeur aussi vite que
possible.

------------------------------------------------------------------------

## PARTIE 39 --- VALIDÉE COMME ONBOARDING & ACTIVATION

La suite du cahier des charges commence avec :

# PARTIE 40 --- SUPPORT, HELP CENTER & CUSTOMER SUCCESS
