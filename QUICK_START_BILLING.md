# 🚀 Quick Start: Billing & Subscriptions

## For Developers

### Files to Know
- **Webhook:** `/src/app/api/paddle/webhook/route.ts`
- **API:** `/src/app/api/settings/billing/route.ts`
- **UI:** `/src/app/(dashboard)/settings/billing/page.tsx`
- **Components:** `/src/components/ui/Skeleton.tsx`
- **Errors:** `/src/app/not-found.tsx`, `/src/app/error.tsx`

### Test Locally
```bash
# Start dev server
npm run dev

# Visit billing page
open http://localhost:3000/settings/billing

# Test webhook with curl (requires auth token)
curl -X POST http://localhost:3000/api/paddle/webhook \
  -H "Content-Type: application/json" \
  -H "paddle-signature: <valid_signature>" \
  -d '{"event_type":"subscription.created",...}'
```

### Environment Setup
```bash
# Copy example
cp .env.local.example .env.local

# Fill in required vars
PADDLE_API_KEY=...
PADDLE_WEBHOOK_SECRET=...
NEXT_PUBLIC_PADDLE_STARTER_MONTHLY=pri_...
# ... other price IDs
```

---

## For Users

### View Your Plan
1. Login to dashboard
2. Go to **Settings → Billing**
3. See current plan, trial countdown, renewal date

### Change Plan
1. Click **"Changer de plan"** button
2. Select new plan from grid
3. Redirected to Paddle checkout
4. Complete payment
5. Subscription updates automatically

### Cancel Subscription
1. Click **"Annuler l'abonnement"** button
2. Confirm cancellation
3. Subscription marked as canceled
4. Service continues until renewal date

---

## For Admins (Paddle Setup)

### 1. Create Products & Prices
Paddle Dashboard → Products → Create:

| Plan | Monthly Price | Yearly Price |
|------|--------------|--------------|
| Starter | €49 | €468 (€39/month) |
| Pro | €99 | €948 (€79/month) |
| Agency | €249 | €2,388 (€199/month) |

**Get Price IDs** (pri_xxx format)

### 2. Set Environment Variables
```env
NEXT_PUBLIC_PADDLE_STARTER_MONTHLY=pri_01jh...
NEXT_PUBLIC_PADDLE_STARTER_YEARLY=pri_01jh...
NEXT_PUBLIC_PADDLE_PRO_MONTHLY=pri_01jh...
NEXT_PUBLIC_PADDLE_PRO_YEARLY=pri_01jh...
NEXT_PUBLIC_PADDLE_AGENCY_MONTHLY=pri_01jh...
NEXT_PUBLIC_PADDLE_AGENCY_YEARLY=pri_01jh...
PADDLE_WEBHOOK_SECRET=<generate in Paddle>
```

### 3. Configure Webhook
Paddle Dashboard → Developer Tools → Webhooks → Add:
- **URL:** `https://yourdomain/api/paddle/webhook`
- **Events:** subscription.*, transaction.*
- **Copy Secret** → PADDLE_WEBHOOK_SECRET env var

### 4. Deploy
```bash
git push origin clean-main:main --force
# Vercel auto-deploys with env vars from dashboard
```

### 5. Test
- Create test subscription in Paddle sandbox
- Verify webhook fires (check server logs)
- Check Supabase: agencies table should update

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Billing page shows error | Check auth, agency exists in DB |
| Webhook not updating DB | Verify PADDLE_WEBHOOK_SECRET matches |
| Checkout URL is 404 | Check NEXT_PUBLIC_PADDLE_*_MONTHLY vars |
| Trial countdown wrong | Verify trial_ends_at timestamp in DB |
| Skeleton never stops loading | Check API endpoint for errors |

---

## API Reference

### GET /api/settings/billing
**Response:**
```json
{
  "agency": {
    "id": "...",
    "planId": "pro",
    "subscriptionStatus": "active",
    "trialDaysRemaining": null
  },
  "plan": {
    "id": "pro",
    "name": "Pro",
    "price": { "monthly": 99, "yearly": 948 }
  }
}
```

### POST /api/settings/billing
**Request:**
```json
{
  "action": "checkout",
  "priceId": "pri_01jh..."
}
```

**Response:**
```json
{
  "checkoutUrl": "https://paddle.com/checkout/..."
}
```

---

## Best Practices

✅ Always verify webhook signatures
✅ Use Supabase RLS for agency_id isolation
✅ Test in Paddle sandbox before production
✅ Monitor webhook delivery in Paddle logs
✅ Set up error notifications for failed updates
✅ Backup agency data before testing
✅ Use environment-specific credentials

---

Generated: 2026-05-21
