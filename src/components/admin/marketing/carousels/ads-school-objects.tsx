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
        label: "Permission slip",
        primaryText:
          "Here's your permission slip ✍️ to let us build a free, private MudKitchen preview of your school. Ready in 2 business days.",
        headline: "Sign here for your free preview",
        description: "No call. No obligation.",
      },
      adCopyVariants: [
        {
          label: "Signed",
          primaryText: "Permission slip for a free MudKitchen preview ✍️\n☑️ My school, all four views\n☑️ With my logo\n☑️ In 2 business days\nSigned: me. Send your website.",
          headline: "Signed: one free preview, please",
          description: "No call. No obligation.",
        },
        {
          label: "Short",
          primaryText: "This permission slip actually comes back signed. 😄 Send your website and get a free, private MudKitchen preview of your school within 2 business days.",
          headline: "The one slip that comes back signed",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "report-card",
      fileName: "ad-h02-admin-week-report-card.png",
      render: () => noOffer(<ReportCardAd />),
      adCopy: {
        label: "Needs one place",
        primaryText:
          "Enrollment in a form builder. Updates by text. Records in spreadsheets. 📝 See it all in one place: free MudKitchen preview.",
        headline: "Teacher's comment: needs one place",
        description: "Free, with your logo.",
      },
      adCopyVariants: [
        {
          label: "The grades",
          primaryText: "Your school's tools, graded: 📝\nForm builder: C\nGroup texts: D\nSpreadsheets: see me\nOne place for all of it: A+\nSend your website for a free preview.",
          headline: "Spreadsheets: see me",
          description: "Free, with your logo.",
        },
        {
          label: "Short",
          primaryText: "Teacher's comment: \"Great school. Needs one place.\" 📝 Send your website and see it all in one place with a free, private MudKitchen preview.",
          headline: "Great school. Needs one place.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "hall-pass",
      fileName: "ad-h03-hall-pass.png",
      render: () => noOffer(<HallPassAd />),
      adCopy: {
        label: "Skip the sales call",
        primaryText:
          "Here's your hall pass out of the sales call. 🎫 Send your website and a free MudKitchen preview of your school lands in your inbox.",
        headline: "Hall pass: skip the sales call",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Where to?",
          primaryText: "Hall pass to: your own free MudKitchen preview. 🎫\nFrom: the sales call you didn't want\nTime out: 2 business days\nSend your website.",
          headline: "Hall pass to your own preview",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "Excused from the sales call. 🎫 Send your website and a free, private MudKitchen preview of your school lands in your inbox instead.",
          headline: "Excused from the sales call",
          description: "Within 2 business days.",
        },
      ],
    },
    {
      id: "field-trip",
      fileName: "ad-h04-field-trip.png",
      render: () => noOffer(<FieldTripAd />),
      adCopy: {
        label: "Field trip",
        primaryText:
          "Take a field trip through your own school. 🚌 Four stops: website, parent app, teacher portal, admin portal. Free preview.",
        headline: "A field trip through your school",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Itinerary",
          primaryText: "Field trip itinerary for your free MudKitchen preview: 🚌\nStop 1: your website\nStop 2: the parent app\nStop 3: the teacher portal\nStop 4: your admin portal\nNo permission slip needed. Send your website.",
          headline: "Four stops. No permission slip.",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "The only field trip with no bus, no lunches and no headcount. 🚌 Tour your own school in a free, private MudKitchen preview. Send your website.",
          headline: "No bus. No headcount. Just your school.",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "lunchbox-note",
      fileName: "ad-h05-lunchbox-note.png",
      render: () => noOffer(<LunchboxAd />),
      adCopy: {
        label: "Love, your school",
        primaryText:
          "Forms signed online, in an app with your school's name on it. 💌 See it for your families: free MudKitchen preview.",
        headline: "Tuition on autopay. Love, your school.",
        description: "In your free preview.",
      },
      adCopyVariants: [
        {
          label: "Notes home",
          primaryText: "Notes your families would get, in a free preview of your parent app: 💌\n\"The field trip form is ready to sign.\"\n\"Here's this week's calendar.\"\nSend your website.",
          headline: "Notes home, without the backpack",
          description: "In your free preview.",
        },
        {
          label: "Short",
          primaryText: "No more forms crumpled at the bottom of a lunchbox. 🥪 See forms signed online in a free preview of your parent app.",
          headline: "No more crumpled forms",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "annotated",
      fileName: "ad-h06-the-preview-we-would-build.png",
      render: () => noOffer(<AnnotatedAd />),
      adCopy: {
        label: "What we'd build",
        primaryText:
          "Here's the preview we'd build you: your logo, programs and details in an admin portal you can click around. ✏️ Free.",
        headline: "The preview we'd build for you",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Circled",
          primaryText: "Free MudKitchen preview, annotated: ✏️\n⭕ Your logo, here\n⭕ Your programs, here\n⭕ Your school's details, here\nSend your website to get yours.",
          headline: "Your logo here. Your programs here.",
          description: "Free in 2 business days.",
        },
        {
          label: "Click around",
          primaryText: "Screenshots are nice. Clicking around your own admin portal is better. 🖱️ Send your website for a free preview.",
          headline: "Don't look at screenshots. Click.",
          description: "Free, no obligation.",
        },
      ],
    },
    {
      id: "whiteboard",
      fileName: "ad-h07-whiteboard-to-real.png",
      render: () => noOffer(<WhiteboardAd />),
      adCopy: {
        label: "Whiteboard",
        primaryText:
          "Still sketching how it all fits together? 🧑‍🏫 Send your website and we'll build the real thing as a free MudKitchen preview.",
        headline: "From whiteboard to the real thing",
        description: "Free, no obligation.",
      },
      adCopyVariants: [
        {
          label: "Arrows everywhere",
          primaryText: "Whiteboard full of arrows? ➡️ Erase it. Send your website and see it all in one place: a free MudKitchen preview.",
          headline: "Erase the arrows",
          description: "Free, no obligation.",
        },
        {
          label: "The real diagram",
          primaryText: "The diagram, in a free MudKitchen preview: 🧑‍🏫\nWebsite → families apply\nAdmin portal → you run it\nTeacher portal → class runs\nParent app → families stay in the loop",
          headline: "The real diagram: one place",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "no-meeting",
      fileName: "ad-h08-the-meeting-you-dont-need.png",
      render: () => noOffer(<NoMeetingAd />),
      adCopy: {
        label: "No meeting",
        primaryText:
          "No discovery call needed. 📅 Send your website and click around a free, private MudKitchen preview of your school.",
        headline: "The meeting you don't need",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Cancelled",
          primaryText: "Meeting cancelled: \"MudKitchen discovery call.\" 📅 Replaced with a free preview of your school you can click around.",
          headline: "Meeting cancelled. Preview sent.",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "This could've been an email. So it is. ✉️ Send your website and get a free MudKitchen preview of your school in your inbox within 2 business days.",
          headline: "This could've been an email. It is.",
          description: "Free. No call needed.",
        },
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- H1 permission slip

const SLIP_ROWS = ["Use our logo and colours", "Set up our programs", "Build all four views"];

function PermissionSlipAd() {
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            Your permission slip <Accent>is here.</Accent>
          </>
        }
        size={80}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <PaperForm width={880} rotate={-1.5}>
          <FormHeader label="Permission slip" title="Free MudKitchen preview" />
          <div style={{ padding: "24px 32px 28px" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 29, lineHeight: 1.35 }}>I give MudKitchen permission to:</p>
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
              <SignatureLine caption="School director" width="62%">
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
];

function ReportCardAd() {
  return (
    <AdFrame background="#EEF5E9">
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
    <AdFrame background={G.sky} tag={<FreeTag text="Free · private" />}>
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
    <AdFrame background={G.peach}>
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
    <AdFrame background={YOUR.soft}>
      <AdCopy
        title={
          <>
            Tuition&rsquo;s on autopay. <Accent>Love, your school.</Accent>
          </>
        }
        sub="An app with your school's name on it. Free preview."
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
              Have a great day! Your photo form is ready to sign. ♥
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
    <AdFrame background={G.cream} pattern="grid">
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
    <AdFrame background="#F3EEF8">
      <AdCopy
        title={
          <>
            From whiteboard <Accent>to the real thing.</Accent>
          </>
        }
        sub="Send your website. We'll build it, free."
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
    <AdFrame background="#EEF5E9">
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
