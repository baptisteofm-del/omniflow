# 📊 Guide d'Utilisation - Module Veille Trends

## 🎯 Qu'est-ce que c'est ?

Le module **Veille Trends** te permet de:
- 🔍 Découvrir les **tendances en temps réel** sur TikTok, Instagram, Reddit, YouTube
- 🎬 Voir des **créateurs populaires** et leurs contenus viral
- ✨ **Générer du contenu IA** inspiré par les trends
- 💡 Rester à jour sur **ce qui fonctionne maintenant**

## 🚀 Démarrage Rapide

### Étape 1: Ouvrir Veille Trends
Va à `/content/veille` ou clique sur **"Veille Contenu"** dans le menu

### Étape 2: Récupérer les Trends
Clique sur le bouton **"Actualiser maintenant"** 🔄
- Cela va scanner TikTok, Instagram, Reddit, YouTube
- Affiche les **top 5 trends** + autres tendances
- Chaque trend montre: title, creator, platform, engagement

### Étape 3: Explorer les Trends
Pour chaque card, tu vois:

| Élément | Signification |
|---------|--------------|
| **🎵 TikTok / 📷 Instagram / 🔥 Reddit / ▶️ YouTube** | Plateforme d'origine |
| **🎬 Vidéo / 🎞️ Reel / 📸 Photo / 📝 Texte** | Type de contenu |
| **🔥 TRENDING** | Top 5 des tendances (le plus viral) |
| **@username** | Créateur/créatrice du contenu |
| **📊 4.8M** | Nombre de vues/likes/upvotes |
| **il y a 2j** | Quand le post a été publié |
| **#fitness** | Catégorie |

### Étape 4: Utiliser un Trend

#### Option A: Voir le Post Original
Clique **"Voir le post"** pour:
- Ouvrir la page originale du créateur
- Voir les commentaires
- Vérifier l'engagement réel

#### Option B: Générer du Contenu IA ✨
Clique **"Générer IA"** pour:
- Aller au générateur IA
- Le prompt est **pré-rempli** avec contexte du trend
- Tu peux personnaliser avant de générer

⚠️ **Note:** Le bouton "Générer IA" apparaît UNIQUEMENT pour les vidéos, reels et photos. Les posts texte seuls ne sont pas générables (trop de contexte perdu).

## 🎨 Filtrer les Trends

À gauche, tu as des filtres:

### Filtrer par Plateforme
- **Toutes** = affiche TikTok + Instagram + Reddit + YouTube
- **TikTok** = que les vidéos TikTok
- **Instagram** = que les reels Instagram
- **Reddit** = que les posts Reddit
- **YouTube** = que les vidéos YouTube

### Filtrer par Catégorie
- Fitness
- Beauty
- Lifestyle
- Fashion
- Wellness
- Travel
- Music
- Dance
- Glamour
- Motivation

**Exemple:** "Je veux voir que les trends fitness de TikTok"
→ Plateforme: TikTok + Catégorie: Fitness

## 🔍 Interpréter les Données

### Engagement
- **TikTok/YouTube:** Nombre total de vues
- **Instagram:** Likes + commentaires
- **Reddit:** Upvotes + downvotes

**Plus haut = plus viral = plus pertinent**

### Type de Contenu
- **🎬 Vidéo** = short-form video (TikTok, YouTube Shorts)
- **🎞️ Reel** = Instagram Reel (15-90 sec, très viral)
- **📸 Photo** = Instagram post classique
- **📝 Texte** = Reddit post texte (juste discussion)
- **📹 Carousel** = Instagram carousel (plusieurs images)

## 💡 Bonnes Pratiques

### ✅ À Faire

1. **Regarde les Top 5** - ce sont les vrais viral hits 🔥
2. **Click sur l'auteur** - va checker son profil pour + d'inspiration
3. **Génère plusieurs variations** - d'un même trend
4. **Mélange des trends** - combine 2-3 trends pour du contenu unique
5. **Check la date** - les trends frais sont plus pertinents

### ❌ À Éviter

1. **Copier directement** - crée du contenu *inspiré*, pas une copie
2. **Ignorer le contexte** - lis la description du trend
3. **Générer du texte seul** - utilise vidéo/photo pour plus d'impact
4. **Oublier ton branding** - adapte les trends à ta niche

## 🎯 Cas d'Usage Concrets

### Cas 1: Créatrice Fitness
> "Je veux créer du contenu workout viral"

1. Filtre: **Plateforme: TikTok + Catégorie: Fitness**
2. Scroll et voir: "7-Minute Full Body Workout" (2.4M vues) 🔥
3. Click **"Générer IA"**
4. Prompt devient: *"Inspiré du trend '7-Minute Full Body Workout' par @fitnessgirl... crée un contenu fitness professionnel..."*
5. Personnalise le prompt: ajoute tes couleurs, musique, style
6. Génère! 🚀

### Cas 2: Créatrice Beauty
> "Quels looks makeup sont tendances ?"

1. Filtre: **Catégorie: Beauty**
2. Vois: "Morning Skincare Routine" (892K), "Get Ready With Me" (1.8M) 
3. Click sur **@skincare_expert** → voir son profil
4. Stolen les techniques + crée ta version
5. Click **"Générer IA"** pour variante vidéo

### Cas 3: Content Creator Généraliste
> "Trouver les VRAIS trends du moment"

1. **Pas de filtre** = voir TOUS les trends (TikTok + Insta + Reddit + YouTube)
2. Sort par engagement (plus haut d'abord)
3. Vois tendances cross-platform (si même trend sur 3 platforms → très viral)
4. Choisir 3-4 trends + générer des variations

## 🤖 Générer du Contenu IA

Une fois que tu cliques **"Générer IA"**, tu vas à `/content/ai-generation?trend=...`

Là, tu dois:
1. **Vérifier le prompt** (pré-rempli avec le trend)
2. **Ajouter tes détails:**
   - Ta niche
   - Ton style
   - Les couleurs que tu aimes
   - La musique/ambiance
3. **Cliquer Générer**
4. **Attendre** (2-3 minutes max)
5. **Télécharger le fichier** ou le publier directement

## ❓ FAQ

### Q: Les trends se mettent à jour automatiquement ?
**A:** Non, tu dois cliquer **"Actualiser maintenant"** manuellement. Recommandé: 1-2x par jour

### Q: Ça se connecte vraiment à TikTok/Instagram ?
**A:** Oui! Les trends viennent des vraies APIs:
- TikTok: via Apify (lecteur de tendances)
- Instagram: via Apify
- Reddit: API publique (gratuit)
- YouTube: RSS feeds (gratuit)

Si les APIs sont down → affiche des trends demo réalistes

### Q: Je peux filtrer par engagement minimum ?
**A:** Pas encore, mais c'est sur la roadmap. Pour l'instant: les top 5 sont les plus engageants

### Q: Pourquoi pas de bouton "Générer" sur Reddit texte ?
**A:** Parce qu'un post Reddit texte seul ne donne pas assez de contexte visuel pour générer une image/vidéo. Il faudrait du contenu visuel pour inspirer l'IA.

### Q: Je peux sauvegarder mes trends préférés ?
**A:** Pas pour l'instant. C'est sur la roadmap!

## 🚀 Roadmap Futur

- [ ] Sauvegarder trends en favoris
- [ ] Exporter trends en CSV
- [ ] Filtrer par engagement min/max
- [ ] Notifications quand un trend monte
- [ ] Comparer trends jour vs semaine vs mois
- [ ] Support Twitter/X trends
- [ ] Prédire quels trends vont exploser dans 48h

---

**💡 Conseil Final:**
Les trends changent **rapidement**. Check au moins 1x par jour pour rester à jour. Les créatices qui bougent les plus vite sur les trends gagnent toujours! 🚀

**Besoin d'aide ?** Contacte le support ou check les FAQs sur le site.
