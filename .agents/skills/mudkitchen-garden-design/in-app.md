# Garden in the apps: portals and mobile

Read this before changing anything under:
- `src/app/school/[slug]/` (school admin, parent, teacher)
- `src/components/school-admin/`, `school-parent/`, `school-teacher/`
- `src/components/demo/`
- `apps/mobile/`

## The principle: the school's brand owns the portal

The school admin, parent and teacher portals (web and mobile) are **white-labelled per school**:
- **Tokens:** `buildParentThemeTokens(branding)` (`src/lib/organization-settings/parent-theme.ts`) takes each school's `branding.colors.accent*` as `primary*` and its `typography.bodyFont`.
- **Shell:** `SchoolAdminStoryShell` (`src/components/school-admin/SchoolAdminStoryShell.tsx`) and `ParentThemeContext` (`src/components/school-parent/ParentThemeContext.tsx`) hand those tokens to the primitives as JS values. They're applied mostly as inline `style={{}}`.
- **Fonts:** Fraunces (display) and DM Sans (body).
- **Rules:** that system is **School Day Story**, documented in `.agents/skills/admin-workspace-design` and `.agents/skills/parent-portal-story-design`. Those skills stay authoritative for portal content.

So:
- **Never put Garden colours on school-branded content.** No clay buttons, butter notes, Bricolage headings or tilted cards inside a school's parent home, billing, roster or messages. A family at "Rooted Meadows" sees Rooted Meadows' purple, not MudKitchen clay.
- **MudKitchen-owned surfaces** (where MudKitchen, not the school, is speaking) use **Calm Garden**.
- **Portal changes ripple into marketing.** The marketing demos (`src/components/demo/shared/*`, `demo-story-theme.ts`, `DemoStage`) render the *real* portal components. Restyle a portal primitive and every demo on the home page changes too. Re-check `/` and `/demo/*` after any portal change.

## Surface map

| Surface | System | Files |
|---|---|---|
| Login and auth | Calm Garden | `src/app/login/page.tsx`, `src/app/auth/*` |
| Try-for-free signup | Calm Garden (it's marketing-adjacent, so Full Garden is fine above the form) | `src/app/try/page.tsx`, `TryFreeHeadline.tsx`, `TryFreeSchoolForm.tsx` |
| Free-plan upgrade prompt (MudKitchen selling its own plan) | Calm Garden | `src/components/school-admin/FreePlanUpgradeDialog.tsx` |
| First-run onboarding, product tours, "what's new" | Calm Garden | `AdminFeatureAnnouncementsCard`, `AdminDashboardHowToGuidesCard` (`src/components/school-admin/ui/story/`) |
| Empty states | School Day Story layout, plus the Garden empty-state treatment below | `src/components/school-admin/SchoolAdminEmptyState.tsx`, parent and teacher equivalents |
| Success moments (enrollment complete, first payment, setup finished) | School Day Story, plus a Garden celebration | inline in features |
| Dashboards, lists, tables, forms, billing, messages, calendars | **School Day Story only** | `Admin*` primitives (`src/components/school-admin/ui/story/`), `Parent*` primitives (`src/components/school-parent/ui/`) |
| Internal superadmin | `.admin-app` slate | `src/components/admin/AdminShell.tsx`; don't restyle |
| Mobile: auth, onboarding, MudKitchen account and upgrade screens | Calm Garden (mobile) | `apps/mobile/src/app/*` |
| Mobile: parent, teacher and admin portal screens | School Day Story (mobile `Story` / `MobileParentTheme`) | `apps/mobile/src/components/story/*` |

## Token mapping

Garden, web portal and mobile already share most of their neutrals. Use the mapped name in each codebase; don't paste hexes.

| Garden (`--sf-*`, web marketing) | Hex | Web portal token | Mobile constant (`apps/mobile/src/constants/theme.ts`) |
|---|---|---|---|
| `cream` | `#F7F1E7` | no equivalent; portal paper is `theme.paper` `#F8F8F3` | `Brand.bg` |
| `paper` | `#FFFAF4` | `theme.cream` `#FFFDF7` (close) | `Brand.surface`, `Brand.input` |
| `ink` | `#2B241D` | `theme.ink` `#283943` (cooler) | `Brand.text` |
| `soft` | `#6D6257` | `theme.muted` `#65777F` (cooler) | `Brand.textMuted` |
| `forest` | `#2E4A3C` | `adminCompat.accent` when unbranded | `Brand.accent` |
| `clay` | `#A05C45` | `theme.coral` `#DF8A72` is **not** clay; there's no portal clay | `Brand.clay` |
| `peach` | `#F8DDCF` | — | `Brand.claySoft` `#E8D5C8` (close) |
| `mint` | `#DDEBD5` | `theme.sage` `#CFE4D6` (close) | `Brand.badgeGreen` `#E2EDD9` (close) |
| `butter`, `sky`, `lav` | `#FFE58A`, `#E3EDFB`, `#ECE2F3` | `childAccentBg` rotation (`#F3EAD6`, `#DCEBF2`, `#E8E4F0`) are softer cousins | not defined |

- **Missing pastels on mobile:** when a Calm Garden mobile screen needs the pastels, add them once as `GardenPastels` in `apps/mobile/src/constants/theme.ts`, with the exact Garden hexes. Don't inline them per screen.
- **Calm Garden on web, outside `.sf-garden`:** wrap the surface in `GardenRoot` if it's a whole page. For a dialog inside a portal, use the hexes through a small local constant object and keep the portal's fonts. Don't mount `.sf-garden` inside a portal shell, because its `revert-layer` type reset will change the portal's headings.

## Calm Garden rules (MudKitchen-owned app surfaces)

Calm Garden is the home page's materials without the theatre.

**Keep:**
- Cream and paper backgrounds, ink text, soft secondary text.
- Clay for the single primary action, forest for confirmation and success.
- The toy button: 2px ink border plus a hard offset shadow of 4–6px that presses on `active`. **Only on the primary CTA.** Secondary actions use the outline or text-link style.
- Bricolage for the screen title on full MudKitchen pages (login, try, onboarding). Inside a portal dialog, keep the portal's Fraunces so it doesn't clash with the shell around it.
- `Pill` eyebrows with one emoji, `MARK` highlights for one phrase, `Tick` lists for plan features.
- Radius: keep the portal's existing card radius inside portals (admin cards 16px, parent cards 22px). Full-page MudKitchen surfaces may use 26–32px.

**Drop:**
- Tilt on anything holding data, forms or controls. Tilt is allowed only on a decorative illustration or photo.
- Scroll-scrubbed, pinned and parallax motion, marquees, Lenis. These are app screens and people come to get work done.
- Doodles, except a single `Draw` + `Leaf` or `Star` in an empty state or celebration.
- More than **one** Gochi Hand line per screen. Use it only in empty, onboarding and celebration states, and always decoratively (`aria-hidden`).

### Empty-state treatment (web and mobile)

- **Layout:** a centred stack with an illustration from `/images/illustrations/*`, an optional taped polaroid, a title in the surface's display font, one sentence of real guidance, the primary action, and an optional single handwritten line ("nothing here yet ✿").
- **Tape:** at most one strip, using a Garden pastel when MudKitchen-owned or `theme.primaryLight` when school-branded.

### Celebration treatment

- **Confetti:** `canvas-confetti`, skipped when `prefers-reduced-motion`. Use the Garden palette `["#A05C45", "#FFE58A", "#DDEBD5", "#E3EDFB", "#ECE2F3"]` on MudKitchen surfaces, or the school primary plus neutrals on branded ones. `GetStartedDemoFlow` shows the pattern.
- **Sticker pop:** a sticker-style success chip (`StickerNote` look) popping in with a spring.

## Motion in the apps

- **Portal timing** (keep it): easing `[0.16, 1, 0.3, 1]`, 220–350ms fades and slides, `AnimatePresence mode="wait"` for tab and panel swaps.
- **Springs** (`stiffness ~380, damping ~18–24`) only for celebration chips, sticker pops and pill indicators (`layoutId`).
- **Web reduced motion:** framer `useReducedMotion()`. Pass `initial={reduce ? false : …}` and skip exit animations. `globals.css` also clamps CSS animations globally.
- **Mobile reduced motion:** currently **missing**. New animated mobile UI must read `AccessibilityInfo.isReduceMotionEnabled()` (or Reanimated's `ReduceMotion.System`) and skip non-essential motion.

## Focus and accessibility standard

There's no shared focus token in the portals today: `outline-none` appears 41 times and `focus-visible` only about 6. All new or touched interactive elements use:

```
focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[<accent>]/30
```

- **`<accent>`:** clay on MudKitchen surfaces, the school primary (`theme.primary`) in portals. Because portal colours are runtime values, use `style={{ "--ring": theme.primary }}` with `focus-visible:ring-[color:var(--ring)]/30`.
- **Mobile:** every pressable needs `accessibilityRole` plus `accessibilityLabel` (the existing pattern), with hit targets of at least 44×44.

## Mobile specifics (`apps/mobile`)

- **Styling:** plain `StyleSheet.create`; there's no nativewind. Story primitives are in `apps/mobile/src/components/story/` (`story-button`, `story-card`, `story-chip`, `story-bottom-sheet`, …), with tokens in `apps/mobile/src/constants/story-theme.ts` and per-school theming in `apps/mobile/src/contexts/parent-theme-context.tsx`.
- **Fonts:** loaded in `apps/mobile/src/constants/app-fonts.ts`; currently Fraunces, DM Sans, Lora and Poppins. Bricolage, Nunito and Gochi Hand are **not** loaded. Add them through `@expo-google-fonts/bricolage-grotesque`, `@expo-google-fonts/nunito` and `@expo-google-fonts/gochi-hand` **only** when a MudKitchen-owned screen needs them, and register them in `APP_FONTS`.
- **Dark mode:** not supported (`Colors.dark` equals `Colors.light`). Don't add half-dark styles.
- **Keyboard and sheet layouts:** follow `apps/mobile/AGENTS.md`.

Calm Garden building blocks for React Native:

```ts
// Toy primary button (MudKitchen-owned screens only)
const styles = StyleSheet.create({
  toyButton: {
    backgroundColor: Brand.clay,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: Brand.text,
    // hard offset shadow, no blur
    shadowColor: Brand.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0, // Android can't do hard shadows: fake it with an absolutely positioned
                  // ink-coloured View 5px below, same radius, behind the button.
  },
  toyButtonPressed: { transform: [{ translateY: 4 }], shadowOffset: { width: 0, height: 1 } },
  toyButtonLabel: { color: "#fff", fontFamily: "DMSans_600SemiBold", fontSize: 16 },

  // Sticky note (empty states, onboarding tips)
  stickyNote: {
    backgroundColor: "#FFE58A", // GardenPastels.butter once added
    borderRadius: 6,
    padding: 18,
    paddingTop: 22,
    transform: [{ rotate: "-1.5deg" }], // decorative notes only, never on data
    shadowColor: "#2B241D",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  tape: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    width: 64,
    height: 20,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.7)",
    transform: [{ rotate: "2deg" }],
  },

  // Taped polaroid (onboarding, school photo)
  polaroid: {
    backgroundColor: "#fff",
    padding: 10,
    paddingBottom: 14,
    borderRadius: 6,
    shadowColor: "#2B241D",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
});
```

## Do / don't

| Do | Don't |
|---|---|
| Use `useParentTheme()` / `useSchoolAdminStoryTheme()` tokens for anything inside a school's portal | Hardcode Garden clay or butter in portal components |
| Keep MudKitchen's voice (Calm Garden) to MudKitchen-owned moments: auth, upgrade, onboarding, empty states, celebrations | Turn a dashboard or table into a sticky-note wall |
| Re-check `/` and `/demo/*` after changing any portal primitive | Assume portal changes stay inside the portal |
| Give empty states one illustration, one sentence, one action | Add tilt, tape or handwriting to forms and data |
| Add missing tokens once (`GardenPastels`, a focus ring) and reuse them | Inline hexes per screen |

After any UI change, run the existing verification skills: `.agents/skills/portal-responsive-verify` (web, three viewports), `.agents/skills/mobile-ui-visual-verify` (Maestro captures) and `.agents/skills/portal-qa`.
