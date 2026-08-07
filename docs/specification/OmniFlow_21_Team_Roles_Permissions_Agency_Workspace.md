# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 21 --- TEAM, ROLES, PERMISSIONS & AGENCY WORKSPACE

## 21.1 --- Objectif

OmniFlow est un SaaS destiné à des agences qui peuvent avoir plusieurs :

-   propriétaires
-   managers
-   chatters
-   créatrices
-   collaborateurs

Le produit doit donc être construit autour d'un véritable :

# AGENCY WORKSPACE

et non autour d'un simple compte utilisateur individuel.

Chaque membre doit accéder uniquement aux données, créatrices et actions
nécessaires à son rôle.

Principe :

# ONE AGENCY.

# MULTIPLE PEOPLE.

# PRECISE ACCESS.

## 21.2 --- Tenant principal

L'entité principale du produit est :

# AGENCY

Une Agency possède notamment :

-   users
-   creators
-   platform accounts
-   fans
-   conversations
-   scripts
-   media
-   settings
-   billing
-   analytics
-   AI configuration

Toutes les données métier doivent être reliées à une agence.

## 21.3 --- Agency Object

Champs conceptuels :

-   id
-   name
-   slug
-   owner_user_id
-   status
-   timezone
-   default_currency
-   plan
-   billing_status
-   created_at
-   updated_at

Prévoir une architecture extensible.

## 21.4 --- User ≠ Agency

Un User représente une personne.

Une Agency représente un workspace.

Ne pas mélanger les deux.

Un utilisateur peut potentiellement appartenir à plusieurs agences à
terme.

Prévoir :

# AGENCY MEMBERSHIP

entre User et Agency.

## 21.5 --- Agency Membership

Objet :

``` text
AgencyMembership
```

Contient :

-   user_id
-   agency_id
-   role_id
-   status
-   invited_by
-   joined_at
-   last_active_at

Statuts :

-   INVITED
-   ACTIVE
-   SUSPENDED
-   REMOVED

## 21.6 --- Rôles V1

Prévoir au minimum :

### OWNER

Contrôle complet.

### ADMIN

Administration opérationnelle importante.

### MANAGER

Pilotage des créatrices et performances autorisées.

### CHATTER

Accès principalement aux conversations assignées et Copilot.

### VIEWER / ANALYST

Lecture uniquement selon scope.

Les noms exacts pourront être ajustés dans l'UI.

## 21.7 --- Owner

Permissions typiques :

-   full workspace access
-   billing
-   plans
-   integrations
-   AI settings
-   creators
-   team
-   scripts
-   media
-   analytics
-   Full AI activation
-   permissions
-   delete agency

Les actions irréversibles doivent demander confirmation.

## 21.8 --- Admin

Peut généralement :

-   manage creators
-   manage team selon permission
-   configure scripts
-   manage media
-   view analytics
-   configure AI
-   manage integrations si autorisé

Billing et ownership peuvent rester réservés à Owner.

## 21.9 --- Manager

Peut être assigné à certaines créatrices.

Exemples de permissions :

-   view conversations
-   review Copilot
-   approve AI actions
-   manage scripts
-   manage media
-   view analytics
-   human takeover
-   review follow-ups

Uniquement dans son scope.

## 21.10 --- Chatter

Peut avoir accès à :

-   Inbox
-   assigned creators
-   assigned conversations
-   Copilot suggestions
-   fan context nécessaire
-   approved media
-   scripts

Ne doit pas nécessairement avoir accès à :

-   billing
-   agency-wide revenue
-   integrations
-   sensitive AI configuration
-   team permissions

## 21.11 --- Viewer / Analyst

Lecture uniquement.

Exemples :

-   dashboard
-   analytics
-   reports

Pas d'envoi de message ni modification de configuration.

## 21.12 --- Permission Model

Ne pas coder uniquement :

``` text
if role == OWNER
```

Créer des permissions granulaires.

Exemples :

``` text
agency.view
agency.manage

creator.view
creator.manage

conversation.view
conversation.send
conversation.takeover

script.view
script.create
script.edit
script.publish

media.view
media.upload
media.edit
media.archive

analytics.view

ai.configure
ai.enable_full_ai
ai.approve_action

integration.manage

team.view
team.invite
team.manage

billing.view
billing.manage
```

Les rôles deviennent des ensembles de permissions.

## 21.13 --- Permission Registry

Créer un registre centralisé.

Chaque permission :

-   key
-   description
-   category
-   risk level

Éviter les permissions définies différemment entre frontend et backend.

## 21.14 --- Backend Enforcement

Toutes les permissions critiques doivent être vérifiées côté serveur.

Masquer un bouton dans le frontend ne constitue pas une sécurité.

Exemple :

un chatter ne peut pas appeler directement l'API pour modifier un prix
minimum s'il n'a pas la permission.

## 21.15 --- Creator Scope

En plus du rôle, un membre peut être limité à certaines créatrices.

Exemple :

Manager A: Creator 1 Creator 2

Manager B: Creator 3

Toutes les requêtes doivent appliquer ce scope.

## 21.16 --- Platform Scope

Prévoir éventuellement un scope par plateforme.

Exemple :

un collaborateur peut gérer OnlyFans mais pas MYM.

Pas obligatoire dans l'UI V1 si cela complexifie trop, mais architecture
extensible.

## 21.17 --- Conversation Assignment

Une conversation peut être :

-   unassigned
-   assigned to user
-   assigned to team
-   Full AI
-   Human Takeover

Stocker clairement l'ownership opérationnel.

## 21.18 --- Chatter Assignment

Permettre :

-   manual assignment
-   creator-based assignment
-   queue assignment
-   future automatic assignment

Exemple :

Chatter A → Creator Emma

Toutes les conversations humaines d'Emma peuvent apparaître dans sa
queue.

## 21.19 --- Shift-ready Architecture

Même si la gestion avancée des shifts n'est pas nécessaire en V1,
prévoir :

-   availability
-   active/inactive
-   assigned creator
-   last activity

Cela permettra plus tard :

-   shifts
-   handoffs
-   staffing analytics

## 21.20 --- Human Takeover Ownership

Lorsqu'un utilisateur prend le contrôle :

stocker :

-   taken_over_by
-   timestamp
-   reason
-   expected duration éventuelle

Cela évite que plusieurs personnes pensent gérer la même conversation.

## 21.21 --- Conversation Lock

Prévoir un mécanisme léger pour éviter deux réponses humaines
simultanées.

Exemple :

**Dave is currently viewing / replying**

Ne pas nécessairement bloquer complètement, mais avertir.

Pour une action critique, utiliser un verrouillage approprié.

## 21.22 --- Presence

Prévoir éventuellement :

-   online
-   last active
-   currently in conversation

Cela améliore la collaboration.

Ne pas confondre cette présence interne avec le suivi intrusif du
travail des employés.

## 21.23 --- Team Page

Route :

``` text
/team
```

Afficher :

-   name
-   email
-   role
-   creator scope
-   status
-   last active
-   invitation status

Actions selon permission :

-   Invite
-   Edit Role
-   Change Scope
-   Suspend
-   Remove

## 21.24 --- Invitation

Flow :

1.  authorized user enters email
2.  select role
3.  select creator scope
4.  send invitation
5.  user creates/uses account
6.  membership becomes active

Les invitations doivent expirer.

## 21.25 --- Invite Security

Invitation token :

-   random
-   single use
-   expiration
-   server validated

Ne pas exposer d'informations sensibles dans le lien.

## 21.26 --- Existing User

Si l'adresse possède déjà un compte OmniFlow :

l'invitation ajoute une membership après acceptation.

Ne pas créer de doublon utilisateur.

## 21.27 --- Multiple Agencies

Architecture future :

un utilisateur appartenant à plusieurs agences voit :

# WORKSPACE SWITCHER

Exemple :

``` text
BA Management
Agency Two
Demo Workspace
```

La V1 peut limiter certaines fonctionnalités multi-workspace, mais le
modèle de données doit le permettre.

## 21.28 --- Workspace Switcher

Le workspace actif doit déterminer :

-   routes
-   API scope
-   data
-   permissions
-   billing context

Ne jamais faire confiance uniquement à un `agency_id` envoyé par le
frontend.

Le backend doit vérifier la membership.

## 21.29 --- Creator Management

Route :

``` text
/creators
```

Afficher :

-   creator
-   platforms
-   AI mode
-   managers
-   chatters
-   status
-   revenue summary

## 21.30 --- Creator Detail

Sections :

-   Overview
-   AI Settings
-   Model DNA
-   Platforms
-   Team
-   Scripts
-   Media
-   Analytics

Les onglets visibles dépendent des permissions.

## 21.31 --- Creator Status

Statuts possibles :

-   ACTIVE
-   PAUSED
-   ONBOARDING
-   DISCONNECTED
-   ARCHIVED

Si PAUSED :

Full AI et proactive actions doivent s'arrêter selon les règles
définies.

## 21.32 --- Agency Settings

Route :

``` text
/settings
```

Sections :

-   General
-   AI Control
-   Sales Strategy
-   Integrations
-   Team
-   Billing
-   Security

Chaque section nécessite des permissions.

## 21.33 --- Agency Default + Creator Override

Les réglages suivent souvent :

``` text
Agency Default
      ↓
Creator Override
```

Exemple :

Agency Full AI = Copilot by default.

Creator Emma: Full AI enabled.

L'interface doit montrer clairement si une valeur est :

-   inherited
-   overridden

## 21.34 --- Reset to Agency Default

Pour chaque override :

**Reset to Agency Default**

Cela évite les configurations impossibles à maintenir.

## 21.35 --- Permission Presets

Pour simplifier :

proposer des presets :

-   Owner
-   Admin
-   Manager
-   Chatter
-   Viewer

Puis éventuellement :

**Custom Role**

dans une version plus avancée.

## 21.36 --- Custom Roles --- Architecture

Même si l'UI V1 n'expose pas immédiatement les custom roles, le backend
doit éviter de rendre cette évolution impossible.

Tables possibles :

-   roles
-   permissions
-   role_permissions
-   memberships

## 21.37 --- Approval Permissions

Certaines actions IA nécessitent un approver.

Exemples :

-   custom content
-   unusual price
-   high-value transaction
-   Full AI uncertainty

Définir qui peut approuver :

``` text
ai.approve_action
```

## 21.38 --- Approval Queue Assignment

Une approval request peut être visible par :

-   owner
-   admins
-   assigned manager

selon creator scope.

Éviter d'envoyer une demande à toute l'agence.

## 21.39 --- Script Permissions

Distinguer :

-   create draft
-   edit
-   publish
-   pause

Un chatter peut éventuellement consulter un script sans pouvoir le
publier.

## 21.40 --- Media Permissions

Distinguer :

-   view
-   upload
-   edit metadata
-   edit price
-   archive

Le changement du minimum price doit être réservé à un rôle suffisamment
autorisé.

## 21.41 --- Analytics Permissions

Certains collaborateurs ne doivent pas nécessairement voir :

-   total agency revenue
-   billing
-   profit estimates

Prévoir :

-   creator analytics
-   agency analytics
-   billing analytics

comme permissions distinctes si nécessaire.

## 21.42 --- Billing Permissions

Réserver par défaut :

-   billing.view
-   billing.manage

à Owner / rôles explicitement autorisés.

## 21.43 --- Integration Permissions

Connecter ou déconnecter OnlyFans/MYM est une action critique.

Permission :

``` text
integration.manage
```

Journaliser chaque changement.

## 21.44 --- Full AI Activation Permission

Activer Full AI est une action à fort impact.

Permission spécifique :

``` text
ai.enable_full_ai
```

Afficher confirmation.

## 21.45 --- Audit Log

Créer :

# AUDIT LOG

Événements importants :

-   login security event
-   invitation
-   member removed
-   role changed
-   creator scope changed
-   integration connected/disconnected
-   Full AI enabled/disabled
-   pricing rule changed
-   script published
-   media price changed
-   human takeover
-   billing change

## 21.46 --- Audit Entry

Stocker :

-   agency
-   actor
-   action
-   resource
-   resource_id
-   before
-   after
-   timestamp
-   metadata
-   IP / device info si approprié et conforme

Ne jamais enregistrer des secrets.

## 21.47 --- Audit UI

Route possible :

``` text
/settings/audit
```

Filtres :

-   user
-   action
-   creator
-   date
-   category

Visible uniquement aux rôles autorisés.

## 21.48 --- Authentication

Prévoir une authentification robuste.

Fonctions :

-   email/password ou provider approprié
-   password reset
-   email verification
-   session management

La stack exacte sera définie dans Infrastructure/Auth.

## 21.49 --- MFA

Prévoir l'architecture pour MFA.

Fortement recommandé pour :

-   Owner
-   Admin
-   utilisateurs avec accès intégrations/billing

Peut être déployé progressivement.

## 21.50 --- Session Management

L'utilisateur doit pouvoir :

-   voir sessions actives
-   logout current
-   logout all devices

Pour les actions critiques, une réauthentification peut être demandée.

## 21.51 --- Suspended Member

Si un membre est suspendu :

-   sessions revoked
-   access blocked
-   assignments preserved ou réassignés selon workflow
-   audit event

## 21.52 --- Removed Member

Lorsqu'un membre est supprimé :

ne pas supprimer son historique.

Conserver :

-   messages
-   approvals
-   audit
-   actions

mais retirer l'accès.

## 21.53 --- Ownership Transfer

Prévoir un mécanisme sécurisé futur pour transférer l'ownership.

Nécessite :

-   current owner authorization
-   target active member
-   confirmation
-   audit

## 21.54 --- Delete Agency

Action critique.

Flow :

-   explicit confirmation
-   reauthentication
-   billing check
-   integration disconnect
-   retention/deletion workflow
-   grace period éventuelle

Ne jamais permettre une suppression accidentelle en un clic.

## 21.55 --- Team Activity Analytics

Pour V1, rester centré sur la performance opérationnelle utile.

Exemples :

-   conversations handled
-   Copilot acceptance
-   response time
-   sales attribution

Ne pas construire un système de surveillance intrusive de l'activité des
employés.

## 21.56 --- Future VA Management

Le futur module Marketing pourra intégrer des workflows de tâches VA :

-   assigned tasks
-   expected posts
-   completion status
-   account performance
-   alerts

Le suivi doit être basé sur les actions et résultats de travail
autorisés, pas sur une surveillance cachée des appareils personnels.

## 21.57 --- Notifications

Chaque membre peut recevoir selon rôle :

-   approval requests
-   integration errors
-   script alerts
-   follow-up queue
-   billing issues
-   team invitations

Prévoir préférences de notification.

## 21.58 --- In-app Notifications

Créer un Notification Center.

Chaque notification :

-   type
-   priority
-   resource
-   read/unread
-   created_at

CTA vers l'action correspondante.

## 21.59 --- Email Notifications

Pour événements importants :

-   invitation
-   security
-   billing
-   integration disconnected
-   critical AI issue

Prévoir une couche notification indépendante du provider email.

## 21.60 --- Workspace Onboarding

Après création d'agence :

1.  Agency details
2.  Add creator
3.  Connect platform
4.  Configure Model DNA
5.  Configure AI
6.  Import media/scripts
7.  Invite team
8.  Test
9.  Activate

Afficher progression.

## 21.61 --- Demo Workspace

Prévoir un workspace de démonstration avec données fictives.

Objectifs :

-   onboarding
-   sales demos
-   product exploration

Les données demo doivent être isolées et clairement marquées.

## 21.62 --- Tenant Isolation

Règle critique :

# EVERY BUSINESS QUERY MUST BE TENANT-SCOPED.

Ne jamais récupérer une ressource uniquement par ID sans vérifier
l'agence.

Exemple interdit :

``` text
getConversation(conversation_id)
```

sans vérification de membership/scope.

## 21.63 --- Row Level Security

Si la stack utilise Supabase/Postgres :

évaluer et utiliser Row Level Security lorsque pertinent, en complément
des contrôles backend.

Les politiques doivent être testées.

Ne pas considérer RLS comme remplacement automatique de toute logique
d'autorisation applicative.

## 21.64 --- Service Role

Les credentials backend à privilèges élevés ne doivent jamais être
exposés au navigateur.

Les opérations service-role doivent appliquer explicitement les règles
tenant/permission appropriées.

## 21.65 --- Security Tests

Tester :

-   user from Agency A requests Agency B resource
-   chatter requests billing
-   manager requests unauthorized creator
-   removed member reuses old session
-   invitation token reuse
-   privilege escalation
-   manipulated agency_id

Tous doivent échouer.

## 21.66 --- Critère de réussite

Team, Roles & Agency Workspace sont réussis lorsque :

-   OmniFlow fonctionne comme un vrai workspace agence
-   plusieurs utilisateurs peuvent collaborer
-   les rôles sont granulaires
-   les créatrices peuvent être assignées
-   un chatter ne voit que ce dont il a besoin
-   les actions critiques sont protégées
-   Full AI possède une permission dédiée
-   les changements sont audités
-   un membre supprimé perd immédiatement l'accès
-   aucune agence ne peut accéder aux données d'une autre
-   l'architecture pourra accueillir les futurs modules Marketing et
    Recruitment

# COLLABORATION SHOULD BE SIMPLE.

# ACCESS CONTROL SHOULD BE STRICT.

------------------------------------------------------------------------

## PARTIE 21 --- VALIDÉE COMME SPÉCIFICATION DE TEAM, ROLES, PERMISSIONS & AGENCY WORKSPACE

La suite du cahier des charges commence avec :

# PARTIE 22 --- BILLING, SUBSCRIPTIONS, COMMISSION & PLAN MANAGEMENT
