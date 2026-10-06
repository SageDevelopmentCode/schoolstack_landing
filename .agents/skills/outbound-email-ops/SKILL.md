---
name: outbound-email-ops
description: >
  Run one-off or script-driven Zoho outbound email (resend notifications, ACH
  verification, receipts, committee catch-up) with production trymudkitchen.com
  links and logo — never localhost from .env.local. Use when sending email via
  scripts/, DRY_RUN=0 ops sends, or resend-* / send-* under scripts/.
---

# Outbound email ops (production URLs)

## When to use

- Any `scripts/*` run that sends real email through Zoho (`DRY_RUN=0`)
- User asks to resend receipts, ACH verification, admin payment alerts, application submitted, committee catch-up, etc.

**Not for:** `.email-previews/` or `npm run preview:emails` (localhost in previews is OK).

## Rules

1. **Never** assume `.env.local` `NEXT_PUBLIC_SITE_URL` is production (often `http://localhost:3000`).
2. **`SITE_URL` in `@/lib/site` is frozen at import time** — use `getRuntimeSiteUrl()` and `composeEmail` (defaults to runtime URL). Do not rely on cached `SITE_URL` for sent HTML.
3. Before `await import("@/lib/emails")` or notification libs from a script, call:
   - `ensureProductionSiteUrlForOutboundEmail()` from [`scripts/lib/outbound-email-production-site.ts`](scripts/lib/outbound-email-production-site.ts)
   - `logOutboundEmailSiteUrl("<script-prefix>")`
4. Before `DRY_RUN=0`, call `assertNoLocalhostInOutboundHtml(html)` on representative HTML (family + admin templates when applicable).
5. Logo in sent mail must be `https://trymudkitchen.com/images/Logo.png` unless `EMAIL_SITE_URL` is intentionally set to another public host (not localhost).
6. Optional override: `EMAIL_SITE_URL=https://trymudkitchen.com` (or staging) on the command line.

## Known send scripts

Audit `scripts/` for `sendZohoEmail`, `@/lib/emails`, or notification resends:

| Script | Purpose |
|--------|---------|
| `resend-ach-bank-verification.ts` | ACH micro-deposit family + admin ops |
| `resend-payment-admin-notification.ts` | Payment received admin email |
| `resend-tuition-receipt.ts` | Tuition receipt |
| `resend-application-submitted-notification.ts` | Application submitted |
| `send-committee-unread-catchup.ts` | Committee unread digest |
| `test-zoho-send.ts` | Zoho smoke test |
| `send-unsubscribe-test-email.ts` | Unsubscribe link test |

## ACH resend specifics

- Live PaymentIntents need **`sk_live_…`** in `STRIPE_SECRET_KEY`, or set **`HOSTED_VERIFICATION_URL`** from Stripe Dashboard when local env is test-only.
- Sep/Oct with **different** verification URLs → one `PAYMENT_ID` per send (see [`validateAchResendBatch`](scripts/lib/resend-ach-batch-validation.ts)).
- See [`docs/stripe-production-webhooks.md`](docs/stripe-production-webhooks.md).

## Auth templates (Supabase)

Supabase magic-link / confirm-signup HTML always uses production logo — see [`supabase/email-templates/README.md`](supabase/email-templates/README.md).

## Standard command shape

```bash
npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/<script>.ts
```

Scripts call `ensureProductionSiteUrlForOutboundEmail()` at runtime; you do not need to prefix `NEXT_PUBLIC_SITE_URL` if the script is updated per this skill.

## Cursor rule

Short reminder: [`.cursor/rules/outbound-email-ops.mdc`](../../.cursor/rules/outbound-email-ops.mdc)
