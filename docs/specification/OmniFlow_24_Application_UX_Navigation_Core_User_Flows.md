# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 24 --- APPLICATION UX, NAVIGATION & CORE USER FLOWS

## 24.1 --- Objectif

L'application connectée OmniFlow doit elle aussi être reconstruite
depuis une base neuve.

Ne pas conserver l'ancienne interface utilisateur comme structure par
défaut.

Objectif :

# BUILD A PREMIUM AI OPERATING INTERFACE FOR AGENCIES.

L'utilisateur doit pouvoir piloter une opération de chatting complexe
sans ressentir la complexité technique du système.

L'expérience doit être :

-   rapide
-   premium
-   claire
-   dense lorsque nécessaire
-   cohérente
-   orientée action
-   fluide

## 24.2 --- Continuité avec la Landing

La transition :

``` text
Landing
→ Signup
→ Onboarding
→ Application
```

doit sembler appartenir au même produit.

Conserver :

-   identité
-   typographie
-   accents
-   surfaces
-   motion language
-   qualité visuelle

L'application doit être légèrement plus fonctionnelle et moins
démonstrative que la landing.

## 24.3 --- Desktop-first

Le produit est principalement un outil de travail agence.

Priorité UX :

1.  desktop
2.  tablet
3.  mobile

Mobile doit permettre :

-   consulter dashboard
-   recevoir alertes
-   approuver
-   lire conversations
-   répondre si nécessaire

Les workflows complexes peuvent rester optimisés desktop.

## 24.4 --- App Shell

Structure recommandée :

``` text
┌──────────────┬───────────────────────────────┐
│              │ Topbar                        │
│ Sidebar      ├───────────────────────────────┤
│              │                               │
│              │ Main Content                  │
│              │                               │
└──────────────┴───────────────────────────────┘
```

Sidebar stable.

Topbar contextuelle.

## 24.5 --- Navigation V1

Navigation principale :

``` text
Dashboard
Inbox
Fans
Scripts
Media
Follow-ups
Analytics
Creators
Team
Integrations
Billing
Settings
```

Regrouper visuellement si nécessaire.

## 24.6 --- Navigation Future-ready

Les futurs piliers :

-   Marketing
-   Recruitment
-   VA Management

pourront être ajoutés comme modules sans casser l'architecture.

Prévoir une navigation modulaire.

## 24.7 --- Sidebar

La Sidebar doit afficher :

-   OmniFlow symbol / wordmark
-   workspace
-   navigation
-   current plan / usage léger si pertinent
-   user profile

Possibilité de collapse.

## 24.8 --- Workspace Switcher

En haut :

``` text
BA Management ▾
```

Si plusieurs workspaces existent :

ouvrir switcher.

Sinon :

afficher simplement le workspace actif.

## 24.9 --- Creator Context

Dans certaines pages :

ajouter un Creator Selector global ou local.

Exemple :

``` text
All Creators ▾
```

Permet de passer rapidement de la vue agence à une créatrice.

## 24.10 --- Platform Context

Filtre :

``` text
All Platforms
OnlyFans
MYM
```

uniquement lorsque pertinent.

## 24.11 --- Topbar

Contenu contextuel :

-   page title
-   filters
-   search
-   notifications
-   help
-   primary action

Éviter une topbar surchargée.

## 24.12 --- Command Search

Prévoir une recherche globale.

Raccourci possible :

``` text
⌘ K / Ctrl K
```

Permet de rechercher :

-   fan
-   creator
-   conversation
-   script
-   media
-   settings

Future :

actions rapides.

## 24.13 --- Dashboard Flow

Après connexion :

``` text
Login
↓
Dashboard
```

L'utilisateur voit immédiatement :

-   revenue
-   sales
-   conversion
-   AI performance
-   opportunities
-   alerts

Si aucune donnée :

→ onboarding state.

## 24.14 --- Inbox

L'Inbox est un écran critique.

Objectif :

gérer efficacement les conversations en :

-   Copilot
-   Full AI
-   Human Takeover

Layout desktop recommandé :

``` text
Conversation List
│
├───────────────┬──────────────────────┬───────────────────
│ Fan List      │ Conversation         │ Intelligence Panel
│               │                      │
```

## 24.15 --- Conversation List

Afficher :

-   fan
-   creator
-   platform
-   last message
-   time
-   unread
-   AI/Human status
-   priority
-   commercial signal éventuel

Filtres :

-   unread
-   assigned to me
-   Full AI
-   Copilot
-   takeover
-   high intent
-   high value

## 24.16 --- Conversation Center

Zone principale :

-   message history
-   media
-   paid offers
-   system markers
-   script events
-   purchases

Les événements internes OmniFlow doivent être visuellement distincts des
messages envoyés au fan.

## 24.17 --- Composer

En Copilot :

composer avec :

-   text input
-   media
-   paid media
-   script actions
-   AI suggestion
-   regenerate
-   send

Actions IA :

-   Improve
-   Shorter
-   More playful
-   More direct

mais uniquement si elles respectent Model DNA et agency rules.

## 24.18 --- Copilot Suggestion

Afficher une suggestion claire.

Actions :

-   Send
-   Edit
-   Regenerate
-   Dismiss

Après edit + send :

enregistrer AI Draft vs Final Sent pour Learning Engine.

## 24.19 --- Full AI Conversation

En Full AI :

l'utilisateur peut observer :

-   latest AI message
-   current objective
-   current strategy
-   script state
-   fan scores

Ajouter CTA :

# TAKE OVER

Action immédiatement accessible.

## 24.20 --- Human Takeover

Après Take Over :

-   Full AI pauses
-   composer humain actif
-   badge visible
-   assignment à l'utilisateur

CTA :

**Return to AI**

selon permissions.

## 24.21 --- Intelligence Panel

Panneau droit :

### Fan

-   scores
-   spend
-   status

### Memory

-   important facts
-   preferences
-   relationship summary

### Sales

-   current strategy
-   script
-   last offer
-   purchase history

### AI

-   current objective
-   confidence
-   recommended next action

Éviter d'afficher le raisonnement interne brut du modèle.

## 24.22 --- Fan Score UI

Scores visuels compacts :

``` text
Purchase Intent      86
Relationship         72
Spending Potential   91
Engagement            80
Churn Risk            24
```

Utiliser barres / indicators cohérents.

## 24.23 --- Why This Action

OmniFlow peut afficher une explication concise :

**Why:** High purchase intent + positive response to current script.

Ne pas afficher de chain-of-thought.

Utiliser des raisons structurées produites par le système.

## 24.24 --- Script State in Conversation

Afficher :

``` text
Script: Premium Flow
Step: 2 / 4
Status: Waiting for Purchase
```

Avec possibilité autorisée de :

-   pause
-   skip
-   stop
-   switch script

## 24.25 --- Media Quick Access

Depuis conversation :

ouvrir Media Drawer.

Filtres :

-   recommended
-   script
-   category
-   purchased/not purchased
-   price

L'IA peut mettre en avant les médias recommandés.

## 24.26 --- Fans Page

Table + recherche.

Filtres :

-   creator
-   platform
-   segment
-   score
-   spend
-   last interaction
-   churn risk

Cliquer → Fan Detail.

## 24.27 --- Fan Detail

Layout :

### Header

-   fan
-   creator
-   platform
-   lifetime spend
-   status

### Tabs

-   Overview
-   Memory
-   Purchases
-   Conversations
-   Scripts
-   Follow-ups
-   AI Activity

## 24.28 --- Memory Editor

Les utilisateurs autorisés peuvent :

-   add fact
-   edit fact
-   remove fact
-   mark important
-   correct wrong memory

Les corrections humaines deviennent prioritaires.

## 24.29 --- Scripts Page

Afficher :

-   active scripts
-   drafts
-   performance
-   creator assignment
-   version
-   status

CTA :

**Create Script**

## 24.30 --- Script Builder UX

Éditeur visuel.

Concept :

``` text
START
  ↓
MESSAGE
  ↓
PAID MEDIA €15
 ├── PURCHASED → STEP 2
 └── NOT PURCHASED → RECOVERY
```

Drag/drop possible si fiable.

Sinon utiliser un builder structuré plus simple.

Priorité à la robustesse.

## 24.31 --- Script Node Editor

Chaque node peut configurer :

-   type
-   text
-   media
-   price
-   delay
-   conditions
-   next branches
-   AI flexibility

## 24.32 --- Script Preview

Bouton :

**Preview Flow**

Affiche le parcours.

Option future :

simulate fan behavior.

## 24.33 --- Script Publish

Workflow :

``` text
Draft
↓
Validate
↓
Publish
```

Avant publication :

vérifier :

-   broken branch
-   missing media
-   invalid price
-   impossible condition
-   no exit path

## 24.34 --- Media Page

Deux modes :

-   Grid
-   Table

Media card :

-   preview
-   title
-   tags
-   target price
-   minimum price
-   performance
-   usage

## 24.35 --- Media Upload

Flow :

1.  upload
2.  preview
3.  categorize
4.  tags
5.  target price
6.  minimum price
7.  creator
8.  save

Possibilité batch upload.

## 24.36 --- Sensitive Media Access

Les médias doivent respecter :

-   creator scope
-   role permission
-   signed URLs / protected access
-   no public bucket exposure

L'UI ne doit pas charger des médias non autorisés.

## 24.37 --- Follow-ups Page

Queue structurée :

-   Waiting Approval
-   Scheduled
-   Sent
-   Skipped

Card :

-   fan
-   creator
-   reason
-   priority
-   proposed message
-   scheduled time

Actions :

-   Approve
-   Edit
-   Skip
-   Snooze

## 24.38 --- Analytics

Navigation analytics :

-   Overview
-   Scripts
-   Media
-   Pricing
-   Negotiation
-   Follow-ups
-   AI vs Human

Éviter une page géante unique.

## 24.39 --- Creators Page

Cards/table.

Afficher :

-   creator
-   platform
-   status
-   AI mode
-   revenue
-   team

CTA :

**Add Creator**

## 24.40 --- Creator Onboarding

Flow :

1.  creator identity
2.  platform
3.  Model DNA
4.  agency defaults
5.  scripts
6.  media
7.  team
8.  AI mode
9.  test
10. activate

Permettre Save & Continue Later.

## 24.41 --- AI Control Center

Page ou section critique.

Route possible :

``` text
/settings/ai
```

Sections :

-   AI Mode
-   Personality
-   Sales Strategy
-   Memory
-   Negotiation
-   Follow-ups
-   Custom Requests
-   Autonomy
-   Safety / Limits

## 24.42 --- AI Mode Control

Selector :

``` text
COPILOT
FULL AI
```

Full AI nécessite permission.

Afficher clairement ce que le mode autorise.

## 24.43 --- Personality Controls

Paramètres UI :

-   tone
-   vocabulary
-   message length
-   emoji
-   punctuation
-   flirt intensity
-   relationship warmth
-   directness
-   sales aggressiveness

Préférer :

-   sliders
-   presets
-   examples

plutôt que 50 champs texte.

## 24.44 --- Live Style Preview

Lorsque les paramètres changent :

afficher un exemple généré.

Exemple :

``` text
Fan:
"I missed you"

OmniFlow Preview:
"..."
```

Cela aide l'agence à comprendre le résultat.

## 24.45 --- Advanced Settings

Les réglages complexes peuvent être sous :

**Advanced**

Éviter d'effrayer un nouvel utilisateur.

## 24.46 --- Integration Page

Cards :

### OnlyFans

Status Capabilities Creator

### MYM

Status Capabilities Creator

Actions :

-   Connect
-   Reconnect
-   Manage
-   Disconnect

## 24.47 --- Integration Capability UI

Afficher :

``` text
Messages          ✓
Media             ✓
Transactions      ✓
Full AI           ✓ / unavailable
```

selon données réelles.

## 24.48 --- Team Page

Voir Partie 21.

UX :

-   invite
-   role
-   creator access
-   status

Simple et lisible.

## 24.49 --- Billing Page

Voir Partie 22.

Mettre en avant :

-   plan
-   current usage
-   2.5% fee
-   estimated current invoice
-   ROI comparison

## 24.50 --- Notifications Center

Bell icon.

Catégories :

-   AI
-   Sales
-   Follow-up
-   Integration
-   Billing
-   Team

Priorité visuelle.

## 24.51 --- Critical Alerts

Une alerte critique ne doit pas être noyée dans les notifications.

Exemple :

**OnlyFans connection lost --- Full AI paused.**

Afficher :

-   banner
-   CTA reconnect

## 24.52 --- Toasts

Pour actions immédiates :

-   Saved
-   Script published
-   Follow-up scheduled
-   Member invited

Les erreurs importantes doivent fournir une action claire.

## 24.53 --- Empty States

Chaque page doit avoir un état vide utile.

Exemple Media :

**Your media library is empty. Upload your first content so OmniFlow can
recommend and sell it.**

CTA :

**Upload Media**

## 24.54 --- Loading States

Utiliser :

-   skeleton
-   local spinners
-   optimistic UI lorsque sûr

Éviter les écrans blancs.

## 24.55 --- Error States

Toujours expliquer :

-   ce qui s'est passé
-   impact
-   action possible

Exemple :

**We couldn't sync the latest conversations. Your existing data is still
available. Retry sync.**

## 24.56 --- Unsaved Changes

Pour settings complexes :

avertir avant navigation si modifications non sauvegardées.

## 24.57 --- Auto-save

Utiliser auto-save seulement lorsque le comportement est clair.

Pour les changements à fort impact :

-   Full AI
-   pricing
-   minimum prices
-   integration

préférer Save / Confirm explicite.

## 24.58 --- Confirmation Modals

Réserver aux actions à risque :

-   enable Full AI
-   disconnect platform
-   archive creator
-   delete script
-   change critical pricing rule

Ne pas demander confirmation pour chaque action banale.

## 24.59 --- Global Search

Recherche avec résultats groupés :

``` text
Fans
Creators
Conversations
Scripts
Media
```

Permissions appliquées.

## 24.60 --- Keyboard Productivity

Pour Inbox :

raccourcis possibles :

-   next conversation
-   previous conversation
-   send
-   open media
-   take over

Les raccourcis doivent être documentés et non dangereux.

## 24.61 --- URL State

Les filtres importants doivent pouvoir être reflétés dans l'URL lorsque
pertinent.

Cela permet :

-   refresh
-   share internal link
-   back button

## 24.62 --- Deep Links

Une notification doit ouvrir directement :

-   conversation
-   follow-up
-   integration
-   billing issue

Pas uniquement le Dashboard.

## 24.63 --- Breadcrumbs

Utiliser seulement dans les zones profondes.

Exemple :

``` text
Scripts / Premium Flow / Version 3
```

Pas nécessaire partout.

## 24.64 --- Design Density

Prévoir une densité adaptée à un outil professionnel.

Dashboard :

spacieux.

Inbox :

plus dense.

Tables :

compactes mais lisibles.

Settings :

structurés.

## 24.65 --- Visual Hierarchy

Chaque écran doit avoir :

1.  context
2.  key information
3.  primary action
4.  secondary detail

Éviter que tout ait le même poids visuel.

## 24.66 --- AI Visual Language

Utiliser une identité spécifique pour les actions IA :

-   subtle glow
-   AI icon
-   animated indicator
-   status

Mais ne pas transformer chaque élément en « AI gradient ».

## 24.67 --- AI Thinking State

Lorsqu'OmniFlow traite :

afficher un état court :

-   Analyzing
-   Preparing response
-   Checking rules

Ne pas afficher de chain-of-thought.

## 24.68 --- AI Decision Timeline

Dans les détails avancés :

afficher une timeline structurée :

``` text
10:42 Message received
10:42 Intent: High Purchase Interest
10:42 Strategy: Continue Script
10:43 Offer sent
10:45 Purchase confirmed
```

Très utile pour audit.

## 24.69 --- Explainability

L'interface doit expliquer suffisamment pour créer de la confiance.

Afficher :

-   objective
-   rule used
-   score
-   reason summary

Pas :

-   raisonnement privé détaillé du LLM
-   token-level internals

## 24.70 --- First Value

Le produit doit amener rapidement à une démonstration de valeur.

Objectif onboarding :

``` text
Connect/Create Demo
↓
Configure Creator
↓
Import Script/Media
↓
Test Conversation
↓
See OmniFlow Decide
```

L'utilisateur doit voir l'intelligence du produit avant une
configuration interminable.

## 24.71 --- Test Playground

Créer un environnement :

# AI PLAYGROUND

L'agence peut simuler un fan.

Elle écrit :

**"that's too expensive"**

OmniFlow affiche :

-   understanding
-   scores/context
-   decision
-   response
-   potential action

Sans envoyer sur la plateforme.

## 24.72 --- Playground Benefits

Permet :

-   tester Model DNA
-   tester scripts
-   tester pricing
-   tester objections
-   rassurer avant Full AI
-   benchmark manuel

Très important pour adoption.

## 24.73 --- Full AI Activation Flow

Avant première activation :

1.  platform connected
2.  creator configured
3.  Model DNA ready
4.  rules ready
5.  pricing valid
6.  media/scripts valid
7.  Playground test
8.  confirmation
9.  Full AI enabled

Afficher checklist.

## 24.74 --- Full AI Safety Banner

Lors de l'activation :

résumer :

-   what AI can do
-   pricing limits
-   negotiation
-   follow-ups
-   human takeover

CTA :

**Enable Full AI**

## 24.75 --- First Full AI Monitoring

Après activation initiale :

recommander une période de surveillance.

UI :

**Full AI is live**

Afficher :

-   conversations handled
-   actions
-   approvals
-   sales

Permettre Take Over rapidement.

## 24.76 --- Onboarding Progress

Progress bar :

``` text
Workspace      ✓
Creator        ✓
Integration    ✓
AI Profile     ✓
Scripts        60%
Media          ✓
Test           —
```

Ne pas forcer les étapes non indispensables avant exploration.

## 24.77 --- Help System

Prévoir :

-   tooltips
-   contextual help
-   docs links
-   onboarding hints

Les concepts complexes doivent être expliqués simplement.

## 24.78 --- Tooltips

Utiliser pour :

-   Purchase Intent
-   Churn Risk
-   AI Coverage
-   Commission
-   Attribution

Éviter les paragraphes dans l'interface principale.

## 24.79 --- Feedback

Ajouter un moyen simple de signaler :

-   bad AI response
-   wrong memory
-   wrong decision

Cela alimente Learning Engine.

## 24.80 --- Product Feedback

Menu :

**Send Feedback**

Catégories :

-   Bug
-   Feature Request
-   AI Quality
-   Other

Future integration support.

## 24.81 --- Responsive Inbox

Mobile :

``` text
Conversation List
→ tap
Conversation
→ drawer
Fan Intelligence
```

Ne pas essayer d'afficher les trois colonnes simultanément.

## 24.82 --- Mobile Approval

Les approvals doivent être excellentes sur mobile.

Card :

-   fan
-   reason
-   proposed action
-   amount
-   approve / reject

Important pour managers.

## 24.83 --- Accessibility

Application :

-   keyboard navigation
-   focus states
-   labels
-   semantic structure
-   contrast
-   reduced motion

Les graphiques doivent avoir des valeurs accessibles autrement que par
couleur.

## 24.84 --- Performance

Inbox et Dashboard doivent rester rapides avec beaucoup de données.

Prévoir :

-   pagination / virtualization
-   query caching
-   optimistic updates
-   background refresh
-   lazy panels

## 24.85 --- Real-time Events

Lorsque possible :

-   new message
-   purchase
-   AI action
-   approval

doivent apparaître sans refresh manuel.

Utiliser une architecture temps réel adaptée.

## 24.86 --- Stale Data

Si la plateforme n'est pas synchronisée :

afficher clairement :

**Last sync: X minutes ago**

Éviter de prendre des décisions sur des données silencieusement
obsolètes.

## 24.87 --- Application Rebuild Order

Ordre recommandé pour Claude Code :

1.  Design System
2.  App Shell
3.  Authentication / Workspace
4.  Dashboard shell
5.  Creator management
6.  AI Control Center
7.  Inbox
8.  Fan Intelligence
9.  Scripts
10. Media
11. Follow-ups
12. Analytics
13. Integrations
14. Team
15. Billing
16. Playground
17. Notifications
18. responsive polish
19. accessibility
20. performance

Cet ordre peut être adapté aux dépendances backend.

## 24.88 --- No Legacy UI Constraint

Claude Code doit comprendre explicitement :

# DO NOT PATCH THE OLD CONNECTED APP.

La nouvelle application doit être reconstruite.

Réutiliser seulement :

-   infrastructure saine
-   backend utile
-   database migrations utiles après audit
-   auth si correcte
-   assets validés

L'interface, navigation et architecture UX doivent suivre ce nouveau
cahier des charges.

## 24.89 --- Critère de réussite

L'application UX est réussie lorsque :

-   un owner peut piloter l'agence rapidement
-   un chatter comprend immédiatement quoi faire
-   Copilot est rapide à utiliser
-   Full AI reste observable et contrôlable
-   Take Over est immédiat
-   Fan Intelligence est visible sans surcharger
-   Scripts et Media sont accessibles depuis la conversation
-   les settings complexes restent compréhensibles
-   l'utilisateur peut tester l'IA avant activation
-   la navigation peut accueillir les futurs piliers OmniFlow
-   le design paraît premium et cohérent avec la landing
-   aucune dépendance UX majeure à l'ancienne application n'est
    conservée

# COMPLEX SYSTEM.

# SIMPLE CONTROL.

------------------------------------------------------------------------

## PARTIE 24 --- VALIDÉE COMME SPÉCIFICATION DE L'APPLICATION UX, NAVIGATION & CORE USER FLOWS

La suite du cahier des charges commence avec :

# PARTIE 25 --- TECHNICAL ARCHITECTURE, DATABASE, SECURITY & DEPLOYMENT
