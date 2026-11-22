"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  GardenAdmissionsWindow,
  GardenMarketingWindow,
  GardenWebsiteWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  MascotHookSlide,
  MascotListSlide,
  MascotOutroSlide,
  MascotProductSlide,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// January carousel. Product notes are word for word from the Terra, Marigold and Dig carousels.

const H = 920;

export const MASCOT_SPRING_ENROLLMENT_PLAN_CAROUSEL = {
  id: "mascot-spring-enrollment-plan",
  title: "Your spring enrollment game plan (Website, Marketing, Admissions)",
  description: "Mascot carousel for January: a 5-step spring enrollment plan, then the website, marketing and admissions screens.",
  fileSlug: "mudkitchen-spring-enrollment-plan",
  slides: [
    {
      id: "hook",
      fileName: "01-spring-enrollment-game-plan.png",
      render: () => (
        <MascotHookSlide
          kicker="Spring enrollment"
          headline={
            <>
              Spring enrollment opens in January. <Accent>Here&rsquo;s the game plan.</Accent>
            </>
          }
          name="pip"
          view="determined"
          background="#E9F4E2"
          aside="pip made a whiteboard."
        />
      ),
      adCopy: {
        label: "Game plan",
        primaryText:
          "Spring enrollment opens in January. Here's the game plan, in 5 steps. 📋\n\nSave it now, thank yourself in February. Swipe →\n\n#microschool #enrollment #schoolfounder",
        headline: "Your spring enrollment game plan",
      },
      adCopyVariants: [
        {
          label: "Which step",
          primaryText: "Spring enrollment in 5 steps. Which one are you already done with? Comment the number. 👇\n\nSwipe for the full plan →\n\n#microschool #enrollment #schoolfounder",
          headline: "Which step are you on?",
        },
        {
          label: "Tag a co-founder",
          primaryText: "Send this to whoever runs enrollment at your school. 📋 Five steps to a calm spring enrollment. Swipe →\n\n#microschool #enrollment",
          headline: "Send this to your enrollment person",
        },
      ],
    },
    {
      id: "steps",
      fileName: "02-five-steps.png",
      render: () => (
        <MascotListSlide
          kicker="The plan"
          title={
            <>
              5 steps to a <Accent>full spring roster</Accent>
            </>
          }
          headlineSize={60}
          rows={[
            { label: "Freshen your website", detail: "Make Apply impossible to miss." },
            { label: "Open applications", detail: "One online form, not a PDF." },
            { label: "Host an open house", detail: "Then follow up with everyone." },
            { label: "Review by stage", detail: "Inquiry, tour, applied, enrolled." },
            { label: "Send the enrollment checklist", detail: "Forms, agreements, fees, done." },
          ]}
          mascot={{ name: "pip", view: "point" }}
          tip="step 6: nap."
        />
      ),
    },
    {
      id: "website",
      fileName: "03-the-apply-button.png",
      render: () => (
        <MascotProductSlide
          kicker="Step 1 · Website"
          title="Families can find the Apply button."
          aside="terra polished it."
          note="Families go from reading about you to applying in one click."
          noteAt={{ x: 620, y: 940, rotate: 3, width: 390 }}
          mascot={{ name: "terra", view: "point", width: 360, x: -30, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.12, originX: 0, originY: 0 }}
        >
          <GardenWebsiteWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "marketing",
      fileName: "04-follow-ups-that-send-themselves.png",
      render: () => (
        <MascotProductSlide
          kicker="Step 3 · Open house"
          title="Each family gets the right next email."
          aside="marigold is thriving."
          note="Booked a tour? Applied? The next email goes out on its own."
          background="#FFF3CF"
          noteAt={{ x: 60, y: 980, rotate: -3, width: 390 }}
          mascot={{ name: "marigold", view: "excited", width: 330, x: 730, y: 930 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenMarketingWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "admissions",
      fileName: "05-review-by-stage.png",
      render: () => (
        <MascotProductSlide
          kicker="Step 4 · Review"
          title="Applications sorted by stage, automatically."
          aside="pip found every family."
          note="See every family, from first inquiry to enrolled."
          background="#E3EDFB"
          noteAt={{ x: 620, y: 940, rotate: 3, width: 390 }}
          mascot={{ name: "pip", view: "thumbs", width: 340, x: -20, y: 920 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenAdmissionsWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "outro",
      fileName: "06-spring-enrollment-planned.png",
      render: () => <MascotOutroSlide name="pip" view="celebrate" lead="Spring enrollment," accent="planned." aside="(the whiteboard can retire.)" />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
