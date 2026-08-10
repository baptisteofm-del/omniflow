# BILLING_GOLDEN_TESTS.md

Per spec 47.108 (Phase 13 exit): "les golden tests financiers doivent
passer." No automated test suite exists yet anywhere in this rebuild
(tracked since Phase 1) — these are hand-verified reference cases for
`computeCommissionCents()` (`src/lib/billing/ledger.ts`), the one function
that turns a gross sale amount into a commission amount. Re-run the node
snippet below any time that function changes; every row must still match.

Commission rate: **2.5%** (`DEFAULT_COMMISSION_RATE` in `ledger.ts`).

| Gross sale | Commission (expected) | Commission (computed) |
|---|---|---|
| €100.00 | €2.50 | €2.50 |
| €50.00 | €1.25 | €1.25 |
| €39.00 | €0.98 | €0.98 |
| €15.00 | €0.38 (rounds up from €0.375) | €0.38 |
| €9.99 | €0.25 | €0.25 |
| €199.00 | €4.98 | €4.98 |
| €0.01 | €0.00 (rounds down from €0.00025) | €0.00 |
| €1,000,000.00 | €25,000.00 | €25,000.00 |
| €33.33 | €0.83 | €0.83 |

Verified with:

```js
function computeCommissionCents(grossAmount, rate) {
  const grossCents = Math.round(grossAmount * 100)
  return Math.round(grossCents * rate)
}
// node -e '...' with the cases above — all match, including the naive-float
// trap case (39 * 0.025 lands on 0.9750000000000001 in raw JS floats before
// rounding; computing on integer cents avoids ever hitting that).
```

## Eligibility golden cases

`ELIGIBLE_TRANSACTION_TYPES` = `message_purchase`, `media_purchase`,
`custom_content`, `live_session`, `tip`. `subscription` and `other` are
**not** eligible — `eligible_amount` and `commission_amount` are both `0`
for those, regardless of `gross_amount`. This reflects the business rule in
`0018_billing_commission.sql`'s header comment (platform subscription
revenue ≠ Chatting-driven sales) — flagged in TECH_DEBT.md as needing real
legal/commercial sign-off before this ever bills real money (spec 22.5
explicitly requires that validation).

## Not covered by this pass (see TECH_DEBT.md)

Refunds/reversals reducing a already-ledgered commission, multi-currency
conversion, duplicate-transaction/duplicate-webhook idempotency (no real
payment provider is wired yet, so there's no webhook to duplicate),
proration on plan upgrade/downgrade mid-period. Spec 22.60 lists all of
these as things Billing must eventually test — none apply yet since there's
no real provider behind `agencies.billing_provider = 'mock'`.
