"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenWebsiteWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  BrowserTab,
  G,
  Hand,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  NotificationReactionSlide,
  ReactionListSlide,
  SAMPLE_NOTIFS,
  StickyNote,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from product-preview-tabs.ts,
// get-started-showcase-slides.ts and FloatingStickers.tsx.

const H = 920;

export const MASCOT_TERRA_WEBSITE_CAROUSEL = {
  id: "mascot-terra-website",
  title: "Terra is updating the website (Website)",
  description: "Mascot carousel: Terra's eternal website update, then the Garden school website.",
  fileSlug: "mudkitchen-terra-website",
  slides: [
    {
      id: "hook",
      fileName: "01-updating-the-website-since-2019.png",
      adCopy: {
        label: "Updating the website",
        primaryText: "Terra is \"updating the website.\" It's on the list. It's been on the list since 2019. 🙃\n\nSwipe for the school website that actually stays up to date →\n\n#microschool #schoolwebsite #schoolfounder",
        headline: "Terra is updating the website",
      },
      adCopyVariants: [
        {
          label: "The stages",
          primaryText: "The stages of editing your own school website: \"how hard can it be,\" 14 plugins installed, the font incident, and the phone view. 😅 Which stage are you in? Swipe →\n\n#microschool #schoolwebsite",
          headline: "Which website stage are you in?",
        },
        {
          label: "Tag them",
          primaryText: "Tag the person who's been \"updating the website\" since 2019. 👀 Then swipe for the version Terra is proud of →\n\n#microschool #schoolwebsite",
          headline: "Tag your website person",
        },
      ],
      render: () => (
        <MascotHookSlide
          kicker="Meet Terra, who runs the website"
          headline={
            <>
              Terra has been <Accent>&ldquo;updating the website&rdquo;</Accent> since 2019
            </>
          }
          name="terra"
          view="sleepy"
          background="#EEF5E9"
          aside="it’s on the list. it’s been on the list."
          mascot={{ x: 230, y: 660, width: 560 }}
        >
          <At x={60} y={470} z={3}>
            <BrowserTab label="home-OLD-v2.html" rotate={-5} tint="#FFF7DA" />
          </At>
          <At x={640} y={500} z={3}>
            <BrowserTab label="© 2019 · under construction" rotate={4} />
          </At>
          <At x={700} y={640} z={5}>
            <StickyNote width={300} rotate={6} color={G.butter}>
              <Hand size={34} color={G.ink} rotate={0}>
                TODO: new photos (2019)
              </Hand>
            </StickyNote>
          </At>
        </MascotHookSlide>
      ),
    },
    {
      id: "stages",
      fileName: "02-five-stages-of-editing-your-website.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              The 5 stages of <Accent>editing your own website</Accent>
            </>
          }
          name="terra"
          tagPrefix="Stage"
          rows={[
            { label: "Confidence", aside: "“how hard can it be”", view: "happy" },
            { label: "The plugins", aside: "installed 14. using 0.", view: "thinking" },
            { label: "The font incident", aside: "everything is bold now", view: "surprised" },
            { label: "The phone view", aside: "why is the menu… there", view: "confused" },
            { label: "Acceptance", aside: "“nobody scrolls anyway”", view: "tears" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-it-just-worked.png",
      render: () => (
        <MascotTurnSlide
          name="terra"
          view="curious"
          bubble={
            <>
              what if the website just&hellip; <Accent>worked?</Accent>
            </>
          }
          aside="(no plugins. no font incidents.)"
        />
      ),
    },
    {
      id: "site",
      fileName: "04-a-full-school-website.png",
      render: () => (
        <MascotProductSlide
          kicker="School Website"
          title="A website that looks like your school."
          aside="terra cried. happy tears."
          note="Programs, FAQs, your team, and tour booking on one site."
          noteAt={{ x: 630, y: 960, rotate: 3, width: 390 }}
          mascot={{ name: "terra", view: "point", width: 400, x: -40, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.12, originX: 0, originY: 0 }}
        >
          <GardenWebsiteWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "apply",
      fileName: "05-apply-buttons-families-find.png",
      render: () => (
        <MascotProductSlide
          kicker="Apply buttons"
          title="Families can find the Apply button."
          aside="it’s big. it’s on every page."
          note="Families go from reading about you to applying in one click."
          background="#F3EEF8"
          noteAt={{ x: 60, y: 990, rotate: -3, width: 380 }}
          mascot={{ name: "terra", view: "thumbs", width: 380, x: 680, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.12, originX: 0, originY: 0 }}
        >
          <GardenWebsiteWindow contentHeight={H} toForm />
        </MascotProductSlide>
      ),
    },
    {
      id: "reaction",
      fileName: "06-refreshing-for-tour-bookings.png",
      render: () => (
        <NotificationReactionSlide
          headline={
            <>
              Tours now <Accent>book themselves</Accent> from the website
            </>
          }
          aside="terra checks anyway. slowly."
          name="terra"
          view="love"
          background="#FDEBDD"
          notifs={[SAMPLE_NOTIFS.tourBooked, SAMPLE_NOTIFS.newInquiry]}
        />
      ),
    },
    {
      id: "outro",
      fileName: "07-website-updated-for-real.png",
      render: () => <MascotOutroSlide name="terra" view="celebrate" lead="Website: updated." accent="For real this time." aside="the 2019 banner is finally gone" />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
