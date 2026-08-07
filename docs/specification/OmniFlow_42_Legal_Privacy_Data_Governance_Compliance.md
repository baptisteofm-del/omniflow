# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 42 --- LEGAL, PRIVACY, DATA GOVERNANCE & COMPLIANCE

## 42.1 --- Objectif

OmniFlow traite potentiellement des données commerciales,
conversationnelles, personnelles et des médias provenant de plateformes
tierces.

L'architecture doit donc intégrer dès la conception :

``` text
PRIVACY
SECURITY
DATA GOVERNANCE
TRACEABILITY
PLATFORM COMPLIANCE
```

Cette partie définit des exigences produit et techniques.

Elle ne remplace pas la validation juridique par un professionnel
compétent avant lancement.

------------------------------------------------------------------------

## 42.2 --- Privacy by Design

La confidentialité ne doit pas être ajoutée après construction.

Chaque nouvelle feature doit répondre à :

-   quelles données sont utilisées ?
-   pourquoi ?
-   où sont-elles stockées ?
-   combien de temps ?
-   qui peut y accéder ?
-   sont-elles nécessaires ?

------------------------------------------------------------------------

## 42.3 --- Data Minimization

Ne collecter et conserver que les données nécessaires au fonctionnement
légitime du produit.

------------------------------------------------------------------------

## 42.4 --- Purpose Limitation

Les données collectées pour une fonction ne doivent pas être
automatiquement réutilisées pour une finalité différente sans base
appropriée.

------------------------------------------------------------------------

## 42.5 --- Data Categories

Maintenir une cartographie au minimum des catégories suivantes :

``` text
ACCOUNT DATA
AGENCY DATA
CREATOR DATA
FAN DATA
CONVERSATION DATA
MEDIA
TRANSACTION DATA
AI DATA
SUPPORT DATA
SECURITY / AUDIT DATA
BILLING DATA
```

------------------------------------------------------------------------

## 42.6 --- Data Inventory

Créer un inventaire indiquant pour chaque catégorie :

-   source
-   purpose
-   storage
-   retention
-   access
-   processor/provider
-   deletion behavior

------------------------------------------------------------------------

## 42.7 --- Data Ownership Model

Distinguer clairement :

``` text
OmniFlow account data
Agency-controlled operational data
Third-party platform data
OmniFlow-generated analytics/metadata
```

Le modèle exact doit être validé juridiquement.

------------------------------------------------------------------------

## 42.8 --- Tenant Isolation

Les données d'une agence ne doivent jamais être accessibles à une autre
agence.

Cette règle s'applique à :

-   database
-   storage
-   cache
-   vector/memory system
-   search
-   analytics
-   logs
-   notifications
-   AI context

------------------------------------------------------------------------

## 42.9 --- Creator Isolation

Les permissions creator-level doivent être respectées lorsqu'elles
existent.

------------------------------------------------------------------------

## 42.10 --- Fan Memory Isolation

Une mémoire fan doit être liée au bon tenant et au bon contexte
créatrice/fan.

Aucune mémoire ne doit fuiter vers une autre conversation.

------------------------------------------------------------------------

## 42.11 --- AI Context Privacy

Avant chaque appel LLM :

envoyer uniquement les données nécessaires à la tâche.

------------------------------------------------------------------------

## 42.12 --- AI Provider Review

Pour chaque fournisseur IA, documenter :

-   données envoyées
-   rétention fournisseur
-   training policy applicable
-   région si disponible
-   security terms
-   contractual terms

------------------------------------------------------------------------

## 42.13 --- No Secret in Prompts

Ne jamais injecter :

-   API secrets
-   service role keys
-   passwords
-   private infrastructure credentials

dans les prompts.

------------------------------------------------------------------------

## 42.14 --- Sensitive Content

Le système peut traiter des conversations et médias à caractère adulte.

Cela impose une revue spécifique :

-   fournisseurs utilisés
-   conditions d'utilisation
-   stockage
-   modération
-   accès interne
-   obligations légales applicables

avant production.

------------------------------------------------------------------------

## 42.15 --- Provider Compatibility

Ne pas utiliser un fournisseur si ses conditions interdisent le cas
d'usage réel d'OmniFlow.

Claude Code doit signaler :

``` text
LEGAL / PROVIDER REVIEW REQUIRED
```

si non confirmé.

------------------------------------------------------------------------

## 42.16 --- Platform Terms

OnlyFans, MYM ou toute autre plateforme doivent être intégrés uniquement
via une méthode autorisée et compatible avec leurs règles applicables.

------------------------------------------------------------------------

## 42.17 --- No Unauthorized Workaround

Ne pas construire comme solution production :

-   contournement d'authentification
-   scraping interdit
-   mécanisme visant à contourner les protections de plateforme
-   automatisation non autorisée

------------------------------------------------------------------------

## 42.18 --- Platform Capability Registry

Pour chaque plateforme :

``` text
Capability
Technical Method
Authorization Status
Terms Review Status
Risk
```

------------------------------------------------------------------------

## 42.19 --- Integration Gate

Avant activation réelle d'un connecteur :

``` text
TECHNICAL VALIDATION
+
SECURITY VALIDATION
+
TERMS / LEGAL VALIDATION
```

------------------------------------------------------------------------

## 42.20 --- GDPR / Applicable Privacy Law

OmniFlow doit être conçu pour permettre le respect du RGPD et des autres
règles applicables selon :

-   société exploitante
-   localisation
-   clients
-   personnes concernées
-   fournisseurs

La qualification juridique exacte doit être validée professionnellement.

------------------------------------------------------------------------

## 42.21 --- Controller / Processor Mapping

Déterminer juridiquement les rôles d'OmniFlow et de l'agence selon
chaque traitement.

Ne pas hardcoder une qualification juridique non validée dans le
produit.

------------------------------------------------------------------------

## 42.22 --- Data Processing Agreement

Prévoir la capacité commerciale/opérationnelle à fournir les accords de
traitement nécessaires si applicables.

------------------------------------------------------------------------

## 42.23 --- Subprocessor Registry

Maintenir une liste des sous-traitants pertinents.

Exemples potentiels selon stack :

-   hosting
-   database
-   AI
-   email
-   billing
-   monitoring

------------------------------------------------------------------------

## 42.24 --- Privacy Policy

Avant production publique :

publier une politique de confidentialité adaptée au fonctionnement réel
du produit.

------------------------------------------------------------------------

## 42.25 --- Terms of Service

Avant production commerciale :

préparer les conditions applicables au SaaS.

Elles doivent notamment refléter correctement :

-   abonnement
-   commission
-   acceptable use
-   responsabilités
-   suspension
-   résiliation

selon validation juridique.

------------------------------------------------------------------------

## 42.26 --- Commission Disclosure

Le taux de commission de 2,5 % doit être présenté clairement dans le
parcours commercial et contractuel applicable.

Ne pas le cacher uniquement dans des conditions longues.

------------------------------------------------------------------------

## 42.27 --- Billing Consent

Conserver la preuve appropriée de l'acceptation des conditions de
facturation lorsque nécessaire.

------------------------------------------------------------------------

## 42.28 --- Terms Versioning

Enregistrer :

``` text
terms_version
accepted_at
user/account
```

selon besoin juridique.

------------------------------------------------------------------------

## 42.29 --- Policy Versioning

Versionner :

-   Terms
-   Privacy Policy
-   DPA
-   Acceptable Use

si applicable.

------------------------------------------------------------------------

## 42.30 --- Consent Is Not Universal Legal Basis

Ne pas utiliser techniquement "consent=true" comme solution générique à
toutes les questions de traitement.

La base juridique dépend du traitement réel.

------------------------------------------------------------------------

## 42.31 --- Data Subject Requests

Prévoir des workflows permettant de traiter, selon obligations
applicables :

-   access
-   correction
-   deletion
-   portability
-   restriction

------------------------------------------------------------------------

## 42.32 --- Request Verification

Avant action sensible :

vérifier correctement l'identité/l'autorité du demandeur.

------------------------------------------------------------------------

## 42.33 --- Export Architecture

Prévoir un export structuré des données appropriées.

Le périmètre exact dépend du rôle juridique et des obligations
applicables.

------------------------------------------------------------------------

## 42.34 --- Deletion Architecture

La suppression doit gérer :

``` text
database
storage
memory/vector data
cache
derived data
backups
third-party processors
```

selon politique applicable.

------------------------------------------------------------------------

## 42.35 --- Soft Delete vs Hard Delete

Ne pas supposer qu'un soft delete satisfait une demande d'effacement.

Documenter les différences.

------------------------------------------------------------------------

## 42.36 --- Retention Schedule

Créer une politique de conservation par catégorie.

Exemple structurel :

``` text
Category
Active retention
Post-termination retention
Deletion/anonymization
Legal exception
```

Les durées exactes doivent être validées.

------------------------------------------------------------------------

## 42.37 --- Backup Retention

Documenter comment les suppressions sont traitées dans les backups.

------------------------------------------------------------------------

## 42.38 --- Legal Hold

Prévoir conceptuellement qu'une obligation légale peut empêcher
temporairement certaines suppressions.

Ne pas implémenter arbitrairement sans besoin validé.

------------------------------------------------------------------------

## 42.39 --- Account Closure

À la fermeture d'une agence :

définir :

-   access termination
-   export window
-   retention
-   deletion schedule
-   billing finalization

------------------------------------------------------------------------

## 42.40 --- Media Governance

Les médias nécessitent une gouvernance stricte.

Conserver au minimum :

-   owner/context
-   access scope
-   source
-   upload timestamp
-   deletion state

------------------------------------------------------------------------

## 42.41 --- Media Authorization

L'agence doit être responsable de disposer des droits/autorisations
nécessaires sur les médias qu'elle importe.

Le produit doit le refléter contractuellement selon validation
juridique.

------------------------------------------------------------------------

## 42.42 --- Content Access

Les URLs de médias privés ne doivent pas être publiques de façon
permanente.

Utiliser des mécanismes sécurisés adaptés.

------------------------------------------------------------------------

## 42.43 --- Media Logs

Tracer les actions sensibles :

-   upload
-   deletion
-   access administratif exceptionnel
-   send/sale

selon architecture.

------------------------------------------------------------------------

## 42.44 --- Adult Content Internal Access

Limiter fortement l'accès interne aux médias/conversations adultes.

Le support ne doit pas pouvoir parcourir librement ce contenu.

------------------------------------------------------------------------

## 42.45 --- Age / Eligibility

Le cas d'usage réel implique des créateurs adultes.

Les mécanismes d'éligibilité, vérification et responsabilité doivent
être définis avec conseil juridique et selon les plateformes intégrées.

OmniFlow ne doit jamais être conçu pour faciliter du contenu impliquant
des mineurs.

------------------------------------------------------------------------

## 42.46 --- Prohibited Content

Prévoir une Acceptable Use Policy permettant d'interdire les
contenus/usages illégaux ou incompatibles avec les fournisseurs.

------------------------------------------------------------------------

## 42.47 --- Reporting / Enforcement

Prévoir un workflow interne pour :

-   report
-   investigation
-   suspension
-   preservation where required
-   resolution

------------------------------------------------------------------------

## 42.48 --- Automated Decisions

Si Full AI prend des décisions commerciales automatisées, documenter
clairement :

-   nature des actions
-   limites
-   human takeover
-   auditability

------------------------------------------------------------------------

## 42.49 --- Agency Control

L'agence doit pouvoir contrôler les principaux comportements autonomes :

-   Full AI on/off
-   pricing
-   negotiation
-   custom requests
-   proactive follow-up

------------------------------------------------------------------------

## 42.50 --- Explainability

Pour les décisions importantes, conserver assez de données structurées
pour comprendre :

``` text
What happened?
What rules applied?
Which configuration version?
Which AI version?
What action was executed?
```

------------------------------------------------------------------------

## 42.51 --- AI Logs

Ne pas conserver indéfiniment tous les prompts bruts par défaut.

Définir une stratégie minimisant les données tout en permettant :

-   debugging
-   audit
-   benchmark

------------------------------------------------------------------------

## 42.52 --- Redaction

Lorsque possible, les logs techniques doivent éviter ou masquer les
données personnelles non nécessaires.

------------------------------------------------------------------------

## 42.53 --- Analytics Governance

Les analytics doivent utiliser uniquement les données nécessaires.

------------------------------------------------------------------------

## 42.54 --- Internal Product Analytics

Séparer autant que possible :

``` text
PRODUCT EVENT
```

de :

``` text
PRIVATE CONVERSATION CONTENT
```

------------------------------------------------------------------------

## 42.55 --- Training Data

Les conversations clientes ne doivent pas être automatiquement utilisées
comme dataset d'entraînement global sans politique, base juridique,
conditions et protections appropriées.

------------------------------------------------------------------------

## 42.56 --- Evaluation Dataset

Pour benchmark :

préférer selon besoin :

-   synthetic data
-   curated cases
-   properly authorized/anonymized data

------------------------------------------------------------------------

## 42.57 --- Cross-Agency Learning

Ne jamais copier directement des données privées d'une agence vers une
autre.

L'amélioration globale doit utiliser des mécanismes respectant
confidentialité et droits applicables.

------------------------------------------------------------------------

## 42.58 --- Fine-Tuning Governance

Avant tout fine-tuning sur données réelles :

``` text
DATA SOURCE REVIEW
AUTHORIZATION
PRIVACY REVIEW
PROVIDER REVIEW
DATASET VERSIONING
```

------------------------------------------------------------------------

## 42.59 --- Data Residency

Documenter les régions d'hébergement et de traitement pertinentes.

Si des exigences clients apparaissent plus tard, l'architecture doit
pouvoir évoluer.

------------------------------------------------------------------------

## 42.60 --- International Transfers

Identifier les transferts internationaux de données et les mécanismes
juridiques nécessaires avec conseil compétent.

------------------------------------------------------------------------

## 42.61 --- Encryption in Transit

Utiliser TLS/HTTPS pour les communications externes.

------------------------------------------------------------------------

## 42.62 --- Encryption at Rest

Utiliser les capacités de chiffrement des fournisseurs d'infrastructure
appropriés.

------------------------------------------------------------------------

## 42.63 --- Secrets

Stocker les secrets via les mécanismes sécurisés de la plateforme.

Jamais dans :

-   git
-   frontend
-   logs
-   documentation publique

------------------------------------------------------------------------

## 42.64 --- Credential Rotation

Prévoir la rotation des credentials critiques.

------------------------------------------------------------------------

## 42.65 --- Access Reviews

Réviser régulièrement :

-   internal admins
-   service accounts
-   third-party integrations

------------------------------------------------------------------------

## 42.66 --- Audit Retention

Les logs d'audit sensibles doivent avoir une durée de conservation
définie.

------------------------------------------------------------------------

## 42.67 --- Security Incident & Privacy Incident

Un incident technique peut devenir un incident de données.

Le processus Partie 31 doit prévoir cette qualification.

------------------------------------------------------------------------

## 42.68 --- Breach Response

Préparer un runbook permettant :

``` text
Detect
Contain
Assess
Preserve Evidence
Legal Review
Notify if required
Remediate
```

------------------------------------------------------------------------

## 42.69 --- No Automatic Legal Notification

Le code ne doit pas envoyer automatiquement une notification
réglementaire sans validation du processus applicable.

------------------------------------------------------------------------

## 42.70 --- Vendor Due Diligence

Avant production, examiner les fournisseurs critiques :

-   security
-   privacy
-   reliability
-   terms
-   data handling

------------------------------------------------------------------------

## 42.71 --- Payment Data

Ne pas stocker directement des données carte si un fournisseur de
paiement peut les gérer.

------------------------------------------------------------------------

## 42.72 --- PCI Scope

Utiliser une intégration de paiement minimisant le périmètre PCI
applicable.

------------------------------------------------------------------------

## 42.73 --- Invoice Data

Les données de facturation doivent être conservées conformément aux
obligations comptables applicables.

------------------------------------------------------------------------

## 42.74 --- Commission Records

Conserver un historique auditable :

``` text
transaction
eligible amount
rate
commission
adjustment
billing status
```

------------------------------------------------------------------------

## 42.75 --- Tax

La fiscalité SaaS, TVA et commission dépend de la structure juridique et
des pays clients.

Prévoir une validation comptable/fiscale avant scale international.

------------------------------------------------------------------------

## 42.76 --- Cookie / Tracking Governance

La landing et l'application doivent distinguer :

-   essential
-   analytics
-   marketing

selon outils réellement utilisés et obligations applicables.

------------------------------------------------------------------------

## 42.77 --- Consent Management

Si nécessaire juridiquement, intégrer une gestion des préférences de
tracking.

------------------------------------------------------------------------

## 42.78 --- Marketing Emails

Séparer les emails transactionnels des communications marketing.

------------------------------------------------------------------------

## 42.79 --- Unsubscribe

Les communications marketing doivent supporter les mécanismes de
désinscription requis.

------------------------------------------------------------------------

## 42.80 --- Transactional Emails

Les emails nécessaires au fonctionnement du compte ne doivent pas être
confondus avec le marketing.

------------------------------------------------------------------------

## 42.81 --- Data Governance Roles

Identifier en interne les responsables :

``` text
Security
Privacy/Legal
Data
Billing
AI
```

même si plusieurs rôles sont tenus par la même personne au début.

------------------------------------------------------------------------

## 42.82 --- Data Change Management

Toute nouvelle catégorie de donnée importante doit mettre à jour :

-   data inventory
-   privacy analysis
-   retention
-   access rules

------------------------------------------------------------------------

## 42.83 --- Schema Classification

Ajouter si utile une classification documentaire :

``` text
PUBLIC
INTERNAL
CONFIDENTIAL
HIGHLY_SENSITIVE
```

------------------------------------------------------------------------

## 42.84 --- Production Data in Development

Ne pas copier librement les données production dans les environnements
dev/test.

------------------------------------------------------------------------

## 42.85 --- Test Data

Utiliser prioritairement :

-   synthetic
-   anonymized
-   dedicated test data

------------------------------------------------------------------------

## 42.86 --- Staging

Staging ne doit pas devenir une copie non sécurisée de production.

------------------------------------------------------------------------

## 42.87 --- Support Data Handling

Les tickets support doivent éviter la duplication inutile de données
privées.

------------------------------------------------------------------------

## 42.88 --- Attachments

Les attachments support doivent suivre :

-   access control
-   malware/file validation where relevant
-   retention

------------------------------------------------------------------------

## 42.89 --- Search Indexes

Les moteurs de recherche internes ou vector stores doivent respecter la
suppression et l'isolation tenant.

------------------------------------------------------------------------

## 42.90 --- Cache Deletion

Les workflows d'effacement doivent prendre en compte les caches lorsque
nécessaire.

------------------------------------------------------------------------

## 42.91 --- Derived Data

Documenter si certaines données dérivées peuvent être :

-   deleted
-   recomputed
-   anonymized

------------------------------------------------------------------------

## 42.92 --- Anonymization

Ne pas appeler "anonymous" une donnée simplement pseudonymisée.

------------------------------------------------------------------------

## 42.93 --- Pseudonymization

Utiliser lorsque cela réduit le risque sans empêcher le fonctionnement.

------------------------------------------------------------------------

## 42.94 --- User-Facing Privacy Controls

Prévoir dans les settings :

-   account information
-   export/request entry
-   deletion/closure entry
-   relevant privacy links

------------------------------------------------------------------------

## 42.95 --- Agency Data Controls

L'owner doit disposer des contrôles nécessaires pour gérer ses
utilisateurs et données selon le modèle contractuel.

------------------------------------------------------------------------

## 42.96 --- Legal Pages

Landing/footer :

``` text
Terms
Privacy
Cookie settings if applicable
Contact
```

et autres mentions requises selon structure juridique.

------------------------------------------------------------------------

## 42.97 --- Version Acceptance UX

En cas de changement matériel nécessitant nouvelle acceptation :

le produit doit pouvoir demander une acceptation explicite.

------------------------------------------------------------------------

## 42.98 --- Compliance Checklist Before Pilot

``` text
[ ] Privacy policy reviewed
[ ] Terms reviewed
[ ] Commission disclosure reviewed
[ ] Platform terms reviewed
[ ] AI providers reviewed
[ ] Data inventory created
[ ] Retention policy drafted
[ ] Internal access restricted
[ ] Data deletion workflow tested
[ ] Incident response prepared
```

------------------------------------------------------------------------

## 42.99 --- Compliance Checklist Before Production

``` text
[ ] Legal entity / contracting structure confirmed
[ ] Privacy roles confirmed
[ ] DPA/subprocessor documentation ready if applicable
[ ] Billing/tax reviewed
[ ] Platform integration authorized
[ ] Adult-content provider compatibility confirmed
[ ] Security review completed
[ ] Data request workflow operational
[ ] Terms acceptance versioned
[ ] Production tracking/cookies reviewed
```

------------------------------------------------------------------------

## 42.100 --- Claude Code Blocking Rule

Claude Code doit utiliser :

``` text
LEGAL REVIEW REQUIRED
```

lorsqu'une décision juridique ne peut pas être déduite techniquement.

Il ne doit pas inventer une règle légale.

------------------------------------------------------------------------

## 42.101 --- No Legal Hardcoding

Éviter les comportements irréversibles basés sur une supposition
juridique.

Utiliser configuration/documentation lorsque approprié.

------------------------------------------------------------------------

## 42.102 --- Required Documents

Créer :

``` text
/docs/compliance/DATA_INVENTORY.md
/docs/compliance/DATA_RETENTION.md
/docs/compliance/PLATFORM_COMPLIANCE.md
/docs/compliance/AI_PROVIDER_REVIEW.md
/docs/compliance/PRIVACY_OPERATIONS.md
```

------------------------------------------------------------------------

## 42.103 --- DATA_INVENTORY.md

Pour chaque donnée :

``` text
Category
Fields/examples
Source
Purpose
Storage
Access
Processor
Retention
Deletion
```

------------------------------------------------------------------------

## 42.104 --- DATA_RETENTION.md

Documenter :

-   retention rules
-   account closure
-   backup behavior
-   deletion
-   exceptions requiring review

------------------------------------------------------------------------

## 42.105 --- PLATFORM_COMPLIANCE.md

Pour chaque plateforme :

-   integration method
-   technical status
-   terms review
-   permissions
-   limitations
-   unresolved risks

------------------------------------------------------------------------

## 42.106 --- AI_PROVIDER_REVIEW.md

Pour chaque fournisseur :

-   model use
-   data sent
-   retention/training configuration
-   policy compatibility
-   region
-   unresolved risks

------------------------------------------------------------------------

## 42.107 --- PRIVACY_OPERATIONS.md

Documenter :

-   access requests
-   export
-   deletion
-   correction
-   verification
-   incident escalation

------------------------------------------------------------------------

## 42.108 --- Acceptance Criteria

Cette partie est correctement prise en compte lorsque :

-   les catégories de données sont connues
-   les tenants sont isolés
-   les fournisseurs IA sont documentés
-   les connecteurs plateforme nécessitent validation
-   les données ne sont pas utilisées globalement sans gouvernance
-   les politiques de rétention existent
-   les workflows export/suppression sont possibles
-   les accès internes sont limités et audités
-   les médias privés sont protégés
-   les commissions sont transparentes
-   les conditions sont versionnables
-   les décisions juridiques non résolues sont explicitement bloquées
-   OmniFlow peut démontrer où vont les données et pourquoi

------------------------------------------------------------------------

## 42.109 --- Final Principle

OmniFlow doit être capable de répondre à quatre questions pour toute
donnée importante :

# WHY DO WE HAVE IT?

# WHERE IS IT?

# WHO CAN ACCESS IT?

# WHEN IS IT DELETED?

La vitesse de développement ne doit jamais dépendre d'une opacité sur
les données.

------------------------------------------------------------------------

## PARTIE 42 --- VALIDÉE COMME LEGAL, PRIVACY, DATA GOVERNANCE & COMPLIANCE

La suite du cahier des charges commence avec :

# PARTIE 43 --- GROWTH, REFERRAL & PRODUCT-LED EXPANSION
