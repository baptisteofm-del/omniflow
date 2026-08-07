# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 40 --- SUPPORT, HELP CENTER & CUSTOMER SUCCESS

## 40.1 --- Objectif

OmniFlow doit pouvoir accompagner une agence lorsqu'elle rencontre un
problème sans rendre l'utilisation du produit dépendante d'un support
humain permanent.

Le système doit combiner :

``` text
SELF-SERVICE
+
CONTEXTUAL HELP
+
SUPPORT
+
CUSTOMER SUCCESS
```

------------------------------------------------------------------------

## 40.2 --- Principe

Le support ne doit pas seulement répondre aux bugs.

Il doit aider l'agence à obtenir de la valeur d'OmniFlow.

Deux catégories doivent être distinguées :

``` text
PRODUCT SUPPORT
```

et :

``` text
CUSTOMER SUCCESS
```

------------------------------------------------------------------------

## 40.3 --- Product Support

Couvre notamment :

-   problème de compte
-   problème de connexion plateforme
-   erreur de paiement
-   bug
-   problème de configuration
-   comportement inattendu
-   problème Full AI
-   problème de permissions

------------------------------------------------------------------------

## 40.4 --- Customer Success

Couvre notamment :

-   amélioration de configuration
-   adoption de Copilot
-   passage à Full AI
-   utilisation des scripts
-   optimisation commerciale
-   compréhension des analytics

------------------------------------------------------------------------

## 40.5 --- Help Center

Créer une architecture de centre d'aide permettant de documenter :

``` text
Getting Started
AI Chatting
Creator DNA
Fan Memory
Fan Scores
Scripts
Media
Full AI
Billing
Integrations
Security
Troubleshooting
```

------------------------------------------------------------------------

## 40.6 --- Search

Le Help Center doit être recherchable.

L'utilisateur doit pouvoir saisir une question ou un mot-clé.

------------------------------------------------------------------------

## 40.7 --- Contextual Help

Depuis certaines pages, proposer une aide directement liée au contexte.

Exemple :

depuis Creator DNA :

``` text
How Creator DNA works
```

------------------------------------------------------------------------

## 40.8 --- Empty-State Help

Les états vides peuvent contenir une explication courte et un lien
d'aide.

------------------------------------------------------------------------

## 40.9 --- AI Help Assistant

OmniFlow peut proposer un assistant IA dédié à l'utilisation du produit.

Il doit être séparé du moteur AI Chatting commercial.

------------------------------------------------------------------------

## 40.10 --- Support AI Scope

L'assistant support peut répondre à partir :

-   documentation OmniFlow
-   état fonctionnel autorisé du compte
-   configuration non sensible utile

Il ne doit pas inventer de capacités.

------------------------------------------------------------------------

## 40.11 --- Grounding

Les réponses support doivent être basées sur une documentation
versionnée.

------------------------------------------------------------------------

## 40.12 --- Escalation to Human

Si l'assistant ne peut pas résoudre :

``` text
AI SUPPORT
↓
HUMAN SUPPORT
```

avec transmission du contexte utile.

------------------------------------------------------------------------

## 40.13 --- Support Request

Un ticket doit pouvoir inclure :

-   category
-   subject
-   description
-   agency
-   user
-   relevant entity
-   severity
-   attachments if supported

------------------------------------------------------------------------

## 40.14 --- Automatic Context

Lorsque l'utilisateur ouvre le support depuis une erreur :

joindre automatiquement des références techniques sûres.

Exemples :

-   request ID
-   connector
-   error code
-   timestamp

------------------------------------------------------------------------

## 40.15 --- Privacy

Ne pas joindre automatiquement :

-   secrets
-   credentials
-   contenu privé inutile
-   données sensibles non nécessaires

------------------------------------------------------------------------

## 40.16 --- Support Categories

``` text
ACCOUNT
BILLING
AI
CONVERSATION
PLATFORM
MEDIA
SCRIPT
TEAM
BUG
FEATURE QUESTION
OTHER
```

------------------------------------------------------------------------

## 40.17 --- Severity

``` text
LOW
NORMAL
HIGH
CRITICAL
```

------------------------------------------------------------------------

## 40.18 --- Critical Definition

Exemples :

-   Full AI comportement dangereux
-   impossibilité généralisée d'envoyer
-   incident sécurité
-   erreur de facturation importante
-   perte/corruption de données suspectée

------------------------------------------------------------------------

## 40.19 --- Support Status

``` text
OPEN
IN_PROGRESS
WAITING_FOR_CUSTOMER
RESOLVED
CLOSED
```

------------------------------------------------------------------------

## 40.20 --- Support Timeline

Conserver un historique :

-   creation
-   messages
-   status changes
-   assignment
-   resolution

------------------------------------------------------------------------

## 40.21 --- Internal Notes

Les agents support peuvent avoir des notes internes non visibles par le
client.

------------------------------------------------------------------------

## 40.22 --- Assignment

Les tickets peuvent être assignés à :

-   support
-   technical
-   billing
-   customer success

------------------------------------------------------------------------

## 40.23 --- SLA

L'architecture doit permettre des niveaux de service futurs.

Les SLA commerciaux exacts ne doivent pas être inventés dans le code.

------------------------------------------------------------------------

## 40.24 --- Plan-Based Support

Les plans futurs peuvent proposer des niveaux différents :

``` text
Standard Support
Priority Support
Dedicated Success
```

sans modifier le cœur du système.

------------------------------------------------------------------------

## 40.25 --- In-App Support

Accès support facilement visible depuis l'application.

------------------------------------------------------------------------

## 40.26 --- Support History

L'utilisateur peut consulter ses demandes précédentes.

------------------------------------------------------------------------

## 40.27 --- Status Notifications

Notifier lorsque :

-   support répond
-   information demandée
-   ticket résolu

selon Partie 38.

------------------------------------------------------------------------

## 40.28 --- Incident Linking

Si un ticket correspond à un incident global :

le relier à l'incident.

Éviter que 100 tickets deviennent 100 investigations séparées.

------------------------------------------------------------------------

## 40.29 --- Known Issues

Le Help Center peut afficher les problèmes connus lorsque pertinent.

------------------------------------------------------------------------

## 40.30 --- Status Page

Prévoir une page de statut publique ou semi-publique à terme.

Services possibles :

-   App
-   AI
-   Platform connectors
-   Billing

------------------------------------------------------------------------

## 40.31 --- Incident Communication

En cas d'incident majeur :

communiquer :

``` text
Investigating
Identified
Monitoring
Resolved
```

------------------------------------------------------------------------

## 40.32 --- No False Resolution

Ne jamais marquer un incident résolu uniquement parce qu'une erreur a
disparu temporairement.

------------------------------------------------------------------------

## 40.33 --- Troubleshooting Guides

Créer des guides pour les problèmes fréquents.

Exemples :

-   platform disconnected
-   AI suggestion unavailable
-   media failed
-   billing issue
-   missing conversation

------------------------------------------------------------------------

## 40.34 --- Diagnostic IDs

Les erreurs importantes doivent afficher un identifiant partageable au
support.

------------------------------------------------------------------------

## 40.35 --- Admin Support View

L'admin OmniFlow doit pouvoir voir :

-   agency
-   plan
-   account status
-   relevant usage
-   recent errors
-   connector status
-   billing status

dans les limites d'accès prévues.

------------------------------------------------------------------------

## 40.36 --- Impersonation

Ne pas implémenter une impersonation admin non sécurisée.

Si nécessaire plus tard :

-   permission forte
-   audit
-   reason
-   explicit session state

------------------------------------------------------------------------

## 40.37 --- Data Access

Le support ne doit voir que ce qui est nécessaire à la résolution.

------------------------------------------------------------------------

## 40.38 --- Customer Success Dashboard

À terme, suivre :

-   activation
-   adoption
-   Copilot usage
-   Full AI usage
-   creator count
-   churn signals
-   support volume

------------------------------------------------------------------------

## 40.39 --- Health Score

Un health score agence peut être créé plus tard.

Il doit reposer sur des signaux mesurables.

------------------------------------------------------------------------

## 40.40 --- Possible Health Signals

``` text
Activation
Weekly usage
AI adoption
Platform connection health
Creator activity
Support incidents
Billing health
```

------------------------------------------------------------------------

## 40.41 --- Customer Success Triggers

Exemples :

-   signup non activé
-   Full AI jamais testé
-   connecteur déconnecté plusieurs jours
-   usage en forte baisse
-   nombreux tickets

------------------------------------------------------------------------

## 40.42 --- Human Outreach

Pour certaines agences importantes :

Customer Success peut intervenir proactivement.

Pas obligatoire dans le MVP self-service.

------------------------------------------------------------------------

## 40.43 --- Feedback Collection

Après résolution :

demander éventuellement :

``` text
Did this solve your problem?
```

------------------------------------------------------------------------

## 40.44 --- Support CSAT

Mesurer la satisfaction support sans rendre l'expérience intrusive.

------------------------------------------------------------------------

## 40.45 --- Feature Feedback

Séparer :

``` text
SUPPORT ISSUE
```

de :

``` text
PRODUCT FEEDBACK
```

------------------------------------------------------------------------

## 40.46 --- Feature Requests

Les demandes peuvent être taguées et agrégées.

Ne pas promettre automatiquement leur développement.

------------------------------------------------------------------------

## 40.47 --- Bug Reports

Un bug report utile doit inclure automatiquement, si disponible :

-   app version
-   browser
-   route
-   request IDs
-   timestamp

------------------------------------------------------------------------

## 40.48 --- Screenshot

Permettre éventuellement une capture/upload manuel.

Ne pas capturer automatiquement du contenu privé sans consentement.

------------------------------------------------------------------------

## 40.49 --- Reproduction

Les tickets techniques internes doivent inclure :

``` text
Steps to reproduce
Expected
Actual
Environment
```

------------------------------------------------------------------------

## 40.50 --- Knowledge Base Feedback Loop

Les tickets fréquents doivent alimenter :

-   FAQ
-   documentation
-   UX fixes

------------------------------------------------------------------------

## 40.51 --- Support Volume as Product Signal

Une forte répétition d'un même ticket signifie potentiellement :

``` text
PRODUCT PROBLEM
```

pas seulement :

``` text
SUPPORT PROBLEM
```

------------------------------------------------------------------------

## 40.52 --- AI Quality Complaints

Créer une catégorie spécifique pour :

-   wrong tone
-   bad decision
-   too aggressive
-   too passive
-   memory error
-   pricing issue

------------------------------------------------------------------------

## 40.53 --- AI Feedback Link

Depuis une réponse IA problématique :

permettre de signaler le cas avec son contexte technique.

------------------------------------------------------------------------

## 40.54 --- Benchmark Integration

Les cas AI pertinents peuvent alimenter le dataset d'évaluation après
review/anonymisation appropriée.

------------------------------------------------------------------------

## 40.55 --- Never Auto-Learn From Complaint

Un signalement client ne doit pas modifier automatiquement le
comportement production.

Flux :

``` text
Complaint
↓
Review
↓
Benchmark case
↓
Controlled improvement
```

------------------------------------------------------------------------

## 40.56 --- Billing Support

Les agents doivent pouvoir comprendre :

-   subscription
-   invoice
-   commission
-   payment status

sans modifier arbitrairement les données financières.

------------------------------------------------------------------------

## 40.57 --- Financial Adjustments

Tout crédit/remboursement manuel doit être :

-   autorisé
-   tracé
-   justifié

------------------------------------------------------------------------

## 40.58 --- Cancellation Support

Si un utilisateur veut annuler :

le support ne doit pas créer de friction abusive.

Le flow produit de rétention peut proposer une offre ou recueillir le
motif, puis permettre l'annulation selon les conditions applicables.

------------------------------------------------------------------------

## 40.59 --- Cancellation Reasons

Exemples structurés :

``` text
Too expensive
AI quality
Missing feature
Platform issue
Not using enough
Switching solution
Other
```

------------------------------------------------------------------------

## 40.60 --- Retention Offer

Une offre de rétention peut être proposée selon règles commerciales.

Elle ne doit pas empêcher l'annulation.

------------------------------------------------------------------------

## 40.61 --- Churn Feedback

Les motifs doivent alimenter l'analyse produit.

------------------------------------------------------------------------

## 40.62 --- Offboarding Data

Prévoir clairement ce qu'il advient :

-   conversations
-   media
-   configuration
-   analytics

selon politique de rétention/suppression.

------------------------------------------------------------------------

## 40.63 --- Export

Prévoir les obligations et besoins d'export définis ailleurs.

------------------------------------------------------------------------

## 40.64 --- Documentation Versioning

Les articles doivent avoir :

-   updated_at
-   version/status
-   category

------------------------------------------------------------------------

## 40.65 --- Draft Documentation

Les articles non validés ne doivent pas être exposés comme documentation
officielle.

------------------------------------------------------------------------

## 40.66 --- Search Index

L'index du Help Center doit se mettre à jour lors de
publication/modification.

------------------------------------------------------------------------

## 40.67 --- Support Assistant Sources

L'assistant support doit pouvoir indiquer les articles pertinents
utilisés.

------------------------------------------------------------------------

## 40.68 --- Hallucination Protection

Si la documentation ne répond pas :

dire que l'information n'est pas confirmée et proposer une escalade.

------------------------------------------------------------------------

## 40.69 --- No Product Policy Invention

L'assistant ne doit jamais inventer :

-   remboursement
-   pricing
-   commission
-   limites
-   SLA

------------------------------------------------------------------------

## 40.70 --- Context Permission

L'assistant support ne peut récupérer que les informations accessibles à
l'utilisateur courant.

------------------------------------------------------------------------

## 40.71 --- Support Analytics

Suivre :

``` text
Ticket volume
Category
Time to first response
Time to resolution
Reopen rate
CSAT
AI support resolution rate
```

------------------------------------------------------------------------

## 40.72 --- Customer Success Analytics

Suivre :

``` text
Activation rate
Feature adoption
Account health
Churn
Expansion
```

selon maturité.

------------------------------------------------------------------------

## 40.73 --- Help Center Analytics

Suivre :

-   searches
-   zero-result searches
-   article views
-   helpful/not helpful

------------------------------------------------------------------------

## 40.74 --- Zero-Result Search

Les recherches sans résultat sont un signal documentaire important.

------------------------------------------------------------------------

## 40.75 --- Support Automation

Automatiser seulement les actions sûres.

Exemples :

-   suggest article
-   collect diagnostics
-   categorize ticket

------------------------------------------------------------------------

## 40.76 --- No Unsafe Auto-Fix

L'assistant support ne doit pas :

-   modifier billing
-   supprimer données
-   activer Full AI
-   modifier permissions

sans workflow autorisé.

------------------------------------------------------------------------

## 40.77 --- Support Permissions

Rôles internes séparés si nécessaire :

``` text
SUPPORT
BILLING_SUPPORT
TECH_SUPPORT
ADMIN
```

------------------------------------------------------------------------

## 40.78 --- Audit

Tracer les actions support sensibles.

------------------------------------------------------------------------

## 40.79 --- Data Retention

Définir une politique pour :

-   tickets
-   attachments
-   support messages

------------------------------------------------------------------------

## 40.80 --- Security

Les pièces jointes doivent être :

-   validées
-   limitées
-   stockées de manière sécurisée

------------------------------------------------------------------------

## 40.81 --- Abuse Protection

Protéger les formulaires support contre :

-   spam
-   abusive upload
-   excessive requests

------------------------------------------------------------------------

## 40.82 --- Availability

Même si une partie de l'app est dégradée, l'utilisateur doit idéalement
pouvoir accéder à une voie de support/statut.

------------------------------------------------------------------------

## 40.83 --- MVP Scope

P0/P1 :

``` text
Help Center foundation
In-app support entry
Support request
Ticket status
Contextual diagnostics
Critical escalation
AI-quality feedback
Billing/platform troubleshooting
```

------------------------------------------------------------------------

## 40.84 --- Secondary Scope

P2 :

``` text
AI support assistant
Advanced search
Customer success health
Retention automation
Support analytics
```

------------------------------------------------------------------------

## 40.85 --- Future Scope

P3 :

``` text
Dedicated success workflows
Advanced SLA engine
Multi-channel support
Sophisticated account health scoring
```

------------------------------------------------------------------------

## 40.86 --- Claude Code Deliverables

Créer :

``` text
/docs/support/SUPPORT_ARCHITECTURE.md
/docs/support/HELP_CENTER_STRUCTURE.md
/docs/support/CUSTOMER_SUCCESS.md
```

------------------------------------------------------------------------

## 40.87 --- SUPPORT_ARCHITECTURE.md

Documenter :

-   ticket model
-   statuses
-   categories
-   permissions
-   diagnostics
-   escalation
-   notifications
-   audit

------------------------------------------------------------------------

## 40.88 --- HELP_CENTER_STRUCTURE.md

Documenter :

-   categories
-   search
-   publishing
-   contextual links
-   AI grounding

------------------------------------------------------------------------

## 40.89 --- CUSTOMER_SUCCESS.md

Documenter :

-   activation signals
-   adoption
-   health
-   churn signals
-   intervention strategy

------------------------------------------------------------------------

## 40.90 --- Acceptance Criteria

Cette partie est réussie lorsque :

-   une agence peut trouver de l'aide sans contacter systématiquement un
    humain
-   un ticket contient assez de contexte pour être diagnostiqué
-   les problèmes critiques sont escaladés
-   le support respecte les permissions
-   les problèmes IA peuvent être signalés précisément
-   les cas utiles peuvent alimenter l'amélioration contrôlée
-   les problèmes récurrents améliorent la documentation ou le produit
-   le support n'invente jamais les règles commerciales
-   Customer Success peut mesurer l'adoption
-   l'annulation reste possible sans dark pattern

------------------------------------------------------------------------

## 40.91 --- Final Principle

Le support OmniFlow ne doit pas être seulement :

# "CONTACT US IF SOMETHING BREAKS."

Il doit devenir un système qui aide l'agence à :

# UNDERSTAND.

# FIX.

# ADOPT.

# IMPROVE.

------------------------------------------------------------------------

## PARTIE 40 --- VALIDÉE COMME SUPPORT, HELP CENTER & CUSTOMER SUCCESS

La suite du cahier des charges commence avec :

# PARTIE 41 --- ADMIN BACKOFFICE & INTERNAL OPERATIONS
