# Rooted Meadows: mobile portal account links

Use this when enabling **Account** portal switching on the MudKitchen mobile app for Rakel / school leadership at Rooted Meadows Waldorf School.

## Why a link group is needed

- **`admin@rootedmeadowswaldorf.org`** — one login with school admin (owner membership), guardian/family access, and a staff row. Mobile can switch **School admin ↔ Parent portal** on this login alone.
- **`sparhawk.r@rootedmeadows.org`** — separate login with teacher/staff portal access. It is **not** merged until the accounts are in a **link group**.
- **`rakel.sparhawk@gmail.com`** — separate parent-only login; only add to the link group if Rakel must switch portals from that sign-in (parent portal for the family is already available on **admin@** via the guardian record).

Organization: **Rooted Meadows Waldorf School** (`slug`: `rooted-meadows`).

## Create the link group (production / staging admin UI)

Do **not** insert link groups via SQL in shared environments.

1. Open MudKitchen admin → **Organizations** → **Rooted Meadows Waldorf School**.
2. Open **Account links** ([`OrganizationAccountLinksPanel`](../src/components/admin/OrganizationAccountLinksPanel.tsx)).
3. Under **Unlinked logins**, add:
   - `admin@rootedmeadowswaldorf.org` as **Primary**
   - `sparhawk.r@rootedmeadows.org` via **Add to link builder**
4. Create the link group.

Optional: add `rakel.sparhawk@gmail.com` only if she signs in with that email and needs the same switcher.

## Verify after linking

1. **Web/API:** As `admin@rootedmeadowswaldorf.org`, `GET /api/portal-options?organizationId=<orgId>&slug=rooted-meadows` should include **School admin**, **Staff portal**, and **Parent portal** (plus **My applications** on web; mobile hides applications in the switcher).
2. **Mobile (live):** Sign in as admin@ → profile / More → **Account** section → switch between portals.
3. **Mobile (impersonate):** Platform admin → Impersonate → preview as admin@ → **Account** section → same portal list (read-only preview).

## Related code

- Link expansion: [`portal-account-link-context.ts`](../src/lib/auth/portal-account-link-context.ts)
- Portal list: [`portal-switcher-server.ts`](../src/lib/auth/portal-switcher-server.ts)
- Mobile switcher: [`account-portal-switcher-panel.tsx`](../apps/mobile/src/components/account-portal-switcher-panel.tsx)
- Preview switcher: [`preview-account-portal-switcher-panel.tsx`](../apps/mobile/src/components/platform-admin/preview-account-portal-switcher-panel.tsx)
