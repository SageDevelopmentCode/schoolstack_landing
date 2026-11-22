"use client";

import type { ReactNode } from "react";
import type { MarketingAdCopy, MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { Accent, AdCopy, AdFooter, AdFrame, Crew, FONT, G, Scene } from "@/components/admin/marketing/ads/ad-kit";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";
import { YourAdminPhone } from "@/components/admin/marketing/carousels/free-preview-mocks";
import {
  AIRY,
  AiryGlow,
  AppIconTile,
  BigCrew,
  ChatBubble,
  ChatExchange,
  RingPortrait,
  SOFT_SHADOW,
  TaskCloud,
} from "@/components/admin/marketing/carousels/crew-chat-kit";

// Set: the crew messages you. Modelled on friendly-character app ads: one big crew member, a short chat where
// they spot something and you say "Yes please!", a shame-free reframe, a floating to-do cloud and an "Until now." pivot.
// Every chat line is something MudKitchen really does (tuition due reminders, online applications, roll call with
// family check-in pings). The crew are characters, never "an AI".

const OFFER_TAIL = "Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.";
const ad = (label: string, hook: string, headline: string, description?: string): MarketingAdCopy => ({
  label,
  primaryText: `${hook} ${OFFER_TAIL}`,
  headline,
  ...(description ? { description } : {}),
});

export const ADS_CREW_CHAT_CAROUSEL = {
  id: "ads-crew-chat",
  title: "Ads: Crew chat (8)",
  description: "Friendly single ads: one big crew member, a short chat (\"Yes please!\"), a shame-free reframe, a to-do cloud and an \"Until now.\" pivot. Offer chip can be switched off. Feed + story.",
  fileSlug: "mudkitchen-ads-crew-chat",
  kind: "ad",
  offerToggle: true,
  sizes: ["feed", "story"],
  slides: [
    {
      id: "hello",
      fileName: "ad-cc1-terra-hello.png",
      render: () => <HelloAd />,
      adCopy: ad("Hello", "Meet the crew that handles your school's admin. 👋 Enrollment, tuition, attendance and parent messages, all in one place.", "Your school's admin, handled.", "For microschools"),
      adCopyVariants: [
        ad("You teach", "Hi! We're the MudKitchen crew. We handle the admin so you can get back to teaching. 👋", "We handle admin. You teach."),
        ad("One place", "Applications, tuition, roll call and parent messages, in one place your whole team can use. 🌱", "Your whole school, one place", "For microschools"),
      ],
    },
    {
      id: "nutmeg-tuition",
      fileName: "ad-cc2-nutmeg-tuition-chat.png",
      render: () => <NutmegChatAd />,
      adCopy: ad("Let Nutmeg", "Let Nutmeg chase tuition. 💸 MudKitchen reminds families before tuition is due, so you don't have to send the awkward text.", "Let Nutmeg chase tuition", "Billing for microschools"),
      adCopyVariants: [
        ad("No awkward text", "\"Just a friendly reminder…\" You never have to type it again. 🙌 MudKitchen reminds families before tuition is due.", "Never type \"friendly reminder\" again"),
        ad("Autopay", "Families see every bill in one place and can set up autopay. Reminders go out before the due date. 💳", "Bills, autopay and reminders", "Billing for microschools"),
      ],
    },
    {
      id: "pip-enrollment",
      fileName: "ad-cc3-pip-enrollment-chat.png",
      render: () => <PipChatAd />,
      adCopy: ad("Let Pip", "Let Pip watch enrollment. 🌱 Families apply online and every application lands in one place, sorted by stage.", "Let Pip watch enrollment", "Online applications"),
      adCopyVariants: [
        ad("Overnight", "Two applications came in overnight. You'll see them first thing, in one place, not buried in email. ☕", "Applications, waiting in one place"),
        ad("Short", "Families apply online. Pip keeps every application in one place. 📥", "Families apply online. Done.", "Online applications"),
      ],
    },
    {
      id: "fennel-attendance",
      fileName: "ad-cc4-fennel-attendance-chat.png",
      render: () => <FennelChatAd />,
      adCopy: ad("Let Fennel", "Let Fennel take roll. 🐸 Teachers mark attendance in about a minute, and families get a ping when their child is checked in.", "Let Fennel take roll", "Attendance, done"),
      adCopyVariants: [
        ad("Clipboard", "Retire the clipboard. ✅ Roll call takes about a minute, and parents know their kid made it in.", "Retire the attendance clipboard"),
        ad("Short", "Everyone's checked in. Families know. You're teaching. 🐸", "Checked in. Families know.", "Attendance, done"),
      ],
    },
    {
      id: "reframe",
      fileName: "ad-cc5-not-bad-at-admin.png",
      render: () => <ReframeAd />,
      adCopy: ad("Reframe", "You're not bad at admin. It's just spread across six places. 🗂️ MudKitchen puts enrollment, tuition, attendance and messages in one.", "Not bad at admin. Just six places.", "One place for it all"),
      adCopyVariants: [
        ad("It's not you", "If admin feels hard, it's not you. It's the six tabs, three apps and one spreadsheet. MudKitchen brings it into one place. 🌱", "It's not you. It's the six tabs."),
        ad("Short", "Same admin, one place. 🌱 Enrollment, tuition, attendance and parent messages, together in MudKitchen.", "Same admin, one place", "One place for it all"),
      ],
    },
    {
      id: "opening",
      fileName: "ad-cc6-opening-a-microschool.png",
      render: () => <OpeningAd />,
      adCopy: ad("Opening", "Opening a microschool? 🌱 The crew handles applications, tuition, attendance, messages and your website in one place.", "Opening a microschool?", "Start organized"),
      adCopyVariants: [
        ad("To-do list", "New microschool to-do list: 📝\n✅ Take applications\n✅ Collect tuition\n✅ Message families\n✅ Build your website\nMudKitchen does all four.", "Your opening to-do list, handled"),
        ad("Start right", "Start your microschool with everything in one place, not five apps you'll untangle later. 🌱", "Start with it all in one place", "Start organized"),
      ],
    },
    {
      id: "until-now",
      fileName: "ad-cc7-until-now.png",
      render: () => <UntilNowAd />,
      adCopy: ad("Until now", "Most school software is built for big schools and districts. MudKitchen is built for microschools. 🌱 Enrollment, tuition, attendance, messages and your website.", "Built for microschools. Finally.", "Made for small schools"),
      adCopyVariants: [
        ad("Too big", "Software built for districts is too much for a microschool. Spreadsheets are too little. MudKitchen fits. 🌱", "Not too big. Not too little."),
        ad("Short", "School software, finally sized for microschools. 🌱", "Finally, sized for microschools", "Made for small schools"),
      ],
    },
    {
      id: "reminders",
      fileName: "ad-cc8-reminders-send-themselves.png",
      render: () => <RemindersAd />,
      adCopy: ad("Send themselves", "Tuition reminders that send themselves. 💸 MudKitchen emails families before tuition is due, so you're not the one texting about it.", "Tuition reminders, on autopilot", "Billing for microschools"),
      adCopyVariants: [
        ad("Set it once", "Pick how many days before the due date. MudKitchen reminds families every time. ⏰", "Set it once. Reminders go out."),
        ad("Short", "Nutmeg sends the tuition reminders now. You don't have to. 💸", "Nutmeg sends the reminders now", "Billing for microschools"),
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- shared layouts (also used by posts-crew-chat)

type Footer = "cta" | "site";

/** Headline + footer up top, one huge crew member running off the bottom, a chat exchange floating over them. */
export function CrewChatLayout({
  background,
  title,
  name,
  view,
  bigView = "wave",
  ask,
  reply,
  footer = "cta",
  mascotX = 250,
}: {
  background: string;
  title: ReactNode;
  name: MascotName;
  view?: MascotView;
  bigView?: MascotView;
  ask: ReactNode;
  reply: ReactNode;
  footer?: Footer;
  mascotX?: number;
}) {
  return (
    <AdFrame background={background} pattern="none">
      <AiryGlow x="70%" y="78%" size={1200} />
      <BigCrew name={name} view={bigView} top={footer === "site" ? 600 : 700} width={680} x={mascotX} />
      <AdCopy title={title} size={88} maxWidth={900} />
      <div style={{ height: 26, flexShrink: 0 }} />
      <AdFooter variant={footer} />
      <Scene style={{ marginTop: 44 }}>
        <ChatExchange name={name} view={view} ask={ask} reply={reply} maxWidth={600} style={{ position: "relative", zIndex: 4, width: 860 }} />
      </Scene>
    </AdFrame>
  );
}

/** Shame-free reframe: a two-part headline, a real phone between two ringed crew portraits. */
export function ReframeLayout({
  background,
  title,
  phone,
  left,
  right,
  footer = "cta",
}: {
  background: string;
  title: ReactNode;
  phone: ReactNode;
  left: { name: MascotName; view: MascotView };
  right: { name: MascotName; view: MascotView };
  footer?: Footer;
}) {
  return (
    <AdFrame background={background} pattern="none">
      <AiryGlow y="62%" size={1100} />
      <AdCopy title={title} size={80} />
      <Scene style={{ marginTop: 30 }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 3 }}>{phone}</div>
        <div style={{ position: "absolute", left: 28, top: "8%", zIndex: 4 }}>
          <RingPortrait name={left.name} view={left.view} size={196} />
        </div>
        <div style={{ position: "absolute", right: 28, bottom: "12%", zIndex: 4 }}>
          <RingPortrait name={right.name} view={right.view} size={196} />
        </div>
      </Scene>
      <div style={{ height: 34, flexShrink: 0 }} />
      <AdFooter variant={footer} />
    </AdFrame>
  );
}

/** Audience question, a floating cloud of jobs, and a mint payoff card with a phone and a crew member. */
export function TaskCloudLayout({
  background,
  title,
  tasks,
  payoff,
  phone,
  crew,
  footer = "cta",
}: {
  background: string;
  title: ReactNode;
  tasks: string[];
  payoff: ReactNode;
  phone: ReactNode;
  crew: { name: MascotName; view: MascotView };
  footer?: Footer;
}) {
  return (
    <AdFrame background={background} pattern="none">
      <AiryGlow y="45%" size={1000} />
      <AdCopy title={title} size={92} />
      <Scene style={{ marginTop: 34, marginBottom: 36 }}>
        <TaskCloud items={tasks} size={38} />
      </Scene>
      <PayoffCard phone={phone} crew={crew}>
        {payoff}
      </PayoffCard>
      <div style={{ height: 34, flexShrink: 0 }} />
      <AdFooter variant={footer} />
    </AdFrame>
  );
}

function PayoffCard({ children, phone, crew }: { children: ReactNode; phone: ReactNode; crew: { name: MascotName; view: MascotView } }) {
  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        boxSizing: "border-box",
        height: 250,
        padding: "0 0 0 48px",
        display: "flex",
        alignItems: "center",
        borderRadius: 44,
        background: G.mint,
        boxShadow: SOFT_SHADOW,
        zIndex: 3,
      }}
    >
      <p style={{ margin: 0, maxWidth: 470, fontFamily: FONT.display, fontWeight: 800, fontSize: 50, lineHeight: 1.04, letterSpacing: "-0.025em", color: G.forestDeep, textWrap: "balance" }}>{children}</p>
      <div style={{ position: "absolute", right: 196, bottom: 26, transform: "rotate(6deg)", zIndex: 1 }}>{phone}</div>
      <div style={{ position: "absolute", right: -26, bottom: -18, zIndex: 2 }}>
        <Crew name={crew.name} view={crew.view} width={230} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- ads

function HelloAd() {
  return (
    <AdFrame background={AIRY.sky} pattern="none">
      <AiryGlow y="80%" size={1300} />
      <BigCrew name="terra" view="wave" top={640} width={760} x={70} />
      <AdCopy title={<>Your school&rsquo;s admin, <Accent>handled.</Accent></>} size={100} align="center" maxWidth={900} />
      <div style={{ height: 28, flexShrink: 0 }} />
      <AdFooter align="center" />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, zIndex: 4 }}>
          <ChatBubble from="crew" size={42}>
            Hi! I&rsquo;m Terra. 👋
          </ChatBubble>
        </div>
      </Scene>
    </AdFrame>
  );
}

function NutmegChatAd() {
  return (
    <CrewChatLayout
      background={AIRY.butter}
      title={<>Let Nutmeg <Accent>chase tuition.</Accent></>}
      name="nutmeg"
      view="happy"
      bigView="thumbs"
      ask={<>Tuition&rsquo;s due Friday. Remind 3 families?</>}
      reply="Yes please!"
    />
  );
}

function PipChatAd() {
  return (
    <CrewChatLayout
      background={AIRY.peach}
      title={<>Let Pip <Accent>watch enrollment.</Accent></>}
      name="pip"
      view="excited"
      bigView="wave"
      ask="2 new applications came in overnight."
      reply="On it!"
    />
  );
}

function FennelChatAd() {
  return (
    <CrewChatLayout
      background={AIRY.mint}
      title={<>Let Fennel <Accent>take roll.</Accent></>}
      name="fennel"
      view="happy"
      bigView="thumbs"
      ask={<>Everyone&rsquo;s checked in. Families got a ping.</>}
      reply="Thanks, Fennel!"
    />
  );
}

function ReframeAd() {
  return (
    <ReframeLayout
      background={AIRY.lav}
      title={<>You&rsquo;re not bad at admin. <Accent>It&rsquo;s just in six places.</Accent></>}
      phone={<YourAdminPhone scale={0.78} />}
      left={{ name: "dig", view: "happy" }}
      right={{ name: "nutmeg", view: "wink" }}
    />
  );
}

function OpeningAd() {
  return (
    <TaskCloudLayout
      background={AIRY.peach}
      title="Opening a microschool?"
      tasks={["Take applications", "Collect tuition", "Message families", "Build your website", "Take attendance"]}
      payoff={<>Start with the crew <Accent color={G.forest}>behind you.</Accent></>}
      phone={<YourAdminPhone scale={0.36} />}
      crew={{ name: "dig", view: "wave" }}
    />
  );
}

const FEATURES = ["Enrollment", "Tuition", "Attendance", "Messages", "Website"];

function UntilNowAd() {
  return (
    <AdFrame background={AIRY.butter} pattern="none">
      <AiryGlow y="40%" size={1100} />
      <AdCopy title={<>School software never fit microschools. <Accent>Until now.</Accent></>} size={96} />
      <Scene>
        <div style={{ position: "absolute", left: 90, bottom: -12, zIndex: 3 }}>
          <Crew name="pip" view="sit" width={300} />
        </div>
        <div style={{ position: "absolute", right: 90, bottom: -12, zIndex: 3 }}>
          <Crew name="nutmeg" view="sit" width={300} flip />
        </div>
      </Scene>
      <div
        style={{
          position: "relative",
          zIndex: 4,
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          padding: "26px 20px",
          borderRadius: 999,
          background: "#FFFFFF",
          boxShadow: SOFT_SHADOW,
          fontFamily: FONT.body,
          fontWeight: 800,
          fontSize: 30,
          color: G.ink,
          whiteSpace: "nowrap",
        }}
      >
        {FEATURES.map((feature, i) => (
          <span key={feature} style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            {i > 0 ? <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: G.clay, opacity: 0.7 }} /> : null}
            {feature}
          </span>
        ))}
      </div>
      <div style={{ height: 34, flexShrink: 0 }} />
      <AdFooter />
    </AdFrame>
  );
}

function RemindersAd() {
  return (
    <AdFrame background={AIRY.blush} pattern="none">
      <AiryGlow x="62%" y="58%" size={1100} />
      <AdCopy title={<>Tuition reminders that <Accent>send themselves.</Accent></>} size={96} maxWidth={860} />
      <Scene>
        <div style={{ position: "absolute", left: -210, bottom: -20, zIndex: 2 }}>
          <Crew name="nutmeg" view="peek" width={520} />
        </div>
        <div style={{ position: "absolute", right: 24, bottom: 60, zIndex: 3 }}>
          <AppIconTile size={230} rotate={6} />
        </div>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <AdFooter />
    </AdFrame>
  );
}

