# Stripe production webhooks (MudKitchen)

Live endpoint (apex only, no `www`):

`https://trymudkitchen.com/api/stripe/webhook`

## Required events

Subscribe the live webhook destination to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.requires_action`
- `account.updated`

Local forwarding (`npm run dev:stripe` or `scripts/dev-with-stripe.ts`) uses the same event list.

## After deploy checklist

1. Stripe Dashboard → Developers → Webhooks → select the live destination → confirm all events above are enabled.
2. Send a test event or complete a test Checkout in live mode and confirm `200` delivery in Stripe.
3. Confirm `STRIPE_WEBHOOK_SECRET` in Vercel matches the signing secret for that destination.

## One-off ACH verification resend

For families stuck on micro-deposit verification after checkout (e.g. before deploy).

Follow [`.agents/skills/outbound-email-ops/SKILL.md`](../.agents/skills/outbound-email-ops/SKILL.md): scripts force production `trymudkitchen.com` for logo/links (not `.env.local` localhost). Use live `STRIPE_SECRET_KEY` when PaymentIntents are live mode, or `HOSTED_VERIFICATION_URL` from the Dashboard when local env is test-only.

By default the script **does not send** — it fetches Stripe state and prints a manual email draft.

Preview / manual copy (default):

```bash
PAYMENT_ID=<application_payment uuid> npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-ach-bank-verification.ts
```

Live send (one payment per run; all batched IDs must share one family and one verification URL):

```bash
DRY_RUN=0 PAYMENT_ID=<uuid> npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-ach-bank-verification.ts
```

Explicit print-only (same as default dry run):

```bash
PAYMENT_ID=<uuid> PRINT_MANUAL=1 npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-ach-bank-verification.ts
```
