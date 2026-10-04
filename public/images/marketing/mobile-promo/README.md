# Mobile promo assets (slide 8)

Slide 8 of the tuition marketing carousel uses **React mocks** in Marketing Studio—not PNG captures from the Expo app.

| Component | Screen |
|-----------|--------|
| [`marketing-mobile-parent-home.tsx`](../../../../src/components/admin/marketing/screens/mobile/marketing-mobile-parent-home.tsx) | Parent home |
| [`marketing-mobile-parent-billing.tsx`](../../../../src/components/admin/marketing/screens/mobile/marketing-mobile-parent-billing.tsx) | Parent billing |
| [`marketing-mobile-admin-transactions.tsx`](../../../../src/components/admin/marketing/screens/mobile/marketing-mobile-admin-transactions.tsx) | School admin transactions |

Wired in [`marketing-mobile-promo-cluster.tsx`](../../../../src/components/admin/marketing/screens/marketing-mobile-promo-cluster.tsx) inside [`mobile-phone-frame.tsx`](../../../../src/components/admin/marketing/screens/mobile-phone-frame.tsx).

**Fiction:** Mud School (`mud-school`), **Mitchell family** (Sarah, Emma, Liam)—aligned with web marketing screens (`parent-home-screen.tsx`, `parent-billing-screen.tsx`). Colors use [`LUFF_LEARNING_ADMIN_COLORS`](../../../../src/data/school-demos/luff-learning-admin-demo.ts) (`#769a61`) via [`marketing-mobile-theme.ts`](../../../../src/components/admin/marketing/screens/mobile/marketing-mobile-theme.ts).

**Layout parity:** Mocks mirror the Expo app’s structure (floating parent/admin tab bars, home **Overview** sub-tab with Start here + Upcoming events, billing story header plus **Payment settings**, **By student**, **Upcoming charges**, **All family payments**)—not pixel-perfect RN. Shared demo copy lives in [`marketing-mobile-demo-data.ts`](../../../../src/components/admin/marketing/screens/mobile/marketing-mobile-demo-data.ts); tab chrome in [`marketing-mobile-floating-tab-bar.tsx`](../../../../src/components/admin/marketing/screens/mobile/marketing-mobile-floating-tab-bar.tsx).

## Edit mocks

1. Open **Admin → Marketing** → tuition carousel → slide 8.
2. Change copy, spacing, or colors in the `marketing-mobile-*.tsx` files and `mobile-screen-chrome.tsx`.
3. Export PNG from Marketing Studio when satisfied.

## Optional: simulator capture (parity audit)

Legacy PNGs in this folder are **not** used by the carousel. To compare mocks against the real app:

1. Local/staging Supabase with Mud School seeds (test parent → marketing persona → branding → staff admin). See manual SQL in `supabase/migrations_manual/seed_mud_school_*`.
2. Sign in on iOS Simulator as `testparent@gmail.com` → Mud School; configure tuition per the fiction above if you want a fair comparison.
3. Run [`apps/mobile/scripts/capture-marketing-screenshots.sh`](../../../../apps/mobile/scripts/capture-marketing-screenshots.sh) with each screen visible.

Outputs overwrite `parent-home.png`, `parent-billing.png`, and `admin-transactions.png` for reference only.
