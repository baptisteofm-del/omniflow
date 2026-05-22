# Deployment Checklist - Model Avatar & Platform Branding

**Project:** OmniFlow  
**Feature:** Model Avatar Upload & Platform Branding  
**Date:** May 22, 2026  
**Status:** Ready for Deployment  

---

## Pre-Deployment

### Code Review
- [ ] **All TypeScript files compile without errors**
  ```bash
  npx tsc --noEmit
  ```
  Expected: No errors shown

- [ ] **All React components render without warnings**
  - Check browser console for warnings
  - No deprecated API usage

- [ ] **API routes handle errors gracefully**
  - 401 Unauthorized
  - 400 Bad Request
  - 404 Not Found
  - 500 Server Error

### Peer Review
- [ ] Code reviewed by team member
- [ ] No security vulnerabilities identified
- [ ] Database migration validated
- [ ] API rate limiting not bypassed

---

## Database Deployment

### Pre-Migration Backup
- [ ] **Backup production database**
  ```bash
  # Using Supabase CLI
  supabase db pull  # Creates migration snapshot
  ```

- [ ] **Test migration locally first**
  ```bash
  supabase db reset  # Test on local instance
  ```

### Run Migration
- [ ] **Execute migration in Supabase**
  - [ ] Via SQL Editor (copy-paste `/supabase/add_model_photo.sql`)
  - [ ] Or via CLI: `supabase db push`
  - [ ] Verify no errors in SQL execution logs

### Post-Migration Validation
- [ ] **Verify new columns exist**
  ```sql
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'models'
  AND column_name IN ('avatar_url', 'bio', 'linked_integration_id', 'linked_platform');
  ```
  Expected: 4 rows returned

- [ ] **Verify indexes created**
  ```sql
  SELECT indexname FROM pg_indexes
  WHERE tablename = 'models'
  AND indexname LIKE 'models_%';
  ```
  Expected: See `models_linked_integration_id_idx` and `models_linked_platform_idx`

- [ ] **Test INSERT with new fields**
  ```sql
  INSERT INTO models (agency_id, name, avatar_url, bio, status)
  VALUES (UUID, 'Test', 'https://...', 'Test bio', 'active')
  RETURNING *;
  ```
  Expected: Row created successfully

### Data Migration (Optional)
- [ ] **No legacy data to migrate** (new fields only)
  - Existing models unaffected
  - Null/empty values are acceptable

---

## Backend Deployment

### New Routes Deployment
- [ ] **Avatar upload route ready**
  - File: `/src/app/api/models/avatar/route.ts`
  - Method: POST
  - Endpoint: `/api/models/avatar`

- [ ] **Model stats route ready**
  - File: `/src/app/api/models/stats/route.ts`
  - Method: GET
  - Endpoint: `/api/models/stats`

- [ ] **Model PATCH endpoint ready**
  - File: `/src/app/api/models/[id]/route.ts`
  - Added PATCH method for updates

- [ ] **Integrations filtering ready**
  - File: `/src/app/api/integrations/route.ts`
  - Query params: `?tool=onlyfans,mym&is_active=true`

### Build & Test
- [ ] **Production build completes**
  ```bash
  npm run build
  ```
  Expected: Build succeeds, no errors

- [ ] **Built assets verified**
  - JavaScript bundle size reasonable
  - No duplicate packages
  - Source maps available for debugging

### Environment Variables
- [ ] **All required env vars set in production**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Storage bucket configured

- [ ] **No hardcoded secrets in code**
  - API keys not exposed
  - Database credentials secure

---

## Frontend Deployment

### Component Verification
- [ ] **PlatformLogos component imports correctly**
  - File: `/src/components/PlatformLogos.tsx`
  - All logo components exported
  - No circular dependencies

- [ ] **Accounts page imports all dependencies**
  - Link component from Next.js
  - Toast notifications work
  - SVG logos render correctly

### CSS & Styling
- [ ] **Tailwind CSS classes valid**
  - No unrecognized classes
  - Color values match design
  - Responsive classes work (md:, lg:, etc.)

- [ ] **Glass morphism effects render**
  - Backdrop blur shows in supported browsers
  - Fallback styling for older browsers

### Image Optimization
- [ ] **Avatar images use correct format**
  - Supabase Storage URL structure: `/avatars/{agencyId}/{modelId}.{ext}`
  - Images served from CDN
  - Lazy loading enabled

---

## Storage Configuration

### Supabase Storage Setup
- [ ] **Avatars bucket exists**
  - Name: `avatars`
  - Public: **ON** (toggle enabled)
  - No RLS policies needed (public read)

- [ ] **Upload permissions configured**
  - Authenticated users can upload
  - Storage policies allow writes to own agency folder

### Bucket Security
- [ ] **Public bucket protections**
  - User can only see their own agency's avatars
  - Consider adding naming prefix (agency_id)
  - Max file size limits enforced (5MB)

---

## Testing - Unit Level

### API Route Tests
- [ ] **Avatar upload endpoint**
  - [x] Accepts image files
  - [x] Rejects non-image files
  - [x] Returns 401 when not authenticated
  - [x] Returns 404 for non-existent model
  - [x] Returns public URL on success

- [ ] **Model stats endpoint**
  - [x] Returns stats for all models
  - [x] Initializes stats as 0
  - [x] Sums revenue correctly
  - [x] Counts posts correctly

- [ ] **Model PATCH endpoint**
  - [x] Updates name field
  - [x] Updates bio field
  - [x] Updates platform arrays
  - [x] Validates ownership

- [ ] **Integrations GET with filters**
  - [x] Returns all integrations without filter
  - [x] Filters by single tool
  - [x] Filters by multiple tools (comma-separated)
  - [x] Filters by is_active

### Component Tests
- [ ] **PlatformLogo component**
  - [x] Renders correct logo for each platform
  - [x] Respects size prop
  - [x] SVG renders without errors

- [ ] **Accounts page**
  - [x] Loads models correctly
  - [x] Shows empty state
  - [x] Displays model cards
  - [x] Modal opens/closes

---

## Testing - Integration Level

### End-to-End Workflows

#### Avatar Upload Workflow
- [ ] **Full flow works**
  1. Navigate to Accounts page
  2. Click upload button on model card
  3. Select image file
  4. Image uploads successfully
  5. Avatar displays on card
  6. Refresh page → avatar persists

#### Model Edit Workflow
- [ ] **Full flow works**
  1. Click settings button on card
  2. Modal opens with current data
  3. Edit name/bio/platforms
  4. Click save
  5. Page refreshes
  6. Changes persisted

#### Navigation Workflow
- [ ] **All links functional**
  1. Click OnlyFans badge → navigates to `/chatting/ai`
  2. Click Instagram badge → navigates to `/posting`
  3. Click Revenus mois → navigates to `/finance`
  4. Click Posts publiés → navigates to `/posting`

#### Stats Display
- [ ] **Stats load and display**
  1. Models load
  2. Stats load (should be 0 initially)
  3. Stats display on cards
  4. No fake/placeholder data shown

### User Acceptance Testing (UAT)

#### Browser Compatibility
- [ ] **Chrome/Edge 120+**
  - Avatar upload works
  - SVG logos render crisp
  - Responsive layout correct
  - Animations smooth

- [ ] **Firefox 121+**
  - Same as Chrome

- [ ] **Safari 17+**
  - Same as Chrome

#### Mobile Testing
- [ ] **iPhone (iOS 17+)**
  - Avatar upload works on mobile
  - Modal accessible
  - Touch interactions responsive

- [ ] **Android (Chrome Mobile)**
  - Avatar upload works
  - Layout reflows correctly
  - No overlapping elements

#### Accessibility
- [ ] **Keyboard navigation**
  - Tab through form fields
  - Enter submits form
  - Escape closes modal

- [ ] **Screen reader support**
  - Alt text on images
  - Form labels associated with inputs
  - Button purposes clear

---

## Performance Testing

### Load Testing
- [ ] **Accounts page load time**
  - Target: < 2 seconds
  - Measure: With 100+ models loaded

- [ ] **Avatar upload performance**
  - Target: < 3 seconds for 1MB image
  - Network throttled testing

- [ ] **Stats endpoint response**
  - Target: < 500ms
  - Measure: With 100 models

### Bundle Size Analysis
- [ ] **Frontend bundle size**
  - Check `.next/static` folder
  - Ensure reasonable size growth
  - No unexpected dependencies added

---

## Security Testing

### Authentication & Authorization
- [ ] **Unauthenticated access blocked**
  - /api/models → 401
  - /api/models/avatar → 401
  - /api/models/stats → 401

- [ ] **Cross-agency access prevented**
  - User A cannot see models from Agency B
  - User A cannot upload to Agency B models
  - User A cannot modify Agency B data

### Input Validation
- [ ] **File upload validation**
  - Only image files accepted
  - File size limited
  - MIME type validated

- [ ] **Form input validation**
  - Required fields enforced
  - String lengths checked
  - Special characters escaped

### CORS & Headers
- [ ] **Storage bucket CORS configured**
  - Avatar upload requests succeed
  - No CORS errors in console

---

## Monitoring & Observability

### Error Tracking Setup
- [ ] **Error logging configured**
  - Sentry/Rollbar or similar
  - Avatar upload errors captured
  - API errors logged with context

### Analytics Setup
- [ ] **Track feature adoption**
  - How many users upload avatars?
  - Which platforms most used?
  - Click-through rates on badges

### Health Checks
- [ ] **Automated health checks**
  - /api/models responds
  - Supabase connection healthy
  - Storage bucket accessible

---

## Rollback Plan

### If Critical Issues Found

#### Option 1: Quick Hotfix (< 1 hour)
- [ ] Identify issue
- [ ] Fix in code
- [ ] Rebuild and redeploy
- [ ] Verify fix works

#### Option 2: Database Rollback
- [ ] Revert migration (drop new columns)
- [ ] Revert code to previous version
- [ ] Verify existing functionality

#### Option 3: Full Rollback
- [ ] Restore from backup database
- [ ] Revert code completely
- [ ] Clear caches
- [ ] Notify users if needed

---

## Post-Deployment

### Monitoring (First 24 Hours)
- [ ] **No error spikes in logs**
- [ ] **Avatar uploads working**
- [ ] **Performance metrics normal**
- [ ] **User feedback positive**

### Follow-up (First Week)
- [ ] **Check analytics dashboard**
- [ ] **Review error logs**
- [ ] **User adoption rate**
- [ ] **Performance metrics stable**

### Documentation Updates
- [ ] **Update API documentation**
  - New avatar endpoint docs
  - Stats endpoint details
  - Usage examples

- [ ] **Update user guides** (if applicable)
  - How to upload avatar
  - How to edit model platforms

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| **Developer** | ________ | ________ | [ ] Pass |
| **QA Lead** | ________ | ________ | [ ] Pass |
| **Product Owner** | ________ | ________ | [ ] Approved |
| **DevOps/Infra** | ________ | ________ | [ ] Deployed |

---

## Notes

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

**Deployment Version:** 1.0  
**Prepared by:** Development Team  
**Last Updated:** May 22, 2026  
**Next Review Date:** [After successful deployment]
