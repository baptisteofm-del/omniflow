# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

## PARTIE 0 --- PRÉAMBULE : REBUILD COMPLET

### 0.1 --- Directive principale

OmniFlow existe déjà sous la forme d'un SaaS précédemment développé.

Cependant, cette nouvelle version doit être considérée comme un
**rebuild complet du produit**.

L'objectif n'est pas d'améliorer progressivement l'ancienne version.

L'objectif est de construire **le nouvel OmniFlow V1 sur une base
propre**, conformément exclusivement à ce nouveau cahier des charges.

### 0.2 --- Tout le produit doit être repensé

La refonte concerne notamment :

-   Landing Page
-   authentification si nécessaire
-   onboarding
-   application après connexion
-   navigation
-   dashboard
-   Chatting
-   interface conversations
-   OmniFlow Brain
-   architecture IA
-   paramètres agences
-   Model DNA
-   Fan Memory
-   Fan Intelligence
-   scripts
-   Media Library
-   analytics
-   A/B Testing
-   billing
-   gestion des équipes
-   intégrations
-   base de données si nécessaire
-   UX
-   UI
-   design system
-   responsive
-   animations
-   architecture backend

Il ne faut pas essayer d'adapter artificiellement les anciennes pages au
nouveau produit.

### 0.3 --- Audit avant reconstruction

Avant de commencer le rebuild, Claude Code doit effectuer un audit du
repository actuel.

Identifier :

-   framework actuel
-   architecture
-   dépendances
-   système d'authentification
-   Supabase
-   structure database
-   stockage
-   Stripe
-   variables d'environnement
-   domaines/configuration
-   composants existants
-   APIs existantes
-   services externes
-   infrastructure de déploiement
-   code éventuellement réutilisable

L'objectif n'est **pas de conserver l'ancien produit**.

L'objectif est uniquement d'éviter de reconstruire inutilement une
infrastructure technique saine.

### 0.4 --- Sauvegarde obligatoire

Avant toute suppression ou modification structurelle importante :

**Créer une branche / sauvegarde permettant de restaurer l'ancienne
version.**

Aucune donnée existante ne doit être supprimée irréversiblement sans
validation.

### 0.5 --- Nouvelle source de vérité

À partir du lancement du rebuild :

# CE CAHIER DES CHARGES DEVIENT LA SOURCE DE VÉRITÉ D'OMNIFLOW.

En cas de conflit entre :

**ancien code**

et

**nouveau cahier des charges**

→ **le nouveau cahier des charges gagne systématiquement.**

Claude Code ne doit pas réintroduire une ancienne fonctionnalité
simplement parce qu'elle existe déjà.

### 0.6 --- Philosophie de développement

Ne pas construire les 48 parties simultanément.

Le développement doit suivre les différentes phases définies dans la
roadmap.

Principe :

**BUILD → TEST → VERIFY → VALIDATE → NEXT**

Chaque système critique doit être suffisamment stable avant de
construire les éléments qui en dépendent.

------------------------------------------------------------------------

# PARTIE 1 --- VISION & OBJECTIF D'OMNIFLOW V1

## 1.1 --- Vision long terme

OmniFlow a vocation à devenir :

# **THE OPERATING SYSTEM FOR CREATOR AGENCIES**

À terme, OmniFlow doit permettre à une agence de centraliser ses
principaux pôles :

**Chatting**

**Marketing**

**Recruiting**

**Management**

**Analytics**

**Automation**

L'objectif long terme est de permettre à une agence de piloter une
grande partie de son activité depuis un environnement unique.

## 1.2 --- Mais OmniFlow V1 n'est PAS tout cela

Ne pas construire cette vision complète maintenant.

La première version doit résoudre **un seul problème extrêmement bien**.

# CHATTING.

Marketing, Recruiting, Marketplace et VA Management appartiennent à la
roadmap future.

Ils ne doivent pas détourner les ressources de la V1.

## 1.3 --- Produit initial

OmniFlow V1 est une plateforme de :

# **AI Chatting & Sales Intelligence**

destinée aux agences de créateurs.

Elle doit pouvoir fonctionner selon deux approches :

### COPILOT

OmniFlow assiste les chatters humains.

### FULL AI

OmniFlow peut prendre en charge automatiquement les actions autorisées
par l'agence lorsque l'intégration de la plateforme le permet.

## 1.4 --- OmniFlow n'est pas un chatbot

Point fondamental pour toute l'architecture :

**Ne jamais concevoir OmniFlow comme un simple LLM répondant à des
messages.**

OmniFlow doit être capable de :

**recevoir un message**

↓

**comprendre la situation**

↓

**récupérer la mémoire**

↓

**analyser le fan**

↓

**déterminer l'état de la relation**

↓

**détecter les intentions**

↓

**évaluer une opportunité commerciale**

↓

**choisir une stratégie**

↓

**prendre une décision**

↓

**sélectionner éventuellement un script**

↓

**sélectionner éventuellement un média**

↓

**déterminer un prix autorisé**

↓

**générer une réponse cohérente avec la créatrice**

↓

**agir**

↓

**observer la réaction**

↓

**mettre à jour ses données**

↓

**apprendre des résultats**

## 1.5 --- Boucle fondamentale

Toute l'intelligence d'OmniFlow doit être organisée autour de :

# MESSAGE → COMPRENDRE → DÉCIDER → AGIR → OBSERVER → APPRENDRE

Cette boucle doit guider l'architecture technique du produit.

## 1.6 --- Objectif produit

OmniFlow doit chercher à améliorer la performance commerciale des
conversations tout en conservant une expérience conversationnelle
cohérente.

L'objectif n'est donc pas :

> envoyer le maximum de messages commerciaux.

L'objectif est :

> **prendre la meilleure décision au meilleur moment pour chaque fan.**

Cela signifie notamment qu'OmniFlow doit savoir reconnaître quand :

-   continuer une conversation
-   renforcer la relation
-   attendre
-   commencer une stratégie commerciale
-   lancer un script
-   poursuivre un script
-   relancer
-   gérer une objection
-   négocier lorsque cela est autorisé
-   recommander un média
-   effectuer une vente hors script
-   arrêter de pousser une vente
-   revenir au relationnel
-   escalader vers un humain

## 1.7 --- Différenciation fondamentale

La force d'OmniFlow doit provenir de la combinaison de :

**Model DNA**

-   

**Fan Memory**

-   

**Fan Intelligence**

-   

**Decision Engine**

-   

**Sales Strategy**

-   

**Script Intelligence**

-   

**Media Intelligence**

-   

**Pricing Intelligence**

-   

**Learning Engine**

L'avantage concurrentiel ne doit donc pas dépendre uniquement du LLM
utilisé.

## 1.8 --- Mémoire comme avantage

OmniFlow doit pouvoir conserver une mémoire structurée pour chaque fan.

Positionnement produit potentiel :

> **OmniFlow remembers every fan.**

L'objectif est de résoudre une faiblesse importante des équipes humaines
:   la difficulté à conserver et exploiter correctement l'historique de
    centaines ou milliers de relations.

## 1.9 --- Intelligence commerciale

OmniFlow doit chercher à comprendre notamment :

**Qui est ce fan ?**

**Quelle relation entretient-il avec la créatrice ?**

**Que veut-il actuellement ?**

**Quelle est sa propension à acheter ?**

**Quel est son comportement commercial ?**

**Quels contenus semblent l'intéresser ?**

**Quelle stratégie fonctionne avec lui ?**

**Faut-il vendre maintenant ?**

**Faut-il attendre ?**

**Quel script utiliser ?**

**Quel média proposer ?**

**Quel prix appliquer dans les limites autorisées ?**

**Faut-il relancer ?**

## 1.10 --- KPI principal

North Star Metric :

# **REVENUE PER ACTIVE FAN**

Indicateurs complémentaires indispensables :

-   Revenue per Conversation
-   Conversion Rate
-   PPV Unlock Rate
-   Average Transaction Value
-   Repeat Purchase Rate
-   Fan Retention
-   Script Conversion
-   Conversion per Script Step
-   Follow-up Conversion
-   Revenue AI-Assisted
-   Revenue AI-Autonomous
-   Revenue per Chatter
-   Churn Risk
-   AI Recommendation Acceptance Rate

L'amélioration d'un KPI ne doit pas pouvoir masquer une dégradation
importante des autres.

## 1.11 --- Principe de contrôle

L'agence doit conserver un contrôle important sur le comportement
d'OmniFlow.

Principe :

# **YOUR AGENCY. YOUR RULES. OMNIFLOW INTELLIGENCE.**

OmniFlow apporte l'intelligence.

L'agence définit les limites dans lesquelles cette intelligence peut
fonctionner.

## 1.12 --- Périmètre V1

### IN V1

Chatting\
Copilot\
Full AI\
OmniFlow Brain\
Model DNA\
Fan Memory\
Fan Scores\
Scripts\
Media Library\
Pricing Rules\
Negotiation Rules\
Custom Content Rules\
Smart Follow-ups\
Analytics\
A/B Testing\
Learning\
Benchmark\
Dashboard\
Billing\
Team Management nécessaire au Chatting

### NOT NOW

Marketing Intelligence\
Social Media Management\
Automatic Posting\
Content Editing\
Content Duplication\
Recruiting Outreach\
Recruiting CRM\
Creator Marketplace\
Advanced VA Monitoring

Ces fonctionnalités doivent pouvoir être ajoutées plus tard sans
nécessiter une reconstruction complète de l'architecture.

------------------------------------------------------------------------

## PARTIE 1 --- VALIDÉE COMME BASE DU PRODUIT

Prochaine section :

# **PARTIE 2 --- OFFRES & BUSINESS MODEL**

------------------------------------------------------------------------

# PARTIE 2 --- OFFRES & BUSINESS MODEL

## 2.1 --- Principe général

OmniFlow V1 doit être commercialisé avec **deux offres principales**.

L'objectif est de conserver une structure tarifaire extrêmement simple :

### OMNIFLOW COPILOT

**Humain + Intelligence OmniFlow**

### OMNIFLOW AI

**Automatisation + Intelligence OmniFlow**

La deuxième offre doit constituer l'offre principale et être
visuellement mise en avant sur la Pricing Page.

## 2.2 --- Offre 1 : OmniFlow Copilot

OmniFlow Copilot est destiné aux agences souhaitant conserver leurs
équipes de chatters tout en augmentant leurs performances grâce à
OmniFlow.

L'humain reste responsable de l'envoi final.

OmniFlow fournit notamment :

-   interface de Chatting
-   OmniFlow Brain
-   Fan Memory
-   Fan Intelligence
-   Fan Scores
-   Model DNA
-   analyse des conversations
-   recommandations IA
-   suggestions de réponses
-   recommandations commerciales
-   détection des opportunités de vente
-   recommandations de scripts
-   recommandations de médias
-   recommandations de prix
-   gestion des scripts
-   Media Library
-   analytics
-   dashboard
-   analyse des performances
-   A/B Testing selon les fonctionnalités disponibles
-   outils nécessaires au management des chatters

Le chatter peut accepter, modifier ou ignorer une recommandation
OmniFlow.

Ces actions doivent être enregistrées afin de mesurer notamment :

**AI Recommendation Acceptance Rate.**

## 2.3 --- Offre 2 : OmniFlow AI

OmniFlow AI constitue l'offre premium et l'offre que le produit doit
principalement chercher à vendre.

Elle reprend les fonctionnalités pertinentes de Copilot et ajoute
l'automatisation.

Selon les permissions accordées par l'agence et les capacités offertes
par les plateformes connectées, OmniFlow peut notamment :

-   répondre automatiquement
-   gérer une conversation
-   prendre certaines décisions commerciales
-   déclencher un script
-   avancer dans les différentes étapes d'un script
-   sélectionner un média
-   proposer une vente
-   appliquer les règles de pricing
-   négocier lorsque cela est autorisé
-   effectuer certaines relances
-   détecter une opportunité commerciale
-   revenir au relationnel
-   interrompre une stratégie commerciale
-   transférer une situation à un humain

L'agence doit pouvoir définir précisément le niveau d'autonomie accordé
à OmniFlow.

## 2.4 --- Pricing initial

Les prix exacts doivent rester facilement modifiables depuis
l'administration.

Base de travail initiale :

### OmniFlow Copilot

**99 €/mois**

### OmniFlow AI

**199 €/mois + 2,5 %**

Les montants d'abonnement pourront être modifiés avant le lancement
commercial.

Ils ne doivent donc pas être codés en dur dans l'application.

## 2.5 --- Commission OmniFlow AI

OmniFlow AI applique une commission de :

# **2,5 %**

sur les ventes attribuables au périmètre de vente géré par OmniFlow AI,
selon les données et mécanismes d'attribution effectivement disponibles
via les plateformes connectées.

Le système de billing doit conserver pour chaque transaction attribuée :

-   agence
-   créatrice
-   fan
-   plateforme
-   transaction
-   montant brut
-   devise
-   date
-   origine
-   mode Copilot/AI
-   script éventuel
-   étape éventuelle
-   média éventuel
-   commission applicable
-   montant de commission OmniFlow
-   statut de facturation

## 2.6 --- Attribution des ventes

La logique d'attribution doit être définie explicitement.

Une vente ne doit pas être attribuée arbitrairement à OmniFlow.

Le système doit pouvoir distinguer autant que techniquement possible :

### AI AUTONOMOUS

OmniFlow a réalisé l'action commerciale automatiquement.

### AI ASSISTED

OmniFlow a recommandé l'action mais un chatter humain l'a exécutée.

### HUMAN

L'action a été réalisée indépendamment d'OmniFlow.

Cette distinction doit également apparaître dans les analytics.

## 2.7 --- Commission et Copilot

La V1 doit permettre de configurer séparément la politique de commission
pour :

-   ventes AI Autonomous
-   ventes AI Assisted
-   ventes Human

La configuration commerciale initiale envisagée doit privilégier la
commission de **2,5 % sur les ventes effectivement gérées/attribuées à
OmniFlow AI**.

Ne pas imposer techniquement une commission sur une vente purement
humaine si la politique commerciale ne le prévoit pas.

## 2.8 --- Tracking de la commission

Pour chaque période de facturation :

**Eligible Sales Volume × Commission Rate = OmniFlow Performance Fee**

Exemple :

100 000 € de ventes éligibles × 2,5 % = **2 500 € de commission
OmniFlow**

Cette commission s'ajoute à l'abonnement fixe lorsque le plan concerné
l'exige.

## 2.9 --- Encaissement

Ne pas supposer qu'OnlyFans ou MYM permettront à OmniFlow de prélever
directement 2,5 % au moment de chaque transaction.

Prévoir une architecture compatible avec plusieurs méthodes :

### METHOD A --- DIRECT FEE

Si une plateforme permet officiellement un partage/prélèvement
transactionnel.

### METHOD B --- PERIODIC BILLING

Calcul des ventes éligibles puis facturation périodique de la
commission.

### METHOD C --- USAGE/PERFORMANCE BILLING

Envoi du volume éligible au système de billing puis prélèvement du
montant dû selon la configuration disponible.

L'implémentation finale dépendra des possibilités techniques et
contractuelles des plateformes.

## 2.10 --- Paiement et solvabilité

OmniFlow doit disposer d'un moyen de paiement valide pour les comptes
soumis à des commissions variables.

Prévoir :

-   moyen de paiement enregistré
-   statut du moyen de paiement
-   factures
-   paiements réussis
-   paiements échoués
-   retries
-   notifications
-   historique
-   montant dû
-   statut du compte

Ne jamais supprimer automatiquement des données importantes à la suite
d'un paiement échoué.

Prévoir une logique progressive :

**Payment failed → Retry / Notification → Grace Period → Restrictions
éventuelles → Account intervention**

Les règles exactes seront définies avant production.

## 2.11 --- Comparaison économique

La Pricing Page doit pouvoir expliquer simplement pourquoi la commission
de 2,5 % peut être économiquement attractive.

Base comparative marketing :

**Chatter humain : environ 10 % de commission dans l'hypothèse de
comparaison utilisée**

versus

**OmniFlow AI : 2,5 % de performance fee + abonnement**

À commission seule :

**10 % / 2,5 % = 4×**

La commission variable OmniFlow est donc quatre fois inférieure dans cet
exemple.

Ne jamais afficher comme vérité universelle qu'un chatter coûte
obligatoirement 10 %.

Présenter cette donnée comme un **exemple comparatif**.

## 2.12 --- Calculateur d'économies

Prévoir sur la Pricing Page un calculateur permettant à une agence
d'entrer son volume mensuel de ventes.

Le calculateur doit pouvoir afficher :

-   volume mensuel
-   coût estimatif d'une équipe rémunérée à 10 %
-   coût variable OmniFlow à 2,5 %
-   abonnement OmniFlow
-   coût total OmniFlow
-   économie mensuelle estimée
-   économie annuelle estimée

Plus le volume de ventes augmente, plus **l'économie absolue en euros**
peut devenir importante par rapport à une commission humaine plus
élevée.

Ne pas qualifier cette progression d'« exponentielle » : elle est
proportionnelle aux volumes dans cette comparaison à taux fixes.

## 2.13 --- Transparence du pricing

La commission de 2,5 % ne doit pas être cachée.

Elle doit être présentée clairement dans l'offre concernée et dans les
documents contractuels applicables.

L'objectif marketing est de transformer cette commission en argument :

> \*\*OmniFlow gagne davantage lorsque l'agence génère davantage de ventes
> :   les intérêts économiques sont alignés.\*\*

## 2.14 --- Administration du pricing

Prévoir une configuration permettant de modifier sans redéploiement :

-   prix Copilot
-   prix OmniFlow AI
-   commission par défaut
-   devise
-   périodes de facturation
-   promotions
-   essais éventuels
-   règles de commission
-   exceptions contractuelles
-   plans legacy éventuels

L'architecture doit permettre de faire évoluer le business model
ultérieurement.

------------------------------------------------------------------------

## PARTIE 2 --- VALIDÉE COMME BASE DU BUSINESS MODEL

------------------------------------------------------------------------

# PARTIE 3 --- ARCHITECTURE GÉNÉRALE

## 3.1 --- Objectif architectural

L'architecture d'OmniFlow V1 doit être conçue pour supporter
correctement le produit Chatting actuel tout en permettant l'ajout futur
des autres pôles OmniFlow sans rebuild complet.

La priorité est :

**modularité + fiabilité + sécurité + évolutivité + observabilité.**

Ne pas sur-complexifier inutilement la V1 avec une architecture
distribuée prématurée.

Privilégier une architecture claire, modulaire et maintenable.

## 3.2 --- Architecture logique générale

Organiser le produit autour de domaines fonctionnels séparés :

-   Authentication
-   Agency
-   Users & Roles
-   Creators / Models
-   Platform Connections
-   Fans
-   Conversations
-   Messages
-   OmniFlow Brain
-   Model DNA
-   Fan Memory
-   Fan Intelligence
-   Strategies
-   Scripts
-   Media Library
-   Pricing
-   Follow-ups
-   Analytics
-   Experiments / A/B Testing
-   Learning
-   Benchmark
-   Billing
-   Notifications
-   Audit Logs
-   Administration

Chaque domaine doit avoir des responsabilités clairement définies.

## 3.3 --- Multi-tenant obligatoire

OmniFlow est un SaaS B2B multi-agences.

Toutes les données métier doivent être isolées par agence.

Structure conceptuelle :

**OmniFlow** → Agency\
→ Users\
→ Creators\
→ Fans\
→ Conversations\
→ Scripts\
→ Media\
→ Analytics\
→ Billing

Une agence ne doit jamais pouvoir accéder aux données d'une autre
agence.

L'isolation doit être garantie côté backend/database et ne pas dépendre
uniquement de l'interface frontend.

## 3.4 --- Entité Agency

L'Agency constitue l'entité racine principale du SaaS.

Elle doit notamment contenir :

-   identité de l'agence
-   owner
-   plan
-   statut abonnement
-   configuration billing
-   commission applicable
-   paramètres généraux
-   règles IA globales
-   timezone
-   devise
-   langue
-   plateformes connectées
-   fonctionnalités activées
-   date de création
-   statut du compte

## 3.5 --- Gestion des créatrices

Une agence peut gérer plusieurs créatrices.

Chaque Creator / Model doit disposer de son propre environnement :

-   Model DNA
-   paramètres conversationnels
-   règles commerciales
-   scripts
-   médias
-   fans
-   conversations
-   analytics
-   connexions plateformes
-   permissions
-   configuration Copilot / Full AI

Les données d'une créatrice ne doivent pas contaminer celles d'une
autre.

## 3.6 --- Gestion des utilisateurs

Une agence peut avoir plusieurs utilisateurs.

Prévoir une architecture RBAC extensible.

Rôles initiaux envisagés :

-   Owner
-   Admin
-   Manager
-   Chatter
-   Analyst / Read-only

Les permissions détaillées seront définies dans la partie dédiée.

Le backend doit vérifier les permissions pour chaque action sensible.

## 3.7 --- Architecture frontend

L'application authentifiée doit être séparée conceptuellement de la
landing publique.

Prévoir au minimum :

### Public App

-   Landing Page
-   Pricing
-   Login
-   Signup
-   pages légales
-   pages marketing nécessaires

### Authenticated App

-   Dashboard
-   Chatting
-   Fans
-   Scripts
-   Media Library
-   Analytics
-   Models
-   Team
-   Settings
-   Billing
-   Integrations

La navigation doit pouvoir accueillir ultérieurement :

-   Marketing
-   Recruiting
-   Marketplace
-   VA Management

sans nécessiter de redesign complet.

## 3.8 --- Architecture backend

Le backend doit centraliser la logique métier critique.

Ne jamais faire reposer les règles sensibles uniquement sur le frontend.

Doivent notamment être gérés côté serveur :

-   authentification et autorisations
-   isolation multi-tenant
-   règles agence
-   règles créatrice
-   décisions OmniFlow Brain
-   appels LLM
-   accès aux secrets API
-   scripts
-   pricing
-   négociation
-   actions automatisées
-   commissions
-   analytics critiques
-   logs
-   audit
-   webhooks
-   intégrations plateformes

## 3.9 --- OmniFlow Brain comme service interne

Le Brain doit être conçu comme un module/service interne indépendant de
l'interface utilisateur.

Entrée conceptuelle :

**Conversation Context + Fan State + Creator State + Agency Rules +
Script State + Platform Capabilities**

Sortie conceptuelle :

**Understanding + Scores + Decision + Recommended Action + Generated
Content + Confidence + Reasoning Metadata**

Ne pas exposer au client une chaîne de pensée privée du modèle.

Stocker uniquement des explications opérationnelles structurées
nécessaires à l'audit, par exemple :

-   décision choisie
-   principaux facteurs
-   règles appliquées
-   modèle utilisé
-   score de confiance
-   action exécutée

## 3.10 --- Event-driven internal workflow

Les événements importants doivent pouvoir déclencher des traitements
internes.

Exemples :

**MESSAGE_RECEIVED**

→ analyse\
→ mémoire\
→ scoring\
→ décision\
→ recommandation/action

**SALE_COMPLETED**

→ attribution\
→ analytics\
→ script progression\
→ Fan Memory update\
→ Learning Event\
→ commission tracking

**FAN_ACTIVE**

→ évaluation éventuelle d'un Smart Follow-up

**SCRIPT_STEP_COMPLETED**

→ déterminer la branche suivante

**PAYMENT_FAILED**

→ workflow billing

Créer une couche d'événements suffisamment abstraite pour éviter de
coupler tous les modules entre eux.

## 3.11 --- Traitements synchrones et asynchrones

Séparer :

### Temps réel

Ce qui est nécessaire pour répondre rapidement dans une conversation :

-   récupération contexte
-   scores essentiels
-   décision
-   génération
-   validation des règles
-   action éventuelle

### Asynchrone

Ce qui peut être traité en arrière-plan :

-   résumés longs
-   extraction mémoire secondaire
-   recalcul analytics
-   embeddings
-   analyse globale de scripts
-   A/B Testing analytics
-   Learning Events
-   benchmark
-   notifications non urgentes
-   consolidation des données

L'expérience de Chatting ne doit pas être ralentie par des traitements
non essentiels.

## 3.12 --- AI Provider Abstraction

Créer une couche d'abstraction pour les fournisseurs IA.

Ne pas appeler directement Anthropic depuis toute l'application.

Prévoir un service central capable de gérer :

-   provider
-   model
-   task type
-   prompt version
-   temperature / paramètres compatibles
-   timeout
-   retry
-   fallback
-   coût
-   tokens
-   latence
-   erreurs

Cela permettra de changer de modèle ou de fournisseur sans reconstruire
le produit.

## 3.13 --- Platform Adapter Layer

OnlyFans et MYM doivent être intégrés derrière une couche d'abstraction
commune.

Interface conceptuelle :

-   authenticate / connect
-   fetch creators
-   fetch fans
-   fetch conversations
-   fetch messages
-   send message
-   fetch media
-   send media
-   create paid offer si disponible
-   fetch transactions
-   detect fan activity si disponible
-   webhook/event ingestion si disponible
-   capability discovery

Chaque plateforme possède ensuite son propre adapter.

Exemple :

**PlatformAdapter** → OnlyFansAdapter\
→ MYMAdapter

Ne jamais supposer qu'une fonctionnalité existe sur les deux
plateformes.

## 3.14 --- Capability System

Chaque connexion plateforme doit exposer ses capacités disponibles.

Exemples :

-   READ_MESSAGES
-   SEND_MESSAGES
-   READ_FANS
-   READ_TRANSACTIONS
-   SEND_MEDIA
-   SEND_PAID_MEDIA
-   READ_ONLINE_STATUS
-   RECEIVE_WEBHOOKS
-   AUTOMATED_ACTIONS

L'interface doit adapter les fonctionnalités OmniFlow aux capacités
réellement disponibles.

Si une plateforme ne permet pas une action :

-   ne pas simuler qu'elle est disponible
-   ne pas contourner artificiellement les restrictions
-   désactiver proprement la fonctionnalité
-   expliquer la limitation à l'utilisateur

## 3.15 --- Database

Utiliser la base existante si elle est techniquement saine et adaptée,
sinon prévoir une migration propre.

Si Supabase/PostgreSQL est déjà correctement installé, il peut être
conservé après audit.

Principes :

-   IDs robustes
-   timestamps
-   tenant isolation
-   relations explicites
-   migrations versionnées
-   index adaptés
-   contraintes database
-   soft delete lorsque pertinent
-   auditabilité
-   données financières cohérentes
-   séparation des données structurées et vectorielles lorsque
    nécessaire

Le schéma complet sera défini dans la partie Database & Data
Architecture.

## 3.16 --- Mémoire et recherche sémantique

Prévoir une architecture permettant :

-   mémoire structurée
-   résumés
-   événements importants
-   recherche sémantique
-   récupération de contexte
-   embeddings lorsque pertinents

Ne pas envoyer l'intégralité de l'historique d'un fan au LLM à chaque
message.

Le Memory Engine doit sélectionner le contexte pertinent afin de réduire
:

-   coût
-   latence
-   bruit
-   taille du contexte

## 3.17 --- Media Storage

La Media Library doit utiliser un stockage sécurisé.

Prévoir :

-   fichiers
-   thumbnails
-   métadonnées
-   tags
-   creator ownership
-   permissions
-   prix
-   restrictions
-   données d'analyse
-   références plateforme
-   historique d'utilisation

Les URLs sensibles ne doivent pas être exposées publiquement sans
contrôle d'accès approprié.

## 3.18 --- Jobs / Queue

Prévoir un système de jobs pour les tâches asynchrones et les actions
nécessitant retry.

Exemples :

-   ingestion messages
-   synchronisation plateforme
-   analyse mémoire
-   embeddings
-   analytics
-   Smart Follow-ups
-   notifications
-   billing
-   retries API
-   benchmark jobs

Les jobs critiques doivent être idempotents autant que possible afin
d'éviter les doubles actions.

## 3.19 --- Idempotence des actions commerciales

Une action automatique ne doit pas pouvoir être exécutée deux fois
accidentellement à cause d'un retry réseau.

Exemples :

-   double message
-   double média payant
-   double relance
-   double commission
-   double progression de script

Prévoir des idempotency keys / action IDs pour les opérations sensibles.

## 3.20 --- Real-time

L'interface Chatting doit pouvoir recevoir les nouveaux événements sans
rechargement manuel.

Prévoir une couche temps réel pour :

-   nouveaux messages
-   changements de scores
-   recommandations IA
-   changement de script
-   vente
-   notification
-   transfert humain
-   statut d'action

La technologie exacte doit être choisie après audit de la stack
existante.

## 3.21 --- Observabilité

Chaque composant critique doit produire des données permettant de
comprendre son fonctionnement.

Prévoir :

-   application logs
-   AI logs
-   integration logs
-   errors
-   latency
-   token usage
-   AI cost
-   action status
-   retries
-   failed jobs
-   platform sync status

Les données sensibles ne doivent pas être enregistrées inutilement dans
les logs techniques.

## 3.22 --- Audit Trail

Toute action importante doit être traçable.

Exemples :

-   qui a modifié une règle
-   qui a changé un prix minimum
-   qui a activé Full AI
-   quelle IA a envoyé un message
-   quel script a été déclenché
-   pourquoi une action a été bloquée
-   quelle règle a été appliquée
-   quelle transaction a généré une commission
-   intervention humaine

L'audit trail doit être exploitable depuis l'administration et pour le
debugging.

## 3.23 --- Feature Flags

Prévoir un système de Feature Flags.

Objectifs :

-   activer progressivement Full AI
-   tester de nouvelles fonctionnalités
-   limiter une feature à certaines agences
-   effectuer des bêta tests
-   désactiver rapidement une fonctionnalité problématique

Exemples :

-   FULL_AI_ENABLED
-   SMART_FOLLOWUPS_ENABLED
-   NEGOTIATION_ENABLED
-   AB_TESTING_ENABLED
-   NEW_BRAIN_VERSION_ENABLED

## 3.24 --- Versioning des composants IA

Les éléments critiques doivent être versionnés :

-   prompts
-   strategies
-   scoring logic
-   Brain versions
-   model routing
-   benchmark datasets
-   Model DNA configuration
-   script versions

Chaque décision IA importante doit pouvoir être reliée à la version qui
l'a produite.

## 3.25 --- Environnements

Prévoir au minimum :

### Development

Développement local.

### Staging

Tests réalistes avant production.

### Production

Clients réels.

Les secrets, bases et connexions doivent être séparés autant que
nécessaire.

Full AI doit pouvoir être testé en staging/simulation sans envoyer de
vraies actions commerciales.

## 3.26 --- Simulation Mode

Créer un **Simulation Mode** pour OmniFlow Brain.

Dans ce mode :

OmniFlow analyse une conversation et prend une décision comme en
production, mais aucune action réelle n'est envoyée.

Le système doit enregistrer :

-   décision
-   réponse proposée
-   script proposé
-   média proposé
-   prix proposé
-   scores
-   règles appliquées

Ce mode sera essentiel pour :

-   Benchmark
-   QA
-   tests agence
-   comparaison Copilot / Full AI
-   validation avant activation automatique

## 3.27 --- Sécurité des secrets

Toutes les clés sensibles doivent rester côté serveur :

-   Anthropic / AI providers
-   Stripe
-   Supabase service credentials
-   plateformes connectées
-   webhooks secrets
-   services externes

Aucun secret ne doit être exposé dans le bundle frontend.

## 3.28 --- Architecture extensible vers OmniFlow OS

Même si la V1 concerne uniquement le Chatting, prévoir une structure
permettant d'ajouter ultérieurement :

**Marketing** **Recruiting** **Marketplace** **VA Management**

Ces futurs modules doivent pouvoir partager :

-   Agency
-   Users
-   Creators
-   Permissions
-   Notifications
-   Billing
-   Analytics infrastructure

sans dépendre directement du Chatting.

## 3.29 --- Principe de simplicité

Claude Code doit éviter :

-   microservices inutiles
-   duplication de logique
-   dépendances excessives
-   abstraction sans usage réel
-   architecture complexe uniquement pour anticiper un futur
    hypothétique

Construire une base solide et modulaire, mais adaptée à une V1.

## 3.30 --- Validation de l'architecture avant développement massif

Après audit du repository et avant de reconstruire massivement
l'application, Claude Code doit produire un court document interne :

**ARCHITECTURE_DECISIONS.md**

Il doit contenir :

-   stack retenue
-   éléments existants conservés
-   éléments supprimés/remplacés
-   architecture frontend
-   architecture backend
-   database
-   realtime
-   jobs/queue
-   AI abstraction
-   Platform Adapter Layer
-   stockage
-   billing
-   monitoring
-   principales décisions techniques

Ce document doit permettre de vérifier que l'architecture respecte le
présent cahier des charges avant d'avancer.

------------------------------------------------------------------------

## PARTIE 3 --- VALIDÉE COMME BASE ARCHITECTURALE

Prochaine section :

# **PARTIE 4 --- OMNIFLOW BRAIN**
