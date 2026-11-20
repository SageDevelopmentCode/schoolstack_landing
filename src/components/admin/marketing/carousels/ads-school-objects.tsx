"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdOfferProvider } from "@/components/admin/marketing/slide-frame";
import { Accent, AdCopy, AdFooter, AdFrame, Crew, FONT, G, Hand, InkCard, Pin, Scene } from "@/components/admin/marketing/ads/ad-kit";
import {
  FREE_PREVIEW_CTA,
  FREE_PREVIEW_URL,
  FREE_PREVIEW_UTM,
  FreeTag,
  PreviewReadyEmail,
  YOUR,
  YourAdminWindow,
  YourParentPhone,
  YourTeacherWindow,
  YourWebsiteWindow,
} from "@/components/admin/marketing/carousels/free-preview-mocks";
import {
  Annotation,
  FormHeader,
  MarkerBox,
  PaperForm,
  SignatureLine,
  Stamp,
  Struck,
  TearLine,
  TickBox,
  Whiteboard,
} from "@/components/admin/marketing/carousels/founder-notes-kit";

// Set H: school objects. A permission slip, report card, hall pass, field-trip flyer, lunchbox note,
// annotated screens, a whiteboard and a calendar invite, each pointing microschool founders to the
// free custom preview. Same claim rules as the free-preview set (no gift card, no customer names or
// stats). Pain lines are PAIN_COPY in src/components/home/home-copy.ts; "autopay" and "sign forms"
// are existing product features. Screens are the real Garden demos branded "Your School".

const AUDIENCE = "for microschool founders";
const noOffer = (node: ReactNode) => <AdOfferProvider show={false}>{node}</AdOfferProvider>;

function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <AdFooter tone={tone} ctaLabel={FREE_PREVIEW_CTA} siteLabel={FREE_PREVIEW_URL} />;
}

export const ADS_SCHOOL_OBJECTS_CAROUSEL = {
  id: "ads-school-objects",
  title: "Ads: School-object notes (8)",
  description: `Single ads for microschool founders built from school objects (permission slip, report card, hall pass, field-trip flyer, lunchbox note, whiteboard) on the real "Your School" screens. Free custom preview; no offer chip. Feed + story. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-ads-school-objects",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "permission-slip",
      fileName: "ad-h01-permission-slip.png",
      render: () => noOffer(<PermissionSlipAd />),
      adCopy: {
        primaryText:
          "Microschool founders, here's your permission slip: let us build a free, private MudKitchen preview of your school. Your website, parent app, teacher and admin portals, within 2 business days.",
        headline: "Sign here for your free preview",
        description: "No obligation. No call needed.",
      },
    },
    {
      id: "report-card",
      fileName: "ad-h02-admin-week-report-card.png",
      render: () => noOffer(<ReportCardAd />),
      adCopy: {
        primaryText:
          "Microschool directors: enrollment in a form builder, updates in texts and email, student details in spreadsheets. See it all in one place instead: send your website for a free MudKitchen preview.",
        headline: "Teacher's comment: needs one place",
        description: "Free preview with your school's name.",
      },
    },
    {
      id: "hall-pass",
      fileName: "ad-h03-hall-pass.png",
      render: () => noOffer(<HallPassAd />),
      adCopy: {
        primaryText:
          "Microschool owners: here's your hall pass out of the sales call. Send your website and a private MudKitchen preview of your school lands in your inbox within 2 business days. Free.",
        headline: "Hall pass: skip the sales call",
        description: "Free, private, no obligation.",
      },
    },
    {
      id: "field-trip",
      fileName: "ad-h04-field-trip.png",
      render: () => noOffer(<FieldTripAd />),
      adCopy: {
        primaryText:
          "Microschool founders: take a field trip through your own school. Four stops: your website, parent app, teacher portal and admin portal, all built as a free private MudKitchen preview.",
        headline: "A field trip through your school",
        description: "Free, within 2 business days.",
      },
    },
    {
      id: "lunchbox-note",
      fileName: "ad-h05-lunchbox-note.png",
      render: () => noOffer(<LunchboxAd />),
      adCopy: {
        primaryText:
          "Microschool owners: tuition on autopay and forms signed online, in an app with your school's name on it. See it for your families: send your website for a free MudKitchen preview.",
        headline: "Tuition on autopay. Love, your school.",
        description: "Part of your free, private preview.",
      },
    },
    {
      id: "annotated",
      fileName: "ad-h06-the-preview-we-would-build.png",
      render: () => noOffer(<AnnotatedAd />),
      adCopy: {
        primaryText:
          "Microschool admins: here's the kind of preview we'd build for you. Your logo, your programs and your school's details in a MudKitchen admin portal you can click around. Free.",
        headline: "The preview we'd build for you",
        description: "Free, private, within 2 business days.",
      },
    },
    {
      id: "whiteboard",
      fileName: "ad-h07-whiteboard-to-real.png",
      render: () => noOffer(<WhiteboardAd />),
      adCopy: {
        primaryText:
          "Microschool founders: still sketching how it all fits together? Send your website and we'll build the real thing as a free private MudKitchen preview: website, parent app, teacher and admin portals.",
        headline: "From whiteboard to the real thing",
        description: "Free, no obligation.",
      },
    },
    {
      id: "no-meeting",
      fileName: "ad-h08-the-meeting-you-dont-need.png",
      render: () => noOffer(<NoMeetingAd />),
      adCopy: {
        primaryText:
          "Microschool owners: no discovery call needed. Send your website and click around a private MudKitchen preview of your school, teacher portal included. Free, within 2 business days.",
        headline: "The meeting you don't need",
        description: "Free, private, no obligation.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- H1 permission slip

const SLIP_ROWS = ["Use our logo and colours", "Set up our programs", "Build our website, parent app, teacher and admin portals"];

function PermissionSlipAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            Your permission slip, <Accent>microschool founder.</Accent>
          </>
        }
        size={80}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <PaperForm width={880} rotate={-1.5}>
          <FormHeader label="Permission slip" title="Free MudKitchen preview" />
          <div style={{ padding: "24px 32px 28px" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 29, lineHeight: 1.35 }}>I give MudKitchen permission to build a free, private preview of my school:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "18px 0 20px" }}>
              {SLIP_ROWS.map((row) => (
                <span key={row} style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: 800, fontSize: 28 }}>
                  <TickBox size={42} />
                  {row}
                </span>
              ))}
            </div>
            <TearLine />
            <div style={{ display: "flex", gap: 30, marginTop: 14 }}>
              <SignatureLine caption="School founder / director" width="62%">
                <Hand size={44} color="#24507A" rotate={-3}>
                  your name here
                </Hand>
              </SignatureLine>
              <SignatureLine caption="Ready within" width="38%">
                <span style={{ fontWeight: 800, fontSize: 28 }}>2 business days</span>
              </SignatureLine>
            </div>
          </div>
        </PaperForm>
        <Pin right={-80} top={40} z={1} rotate={8}>
          <YourParentPhone scale={0.5} screen="forms" />
        </Pin>
        <Pin right={-30} bottom={-10} z={5}>
          <Crew name="pip" view="excited" width={220} flip />
        </Pin>
      </Scene>
      <div style={{ height: 24, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- H2 report card

const REPORT: Array<{ subject: string; today: string }> = [
  { subject: "Enrollment", today: "a form builder" },
  { subject: "Parent updates", today: "texts and email" },
  { subject: "Student details", today: "spreadsheets" },
  { subject: "Important tasks", today: "memory" },
];

function ReportCardAd() {
  return (
    <AdFrame audience={AUDIENCE} background="#EEF5E9">
      <AdCopy
        title={
          <>
            Your admin week&rsquo;s <Accent>report card.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin right={-80} bottom={20} z={2} rotate={3}>
          <YourAdminWindow scale={0.58} />
        </Pin>
        <Pin left={-6} top={30} z={4}>
          <PaperForm width={720} rotate={-2}>
            <FormHeader label="Report card" title="The admin week" tint={G.butter} />
            <div style={{ padding: "8px 30px 22px" }}>
              <div style={{ display: "flex", padding: "12px 0", borderBottom: `3px solid ${G.ink}`, fontWeight: 800, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", color: G.soft }}>
                <span style={{ width: "46%" }}>Subject</span>
                <span>Lives in</span>
              </div>
              {REPORT.map((row) => (
                <div key={row.subject} style={{ display: "flex", alignItems: "baseline", padding: "12px 0", borderBottom: "2px dashed rgba(43,36,29,.2)" }}>
                  <span style={{ width: "46%", fontWeight: 800, fontSize: 30 }}>{row.subject}</span>
                  <Hand size={36} color={G.clayDeep} rotate={0}>
                    {row.today}
                  </Hand>
                </div>
              ))}
              <p style={{ margin: "16px 0 0", fontWeight: 800, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", color: G.soft }}>Teacher&rsquo;s comment</p>
              <Hand size={40} color={G.forest} rotate={-1}>
                needs one shared system.
              </Hand>
            </div>
          </PaperForm>
        </Pin>
        <Pin left={30} top={620} z={6}>
          <Stamp color={G.clay} rotate={-8} style={{ background: "#FFFFFF" }}>
            See it in one place
          </Stamp>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- H3 hall pass

function HallPassAd() {
  const rows: Array<[string, string]> = [
    ["Destination", "your free preview"],
    ["Skipping", "the sales call"],
    ["Back in", "2 business days"],
  ];
  return (
    <AdFrame audience={AUDIENCE} background={G.sky} tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            Hall pass: <Accent>skip the sales call.</Accent>
          </>
        }
        size={86}
      />
      <Scene>
        <Pin right={-30} top={420} z={2}>
          <PreviewReadyEmail width={620} rotate={3} />
        </Pin>
        <Pin left={0} top={10} z={4} rotate={-6}>
          <div
            style={{
              width: 560,
              boxSizing: "border-box",
              padding: "26px 34px 30px",
              background: "linear-gradient(135deg, #E9B872 0%, #D99A52 100%)",
              border: `5px solid ${G.ink}`,
              borderRadius: 40,
              boxShadow: `0 12px 0 ${G.ink}`,
              fontFamily: FONT.body,
              color: G.ink,
            }}
          >
            <span aria-hidden style={{ display: "block", width: 46, height: 46, margin: "0 auto 10px", borderRadius: 999, background: G.sky, border: `5px solid ${G.ink}` }} />
            <p style={{ margin: 0, textAlign: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 76, letterSpacing: "0.02em", lineHeight: 1 }}>HALL PASS</p>
            <div style={{ marginTop: 18, padding: "16px 22px", background: "#FFFAF0", border: `3px solid ${G.ink}`, borderRadius: 18 }}>
              {rows.map(([label, value]) => (
                <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "6px 0" }}>
                  <span style={{ width: 170, fontWeight: 800, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", color: G.soft }}>{label}</span>
                  <Hand size={36} color="#24507A" rotate={0}>
                    {value}
                  </Hand>
                </div>
              ))}
            </div>
          </div>
        </Pin>
        <Pin left={20} bottom={0} z={5}>
          <Crew name="clover" view="cheeky" width={220} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- H4 field trip

function FieldTripAd() {
  const stops: Array<{ label: string; node: ReactNode }> = [
    { label: "Your website", node: <YourWebsiteWindow scale={0.39} /> },
    { label: "Your parent app", node: <YourParentPhone scale={0.33} screen="calendar" /> },
    { label: "Your teacher portal", node: <YourTeacherWindow scale={0.39} /> },
    { label: "Your admin portal", node: <YourAdminWindow scale={0.39} /> },
  ];
  return (
    <AdFrame audience={AUDIENCE} background={G.peach}>
      <AdCopy
        title={
          <>
            Field trip: <Accent>a tour of your own school.</Accent>
          </>
        }
        size={82}
      />
      <Scene style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PaperForm width={920} rotate={-1} bg="#FFFDF4">
          <FormHeader label="Field trip · 4 stops" title="Your free MudKitchen preview" tint={G.mint} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px", padding: "22px 26px 24px" }}>
            {stops.map((stop, i) => (
              <div key={stop.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ height: 248, display: "flex", alignItems: "center", justifyContent: "center" }}>{stop.node}</div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 25 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 999, background: G.butter, border: `3px solid ${G.ink}`, display: "grid", placeItems: "center", fontSize: 20 }}>{i + 1}</span>
                  {stop.label}
                </span>
              </div>
            ))}
          </div>
        </PaperForm>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- H5 lunchbox note

function LunchboxAd() {
  return (
    <AdFrame audience={AUDIENCE} background={YOUR.soft}>
      <AdCopy
        title={
          <>
            Tuition&rsquo;s on autopay. <Accent>Love, your school.</Accent>
          </>
        }
        sub="The note your families will actually read: an app with your school's name on it. We'll build you a free preview."
        size={80}
      />
      <Scene>
        <Pin right={20} top={10} z={2} rotate={3}>
          <YourParentPhone scale={0.98} screen="billing" />
        </Pin>
        <Pin left={-10} top={230} z={5} rotate={-7}>
          <div
            style={{
              width: 380,
              boxSizing: "border-box",
              padding: "30px 30px 26px",
              background: "repeating-linear-gradient(180deg, #FFFFFF 0, #FFFFFF 47px, #CFE0F2 47px, #CFE0F2 50px)",
              border: `4px solid ${G.ink}`,
              borderRadius: 8,
              boxShadow: `0 10px 0 ${G.ink}`,
            }}
          >
            <Hand size={36} color={G.ink} rotate={0} style={{ lineHeight: "50px" }}>
              Have a great day! Tuition&rsquo;s on autopay, and the photo release form is ready to sign. ♥
            </Hand>
            <Hand size={30} color="#24507A" rotate={0} style={{ textAlign: "right", lineHeight: "50px" }}>
              — Your School
            </Hand>
          </div>
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- H6 annotated

function AnnotatedAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            Here&rsquo;s the preview <Accent>we&rsquo;d build you.</Accent>
          </>
        }
        size={86}
      />
      <Scene style={{ marginRight: -110 }}>
        <Pin left={20} top={130} z={2}>
          <YourAdminWindow scale={1.02} />
        </Pin>
        <Pin left={-20} top={0} z={5}>
          <Annotation arrow="down-left" color={G.clayDeep}>
            your logo
          </Annotation>
        </Pin>
        <Pin left={440} top={10} z={5}>
          <Annotation arrow="down-left" color={G.forest}>
            your school&rsquo;s day
          </Annotation>
        </Pin>
        <Pin right={130} bottom={0} z={6}>
          <InkCard bg={G.butter} rotate={3} style={{ padding: "16px 24px" }}>
            <Hand size={36} color={G.ink} rotate={0}>
              your families, your programs
            </Hand>
          </InkCard>
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- H7 whiteboard

const SKETCH: Array<{ label: string; color: string; left: number; top: number; w: number; h: number }> = [
  { label: "website", color: "#2F7CF6", left: 20, top: 10, w: 250, h: 120 },
  { label: "apply", color: "#2E9E5B", left: 300, top: 30, w: 200, h: 100 },
  { label: "tuition", color: "#D64545", left: 40, top: 180, w: 210, h: 110 },
  { label: "parent app", color: "#2F7CF6", left: 290, top: 170, w: 230, h: 130 },
];

function WhiteboardAd() {
  return (
    <AdFrame audience={AUDIENCE} background="#F3EEF8">
      <AdCopy
        title={
          <>
            From whiteboard <Accent>to the real thing.</Accent>
          </>
        }
        sub="Send your website. We'll build your school a private MudKitchen preview, free."
        size={84}
      />
      <Scene>
        <Pin left={-10} top={20} z={2}>
          <Whiteboard width={580} height={380} rotate={-3}>
            {SKETCH.map((box) => (
              <MarkerBox key={box.label} color={box.color} style={{ left: box.left, top: box.top, width: box.w, height: box.h, display: "grid", placeItems: "center" }}>
                <Hand size={36} color={box.color} rotate={-2}>
                  {box.label}
                </Hand>
              </MarkerBox>
            ))}
          </Whiteboard>
        </Pin>
        <Pin right={-60} top={300} z={4} rotate={2}>
          <YourWebsiteWindow scale={0.66} />
        </Pin>
        <Pin left={0} top={470} z={5}>
          <Annotation arrow="right" color={G.clayDeep}>
            we build this part
          </Annotation>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- H8 no meeting

function NoMeetingAd() {
  return (
    <AdFrame audience={AUDIENCE} background="#EEF5E9">
      <AdCopy
        title={
          <>
            The meeting <Accent>you don&rsquo;t need.</Accent>
          </>
        }
        hand="just click around your preview instead."
        size={88}
      />
      <Scene>
        <Pin right={-70} top={150} z={2} rotate={2}>
          <YourTeacherWindow scale={0.76} />
        </Pin>
        <Pin left={-10} top={30} z={4} rotate={-5}>
          <InkCard bg="#FFFFFF" width={500} style={{ padding: "24px 30px" }}>
            <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.08em", textTransform: "uppercase", color: G.soft }}>Calendar invite · Tue 10:00</p>
            <p style={{ margin: "8px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 40, lineHeight: 1.1, color: G.soft }}>
              <Struck>45-min discovery call</Struck>
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {["Accept", "Decline"].map((label, i) => (
                <span key={label} style={{ padding: "10px 22px", borderRadius: 999, border: `3px solid ${G.ink}`, background: i ? G.peach : "#FFFFFF", fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: G.ink }}>
                  {label}
                </span>
              ))}
            </div>
          </InkCard>
        </Pin>
        <Pin left={270} top={160} z={6}>
          <Stamp color={G.clay} rotate={-14} size={40} style={{ background: "#FFFFFF" }}>
            Not needed
          </Stamp>
        </Pin>
        <Pin left={10} bottom={0} z={5}>
          <Crew name="fennel" view="happy" width={220} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}
