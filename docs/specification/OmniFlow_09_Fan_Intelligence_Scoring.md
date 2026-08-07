# OMNIFLOW V1 --- CAHIER DES CHARGES CLAUDE CODE

# PARTIE 9 --- FAN INTELLIGENCE & SCORING

## 9.1 --- Objectif

OmniFlow doit transformer les données disponibles sur chaque fan en
intelligence commerciale et relationnelle exploitable.

Le système doit permettre de comprendre rapidement :

-   qui est le fan
-   son niveau d'engagement
-   sa relation avec la créatrice
-   son comportement d'achat
-   son potentiel commercial
-   son intention d'achat actuelle
-   son risque de désengagement
-   la stratégie la plus pertinente

Fan Intelligence doit alimenter :

-   OmniFlow Brain
-   Decision Engine
-   Copilot
-   Full AI
-   Smart Follow-ups
-   Media Intelligence
-   Pricing Intelligence
-   Analytics
-   segmentation

## 9.2 --- Scores principaux

Chaque fan doit disposer au minimum des scores suivants :

### Purchase Intent

Probabilité / intensité estimée d'une intention d'achat à court terme.

### Relationship Score

Force et maturité de la relation avec la créatrice.

### Spending Potential

Potentiel commercial estimé du fan.

### Engagement Score

Niveau d'activité et d'implication dans les conversations.

### Churn Risk

Risque de désengagement ou de perte du fan.

### OmniScore

Synthèse globale destinée principalement à la priorisation.

Les scores doivent être séparés.

Un OmniScore élevé ne doit pas masquer la raison pour laquelle le fan
est intéressant.

## 9.3 --- Échelle

Utiliser une échelle normalisée :

**0--100**

avec éventuellement une catégorie lisible.

Exemple :

0--20 → Very Low\
21--40 → Low\
41--60 → Medium\
61--80 → High\
81--100 → Very High

Les seuils exacts doivent rester configurables.

## 9.4 --- Purchase Intent

Le Purchase Intent doit mesurer l'intérêt commercial actuel.

Signaux possibles :

-   demande explicite de contenu
-   question sur le prix
-   réaction positive à une proposition
-   progression dans un script
-   achat récent
-   comportement historique
-   engagement actuel
-   objections
-   négociation
-   refus récent
-   temps depuis dernière proposition
-   contenu demandé
-   conversation actuelle

Le score doit être fortement sensible au contexte récent.

## 9.5 --- Purchase Intent dynamique

Le Purchase Intent doit pouvoir évoluer rapidement.

Exemple :

Fan habituellement peu acheteur : **Purchase Intent = 25**

Puis il demande explicitement un contenu disponible : **Purchase Intent
→ 88**

Après refus : **Purchase Intent → recalcul**

Le score ne doit pas être un simple attribut permanent du fan.

## 9.6 --- Relationship Score

Mesurer la profondeur de la relation.

Signaux possibles :

-   ancienneté
-   fréquence des conversations
-   longueur des interactions
-   réponses
-   informations personnelles volontairement partagées
-   callbacks mémoire
-   surnoms
-   régularité
-   retour après absence
-   interactions post-achat
-   historique relationnel

Le Relationship Score ne doit pas être directement assimilé à la valeur
commerciale.

Un fan peut avoir :

**Relationship = 90** **Spending Potential = 25**

## 9.7 --- Spending Potential

Estimer la capacité/comportement commercial observable sans prétendre
connaître la situation financière réelle du fan.

Utiliser notamment :

-   total spent
-   average order value
-   max historical purchase
-   purchase frequency
-   price acceptance
-   response to higher-priced offers
-   negotiation behavior
-   recent spending
-   categories purchased

Ne pas inférer abusivement le revenu ou la richesse personnelle d'un
fan.

Le score représente :

# OBSERVED COMMERCIAL POTENTIAL

et non une estimation de patrimoine.

## 9.8 --- Engagement Score

Mesurer l'implication récente.

Signaux possibles :

-   fréquence de messages
-   réponse aux messages
-   temps de réponse
-   sessions récentes
-   longueur des réponses
-   interactions avec offres
-   retour spontané
-   activité disponible via plateforme
-   fréquence des conversations

Le score doit utiliser une pondération de récence.

## 9.9 --- Churn Risk

Mesurer le risque de perte d'engagement.

Signaux possibles :

-   baisse de fréquence
-   réponses plus courtes
-   absence prolongée
-   refus répétés
-   diminution des achats
-   absence de réponse aux follow-ups
-   changement brutal d'engagement
-   insatisfaction explicite
-   fin d'une habitude régulière

Un Churn Risk élevé doit généralement réduire la pression commerciale et
favoriser une stratégie adaptée.

## 9.10 --- OmniScore

L'OmniScore sert à prioriser les fans.

Il peut combiner :

-   Purchase Intent
-   Relationship
-   Spending Potential
-   Engagement
-   Churn Risk
-   contexte
-   récence

Ne pas utiliser une moyenne simple par défaut.

La formule doit être versionnée, testable et configurable.

Exemple conceptuel :

``` text
OmniScore =
Purchase Intent × W1
+ Spending Potential × W2
+ Engagement × W3
+ Relationship × W4
+ Context Adjustment
- Churn Penalty
```

La formule réelle sera calibrée avec les données.

## 9.11 --- Scores ≠ vérité

Chaque score doit être considéré comme une estimation.

Prévoir :

-   score
-   confidence
-   timestamp
-   version
-   principaux signaux explicatifs

Exemple :

**Purchase Intent: 82** **Confidence: 0.91**

Reasons: - asked for specific content - purchased recently - actively
replying

## 9.12 --- Explicabilité

Dans l'interface, permettre d'afficher quelques facteurs principaux.

Ne pas exposer de chaîne de pensée privée.

Exemple :

**Spending Potential --- High**

Based on: - 8 previous purchases - above-average order value - low
historical price resistance

## 9.13 --- Architecture hybride

Le scoring doit combiner plusieurs méthodes.

### Deterministic Signals

Exemples : - total spent - purchases - recency - response time

### Statistical / Formula Signals

Exemples : - frequency - trends - normalized behavior

### AI Interpretation

Exemples : - intention - objection - intérêt - sentiment contextuel

Ne pas demander au LLM de deviner des données déjà disponibles
objectivement.

## 9.14 --- Real-time vs Background

Certains scores doivent être recalculés immédiatement.

Exemple :

Purchase Intent après nouveau message.

D'autres peuvent être recalculés en background.

Exemple :

Spending Potential global après transaction.

Définir pour chaque score :

-   triggers
-   update frequency
-   required inputs

## 9.15 --- Score Events

Événements pouvant déclencher un recalcul :

-   MESSAGE_RECEIVED
-   MESSAGE_SENT
-   OFFER_SENT
-   PURCHASE_COMPLETED
-   OFFER_DECLINED
-   SCRIPT_STEP
-   FAN_RETURNED
-   FOLLOW_UP_RESULT
-   INACTIVITY_THRESHOLD
-   MEMORY_UPDATED

Éviter les recalculs inutiles.

## 9.16 --- Historical Features

Prévoir des features historiques telles que :

-   lifetime spend
-   spend last 7d
-   spend last 30d
-   purchase count
-   days since purchase
-   days since message
-   average response time
-   offer acceptance rate
-   average accepted price
-   negotiation frequency
-   script conversion rate
-   follow-up conversion rate

Le schéma exact sera défini dans la partie Data Architecture.

## 9.17 --- Recency Weighting

Les comportements récents doivent généralement avoir davantage de poids
pour les scores dynamiques.

Exemple :

Un gros acheteur historique devenu inactif depuis longtemps ne doit pas
conserver artificiellement un Purchase Intent très élevé.

Mais son historique reste pertinent pour Spending Potential.

## 9.18 --- Cold Start

Pour un nouveau fan avec très peu de données :

-   utiliser les signaux conversationnels disponibles
-   utiliser des priors prudents
-   afficher une confiance faible
-   éviter les conclusions fortes
-   augmenter progressivement la précision

Ne pas inventer un potentiel commercial élevé uniquement parce que les
données manquent.

## 9.19 --- Fan Segments

À partir des scores et comportements, OmniFlow peut créer des segments
opérationnels.

Exemples :

-   New Fan
-   Hot Lead
-   Warm Buyer
-   High Value
-   Loyal Fan
-   Price Sensitive
-   Dormant Buyer
-   At Risk
-   Re-engagement Opportunity

Les segments doivent être explicables et peuvent être multiples.

## 9.20 --- Segment Rules

Un segment peut être déterminé par règles configurables.

Exemple conceptuel :

**Hot Lead** Purchase Intent ≥ 80 AND Engagement ≥ 60

**High Value** Spending Potential ≥ 80

Ne pas coder les seuils définitivement dans le frontend.

## 9.21 --- Fan Priority Queue

Créer une vue permettant aux agences / chatters de prioriser les
conversations.

Exemples :

### Highest Opportunity

Fans avec forte opportunité immédiate.

### Needs Attention

Fans importants nécessitant une réponse.

### At Risk

Fans à risque.

### Follow-up Opportunities

Fans éligibles à une relance.

Cette file doit être alimentée par Fan Intelligence + règles métier.

## 9.22 --- Copilot Display

Dans l'interface Chatting, afficher les informations essentielles sans
surcharger.

Exemple :

**OmniScore 86** **Purchase Intent 91** **Relationship 72** **Spending
84**

avec badges :

**HOT** **HIGH VALUE**

Permettre d'ouvrir une vue détaillée.

## 9.23 --- Full AI Usage

En Full AI, les scores servent au Brain pour sélectionner une stratégie.

Exemple :

Purchase Intent élevé + Relationship élevé + Spending élevé →
opportunité commerciale forte.

Mais le Brain doit toujours vérifier :

-   conversation
-   règles
-   dernier achat
-   dernier offer
-   script state
-   fatigue commerciale
-   permissions

## 9.24 --- Commercial Fatigue

Créer un indicateur interne permettant d'éviter la sur-sollicitation.

Signaux :

-   offres récentes
-   refus récents
-   relances récentes
-   achats récents
-   fréquence de vente
-   baisse d'engagement après propositions

Le Brain doit pouvoir décider :

**STOP_SELLING / RETURN_TO_RELATIONSHIP**

même avec un Spending Potential élevé.

## 9.25 --- Price Sensitivity

Créer un indicateur spécifique distinct de Spending Potential.

Exemples :

-   LOW
-   MEDIUM
-   HIGH
-   UNKNOWN

Basé sur :

-   négociations
-   refus liés au prix
-   prix acceptés
-   remises nécessaires
-   comportement historique

Cette information alimente Pricing Intelligence.

## 9.26 --- Content Affinity

Créer des affinités par catégorie de contenu lorsque les données sont
disponibles.

Exemple :

Category A: 88\
Category B: 42\
Category C: 71

Media Intelligence peut ensuite prioriser les contenus pertinents.

## 9.27 --- Script Affinity

Analyser quels scripts ou styles de stratégie semblent mieux fonctionner
avec un fan ou un segment.

Ne pas conclure trop rapidement avec peu de données.

Utiliser :

-   minimum sample sizes
-   confidence
-   aggregate segment data

## 9.28 --- Objection Profile

Conserver une synthèse des objections observées.

Exemples :

-   price
-   timing
-   trust
-   content mismatch
-   not interested
-   prefers custom request

Le Decision Engine peut utiliser cette information lors des prochaines
propositions.

## 9.29 --- Fan Value

Prévoir plusieurs notions de valeur.

### Historical Value

Revenu déjà généré.

### Current Opportunity

Potentiel immédiat.

### Future Potential

Potentiel estimé.

### Relationship Value

Importance relationnelle.

Ne pas réduire un fan à son total dépensé.

## 9.30 --- VIP / High-Value Rules

L'agence doit pouvoir définir des règles particulières pour certains
fans.

Exemples :

-   validation humaine obligatoire au-dessus d'un montant
-   priorité de réponse
-   règles commerciales spécifiques
-   pas de relance automatique
-   accès à certaines offres
-   manager notification

Ces règles doivent avoir priorité sur les recommandations générales.

## 9.31 --- Score History

Conserver l'évolution des scores dans le temps lorsque pertinent.

Exemple :

Purchase Intent: 35 → 48 → 82 → 91 → 54

Cela permet :

-   analytics
-   debugging
-   apprentissage
-   visualisation de dynamique

Éviter toutefois de stocker des snapshots inutiles à chaque seconde.

## 9.32 --- Trend Detection

Afficher non seulement le score mais sa tendance.

Exemples :

**Engagement 78 ↑**

**Purchase Intent 84 ↑↑**

**Relationship 71 →**

**Churn Risk 62 ↑**

Le trend peut être plus utile qu'une valeur isolée.

## 9.33 --- Score Calibration

Avant de considérer les scores comme fiables, ils doivent être calibrés
sur des données réelles.

Exemple :

Si les fans avec Purchase Intent 80--100 achètent rarement, le score est
mal calibré.

Mesurer :

-   conversion by score bucket
-   revenue by score bucket
-   false positives
-   false negatives

## 9.34 --- Benchmark des scores

Le Benchmark doit contenir des scénarios permettant de vérifier :

-   intention détectée correctement
-   refus détecté
-   négociation détectée
-   engagement
-   risque de churn
-   opportunité commerciale
-   absence d'opportunité

Les scores doivent être comparés aux résultats réels lorsque
disponibles.

## 9.35 --- Versioning

Chaque moteur de scoring doit être versionné.

Exemples :

-   purchase-intent-v1
-   relationship-v1
-   spending-v2
-   omni-score-v3

Une modification de formule ne doit pas rendre les anciennes analyses
impossibles à interpréter.

## 9.36 --- A/B Testing

Les nouvelles versions de scoring peuvent être testées en :

-   offline benchmark
-   shadow mode
-   controlled A/B test

avant généralisation.

Ne pas modifier silencieusement le comportement de Full AI pour toutes
les agences.

## 9.37 --- Agency Configuration

L'agence peut configurer certains seuils opérationnels.

Exemples :

**Hot Fan threshold** 80

**High Value threshold** 75

**At Risk threshold** 70

Mais l'agence ne doit pas modifier librement les modèles internes
complexes au point de casser Fan Intelligence.

Séparer :

-   engine configuration interne OmniFlow
-   business thresholds agence

## 9.38 --- Analytics

Prévoir des dashboards tels que :

-   revenue by OmniScore
-   conversion by Purchase Intent
-   revenue by Spending Potential
-   churn by Churn Risk
-   performance by segment
-   average fan scores
-   score distributions
-   segment evolution

Ces données aideront à démontrer la valeur d'OmniFlow.

## 9.39 --- Privacy & Fairness

Les scores doivent être basés sur les comportements et données
pertinentes au service.

Éviter d'utiliser des attributs personnels sensibles ou non nécessaires
pour estimer la valeur commerciale d'un fan.

Les scores sont des outils opérationnels internes, pas des diagnostics
psychologiques ou financiers.

## 9.40 --- Critère de réussite

Fan Intelligence est réussie lorsque :

-   l'agence sait immédiatement quels fans nécessitent de l'attention
-   le Brain comprend mieux le timing commercial
-   les ventes ne reposent pas uniquement sur l'intuition
-   les fans à fort potentiel sont détectés
-   les fans à risque sont identifiés
-   la pression commerciale peut être ajustée
-   les scores sont explicables
-   les scores sont calibrés sur des résultats réels
-   les scores améliorent effectivement les KPI commerciaux

# THE RIGHT FAN. THE RIGHT MOMENT. THE RIGHT ACTION.

------------------------------------------------------------------------

## PARTIE 9 --- VALIDÉE COMME SPÉCIFICATION DE FAN INTELLIGENCE & SCORING

La suite du cahier des charges commence avec :

# PARTIE 10 --- AGENCY SETTINGS & AI CONTROL CENTER
