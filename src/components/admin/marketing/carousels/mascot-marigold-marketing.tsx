"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenMarketingWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  BrowserTab,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  NotificationReactionSlide,
  ReactionListSlide,
  SAMPLE_NOTIFS,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from product-preview-tabs.ts,
// get-started-showcase-slides.ts and FloatingStickers.tsx.

const H = 920;

export const MASCOT_MARIGOLD_MARKETING_CAROUSEL = {
  id: "mascot-marigold-marketing",
  title: "Marigold is still waiting for results (Marketing)",
  description: "Mascot carousel: Marigold's marketing plan unravels, then the Garden marketing automations.",
  fileSlug: "mudkitchen-marigold-marketing",
  slides: [
    {
      id: "hook",
      fileName: "01-posted-once-in-2023.png",
      render: () => (
        <MascotHookSlide
          kicker="Meet Marigold, who does the marketing"
          headline={
            <>
              Marigold posted once in 2023 and is <Accent>still waiting for results</Accent>
            </>
          }
          name="marigold"
          view="sleepy"
          background="#FDEBDD"
          aside="the algorithm has not called back."
          mascot={{ x: 260, y: 650, width: 540 }}
        >
          <At x={50} y={560} z={3}>
            <BrowserTab label="1 post · 3 likes (2 are mom)" rotate={-5} tint="#FFF7DA" />
          </At>
          <At x={600} y={530} z={3}>
            <BrowserTab label="open house flyer FINAL.png" rotate={5} />
          </At>
        </MascotHookSlide>
      ),
    },
    {
      id: "plan",
      fileName: "02-the-marketing-plan-a-timeline.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Marigold&rsquo;s marketing plan, <Accent>a timeline</Accent>
            </>
          }
          name="marigold"
          rows={[
            { tag: "January", label: "“post every day!”", view: "excited" },
            { tag: "February", label: "“post every week”", view: "happy" },
            { tag: "March", label: "“post… sometimes”", view: "thinking" },
            { tag: "April", label: "“what’s our password?”", view: "confused" },
            { tag: "May", label: "“we’re word-of-mouth people”", view: "cheeky" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-follow-ups-sent-themselves.png",
      render: () => (
        <MascotTurnSlide
          name="marigold"
          view="curious"
          background="#FFF6D6"
          bubble={
            <>
              what if the follow-ups <Accent>sent themselves?</Accent>
            </>
          }
          aside="(while you teach.)"
        />
      ),
    },
    {
      id: "pipelines",
      fileName: "04-pipelines.png",
      render: () => (
        <MascotProductSlide
          kicker="Marketing"
          title="Emails that keep going while you teach."
          aside="marigold approves."
          note="Automatic emails to families who inquired, based on where they are in enrollment."
          noteAt={{ x: 630, y: 950, rotate: 3, width: 390 }}
          mascot={{ name: "marigold", view: "point", width: 380, x: -30, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenMarketingWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "steps",
      fileName: "05-emails-at-each-step.png",
      render: () => (
        <MascotProductSlide
          kicker="Automations"
          title="Each family gets the right next email."
          aside="marigold gets a nap."
          note="Booked a tour? Applied? The next email goes out on its own."
          background="#F3EEF8"
          noteAt={{ x: 60, y: 990, rotate: -3, width: 380 }}
          mascot={{ name: "marigold", view: "thumbs", width: 360, x: 700, y: 910 }}
          contentHeight={H}
          crop={{ zoom: 1.35, originX: 0.12, originY: 0.24 }}
        >
          <GardenMarketingWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "reaction",
      fileName: "06-invites-going-out-on-their-own.png",
      render: () => (
        <NotificationReactionSlide
          headline={
            <>
              open house invites, <Accent>going out on their own</Accent>
            </>
          }
          aside="marigold, watching from a sunny spot"
          name="marigold"
          view="love"
          background="#E3EDFB"
          notifs={[SAMPLE_NOTIFS.campaignSent, SAMPLE_NOTIFS.leadNurtured]}
        />
      ),
    },
    {
      id: "outro",
      fileName: "07-marketing-on-autopilot.png",
      render: () => <MascotOutroSlide name="marigold" view="celebrate" lead="Marketing," accent="without the guilt." aside="marigold still posts. for fun now." />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
