"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  At,
  FONT,
  G,
  Hand,
  Headline,
  MascotHookSlide,
  MascotSlide,
  NotificationCard,
  PlacedMascot,
  StickyNote,
  SwipeHint,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  BrandSwatches,
  FREE_PREVIEW_UTM,
  FreePreviewCtaSlide,
  PreviewLinkCard,
  PreviewReadyEmail,
  YOUR,
  YourAdminWindow,
  YourParentPhone,
  YourSchoolLockup,
  YourTeacherWindow,
  YourWebsiteWindow,
  groundedY,
} from "@/components/admin/marketing/carousels/free-preview-mocks";

// Swipe carousel for the free custom preview: what happens after you send us your website.
// Product art is the generic "Your School" placeholder (never a prospect's concept demo).

export const MASCOT_FREE_PREVIEW_CAROUSEL = {
  id: "mascot-free-preview",
  title: "What happens after you send us your website (Free preview)",
  description: `Mascot swipe carousel for the free custom preview: the crew gets the request, Terra pulls your colours, Dig builds the admin portal, Pip sets up the parent app, Fennel sets up the teacher portal, it lands in your inbox, you click around. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-free-preview-what-happens",
  slides: [
    {
      id: "hook",
      fileName: "01-what-happens-after-you-send-your-website.png",
      render: () => (
        <MascotHookSlide
          kicker="Free custom preview"
          headline={
            <>
              What happens after you send us <Accent>your website</Accent>
            </>
          }
          name="pip"
          view="excited"
          background="#EEF5E9"
          aside="the crew drops everything."
          mascot={{ x: 250, y: 680, width: 500 }}
        >
          <At x={520} y={500} z={6}>
            <NotificationCard title="New preview request" sub={`${YOUR.name} · website received`} color={G.clay} rotate={3} />
          </At>
          <At x={60} y={520} z={5}>
            <StickyNote width={300} rotate={-6} color={G.butter}>
              <Hand size={34} color={G.ink} rotate={0}>
                build theirs next!
              </Hand>
            </StickyNote>
          </At>
        </MascotHookSlide>
      ),
    },
    {
      id: "terra-colours",
      fileName: "02-terra-pulls-your-colours.png",
      render: () => (
        <StepSlide
          step="Step 1 · Terra"
          title={
            <>
              Terra pulls <Accent>your logo and colours.</Accent>
            </>
          }
          body="Straight from your website, so the preview already looks like your school."
          background={G.cream}
          swipeLeft
        >
          <At x={72} y={600} z={3}>
            <BrandSwatches size={170} />
          </At>
          <At x={72} y={930} z={3}>
            <span style={{ display: "inline-flex", padding: "14px 26px 14px 14px", borderRadius: 999, background: "#FFFFFF", border: `4px solid ${G.ink}`, boxShadow: `0 8px 0 ${G.ink}` }}>
              <YourSchoolLockup size={58} fontSize={34} />
            </span>
          </At>
          <PlacedMascot name="terra" view="hold" width={400} x={650} y={groundedY(400)} z={4} flip />
        </StepSlide>
      ),
    },
    {
      id: "dig-admin",
      fileName: "03-dig-builds-your-admin-portal.png",
      render: () => (
        <StepSlide
          step="Step 2 · Dig"
          title={
            <>
              Dig builds <Accent>your admin portal.</Accent>
            </>
          }
          body="Admissions, tuition and messages, set up with your school's details."
          background={G.sky}
        >
          <At x={200} y={560} z={2}>
            <YourAdminWindow scale={0.88} />
          </At>
          <PlacedMascot name="dig" view="point" width={320} x={-10} y={groundedY(320)} z={5} />
        </StepSlide>
      ),
    },
    {
      id: "pip-parent-app",
      fileName: "04-pip-sets-up-your-parent-app.png",
      render: () => (
        <StepSlide
          step="Step 3 · Pip"
          title={
            <>
              Pip sets up <Accent>your parent app.</Accent>
            </>
          }
          body="Your school's name on every screen your families see."
          background={YOUR.soft}
        >
          <At x={620} y={540} z={3}>
            <YourParentPhone scale={0.9} />
          </At>
          <At x={90} y={600} z={5}>
            <StickyNote width={340} rotate={-4} color={G.butter}>
              <Hand size={36} color={G.ink} rotate={0}>
                your name here →
              </Hand>
            </StickyNote>
          </At>
          <PlacedMascot name="pip" view="celebrate" width={400} x={120} y={groundedY(400)} z={4} />
        </StepSlide>
      ),
    },
    {
      id: "fennel-teacher",
      fileName: "05-fennel-sets-up-your-teacher-portal.png",
      render: () => (
        <StepSlide
          step="Step 4 · Fennel"
          title={
            <>
              Fennel sets up <Accent>your teacher portal.</Accent>
            </>
          }
          body="Roll call, their class, messages to families and their hours, for your staff."
          background="#ECE2F3"
          swipeLeft
        >
          <At x={60} y={600} z={2}>
            <YourTeacherWindow scale={0.86} />
          </At>
          <PlacedMascot name="fennel" view="thumbs" width={300} x={760} y={groundedY(300)} z={5} flip />
        </StepSlide>
      ),
    },
    {
      id: "inbox",
      fileName: "06-it-lands-in-your-inbox.png",
      render: () => (
        <StepSlide
          step="Step 5 · Loam"
          title={
            <>
              It lands <Accent>in your inbox.</Accent>
            </>
          }
          body="A private link, within 2 business days."
          background={G.peach}
          swipeLeft
        >
          <At x={110} y={560} z={3}>
            <PreviewReadyEmail width={840} rotate={-2} />
          </At>
          <PlacedMascot name="loam" view="excited" width={330} x={700} y={groundedY(330)} z={4} flip />
          <Hand size={42} color={G.clayDeep} rotate={-3} style={{ position: "absolute", left: 80, bottom: 180, zIndex: 5 }}>
            ding!
          </Hand>
        </StepSlide>
      ),
    },
    {
      id: "click-around",
      fileName: "07-you-click-around.png",
      render: () => (
        <StepSlide
          step="Step 6 · You"
          title={
            <>
              Then you <Accent>click around.</Accent>
            </>
          }
          body="Your website, parent app, teacher portal and admin portal. No call needed, no obligation."
          background="#EEF5E9"
        >
          <At x={40} y={590} rotate={-3} z={2}>
            <YourAdminWindow scale={0.48} />
          </At>
          <At x={540} y={600} rotate={2} z={2}>
            <YourTeacherWindow scale={0.48} />
          </At>
          <At x={300} y={890} rotate={-1} z={3}>
            <YourWebsiteWindow scale={0.48} />
          </At>
          <At x={820} y={850} rotate={3} z={4}>
            <YourParentPhone scale={0.36} />
          </At>
          <PlacedMascot name="dot" view="thumbs" width={200} x={50} y={groundedY(200)} z={5} />
        </StepSlide>
      ),
    },
    {
      id: "cta",
      fileName: "08-get-your-free-preview.png",
      render: () => (
        <FreePreviewCtaSlide
          lead="Send us your website."
          accent="We'll build the rest."
          aside="free · private · within 2 business days"
          cast={[
            { name: "terra", view: "wave", width: 320, x: 520, y: groundedY(320) },
            { name: "dig", view: "thumbs", width: 300, x: 770, y: groundedY(300), flip: true },
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

/** Middle slide: step kicker, headline and body at the top; scene art below; swipe hint. */
function StepSlide({ swipeLeft, title, body, background, children }: { step: string; title: ReactNode; body?: string; background: string; children: ReactNode; swipeLeft?: boolean }) {
  return (
    <MascotSlide background={background}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 6 }}>
        <Headline size={72}>
          {title}
        </Headline>
        {body ? (
          <p style={{ margin: "18px 0 0", maxWidth: 900, fontFamily: FONT.body, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: G.soft, textWrap: "pretty" }}>{body}</p>
        ) : null}
      </div>
      {children}
      <SwipeHint style={swipeLeft ? { left: 72, right: "auto" } : undefined} />
    </MascotSlide>
  );
}
