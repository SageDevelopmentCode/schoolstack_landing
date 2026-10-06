# Manual email: Hayley Calvert ACH verification (2026-10-03)

**To:** canidcafe@gmail.com  
**Subject:** Action needed: verify your bank for Arrow’s tuition (Rooted Meadows)

## Payment IDs (Supabase)

- Sep: `040a76f7-06bf-4f80-962d-ff0154b873ba` · PI `pi_3UMAdpJPlPJpPJRq27tfIln3`
- Oct: `ea94f4ad-984b-4518-92d5-2a9b9c9f4edb` · PI `pi_3UMAhTJPlPJpPJRq1tVxQrdf`

## Get verification links

Stripe Dashboard → Rooted Meadows Connect account → each PaymentIntent → copy  
`next_action.verify_with_microdeposits.hosted_verification_url`

Or with **live** `STRIPE_SECRET_KEY` in `.env.local` (default is dry run — prints a manual draft, no send):

```bash
PAYMENT_IDS=040a76f7-06bf-4f80-962d-ff0154b873ba,ea94f4ad-984b-4518-92d5-2a9b9c9f4edb \
npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-ach-bank-verification.ts
```

Same output with explicit `PRINT_MANUAL=1`.

Sep and Oct use **different** Stripe verification URLs. Do **not** batch both IDs in one automated send — the script refuses when URLs differ. Use the draft above (both links) or the body template below.

## Send via MudKitchen (after deploy + live Zoho)

**Note:** Early resends from a machine with `NEXT_PUBLIC_SITE_URL=http://localhost:3000` could embed localhost in the email shell; the resend script now forces production URLs (see outbound-email-ops skill). Re-send from script after that fix if needed.

Run **once per payment** that still needs verification on Stripe (`requires_action` / micro-deposits). September may already be succeeded in checkout; the script skips PIs that are not awaiting verification.

```bash
DRY_RUN=0 PAYMENT_ID=ea94f4ad-984b-4518-92d5-2a9b9c9f4edb \
npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-ach-bank-verification.ts
```

Repeat with the Sep UUID only if that PaymentIntent still needs verification.

School admin recipients use the same org setting as **“Email admins when payments are received”** (Finances notifications).

Optional env flags:

| Env | Default | Purpose |
|-----|---------|---------|
| `DRY_RUN=0` | off (dry run on) | Required to send family email, Discord, and activity |
| `SEND_FAMILY=0` | on | Skip family verification email |
| `SEND_OPS=0` | on | Skip admin email, Discord, activity |
| `FORCE_OPS=1` | off | Re-send admin + Discord if ops activity already logged (no duplicate activity row) |

## Email preview (HTML)

Run `npm run preview:emails` and open:

- Parent: `.email-previews/ach-bank-verification-tuition.html`
- School admin: `.email-previews/ach-bank-verification-admin-tuition.html`

(Hayley sample copy; replace button URLs with real Stripe links.)

## Body template

Hi Hayley,

Thanks for starting tuition payment by bank account. Stripe still needs you to verify your Westmark account before the payment can go through. Until you complete this, no tuition has been debited.

**September tuition ($725):** [hosted_verification_url from Sep PI]

**October tuition ($725):** [hosted_verification_url from Oct PI]

1. Watch Westmark for a small Stripe entry with a **verification code** in the description.  
2. Open the link and enter that code.  
3. After verification, the payment moves to processing and then completes (usually a few business days).

If you have trouble, reply here or pay with a card in the parent billing portal.

— Rooted Meadows / MudKitchen
