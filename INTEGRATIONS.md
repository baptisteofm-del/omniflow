# Omniflow Integrations — Modules Implémentés

## Vue d'ensemble

Omniflow supporte maintenant trois modules d'intégration majeurs :

1. **OnlyFans & MYM** — Intégrations creator platforms
2. **Binance & Coinbase** — Intégrations crypto/finance

---

## MODULE 1 — OnlyFans Integration

### Stockage des Credentials

OnlyFans n'a pas d'API officielle publique. On utilise les **session tokens** (approche légale utilisée par Infloww, GoRocket, etc.).

L'agence fournit ses propres cookies de session :

```
Cookie: auth_id=xxx
Cookie: sess=xxx
Cookie: bc-tokens-p11=xxx
```

### Comment obtenir les tokens OnlyFans

1. Ouvrez **OnlyFans** dans Chrome
2. Appuyez sur **F12** → onglet **Application**
3. Allez dans **Cookies** → https://onlyfans.com
4. Copiez les valeurs de :
   - `auth_id`
   - `sess`
   - `bc-tokens-p11`
5. Notez votre ID utilisateur OnlyFans

### Implémentation

**`src/lib/platforms/onlyfans.ts`**

Fonctions principales :

```typescript
async function getSubscribers(creds: OFCredentials): Promise<OFSubscriber[]>
async function getChats(creds: OFCredentials): Promise<OFChat[]>
async function getMessages(creds: OFCredentials, fanId?: string): Promise<OFMessage[]>
async function sendMessage(creds: OFCredentials, fanId: string, text: string): Promise<void>
async function getTransactions(creds: OFCredentials, days?: number): Promise<OFTransaction[]>
async function getEarnings(creds: OFCredentials): Promise<OFEarnings>
```

**Endpoints OnlyFans reverse-engineered :**

- `GET /api2/v2/subscriptions/subscribes?type=active` — Liste des abonnés
- `GET /api2/v2/chats?limit=10&offset=0&sort=recent` — Conversations
- `GET /api2/v2/users/{userId}/messages` — Messages d'un fan
- `GET /api2/v2/earning` — Gains total
- `GET /api2/v2/payments/payout` — Historique paiements

### Tests

**Route de test :** `POST /api/integrations/onlyfans/test`

```bash
curl -X POST http://localhost:3000/api/integrations/onlyfans/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "12345",
    "authId": "xxx_auth_id",
    "sess": "xxx_sess",
    "bcTokens": "xxx_tokens"
  }'
```

---

## MODULE 2 — MYM.fans Integration

### Comment obtenir le Bearer Token

1. Allez sur **mym.fans** et connectez-vous
2. Appuyez sur **F12** → **Network**
3. Faites une requête API
4. Copiez le header : `Authorization: Bearer xxx`

### Implémentation

**`src/lib/platforms/mym.ts`**

Fonctions principales :

```typescript
async function getConversations(creds: MYMCredentials): Promise<MYMConversation[]>
async function getMessages(creds: MYMCredentials, conversationId: string): Promise<MYMMessage[]>
async function sendMessage(creds: MYMCredentials, conversationId: string, text: string): Promise<void>
async function getEarnings(creds: MYMCredentials): Promise<MYMEarnings>
```

**Endpoints MYM :**

- `GET /api/v2/conversations` — Toutes les conversations
- `GET /api/v2/conversations/{id}/messages` — Messages d'une conversation
- `POST /api/v2/conversations/{id}/messages` — Envoyer un message
- `GET /api/v2/earnings/summary` — Résumé des gains

### Tests

**Route de test :** `POST /api/integrations/mym/test`

---

## MODULE 3 — Dashboard Chatting Synchronisé

Le dashboard **Chatting** affiche maintenant les vraies données depuis OnlyFans et MYM.

### Synchronisation des fans

**Route de sync :** `POST /api/integrations/onlyfans/sync` ou `POST /api/integrations/mym/sync`

Cela :
1. Récupère tous les chats/conversations
2. Analyse le sentiment des messages (règles simples)
3. Évalue le risque (high/medium/low)
4. Sauvegarde dans la table `fan_interactions`

### Analyse du sentiment

**Règles simples :**

Mots négatifs → sentiment = `negative` :
- "cancel", "refund", "scam", "fake", "disappointed", "unsubscribe", "waste", "boring"

Mots positifs → sentiment = `positive` :
- "love", "amazing", "worth", "best", "❤️", "🔥", "💕"

Sinon → sentiment = `neutral`

### Table fan_interactions

```sql
create table fan_interactions (
  id uuid primary key,
  agency_id uuid,
  platform text, -- 'onlyfans' | 'mym'
  fan_id text,
  fan_name text,
  last_message text,
  sentiment text, -- 'positive' | 'neutral' | 'negative'
  risk_level text, -- 'low' | 'medium' | 'high'
  last_interaction_at timestamptz,
  created_at timestamptz
);
```

### Intégration au dashboard

**`src/app/(dashboard)/chatting/page.tsx`**

- Affiche une **banner** si OnlyFans/MYM n'est pas connecté
- Bouton "Aller aux intégrations" pour setup rapide
- Si connecté → charge les vraies données

---

## MODULE 4 — Binance Integration

### Comment obtenir les API credentials Binance

1. Allez sur **binance.com** → Settings → API Management
2. Créez une nouvelle clé (read-only de préférence)
3. **Important :** n'activez que les permissions de lecture
4. Copiez l'**API Key** et le **Secret Key**

### Implémentation

**`src/lib/platforms/binance.ts`**

Utilise **HMAC-SHA256** pour signer les requêtes (standard Binance).

Fonctions principales :

```typescript
async function getBalance(creds: BinanceCredentials): Promise<BinanceBalance[]>
async function getUSDTBalance(creds: BinanceCredentials): Promise<number>
async function getDepositHistory(creds: BinanceCredentials): Promise<BinanceDeposit[]>
async function getWithdrawHistory(creds: BinanceCredentials): Promise<BinanceWithdraw[]>
async function getTransactionHistory(creds: BinanceCredentials, days?: number): Promise<BinanceTransaction[]>
```

**Endpoints Binance :**

- `GET /api/v3/account` — Solde (signature requise)
- `GET /sapi/v1/capital/deposit/hisrec` — Historique dépôts
- `GET /sapi/v1/capital/withdraw/history` — Historique retraits

### Tests

**Route de test :** `POST /api/integrations/binance/test`

Vérifie les credentials en récupérant le solde USDT.

---

## MODULE 5 — Coinbase Integration

### Comment obtenir l'API Key Coinbase

1. Allez sur **coinbase.com** → Settings → API
2. Créez une nouvelle clé
3. Copiez l'**API Key**

### Implémentation

**`src/lib/platforms/coinbase.ts`**

Utilise l'authentification par Bearer token.

Fonctions principales :

```typescript
async function getAccounts(creds: CoinbaseCredentials): Promise<CoinbaseAccount[]>
async function getTransactions(
  creds: CoinbaseCredentials,
  accountId: string
): Promise<CoinbaseTransaction[]>
```

---

## MODULE 6 — Finance: Crypto Sync

### Route de sync

**`POST /api/finance/crypto/sync`**

Synchronise les transactions depuis Binance et Coinbase :

1. Récupère les transactions
2. Convertit en EUR via **CoinGecko API** (gratuit, public)
3. Catégorise automatiquement (dépôt/retrait)
4. Sauvegarde dans la table `transactions`

### Conversion EUR automatique

Utilise CoinGecko (gratuit) :

```
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur
```

Les résultats sont cachés 5 minutes (revalidate=300).

---

## Setup & Déploiement

### 1. Appliquer les migrations SQL

```sql
-- Dans Supabase SQL Editor
\i supabase/add_fan_interactions.sql
```

### 2. Configurer les intégrations

Allez sur **Settings → Intégrations** :

**Creator Platforms (🎬)**
- OnlyFans : entrez userId, auth_id, sess, bc-tokens-p11
- MYM.fans : entrez le Bearer token

**Finance & Crypto (💰)**
- Binance : entrez API Key + Secret Key
- Coinbase : entrez API Key

### 3. Tester les connexions

Chaque intégration a un bouton "Tester la connexion" qui :
- Vérifie les credentials
- Récupère un petit échantillon de données
- Affiche le résultat (✅ ou ❌)

### 4. Synchroniser les données

Une fois connecté, synchronisez :

```bash
# OnlyFans
curl -X POST http://localhost:3000/api/integrations/onlyfans/sync \
  -H "Authorization: Bearer YOUR_TOKEN"

# MYM
curl -X POST http://localhost:3000/api/integrations/mym/sync

# Crypto
curl -X POST http://localhost:3000/api/finance/crypto/sync
```

---

## Sécurité

### Stockage des credentials

- Les API keys et tokens sont **chiffrés** par Supabase
- Stockés dans `agency_integrations` avec `tool` comme clé unique
- Jamais retournés au client (remplacés par `***`)

### Best practices

1. **Utilisez des clés read-only** quand possible (Binance, Coinbase)
2. **Créez des clés dédiées** pour chaque agence/environnement
3. **Rotez les clés régulièrement**
4. **Ne partagez jamais** les secrets tokens

---

## Fichiers Créés/Modifiés

### Créés

- `src/lib/platforms/onlyfans.ts` — Client OnlyFans
- `src/lib/platforms/mym.ts` — Client MYM
- `src/lib/platforms/binance.ts` — Client Binance (HMAC-SHA256)
- `src/lib/platforms/coinbase.ts` — Client Coinbase
- `src/app/api/integrations/onlyfans/test/route.ts`
- `src/app/api/integrations/mym/test/route.ts`
- `src/app/api/integrations/binance/test/route.ts`
- `src/app/api/integrations/coinbase/test/route.ts`
- `src/app/api/integrations/onlyfans/sync/route.ts`
- `src/app/api/integrations/mym/sync/route.ts`
- `src/app/api/finance/crypto/sync/route.ts`
- `supabase/add_fan_interactions.sql` — Table fan interactions

### Modifiés

- `src/app/(dashboard)/settings/integrations/page.tsx` — UI refactorisée avec sections
- `src/app/api/integrations/route.ts` — Support JSON storage
- `src/app/api/integrations/test/route.ts` — Test routes consolidés
- `src/app/(dashboard)/chatting/page.tsx` — Banner + sync data check

---

## Prochaines étapes (optionnel)

- [ ] Cron job pour synchronisation auto quotidienne
- [ ] Webhooks OnlyFans/MYM (si API dispo)
- [ ] Dashboard des gains crypto en temps réel
- [ ] Alertes fan mécontent (sentiment negative)
- [ ] Export Excel transactions

---

## Troubleshooting

### "OnlyFans connecté avec succès" mais aucune donnée

- Vérifiez les cookies ne sont pas expirés
- Rechargez OnlyFans et récupérez les nouveaux tokens
- Vérifiez le User Agent

### Binance "Invalid signature"

- Vérifiez que secret_key est correct
- Assurez-vous que l'horloge du serveur est synchronisée (NTP)
- L'API requiert une signature HMAC exacte

### CoinGecko rate limit

- L'API gratuite a une limite de ~50 requêtes/minute
- Utilisez le cache (revalidate=300 = 5 minutes)
- Pour production, obtenez une clé API gratuite CoinGecko

---

**Version :** 1.0.0
**Date :** Mai 2026
**Statut :** ✅ Prêt pour production
