"use client";

import type { CSSProperties, ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdOfferProvider } from "@/components/admin/marketing/slide-frame";
import { Accent, AdCopy, AdFooter, AdFrame, CheckList, Crew, FONT, G, Hand, InkCard, Pin, Scene, StickyNote } from "@/components/admin/marketing/ads/ad-kit";
import {
  FREE_PREVIEW_CTA,
  FREE_PREVIEW_URL,
  FREE_PREVIEW_UTM,
  FreeTag,
  RoleBadge,
  RoleSwitch,
  YOUR,
  YourAdminWindow,
  YourParentPhone,
  YourTeacherPhone,
  YourTeacherWindow,
  YourWebsiteWindow,
} from "@/components/admin/marketing/carousels/free-preview-mocks";
import { Annotation, FounderPolaroid, JULIUS_SIGNATURE } from "@/components/admin/marketing/carousels/founder-notes-kit";

// Set I: the full bundle. The free preview isn't one admin screenshot: owners can switch between the
// admin, teacher and parent views (the demo's Teacher View / Parent View) and see their website too.
// Same guardrails as Sets F–H: no gift card, no customer names, quotes or stats, "Your School" only,
// and claims stay inside the offer (free, private, no obligation, no call needed, within 2 business
// days; website, parent app, teacher portal and admin portal with your logo, colours and programs).

const AUDIENCE = "for microschool owners";
const noOffer = (node: ReactNode) => <AdOfferProvider show={false}>{node}</AdOfferProvider>;

function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <AdFooter tone={tone} ctaLabel={FREE_PREVIEW_CTA} siteLabel={FREE_PREVIEW_URL} />;
}

const Gap = ({ h = 30 }: { h?: number }) => <div style={{ height: h, flexShrink: 0 }} />;

export const ADS_PREVIEW_BUNDLE_CAROUSEL = {
  id: "ads-preview-bundle",
  title: "Ads: The full bundle (8)",
  description: `Single ads for microschool owners and admins: the free preview is the whole bundle (admin portal, teacher portal, parent app and website), and you can switch between the admin, teacher and parent views. No offer chip. Feed + story. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-ads-preview-bundle",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "three-logins",
      fileName: "ad-i01-three-logins-one-preview.png",
      render: () => noOffer(<ThreeLoginsAd />),
      adCopy: {
        primaryText:
          "Microschool owners: your free preview comes with three views. Try it as the admin, a teacher and a parent, all set up with your school's logo and colours. Send your website to get yours.",
        headline: "Three logins. One free preview.",
        description: "Admin, teacher and parent views.",
      },
    },
    {
      id: "every-seat",
      fileName: "ad-i02-sit-in-every-seat.png",
      render: () => noOffer(<EverySeatAd />),
      adCopy: {
        primaryText:
          "Running a microschool? Sit in every seat before you decide: your admin portal, your teachers' portal and your families' parent app. All in one free, private MudKitchen preview of your school.",
        headline: "Sit in every seat at your school",
        description: "Free, private, within 2 business days.",
      },
    },
    {
      id: "switch-views",
      fileName: "ad-i03-admin-to-parent-in-one-click.png",
      render: () => noOffer(<SwitchViewsAd />),
      adCopy: {
        primaryText:
          "Microschool admins: inside your free MudKitchen preview, switch from the admin view to the teacher and parent views in one click. Your logo and colours on every screen. Send your website to start.",
        headline: "Admin to parent in one click",
        description: "Your whole school, in one preview.",
      },
    },
    {
      id: "unboxing",
      fileName: "ad-i04-the-whole-bundle-unboxed.png",
      render: () => noOffer(<UnboxingAd />),
      adCopy: {
        primaryText:
          "Microschool owners, here's what's in the box: your website, admin portal, teacher portal and parent app, built as a free MudKitchen preview with your logo and colours. No call needed.",
        headline: "The whole bundle, unboxed",
        description: "Free, private, no obligation.",
      },
    },
    {
      id: "parent-eyes",
      fileName: "ad-i05-see-it-the-way-parents-will.png",
      render: () => noOffer(<ParentEyesAd />),
      adCopy: {
        primaryText:
          "Microschool owners: be the parent for a minute. Your free preview includes the parent app your families would use: tuition, forms, messages and the calendar, with your school's name on it.",
        headline: "See it the way your parents will",
        description: "Plus your admin and teacher portals.",
      },
    },
    {
      id: "hand-to-teacher",
      fileName: "ad-i06-hand-your-teacher-the-phone.png",
      render: () => noOffer(<HandToTeacherAd />),
      adCopy: {
        primaryText:
          "Microschool owners: your teachers get their own portal too. Your free MudKitchen preview includes the teacher view, roll call and all, next to your admin portal and parent app.",
        headline: "Hand your teacher the phone",
        description: "Free preview with your school's name.",
      },
    },
    {
      id: "overthinking",
      fileName: "ad-i07-stop-guessing-what-parents-see.png",
      render: () => noOffer(<OverthinkingAd />),
      adCopy: {
        primaryText:
          "A parent texted \"ok.\" and now you're overthinking it. 😅 Microschool owners: see exactly what your families see. Your free preview includes the parent app, plus your admin and teacher portals.",
        headline: "Stop guessing what parents see",
        description: "Free, private, no obligation.",
      },
    },
    {
      id: "julius-bundle",
      fileName: "ad-i08-not-just-the-admin-side.png",
      render: () => noOffer(<JuliusBundleAd />),
      adCopy: {
        primaryText:
          "A note from Julius, our co-founder: your free preview isn't just the admin side. You get the admin portal, teacher portal and parent app, with your logo. Click through all three.",
        headline: "Not just the admin side. All of it.",
        description: "Free, within 2 business days.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- I1 three logins

function ThreeLoginsAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.cream} pattern="grid" tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            Three logins. <Accent>One free preview.</Accent>
          </>
        }
        hand="try it as the admin, a teacher and a parent."
        size={84}
      />
      <Scene>
        <Pin left={-4} top={70} z={3}>
          <RoleBadge role="Admin" line="the founder's dashboard" width={300} strap={200} rotate={-6} />
        </Pin>
        <Pin left={326} top={50} z={4}>
          <RoleBadge role="Teacher" line="roll call and class days" width={300} strap={210} />
        </Pin>
        <Pin left={656} top={70} z={3}>
          <RoleBadge role="Parent" line="the app your families use" width={300} strap={200} rotate={6} />
        </Pin>
      </Scene>
      <Gap />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- I2 every seat

function SeatTag({ n, label, style }: { n: number; label: string; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 22px 10px 10px",
        borderRadius: 999,
        background: "#FFFFFF",
        border: `4px solid ${G.ink}`,
        boxShadow: `0 6px 0 ${G.ink}`,
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: 30,
        color: G.ink,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={{ width: 46, height: 46, borderRadius: 999, background: G.butter, border: `3px solid ${G.ink}`, display: "grid", placeItems: "center", fontSize: 26 }}>{n}</span>
      {label}
    </span>
  );
}

function EverySeatAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.sky}>
      <AdCopy
        title={
          <>
            Sit in every seat <Accent>at your school.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={0} top={70} z={2} rotate={-2}>
          <YourAdminWindow scale={0.62} label="Your admin portal" />
        </Pin>
        <Pin left={20} top={20} z={5} rotate={-3}>
          <SeatTag n={1} label="the founder's desk" />
        </Pin>
        <Pin right={0} top={30} z={3} rotate={4}>
          <YourTeacherPhone scale={0.6} />
        </Pin>
        <Pin right={0} top={520} z={5} rotate={3}>
          <SeatTag n={2} label="the teacher's phone" />
        </Pin>
        <Pin left={350} top={380} z={4} rotate={-4}>
          <YourParentPhone scale={0.6} />
        </Pin>
        <Pin left={0} top={560} z={5} rotate={-2}>
          <SeatTag n={3} label="the parent's app" />
        </Pin>
        <Pin left={10} top={670} z={5}>
          <Hand size={38} color={G.clayDeep} rotate={-3} style={{ maxWidth: 320 }}>
            all three, in one free preview
          </Hand>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- I3 switch views

function SwitchViewsAd() {
  return (
    <AdFrame audience={AUDIENCE} background="#EEF5E9">
      <AdCopy
        title={
          <>
            Admin to parent <Accent>in one click.</Accent>
          </>
        }
        hand="switch views inside your free preview."
        size={84}
      />
      <Scene>
        <Pin left={0} top={150} z={2} rotate={-1}>
          <YourAdminWindow scale={0.8} />
        </Pin>
        <Pin left={0} top={20} z={6}>
          <RoleSwitch active="Parent" size={30} />
        </Pin>
        <Pin right={-10} top={210} z={4} rotate={5}>
          <YourParentPhone scale={0.66} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- I4 unboxing

function OpenBox({ width = 640, height = 280, label }: { width?: number; height?: number; label: ReactNode }) {
  const kraft = "#D9A86C";
  const flap = { position: "absolute" as const, top: -66, width: width * 0.5, height: 84, boxSizing: "border-box" as const, background: "#E6BC86", border: `4px solid ${G.ink}`, borderRadius: 8 };
  return (
    <div style={{ position: "relative", width, height }}>
      <span aria-hidden style={{ ...flap, left: -width * 0.12, transform: "rotate(-16deg)", transformOrigin: "100% 100%" }} />
      <span aria-hidden style={{ ...flap, right: -width * 0.12, transform: "rotate(16deg)", transformOrigin: "0% 100%" }} />
      <div style={{ position: "absolute", inset: 0, boxSizing: "border-box", background: kraft, border: `4px solid ${G.ink}`, borderRadius: 14, boxShadow: `0 12px 0 ${G.ink}` }}>
        <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 22, background: "rgba(43,36,29,.12)" }} />
        <div style={{ position: "absolute", left: "50%", top: "52%", transform: "translate(-50%, -50%) rotate(-2deg)", padding: "18px 30px", background: "#FFFFFF", border: `4px solid ${G.ink}`, borderRadius: 14, textAlign: "center", whiteSpace: "nowrap" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function UnboxingAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.peach}>
      <AdCopy
        title={
          <>
            The whole bundle, <Accent>unboxed.</Accent>
          </>
        }
        size={88}
      />
      <Scene>
        <Pin left={60} top={436} z={1}>
          <span style={{ display: "block", width: 640, height: 60, background: "#B9844C", border: `4px solid ${G.ink}`, borderRadius: 10, boxSizing: "border-box" }} />
        </Pin>
        <Pin left={-10} top={210} z={2} rotate={-12}>
          <YourWebsiteWindow scale={0.42} label="Your website" />
        </Pin>
        <Pin left={200} top={120} z={2} rotate={-2}>
          <YourAdminWindow scale={0.42} label="Your admin portal" />
        </Pin>
        <Pin left={400} top={220} z={2} rotate={10}>
          <YourTeacherWindow scale={0.42} label="Your teacher portal" />
        </Pin>
        <Pin left={630} top={190} z={2} rotate={14}>
          <YourParentPhone scale={0.4} />
        </Pin>
        <Pin left={60} top={466} z={3}>
          <OpenBox
            label={
              <>
                <span style={{ display: "block", fontFamily: FONT.body, fontWeight: 800, fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", color: G.soft }}>Free preview</span>
                <span style={{ display: "block", fontFamily: FONT.display, fontWeight: 800, fontSize: 40, letterSpacing: "-0.02em", color: YOUR.primaryDeep }}>{YOUR.name}: full bundle</span>
              </>
            }
          />
        </Pin>
        <Pin right={-10} bottom={0} z={4}>
          <Crew name="pip" view="excited" width={230} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- I5 parent eyes

function ParentEyesAd() {
  return (
    <AdFrame audience={AUDIENCE} background={YOUR.soft}>
      <AdCopy
        title={
          <>
            See it the way <Accent>your parents will.</Accent>
          </>
        }
        hand="be the parent for a minute."
        size={84}
      />
      <Scene>
        <Pin left={0} top={100} z={3} rotate={-2}>
          <InkCard width={540} style={{ padding: "34px 40px" }}>
            <p style={{ margin: "0 0 22px", fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", color: G.soft }}>In your parent app</p>
            <CheckList
              size={34}
              rows={[
                { label: "Tuition and payments", done: true },
                { label: "Forms to sign", done: true },
                { label: "Messages from you", done: true },
                { label: "The school calendar", done: true },
              ]}
            />
          </InkCard>
        </Pin>
        <Pin left={40} top={540} z={5}>
          <Annotation arrow="right" color={G.clayDeep} size={38}>
            your name, up top
          </Annotation>
        </Pin>
        <Pin right={0} top={10} z={4} rotate={4}>
          <YourParentPhone scale={1} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- I6 hand to teacher

function HandToTeacherAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            Hand your teacher <Accent>the phone.</Accent>
          </>
        }
        hand="your teachers get their own portal too."
        size={84}
      />
      <Scene>
        <Pin right={-60} top={70} z={2} rotate={3}>
          <YourTeacherWindow scale={0.62} label="Your teacher portal" />
        </Pin>
        <Pin left={30} top={20} z={4} rotate={-5}>
          <YourTeacherPhone scale={0.92} />
        </Pin>
        <Pin left={420} top={500} z={5}>
          <StickyNote width={330} rotate={4} color={G.butter} style={{ padding: "30px 26px 24px" }}>
            <Hand size={36} color={G.ink} rotate={0} style={{ lineHeight: 1.2 }}>
              roll call, class days and messages, with your logo
            </Hand>
          </StickyNote>
        </Pin>
        <Pin right={-10} bottom={0} z={6}>
          <Crew name="fennel" view="thumbs" width={210} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- I7 overthinking

function OverthinkingAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.lav}>
      <AdCopy
        title={
          <>
            A parent texted <Accent>&ldquo;ok.&rdquo;</Accent>
          </>
        }
        hand="now see exactly what they see."
        size={88}
      />
      <Scene>
        <Pin left={0} top={20} z={4} rotate={-2}>
          <InkCard width={500} style={{ padding: "22px 26px 28px", borderRadius: 36 }}>
            <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 700, fontSize: 21, color: G.soft, textAlign: "center" }}>A parent · 9:41 PM</p>
            <span style={{ display: "inline-block", marginTop: 16, padding: "18px 30px", borderRadius: "30px 30px 30px 8px", background: "#ECE8E2", fontFamily: FONT.body, fontWeight: 800, fontSize: 44, color: G.ink }}>ok.</span>
            <p style={{ margin: "10px 0 0", fontFamily: FONT.body, fontWeight: 700, fontSize: 19, color: G.soft }}>Read 9:41 PM</p>
          </InkCard>
        </Pin>
        <Pin left={30} top={290} z={5}>
          <Hand size={40} color={G.clayDeep} rotate={-4}>
            ok? or ok.?
          </Hand>
        </Pin>
        <Pin left={250} top={350} z={5}>
          <Hand size={40} color={G.clayDeep} rotate={3}>
            is that a mad ok?
          </Hand>
        </Pin>
        <Pin left={40} top={420} z={5}>
          <Hand size={40} color={G.clayDeep} rotate={-2}>
            should I call?
          </Hand>
        </Pin>
        <Pin right={0} top={0} z={3} rotate={4}>
          <YourParentPhone scale={0.86} screen="messages" />
        </Pin>
        <Pin left={260} top={520} z={6}>
          <Annotation arrow="right" color={G.forest} size={36}>
            their side
          </Annotation>
        </Pin>
        <Pin left={-10} bottom={0} z={4}>
          <Crew name="dig" view="thinking" width={220} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- I8 Julius: all of it

function JuliusBundleAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            Not just the admin side. <Accent color={G.butter}>All of it.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={0} top={20} z={5}>
          <FounderPolaroid width={250} rotate={-5} caption="Julius 👋" />
        </Pin>
        <Pin left={290} top={10} z={4}>
          <InkCard bg={G.butter} rotate={1.5} width={640} style={{ padding: "26px 32px" }}>
            <Hand size={36} color={G.ink} rotate={0} style={{ lineHeight: 1.28 }}>
              Your preview has all three: the admin portal, the teacher portal and the parent app. Click through each one.
            </Hand>
            <Hand size={28} color={G.clayDeep} rotate={0} style={{ marginTop: 10, textAlign: "right" }}>
              {JULIUS_SIGNATURE}
            </Hand>
          </InkCard>
        </Pin>
        <Pin left={-10} top={370} z={2} rotate={-3}>
          <YourAdminWindow scale={0.54} label="Admin view" />
        </Pin>
        <Pin left={520} top={350} z={3} rotate={4}>
          <YourTeacherPhone scale={0.42} />
        </Pin>
        <Pin right={-10} top={320} z={4} rotate={8}>
          <YourParentPhone scale={0.46} />
        </Pin>
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}
