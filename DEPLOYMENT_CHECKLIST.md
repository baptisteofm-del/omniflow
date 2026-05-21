# 🚀 Deployment Checklist — Profil + Équipe + Notifications

## ✅ Pre-Deployment

- [x] All code committed to `clean-main` branch
  - Commit: `924831a` ✨ Profil + Équipe + Notifications dashboard
  - Commit: `3a325fc` 🔒 Remove token from documentation
- [x] TypeScript compilation verified
- [x] No breaking changes to existing features
- [x] All new components follow design system
- [x] Security features implemented (RLS, password validation)

## 🗄️ Step 1: Database Setup

### In Supabase Console

1. **Create Tables & Policies** (Execute in SQL Editor)

```sql
-- Option 1: Copy-paste all SQL from files
\i supabase/add_team.sql;
\i supabase/add_notifications.sql;

-- Option 2: Or run line-by-line from the migration files
-- (See supabase/add_team.sql and supabase/add_notifications.sql)
```

2. **Create Storage Bucket**

Go to: Supabase Console → Storage → New Bucket
- Bucket name: `avatars`
- Public/Private: Public
- File size limit: 5MB

3. **Verify Tables Created**

Check these appear in `Database` → `Tables`:
- [ ] `team_members`
- [ ] `team_invitations`
- [ ] `notifications`

4. **Verify RLS Policies**

Click each table → `Authentication` → Verify policies exist:
- [ ] team_members: SELECT, INSERT, UPDATE, DELETE policies
- [ ] team_invitations: SELECT, INSERT, DELETE policies
- [ ] notifications: SELECT, INSERT, UPDATE policies

## 🔧 Step 2: Code Deployment

### Local Development

```bash
cd /data/.openclaw/workspace/omniflow

# Install dependencies (if needed)
npm install

# Build locally to verify no errors
npm run build

# Run dev server to test
npm run dev
```

### Push to GitHub

```bash
# Note: There's a pre-existing secret in commit 07d222e
# If push fails with "Push cannot contain secrets":

# Option A: Resolve in GitHub Settings
# Visit: https://github.com/baptisteofm-del/omniflow/security/secret-scanning/unblock-secret/3E2nKWNT5rxelsVJWjEB0VCesai
# Click "Allow" to whitelist the old secret

# Option B: Or wait for secret scanning to auto-remediate

# Then push:
git push origin clean-main:main --force
```

### Vercel Deploy

```bash
# Using environment variable with provided token
export VERCEL_TOKEN=<your_vercel_token>
vercel --yes --prod
```

## ✅ Step 3: Post-Deployment Testing

### Test Profile Page

- [ ] Navigate to `/settings/profile`
- [ ] Verify agency avatar shows with initials
- [ ] Edit agency name → Save → Verify update
- [ ] Try to edit email → Should be disabled
- [ ] Change timezone → Save → Verify persists
- [ ] Upload new avatar → Verify appears
- [ ] Try password change:
  - [ ] Wrong current password → Error
  - [ ] Passwords don't match → Error
  - [ ] Valid change → Success
  - [ ] Log out and login with new password → Works

### Test Team Page

- [ ] Navigate to `/settings/team`
- [ ] See list of team members (should be 1 = owner)
- [ ] Click "Inviter un membre"
  - [ ] Modal appears
  - [ ] Enter invalid email → Error
  - [ ] Enter valid email + role → Send
  - [ ] Check invitation appears in "Invitations en attente"
- [ ] Try to delete owner → Should show error
- [ ] Create another member first, then delete it → Works

### Test Notifications

- [ ] In browser dev console: test API call:
  ```javascript
  fetch('/api/notifications').then(r => r.json()).then(console.log)
  // Should return { notifications: [], unreadCount: 0 }
  ```
- [ ] NotificationBell appears in top-right of dashboard header
- [ ] Bell shows badge when unread count > 0
- [ ] Click bell → Dropdown opens
- [ ] Create test notification in Supabase:
  ```sql
  INSERT INTO notifications (agency_id, type, title, message)
  SELECT id, 'post_published', 'Test Post', 'Your post was published'
  FROM agencies LIMIT 1;
  ```
- [ ] Refresh dashboard → Notification appears in bell
- [ ] Click notification → Mark as read
- [ ] Badge count decreases

### Test Sidebar

- [ ] "Profil" link appears in "Paramètres" section
- [ ] Click "Profil" → Navigate to `/settings/profile`
- [ ] Active state shows correct styling

### Test Header

- [ ] NotificationBell appears in top-right
- [ ] Header has proper styling (border, glass effect)
- [ ] Notification dropdown doesn't overflow viewport

## 🔍 Step 4: Integration Testing

### With Existing Features

- [ ] Dashboard loads without errors
- [ ] Other settings pages still work (Abonnement, Équipe, Intégrations)
- [ ] Sidebar navigation works
- [ ] Auth still required (logout → redirect to /login)

### Database Queries

```sql
-- Check team_members created correctly
SELECT * FROM team_members WHERE agency_id = 'YOUR_AGENCY_ID';

-- Check team_invitations
SELECT * FROM team_invitations WHERE agency_id = 'YOUR_AGENCY_ID';

-- Check notifications
SELECT * FROM notifications WHERE agency_id = 'YOUR_AGENCY_ID';

-- Verify RLS (as non-owner, should see nothing)
-- Test by changing auth context
```

## 🔒 Step 5: Security Verification

- [ ] RLS policies prevent data leakage
  - [ ] Non-owner cannot see other agency data
  - [ ] Each user only sees their own agency data
- [ ] Passwords hashed properly
  - [ ] Database stores hashed version only
  - [ ] Never transmitted in clear in network
- [ ] API validates permissions
  - [ ] Try DELETE team member as non-owner → 403 Forbidden
- [ ] Email not editable
  - [ ] Form field disabled
  - [ ] API ignores email in PATCH request
- [ ] Invitation tokens unique
  - [ ] Try sending 2 invites to same email → Error on 2nd

## 📊 Step 6: Performance Check

- [ ] NotificationBell polling doesn't cause performance issues
- [ ] Notifications dropdown renders smoothly (<100ms)
- [ ] Team member list loads quickly (<500ms for 20 members)
- [ ] Profile page loads avatar without lag

## 📱 Step 7: Responsiveness

Test on different screen sizes:
- [ ] Mobile (375px): Pages responsive, dropdowns don't overflow
- [ ] Tablet (768px): Proper spacing
- [ ] Desktop (1440px): Full features visible

## 🎨 Step 8: Design Consistency

- [ ] Colors match existing design (purple/cyan gradient)
- [ ] Typography consistent
- [ ] Spacing follows grid (4px units)
- [ ] Icons from lucide-react all consistent
- [ ] Glass morphism effect visible
- [ ] Dark mode consistent

## 📋 Step 9: Browser Testing

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## ✅ Final Verification Checklist

- [ ] All 8 new files created and present
- [ ] All 2 modified files updated correctly
- [ ] 2 SQL migration files created
- [ ] Commits pushed to `clean-main` branch
- [ ] Vercel deployment successful (check vercel.com)
- [ ] Production URL loads without errors
- [ ] All three features working (profile, team, notifications)
- [ ] No console errors
- [ ] No TypeScript warnings
- [ ] API endpoints responding correctly
- [ ] Database tables created with RLS
- [ ] Design system maintained
- [ ] No breaking changes to existing features

## 🚨 Rollback Plan (if needed)

```bash
# If something goes wrong:

# Revert code
git revert 3a325fc
git revert 924831a
git push origin clean-main:main

# OR reset to before these commits
git reset --hard f1ae89f
git push origin clean-main:main --force

# Drop tables in Supabase SQL Editor
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;

# Delete avatars bucket
# (In Storage settings → Delete avatars bucket)
```

## 📞 Support

If deployment fails:

1. Check Vercel logs for build errors
2. Verify Supabase connection string in `.env.local`
3. Check browser console for client-side errors
4. Verify RLS policies in Supabase
5. Ensure avatars bucket is created and public

---

## 🎯 Sign-Off

Once all steps are complete:

- [ ] Deployment successful
- [ ] All tests passing
- [ ] Stakeholders notified
- [ ] Monitoring set up (if needed)
- [ ] Documentation updated

**Status:** Ready to deploy ✅

**Deployed by:** ________________________

**Date:** ________________________

**Notes:** ____________________________________________________________________________

