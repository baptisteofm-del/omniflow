# Omniflow Integrations — Quick Start Guide

## 🚀 Démarrage Rapide (5 minutes)

### 1. Appliquer la Migration SQL

```bash
# Supabase Dashboard → SQL Editor
\i supabase/add_fan_interactions.sql
```

### 2. Déployer le Code

```bash
git push origin clean-main:main --force
vercel --prod --token YOUR_TOKEN
```

### 3. Tester les Intégrations

Allez sur **Settings → Intégrations** et connectez vos plateformes.

---

## 📍 Où trouver les Credentials

### OnlyFans
1. Ouvrez OnlyFans → F12 → Application → Cookies
2. Copiez : `auth_id`, `sess`, `bc-tokens-p11`
3. Trouvez votre ID utilisateur (dans l'URL de profil)

### MYM.fans
1. DevTools → Network → Une requête API
2. Copiez le header : `Authorization: Bearer xxx`

### Binance
1. binance.com → Settings → API Management
2. Créez une clé **read-only**
3. Copiez : `API Key` et `Secret Key`

### Coinbase
1. coinbase.com → Settings → API
2. Copiez : `API Key`

---

## 🧪 Test une Intégration

Dans Settings → Intégrations, remplissez les champs et cliquez **"Connecter"**.

Le système testera automatiquement la connexion et affichera ✅ ou ❌.

---

## 📊 Synchroniser les Données

### Manuellement

```bash
# OnlyFans
curl -X POST https://omniflowapp.ai/api/integrations/onlyfans/sync

# MYM
curl -X POST https://omniflowapp.ai/api/integrations/mym/sync

# Crypto (Binance + Coinbase)
curl -X POST https://omniflowapp.ai/api/finance/crypto/sync
```

### Automatiquement (à implémenter)

Ajouter un cron job pour synchroniser quotidiennement :
```
0 6 * * * curl -X POST https://omniflowapp.ai/api/integrations/onlyfans/sync
```

---

## 📈 Dashboard Chatting

Allez sur **Chatting** pour voir :
- Fans connectés (OnlyFans/MYM)
- Sentiment analysis
- Risk levels
- Top performers

Si pas d'intégration → Banner vous guide vers Settings.

---

## 💰 Finance

Allez sur **Finance** pour voir :
- Soldes crypto (Binance/Coinbase)
- Transactions en EUR
- Historique dépôts/retraits

---

## 🔒 Sécurité

- **Ne partagez JAMAIS** vos secret keys
- Utilisez des clés **read-only** pour Binance/Coinbase
- **Rotez les clés** tous les 3 mois
- Les clés sont **chiffrées** en base de données

---

## ⚠️ Troubleshooting

### "Test failed" sur OnlyFans
- Les cookies ont peut-être expiré
- Rechargez OnlyFans et récupérez les nouveaux
- Vérifiez que l'User ID est correct

### "Invalid signature" sur Binance
- L'horloge du serveur doit être synchronisée (NTP)
- Vérifiez que la secret key est exacte
- Essayez une nouvelle clé API

### Pas de transactions affichées
- Les transactions peuvent mettre 5-10 min à synchroniser
- Rafraîchissez le dashboard
- Vérifiez que l'intégration est "Connecté ✅"

---

## 📚 Documentation Complète

Voir **`INTEGRATIONS.md`** et **`IMPLEMENTATION_SUMMARY.md`**

---

**Version :** 1.0.0  
**Date :** 21 Mai 2026  
**Statut :** ✅ Prêt pour production
