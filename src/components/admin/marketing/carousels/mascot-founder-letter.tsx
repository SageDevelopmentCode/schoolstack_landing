"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { At, FONT, G, Hand, MascotSlide, PlacedMascot, StickyNote, SwipeHint } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  FREE_PREVIEW_UTM,
  FreePreviewCtaSlide,
  YOUR,
  YourAdminPhone,
  YourAdminWindow,
  YourParentPhone,
  YourTeacherPhone,
  YourTeacherWindow,
  YourWebsiteWindow,
  groundedY,
} from "@/components/admin/marketing/carousels/free-preview-mocks";
import { FOUNDER_SIGNATURE, LetterLine, NotebookPaper } from "@/components/admin/marketing/carousels/founder-notes-kit";

// Swipe carousel: a letter to microschool founders, one notebook page per slide, each page taped
// over the real "Your School" screen it describes. Claims stay inside the free-preview offer.
// Body lines reuse the free-preview set's wording; signed anonymously.

export const MASCOT_FOUNDER_LETTER_CAROUSEL = {
  id: "mascot-founder-letter",
  title: "Dear microschool founder (Free preview letter)",
  description: `Swipe carousel written as a letter from the MudKitchen founder to microschool founders: one page per part of the free preview (website, parent app, teacher portal, admin portal) on the real "Your School" screens, then the CTA. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-founder-letter",
  audienceBanner: "Built for microschool founders",
  slides: [
    {
      id: "dear-founder",
      fileName: "01-dear-microschool-founder.png",
      render: () => (
        <MascotSlide background={G.cream} pattern="grid" logo="none">
          <At x={60} y={150} z={4}>
            <NotebookPaper width={900} rotate={-1.5} lineGap={74} padding="40px 50px 36px 124px">
              <LetterLine size={60} color={G.clayDeep}>
                Dear microschool founder,
              </LetterLine>
              <LetterLine size={48} style={{ lineHeight: "74px" }}>
                Send me your school&rsquo;s website, and we&rsquo;ll build you a private MudKitchen preview of your school.
              </LetterLine>
              <LetterLine size={48} style={{ lineHeight: "74px" }}>
                Your logo, your colours, your programs. Free, and in your inbox within 2 business days.
              </LetterLine>
              <LetterLine size={48} style={{ lineHeight: "74px" }}>
                Here&rsquo;s what&rsquo;s inside&hellip;
              </LetterLine>
            </NotebookPaper>
          </At>
          <PlacedMascot name="loam" view="wave" width={300} x={700} y={groundedY(300)} z={5} flip />
          <SwipeHint style={{ left: 72, right: "auto" }} />
        </MascotSlide>
      ),
      adCopy: {
        primaryText:
          "Dear microschool founder: send us your school's website and we'll build you a private MudKitchen preview with your logo, colours and programs. Free, within 2 business days. Swipe to see what's inside →",
        headline: "A letter for microschool founders",
        description: "Free, private, no obligation.",
      },
    },
    {
      id: "website",
      fileName: "02-first-your-website.png",
      render: () => (
        <LetterPage page={2} line="First, your website." aside="your logo and colours, on a real school site." background={G.sky}>
          <At x={60} y={520} z={2} rotate={1}>
            <YourWebsiteWindow scale={1} label={`${YOUR.name} · website`} />
          </At>
        </LetterPage>
      ),
    },
    {
      id: "parent-app",
      fileName: "03-then-your-parent-app.png",
      render: () => (
        <LetterPage page={3} line="Then, your parent app." aside="your school's name on every screen your families see." background={YOUR.soft}>
          <At x={560} y={520} z={3} rotate={3}>
            <YourParentPhone scale={0.98} />
          </At>
          <At x={80} y={640} z={4}>
            <StickyNote width={380} rotate={-5} color={G.butter}>
              <Hand size={38} color={G.ink} rotate={0}>
                tuition, forms and this week, in one place
              </Hand>
            </StickyNote>
          </At>
          <PlacedMascot name="pip" view="excited" width={280} x={260} y={groundedY(280)} z={5} />
        </LetterPage>
      ),
    },
    {
      id: "teacher-portal",
      fileName: "04-your-teacher-portal.png",
      render: () => (
        <LetterPage page={4} line="Your teacher portal, too." aside="roll call, the class and staff hours." background="#EEF5E9">
          <At x={60} y={560} z={2} rotate={-1}>
            <YourTeacherWindow scale={1} label={`${YOUR.name} · staff`} />
          </At>
          <At x={720} y={760} z={4} rotate={4}>
            <YourTeacherPhone scale={0.62} />
          </At>
        </LetterPage>
      ),
    },
    {
      id: "admin-portal",
      fileName: "05-and-your-admin-portal.png",
      render: () => (
        <LetterPage page={5} line="And your admin portal." aside="admissions, tuition and messages, set up with your details." background={G.peach}>
          <At x={60} y={560} z={2} rotate={1}>
            <YourAdminWindow scale={1} label={`${YOUR.name} · admin`} />
          </At>
          <At x={720} y={760} z={4} rotate={4}>
            <YourAdminPhone scale={0.62} />
          </At>
        </LetterPage>
      ),
    },
    {
      id: "cta",
      fileName: "06-send-your-website.png",
      render: () => (
        <FreePreviewCtaSlide
          lead="Free. Private. No call needed."
          accent="Just send your website."
          aside={FOUNDER_SIGNATURE}
          cast={[{ name: "loam", view: "wave", x: 640, y: 560, width: 380, flip: true }]}
        />
      ),
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

/** One page of the letter: a notebook strip with the line and a handwritten aside, then the screen. */
function LetterPage({ page, line, aside, background, children }: { page: number; line: string; aside: string; background: string; children: ReactNode }) {
  return (
    <MascotSlide background={background}>
      <At x={60} y={130} z={4}>
        <NotebookPaper width={900} rotate={-1} lineGap={74} padding="30px 50px 26px 124px" tape={G.peach}>
          <LetterLine size={62} style={{ lineHeight: "74px" }}>
            {line}
          </LetterLine>
          <LetterLine size={42} color={G.clayDeep} style={{ lineHeight: "74px" }}>
            {aside}
          </LetterLine>
          <span aria-hidden style={{ position: "absolute", right: 0, top: 6, fontFamily: FONT.hand, fontSize: 30, color: G.soft }}>
            p. {page}
          </span>
        </NotebookPaper>
      </At>
      {children}
      <SwipeHint style={{ left: 72, right: "auto" }} />
    </MascotSlide>
  );
}
