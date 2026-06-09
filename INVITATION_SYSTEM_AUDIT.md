# OmniFlow - Audit Complet du Système d'Invitation

**Date:** 2026-06-09  
**Status:** AUDIT COMPLÉTÉ  

---

## 1. SCHÉMA BASE DE DONNÉES - ÉTAT ACTUEL

### Tables existantes:
- ✅ `agencies` — Table principale
- ✅ `profiles` — Infos utilisateur (id, agency_id, full_name, avatar_url, role, created_at)
- ✅ `team_members` — Membres actifs (id, agency_id, user_id, email, role, joined_at, [permissions, status, created_at])
- ✅ `team_invitations` — Invitations (id, agency_id, email, role, token, accepted, created_at, expires_at, [accepted_at, permissions])

### RLS Policies:
- ❓ Existent mais avec problèmes potentiels (voir audit détaillé)

---

## 2. FLUX D'INVITATION - ÉTAPES ACTUELLES

### Flux 1: Inviter un membre (Owner)
```
POST /api/settings/team
├─ Valide auth du owner
├─ Vérifie que l'email n'existe pas déjà
├─ Génère un token UUID
├─ Insère dans team_invitations
└─ Envoie un email via Resend → lien /join?invitation=[token]&email=[email]&agency=[id]
```

**Route:** `POST /api/settings/team`  
**Statut:** ✅ Fonctionnelle  
**Email:** Utilise Resend avec template HTML  

### Flux 2: Afficher invitation (Visiteur non-auth)
```
GET /join?invitation=[token]&email=[email]&agency=[id]
└─ Page publique qui:
   ├─ Vérifie qu'aucun user n'est connecté
   ├─ Affiche deux options:
   │  ├─ "Créer mon compte" → /register?invitation=...&email=...&agency=...
   │  └─ "Se connecter" → /login?redirect=/join?invitation=...
   └─ Après auth, appelle /api/team/accept
```

**Route:** `/app/(auth)/join/page.tsx`  
**Statut:** ✅ Fonctionnelle  

### Flux 3: Créer un compte (Invité sans compte)
```
POST /register?invitation=[token]
├─ Form: name, email (pré-rempli), password
├─ Appelle POST /api/auth/invite-register
│  ├─ Valide le token
│  ├─ Vérifie expiration
│  ├─ Crée l'utilisateur via admin.auth.admin.createUser
│  │  └─ email_confirm: true (bypass email verification)
│  ├─ Upsert dans profiles
│  ├─ Insère dans team_members
│  └─ Marque team_invitations.accepted = true
└─ Appelle signInWithPassword automatiquement
└─ Redirige vers /dashboard
```

**Route:** `/app/(auth)/register/page.tsx` + `POST /api/auth/invite-register`  
**Statut:** ⚠️ PROBLÉMATIQUE (voir bugs)  

### Flux 4: Se connecter avec compte existant
```
GET /login?redirect=/join?invitation=...
└─ Auth normal
└─ Redirige vers /join
   └─ Appelle POST /api/team/accept
      ├─ Valide le token
      ├─ Vérifie email correspondence
      ├─ Crée l'entrée team_members
      └─ Marque invitation comme acceptée
```

**Route:** `/app/(auth)/login/page.tsx` + `/join` + `POST /api/team/accept`  
**Statut:** ✅ Semble fonctionnelle  

### Flux 5: Accepter une invitation (Membre authentifié)
```
POST /api/team/accept
├─ Récupère le user de la session
├─ Cherche l'invitation par token
├─ Vérifie expiration
├─ Vérifie email correspondence
├─ Insère/Vérifie dans team_members
├─ Marque l'invitation comme acceptée
└─ Retourne agencyId, agencyName, role
```

**Route:** `POST /api/team/accept`  
**Statut:** ✅ Fonctionnelle  

### Flux 6: Gérer l'équipe (Settings)
```
GET /api/settings/team
├─ Retourne owner (détecté par agency_id)
├─ Retourne active members (team_members)
├─ Retourne pending invitations (team_invitations.accepted = false)
└─ Retourne toutes les infos d'affichage

GET /app/(dashboard)/settings/team/page.tsx
├─ Affiche owner avec role "owner"
├─ Affiche members avec badges statut/rôle
├─ Affiche pending invitations avec "Renvoyer" / "Supprimer"
├─ Permet d'inviter → POST /api/settings/team
├─ Permet de modifier rôles → PATCH /api/settings/team
└─ Permet de supprimer → DELETE /api/settings/team
```

**Routes:** `GET/POST/PATCH/DELETE /api/settings/team`  
**Statut:** ✅ Semble fonctionnelle  

---

## 3. BUGS IDENTIFIÉS

### 🔴 BUG MAJEUR: "Nom d'utilisateur invalide" lors de la création de compte (Flux 3)

**Symptôme:**
- Utilisateur reçoit l'email d'invitation
- Clique sur le lien → `/join`
- Choisit "Créer mon compte" → `/register?invitation=...`
- Remplit le formulaire (nom, email, password)
- Clique "Créer mon compte et rejoindre"
- **ERREUR**: "Nom d'utilisateur invalide" ❌
- Account n'est PAS créé
- Utilisateur ne rejoint PAS l'agence

**Cause probable:**
1. **Pas de colonne `username` dans Supabase Auth** — L'erreur vient du serveur Supabase
2. **Le code tente de créer un compte avec un username manquant** — Mais on ne voit pas de validation username dans le code
3. **OU:** Une autre table/schéma a une contrainte sur username non visible

**Investigation plus approfondie nécessaire:**
- [ ] Vérifier les exact error messages du client Supabase
- [ ] Contrôler le schéma exact de `auth.users` dans Supabase
- [ ] Tester la création directement avec `admin.auth.admin.createUser`
- [ ] Vérifier les RLS policies sur `profiles` si une insertion est tentée

### ⚠️ BUG SECONDAIRE: Profils non créés correctement

**Symptôme:**
- Dans `POST /api/auth/invite-register`, ligne 132, on appelle:
  ```typescript
  await admin.from('profiles').upsert({
    id: userId,
    full_name: name || '',
  }).eq('id', userId)
  ```
- Cette insertion peut échouer silencieusement ou causer une cascading error

**Problème:**
- Le code n'ignore pas les erreurs
- Si `profiles` a des colonnes NOT NULL, ça bloquera
- Le schéma attendu: `id, agency_id, full_name, avatar_url, role, created_at`
  - `agency_id` → NULL? (peut être le problème)
  - `role` → NOT NULL DEFAULT 'owner'? (peut être le problème)

### ⚠️ BUG TERTIAIRE: RLS policies ambiguës

**Problème:**
- Les policies dans `team_members` et `team_invitations` sont incohérentes
- Exemple: la policy `Users can view team members of their agency` cherche `auth.uid()` dans `agencies.owner_id`, mais pas tous les users sont owners
- Cela peut causer des SELECT silencieusement vides

---

## 4. ÉTAT DU CODE - POINTS À VÉRIFIER

### ✅ Code fonctionnel:
- ✅ Email templates (Resend) — bien formatés
- ✅ Token generation (UUID) — robuste
- ✅ Expiration logic — 7 jours, timestamp vérifiés
- ✅ Page `/join` — UI correcte

### ⚠️ Code suspect:
- ⚠️ `invite-register/route.ts` ligne 86-88: `admin.auth.admin.listUsers()` — **pas récursif**, peut retourner seulement 1000 users!
  ```typescript
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(...)
  ```
- ⚠️ `invite-register/route.ts` ligne 132: Upsert dans profiles sans agency_id
  ```typescript
  await admin.from('profiles').upsert({
    id: userId,
    full_name: name || '',
  }).eq('id', userId)
  ```
  **Problème:** `agency_id` est NOT NULL? `role` a default?
  
- ⚠️ `invite-register/route.ts` ligne 118: Pas de gestion d'erreur pour `createUser`
  ```typescript
  if (createError && createError.message?.includes('already')) {
    // retourne 409
  }
  throw createError  // ← Erreur non capturée, peut être "invalid username"
  ```

- ⚠️ `team/accept/route.ts` ligne 63: Tentative fallback sur insert team_members sans status/permissions
  ```typescript
  let memberError: any = null
  const res1 = await admin.from('team_members').insert({ ...memberData, status: 'active' })
  memberError = res1.error
  if (memberError && (memberError.code === '42703' || memberError.message?.includes('column'))) {
    const res2 = await admin.from('team_members').insert(memberData)
    memberError = res2.error
  }
  ```
  **Problème:** Les colonnes `status` et `permissions` peuvent exister mais pas accepter 'active'/'{}'

### ❌ Code cassé:
- ❌ `settings/team/page.tsx` — Affiche un permissions modal mais les permissions ne sont pas sauvegardées/récupérées correctement
- ❌ `GET /api/settings/team` — Ne retourne pas les permissions de chaque membre

---

## 5. SCHÉMA DB — CORRECTION NÉCESSAIRE

Le fichier `FIX_TEAM_INVITATIONS_PRODUCTION.sql` propose une structure correcte:

```sql
team_invitations:
  - id uuid PRIMARY KEY
  - agency_id uuid (FK agencies, CASCADE)
  - email text NOT NULL
  - role text DEFAULT 'member'
  - token text UNIQUE NOT NULL
  - accepted boolean DEFAULT false
  - created_at timestamptz
  - expires_at timestamptz
  - accepted_at timestamptz (NOUVEAU)
  - permissions text[] DEFAULT '{}'

team_members:
  - id uuid PRIMARY KEY
  - agency_id uuid (FK agencies, CASCADE)
  - user_id uuid (FK auth.users, CASCADE)
  - email text NOT NULL
  - role text NOT NULL
  - joined_at timestamptz
  - permissions text[] DEFAULT '{}'
  - status text DEFAULT 'active' (NOUVEAU)
  - created_at timestamptz (NOUVEAU)
```

---

## 6. RÔLES PRÉDÉFINIS DANS L'UI

D'après `settings/team/page.tsx`:

```
- Monteur Vidéo (video_editor) — Locked permissions
- Manager Chatting (chatting_manager) — Flexible
- Manager Marketing (marketing_manager) — Flexible
- Administrateur (admin) — Full access
```

Mais le code API in `settings/team/route.ts` accepte:
```
- member, admin, video_editor, chatting_manager, marketing_manager
```

**Manque: Rôles OmniFlow complets selon la tâche:**
- Monteur Vidéo ✅
- Manager Chatting ✅
- Manager Marketing ✅
- Administrateur ✅
- Comptable ❌
- Community Manager ❌
- Chatter ❌

---

## 7. PLAN DE CORRECTION

Voir le fichier `INVITATION_SYSTEM_FIX.md` pour le détail.

**Résumé:**
1. **Audit des erreurs exactes** — Reproduire le bug en local/staging
2. **Correction DB schema** — Exécuter les migrations
3. **Fix du code invite-register** — Gestion d'erreur, profiles correctes
4. **Fix des RLS policies** — Rendre cohérentes, plus permissives
5. **Amélioration email** — Clarifier les étapes, ajouter du debugging
6. **Tests end-to-end** — Vérifier tous les flux
7. **Ajout rôles manquants** — Comptable, Community Manager, Chatter

---

## Fichiers affectés:

1. `supabase/migrations/fix_invitations_system.sql` (NOUVEAU)
2. `src/app/api/auth/invite-register/route.ts` (MODIFIÉ)
3. `src/app/api/team/accept/route.ts` (MODIFIÉ)
4. `src/app/api/settings/team/route.ts` (MODIFIÉ)
5. `src/app/(auth)/register/page.tsx` (AMÉLIORÉ)
6. `src/app/(auth)/join/page.tsx` (AMÉLIORÉ)
7. `src/app/(dashboard)/settings/team/page.tsx` (AMÉLIORÉ)

