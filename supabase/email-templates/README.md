# Supabase auth email templates

MudKitchen-branded HTML for Supabase Authentication emails. Templates are generated from [`src/lib/supabase-auth-emails.ts`](../../src/lib/supabase-auth-emails.ts) using the same design system as [`src/lib/email-layout.ts`](../../src/lib/email-layout.ts) (homepage / transactional emails).

## Files

| File | Paste into Supabase dashboard |
|------|-------------------------------|
| [`magic-link.html`](./magic-link.html) | **Authentication → Email Templates → Magic Link** |
| [`confirm-signup.html`](./confirm-signup.html) | **Authentication → Email Templates → Confirm signup** |

## Recommended subjects

Paste these into the **Subject** field in each Supabase email template. Supabase replaces `{{ .Token }}` with the 6-digit code (parents see the code in their inbox before opening the email).

| Template | Subject line |
|----------|----------------|
| Magic Link | `{{ .Token }} is your sign-in code` |
| Confirm signup | `{{ .Token }} is your verification code` |

Defined in code as `SUPABASE_MAGIC_LINK_SUBJECT` and `SUPABASE_CONFIRM_SIGNUP_SUBJECT` in [`src/lib/supabase-auth-emails.ts`](../../src/lib/supabase-auth-emails.ts). Regenerating previews also writes [`subjects.txt`](./subjects.txt) in this folder.

## Setup

1. **Custom SMTP** (optional but recommended): **Authentication → SMTP Settings**
   - Sender email: e.g. `auth@trymudkitchen.com`
   - Sender name: e.g. `School Admissions` (neutral) or your live school name
   - Zoho host: `smtp.zoho.com`, port `465` or `587`

2. **Email templates**: Open each template in the dashboard, replace the body HTML with the contents of the matching file in this folder.

3. **OTP codes, not links**: Both templates use `{{ .Token }}` for a 6-digit code. Do **not** use `{{ .ConfirmationURL }}` if your apply flow uses `verifyOtp` in the app.

4. **OTP length**: **Authentication → Providers → Email → OTP length** — set to `6` to match the apply flow UI.

5. **Regenerate after design changes**:
   ```bash
   npm run preview:emails
   ```
   This updates `magic-link.html` and `confirm-signup.html` here, and writes browser previews to `.email-previews/`.

## Deliverability

Auth emails are sent by Supabase through your custom SMTP (Zoho). Inbox placement depends on DNS authentication for `trymudkitchen.com`, not on app code.

### Supabase SMTP settings

**Authentication → SMTP Settings**

- Sender email: `auth@trymudkitchen.com` (dedicated transactional address)
- Sender name: consistent branded name, e.g. `MudKitchen` or `MudKitchen Admissions`
- Host: `smtp.zoho.com`, port `465` (SSL) or `587` (TLS)
- Use **Send test email** after DNS records are in place

### Zoho Mail (DKIM)

In Zoho Mail admin for `trymudkitchen.com`:

1. Enable **email authentication** / DKIM for the domain
2. Add the DKIM TXT record Zoho provides to your DNS host

### DNS records

Add these at your registrar or DNS provider (e.g. Cloudflare):

| Record | Purpose |
|--------|---------|
| **SPF** (TXT on `@`) | Authorize Zoho to send for the domain. Include `include:zoho.com` — only one SPF TXT record on the root domain. |
| **DKIM** (TXT from Zoho) | Cryptographic signature so Gmail/Outlook trust the message |
| **DMARC** (TXT on `_dmarc`) | Policy and reporting. Start with `v=DMARC1; p=none; rua=mailto:you@trymudkitchen.com`, then tighten to `p=quarantine` once stable |

### Verify authentication

After DNS propagates (minutes to 48 hours):

1. Send a test OTP to Gmail → open the message → **Show original** → confirm `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`
2. Or send a one-off test to [mail-tester.com](https://www.mail-tester.com) and aim for a score of 8+

### Reputation

- First sends from a new address often land in spam until recipients mark **Not spam** — the apply flow verify step tells parents to check spam/junk
- Avoid changing the From address frequently
- HTML templates already include a preheader, branded layout, and absolute logo URL (`https://trymudkitchen.com/images/Logo.png`)

## Local preview

```bash
npm run preview:emails
```

Open `.email-previews/supabase-magic-link-otp.html` and `.email-previews/supabase-confirm-signup-otp.html` in a browser to review styling with a sample code (`482916`).

## Notes

- Logo URL is absolute (`https://trymudkitchen.com/images/Logo.png`) so it renders in email clients.
- Sender name in SMTP is **fixed per Supabase project** — not per school. School branding lives on the apply page; email copy is intentionally neutral.
- **Magic Link** is Supabase’s template name for `signInWithOtp` — the HTML is OTP-first even though the dashboard label says “Magic Link”.
