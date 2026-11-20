"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  AdCopy,
  AdFooter,
  AdFrame,
  Crew,
  FONT,
  G,
  Hand,
  InkCard,
  Pin,
  ProductWindow,
  Scene,
  StickyNote,
} from "@/components/admin/marketing/ads/ad-kit";
import { GardenAdminDashboardWindow, GardenParentBillingWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import { PRICING_COPY, STORY_COPY } from "@/components/home/home-copy";

// Set D: evergreen pain → outcome and proof. Works without the holiday framing, so it's the best
// set for the no-offer control.

export const ADS_PAIN_PROOF_CAROUSEL = {
  id: "ads-pain-proof",
  title: "Ads: Pain → proof (6)",
  description: "Evergreen single ads: scattered tools, a customer story and real product screens. Offer chip can be switched off. Feed + story.",
  fileSlug: "mudkitchen-ads-pain-proof",
  kind: "ad",
  offerToggle: true,
  sizes: ["feed", "story"],
  slides: [
    {
      id: "six-places",
      fileName: "ad-d1-dig-six-places.png",
      render: () => <SixPlacesAd />,
      adCopy: {
        primaryText:
          "Running a microschool? Enrollment in a form builder. Tuition in Venmo. Updates in a group text. Student details in a spreadsheet. MudKitchen pulls them into one shared system for your microschool. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Run your school from one place",
        description: "Built for microschools.",
      },
    },
    {
      id: "sage-field",
      fileName: "ad-d2-sage-field-story.png",
      render: () => <SageFieldAd />,
      adCopy: {
        primaryText:
          "Microschool founders: Sage Field went from 0 to 35 students in under 3 months, with their website, enrollment, tuition and family communication all running on MudKitchen. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "0 → 35 students in under 3 months",
        description: "Read how Sage Field launched.",
      },
    },
    {
      id: "one-screen",
      fileName: "ad-d3-dig-one-screen.png",
      render: () => <OneScreenAd />,
      adCopy: {
        primaryText:
          "Microschool directors: applications, tuition and messages at a glance. MudKitchen gives you one workspace to run your microschool. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Your whole school on one screen",
        description: "The admin portal for microschools.",
      },
    },
    {
      id: "families-one-app",
      fileName: "ad-d4-nutmeg-families.png",
      render: () => <FamiliesAd />,
      adCopy: {
        primaryText:
          "School owners: families see every bill, sign forms and get updates in one place, and tuition gets paid on autopay. Fewer \"did you get my check?\" texts. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Families pay, sign and stay in the loop",
        description: "A parent portal with your school's name on it.",
      },
    },
    {
      id: "founder-led",
      fileName: "ad-d5-terra-founder-led.png",
      render: () => <FounderLedAd />,
      adCopy: {
        primaryText:
          "MudKitchen is built for founder-led microschools: a branded website, enrollment, a parent portal, tuition and admin tools in one plan, with guided setup. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Built for founder-led microschools",
        description: "One plan. Guided setup.",
      },
    },
    {
      id: "duct-tape",
      fileName: "ad-d6-duct-tape-stack.png",
      render: () => <DuctTapeAd />,
      adCopy: {
        primaryText:
          "Six tools, six logins, one tired director. Or: MudKitchen. Website, enrollment, tuition, messages, attendance and staff hours in one place. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Retire the duct-taped stack",
        description: "Everything your microschool needs, in one place.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- D1

const PILE: Array<{ label: string; color: string; x: number; y: number; r: number }> = [
  { label: "Spreadsheet", color: G.mint, x: 0, y: 20, r: -6 },
  { label: "Venmo", color: "#DCE8F5", x: 330, y: 0, r: 4 },
  { label: "Google Form", color: G.butter, x: 640, y: 30, r: -3 },
  { label: "Group text", color: G.peach, x: 0, y: 185, r: 5 },
  { label: "Paper binder", color: "#ECE2F3", x: 662, y: 195, r: 6 },
  { label: "Website builder", color: "#FFFFFF", x: 330, y: 150, r: -4 },
];

function SixPlacesAd() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            Your school runs in <Accent>six places.</Accent>
          </>
        }
        hand="run it from one."
        size={92}
      />
      <Scene>
        {PILE.map((note) => (
          <Pin key={note.label} left={note.x} top={note.y + 40} z={3}>
            <StickyNote width={290} rotate={note.r} color={note.color} style={{ padding: "28px 24px 24px" }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: G.ink }}>{note.label}</span>
            </StickyNote>
          </Pin>
        ))}
        <Pin left="50%" bottom={0} z={6} style={{ marginLeft: -150 }}>
          <Crew name="dig" view="confused" width={300} />
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- D2

function SageFieldAd() {
  return (
    <AdFrame background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            {STORY_COPY.headlineLead}
            <br />
            <Accent color={G.butter}>{STORY_COPY.headlineAccent}</Accent>
          </>
        }
        size={86}
      />
      <Scene style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <InkCard bg={G.cream} rotate={-1.5} width={760} style={{ padding: "34px 40px" }}>
          <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 700, fontSize: 38, lineHeight: 1.22, letterSpacing: "-0.01em", color: G.ink }}>
            &ldquo;{STORY_COPY.quote}&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26 }}>
            <img src={STORY_COPY.author.image} alt="" style={{ width: 76, height: 76, borderRadius: 999, objectFit: "cover", border: `3px solid ${G.ink}` }} />
            <div>
              <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 800, fontSize: 28, color: G.ink }}>{STORY_COPY.author.name}</p>
              <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 600, fontSize: 24, color: G.soft }}>
                {STORY_COPY.author.title} · {STORY_COPY.school.location}
              </p>
            </div>
          </div>
        </InkCard>
        <Pin right={-40} bottom={-10} z={5}>
          <Crew name="pip" view="celebrate" width={280} flip />
        </Pin>
      </Scene>
      <AdFooter tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- D3

function OneScreenAd() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            Your whole school <Accent>on one screen.</Accent>
          </>
        }
        sub="Applications, tuition and messages at a glance."
        size={86}
      />
      <Scene style={{ marginTop: 34 }}>
        <ProductWindow crop={{ zoom: 1.15, originX: 0, originY: 0 }}>
          <GardenAdminDashboardWindow contentHeight={920} />
        </ProductWindow>
        <Pin left={-30} bottom={-20} z={8}>
          <Crew name="dig" view="point" width={300} />
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- D4

function FamiliesAd() {
  return (
    <AdFrame background="#F3EEF8">
      <AdCopy
        title={
          <>
            Families pay, sign and <Accent>stay in the loop.</Accent>
          </>
        }
        sub="Every bill, form and update in one place. Tuition on autopay."
        size={82}
      />
      <Scene style={{ marginTop: 34 }}>
        <ProductWindow crop={{ zoom: 1.15, originX: 0, originY: 0 }}>
          <GardenParentBillingWindow contentHeight={920} />
        </ProductWindow>
        <Pin right={-30} bottom={-20} z={8}>
          <Crew name="nutmeg" view="thumbs" width={290} flip />
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- D5

const INCLUDED = PRICING_COPY.features.slice(0, 5);

function FounderLedAd() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            Built for founder-led microschools. <Accent>Not shrunk-down district software.</Accent>
          </>
        }
        size={76}
      />
      <Scene>
        <Pin left={-30} bottom={0} z={5}>
          <Crew name="terra" view="wave" width={370} />
        </Pin>
        <Pin right={0} top={30} z={4}>
          <InkCard width={560} rotate={2}>
            <p style={{ margin: "0 0 16px", fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: G.clayDeep }}>The {PRICING_COPY.planLabel} includes:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {INCLUDED.map((feature) => (
                <span key={feature} style={{ display: "flex", gap: 12, fontFamily: FONT.body, fontWeight: 800, fontSize: 28, lineHeight: 1.2, color: G.ink }}>
                  <span style={{ color: G.forest }}>✓</span>
                  {feature}
                </span>
              ))}
            </div>
            <Hand size={34} color={G.forest} rotate={-2} style={{ marginTop: 18 }}>
              + guided setup and support
            </Hand>
          </InkCard>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- D6

const STACK: Array<{ job: string; tool: string }> = [
  { job: "Website", tool: "Website builder" },
  { job: "Enrollment", tool: "Google Forms" },
  { job: "Tuition", tool: "Venmo + spreadsheet" },
  { job: "Parent updates", tool: "Group text" },
  { job: "Attendance", tool: "Clipboard" },
  { job: "Staff hours", tool: "Honor system" },
];

function DuctTapeAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            MudKitchen vs. <Accent>the duct-taped stack.</Accent>
          </>
        }
        size={84}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <InkCard width="100%" style={{ padding: "24px 30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr 1fr", alignItems: "center", rowGap: 4 }}>
            {["", "The stack", "MudKitchen"].map((head, i) => (
              <span key={i} style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", color: i === 2 ? G.forest : G.soft, paddingBottom: 10, textAlign: i === 2 ? "center" : "left" }}>
                {head}
              </span>
            ))}
            {STACK.map((row) => [
              <span key={`${row.job}-j`} style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: G.ink, padding: "10px 0", borderTop: "2px dashed #E4D8C8" }}>
                {row.job}
              </span>,
              <span key={`${row.job}-t`} style={{ fontFamily: FONT.hand, fontSize: 34, color: G.clay, padding: "10px 0", borderTop: "2px dashed #E4D8C8", textDecoration: "line-through", textDecorationThickness: 3 }}>
                {row.tool}
              </span>,
              <span key={`${row.job}-m`} style={{ display: "grid", placeItems: "center", padding: "10px 0", borderTop: "2px dashed #E4D8C8" }}>
                <span style={{ width: 46, height: 46, borderRadius: 999, background: G.forest, display: "grid", placeItems: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
              </span>,
            ])}
          </div>
        </InkCard>
        <Pin right={-60} top={-150} z={6}>
          <Crew name="clover" view="cheeky" width={190} flip ground={false} />
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}
