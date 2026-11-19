"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  At,
  BrowserTab,
  FONT,
  G,
  Hand,
  Headline,
  MascotHookSlide,
  MascotListSlide,
  MascotSlide,
  PlacedMascot,
  SwipeHint,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  FREE_PREVIEW_UTM,
  FreePreviewCtaSlide,
  PreviewLinkCard,
  YourAdminWindow,
  YourParentPhone,
  YourWebsiteWindow,
  groundedY,
} from "@/components/admin/marketing/carousels/free-preview-mocks";

// Swipe carousel for the free custom preview: the scattered stack, then one private preview link.
// The nine tools are the ones drawn on the slide (illustrative, not a statistic).

const TOOLS: Array<{ label: string; x: number; y: number; r: number; tint: string }> = [
  { label: "Website builder", x: 50, y: 470, r: -5, tint: "#FFFFFF" },
  { label: "Google Forms", x: 400, y: 450, r: 3, tint: "#FFF7DA" },
  { label: "Spreadsheet", x: 720, y: 480, r: -3, tint: "#E8F3E1" },
  { label: "Venmo", x: 40, y: 620, r: 4, tint: "#E3EDFB" },
  { label: "Group text", x: 780, y: 630, r: 5, tint: "#F8DDCF" },
  { label: "Email", x: 60, y: 770, r: -4, tint: "#FFFFFF" },
  { label: "Shared calendar", x: 690, y: 780, r: -2, tint: "#ECE2F3" },
  { label: "Paper binder", x: 30, y: 920, r: 3, tint: "#FFF7DA" },
  { label: "Sign-up sheet", x: 740, y: 930, r: 4, tint: "#E8F3E1" },
];

export const MASCOT_FREE_PREVIEW_BEFORE_AFTER_CAROUSEL = {
  id: "mascot-free-preview-before-after",
  title: "From 9 tools to one link (Free preview)",
  description: `Mascot swipe carousel for the free custom preview: the scattered stack, then your school's website, parent app and admin portal behind one private preview link. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-free-preview-one-link",
  slides: [
    {
      id: "hook",
      fileName: "01-your-school-runs-on-9-tools.png",
      render: () => (
        <MascotHookSlide
          kicker="From 9 tools to one link"
          headline={
            <>
              Your school runs on <Accent>9 different tools.</Accent>
            </>
          }
          name="dig"
          view="confused"
          background={G.cream}
          aside="and 9 passwords."
          mascot={{ x: 300, y: 700, width: 480 }}
        >
          {TOOLS.map((tool) => (
            <At key={tool.label} x={tool.x} y={tool.y} rotate={tool.r} z={tool.x > 300 && tool.x < 600 ? 3 : 5}>
              <BrowserTab label={tool.label} tint={tool.tint} />
            </At>
          ))}
        </MascotHookSlide>
      ),
    },
    {
      id: "nine-logins",
      fileName: "02-nine-logins.png",
      render: () => (
        <OneLinkSlide
          title={
            <>
              Nine logins. <Accent>Nine places families have to look.</Accent>
            </>
          }
          background={G.peach}
          swipeLeft
        >
          <div style={{ position: "absolute", left: 72, top: 470, width: 936, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, zIndex: 3 }}>
            {TOOLS.map((tool, i) => (
              <div
                key={tool.label}
                style={{
                  boxSizing: "border-box",
                  height: 128,
                  padding: "16px 20px",
                  background: tool.tint,
                  border: `3px solid ${G.ink}`,
                  borderRadius: 20,
                  transform: `rotate(${[-1.5, 1, -0.5, 1.5, -1, 0.5, -1, 1.5, -0.5][i]}deg)`,
                }}
              >
                <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: G.ink, whiteSpace: "nowrap" }}>{tool.label}</p>
                <p style={{ margin: "10px 0 0", fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.2em", color: G.soft }}>••••••••</p>
              </div>
            ))}
          </div>
          <Hand size={44} color={G.clayDeep} rotate={-3} style={{ position: "absolute", left: 72, top: 960, maxWidth: 560, zIndex: 5 }}>
            forgot password? ×9
          </Hand>
          <PlacedMascot name="fennel" view="tears" width={300} x={720} y={groundedY(300)} z={4} flip />
        </OneLinkSlide>
      ),
    },
    {
      id: "one-link",
      fileName: "03-now-picture-one-link.png",
      render: () => (
        <OneLinkSlide
          title={
            <>
              Now picture <Accent>one link.</Accent>
            </>
          }
          body="Your website, parent app and admin portal, behind a single private link."
          background="#EEF5E9"
        >
          <At x={110} y={540} z={3} rotate={-1.5}>
            <PreviewLinkCard width={860} />
          </At>
          <PlacedMascot name="pip" view="celebrate" width={420} x={330} y={groundedY(420)} z={4} />
        </OneLinkSlide>
      ),
    },
    {
      id: "behind-the-link",
      fileName: "04-behind-that-link-your-school.png",
      render: () => (
        <OneLinkSlide
          title={
            <>
              Behind that link: <Accent>your school.</Accent>
            </>
          }
          body="Built with your logo, colours and programs."
          background={G.sky}
        >
          <At x={40} y={540} rotate={-3} z={2}>
            <YourAdminWindow scale={0.56} />
          </At>
          <Hand size={34} color={G.forest} rotate={-3} style={{ position: "absolute", left: 60, top: 920, zIndex: 5 }}>
            admin portal
          </Hand>
          <At x={500} y={800} rotate={3} z={3}>
            <YourWebsiteWindow scale={0.56} />
          </At>
          <Hand size={34} color={G.forest} rotate={-3} style={{ position: "absolute", left: 330, top: 1060, zIndex: 5 }}>
            website →
          </Hand>
          <At x={620} y={500} z={4}>
            <YourParentPhone scale={0.42} />
          </At>
          <Hand size={34} color={G.forest} rotate={-3} style={{ position: "absolute", left: 790, top: 560, zIndex: 5 }}>
            ← parent app
          </Hand>
          <PlacedMascot name="terra" view="wave" width={240} x={70} y={groundedY(240)} z={5} />
        </OneLinkSlide>
      ),
    },
    {
      id: "how-to-get-it",
      fileName: "05-how-to-get-your-link.png",
      render: () => (
        <MascotListSlide
          kicker="How to get yours"
          title={
            <>
              Your link, <Accent>in 4 steps.</Accent>
            </>
          }
          rows={[
            { label: "Send us your website", detail: "Just the link." },
            { label: "We build your preview", detail: "Your logo, colours and programs." },
            { label: "Check your inbox", detail: "Within 2 business days." },
            { label: "Click around", detail: "Free. No call, no obligation." },
          ]}
          mascot={{ name: "loam", view: "thumbs" }}
          tip="I'll bring it to your inbox."
          background={G.cream}
        />
      ),
    },
    {
      id: "cta",
      fileName: "06-get-your-free-preview.png",
      render: () => (
        <FreePreviewCtaSlide
          lead="Nine tabs today."
          accent="One link to try."
          aside="your free preview: private, within 2 business days"
          cast={[
            { name: "pip", view: "excited", width: 300, x: 530, y: groundedY(300) },
            { name: "dig", view: "happy", width: 300, x: 770, y: groundedY(300), flip: true },
          ]}
        >
          <At x={80} y={560} z={4} rotate={-1.5}>
            <PreviewLinkCard width={760} />
          </At>
        </FreePreviewCtaSlide>
      ),
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

/** Middle slide: headline and body at the top, scene art below, swipe hint. */
function OneLinkSlide({ swipeLeft, title, body, background, children }: { title: ReactNode; body?: string; background: string; children: ReactNode; swipeLeft?: boolean }) {
  return (
    <MascotSlide background={background}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 6 }}>
        <Headline size={76}>{title}</Headline>
        {body ? (
          <p style={{ margin: "18px 0 0", maxWidth: 900, fontFamily: FONT.body, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: G.soft, textWrap: "pretty" }}>{body}</p>
        ) : null}
      </div>
      {children}
      <SwipeHint style={swipeLeft ? { left: 72, right: "auto" } : undefined} />
    </MascotSlide>
  );
}
