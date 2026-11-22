"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  AdCopy,
  AdFooter,
  AdFrame,
  CheckList,
  Crew,
  FONT,
  G,
  Hand,
  InkCard,
  PaperSheet,
  Pin,
  Scene,
} from "@/components/admin/marketing/ads/ad-kit";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";
import { STORY_COPY } from "@/components/home/home-copy";

// Organic single posts (no offer, no "Book a demo" button). Two weeks at 4–5 posts a week.
// `adCopy` holds the caption (primaryText) and a LinkedIn headline. Pillars: Teach, Laugh, Talk,
// Prove, Brand (see the social playbook doc).

export const POSTS_WEEKLY_SINGLES_CAROUSEL = {
  id: "posts-weekly-singles",
  title: "Weekly singles: tips, polls, memes (12)",
  description: "Organic single posts for two weeks: polls, this-or-that, tips, templates, crew memes. No offer.",
  fileSlug: "mudkitchen-weekly-singles",
  kind: "post",
  slides: [
    {
      id: "poll-tabs",
      fileName: "post-01-poll-how-many-tabs.png",
      render: () => <PollTabsPost />,
      adCopy: { label: "Be honest", primaryText: "Be honest: how many tabs does your school run in? A, B or C in the comments. Dig is a C. 🙃 #microschool #schooladmin", headline: "How many tabs does your school run in?" },
      adCopyVariants: [
        {
          label: "Confession",
          primaryText: "Confession time: how many browser tabs are open right now for your school? Drop the number. Closest to 47 wins nothing but our respect. 🙃 #microschool #schooladmin",
          headline: "How many tabs are open right now?",
        },
        {
          label: "Tag a founder",
          primaryText: "A, B or C: which one is your school? Tag the founder who's definitely a C. Dig says hi. 🙃 #microschool #schoolfounder",
          headline: "Tag the founder who's a C",
        },
      ],
    },
    {
      id: "this-or-that",
      fileName: "post-02-this-or-that-forms.png",
      render: () => <ThisOrThatPost />,
      adCopy: { label: "This or that", primaryText: "This or that: paper forms or online forms? Bramble has strong feelings. Tell us yours. #microschool #enrollment", headline: "Paper forms or online forms?" },
      adCopyVariants: [
        {
          label: "Hot take",
          primaryText: "Hot take: paper forms are fine until one goes through the wash. 🧺 Paper or online? Defend your answer below. #microschool #enrollment",
          headline: "Paper forms: fine until laundry day",
        },
        {
          label: "Vote",
          primaryText: "Vote with an emoji: 📄 for paper forms, 💻 for online forms. Bramble is watching the count closely. #microschool #schoolforms",
          headline: "📄 or 💻? Vote below",
        },
      ],
    },
    {
      id: "enrollment-packet",
      fileName: "post-03-enrollment-packet-tip.png",
      render: () => <PacketTipPost />,
      adCopy: { label: "Save this", primaryText: "Save this for spring enrollment: 3 things every enrollment packet needs, so you're not chasing them in week one. #microschool #enrollment #schoolfounder", headline: "3 things every enrollment packet needs" },
      adCopyVariants: [
        {
          label: "Week one",
          primaryText: "Week one of spring enrollment shouldn't be spent chasing paperwork. 📌 These 3 things go in every packet. Save it for January. #microschool #enrollment #schoolfounder",
          headline: "Don't spend week one chasing forms",
        },
        {
          label: "Tag a co-founder",
          primaryText: "Tag the person who puts your enrollment packets together. They'll want this one. 📌 3 things every packet needs. #microschool #enrollment",
          headline: "Send this to whoever does enrollment",
        },
      ],
    },
    {
      id: "tuition-template",
      fileName: "post-04-tuition-reminder-template.png",
      render: () => <TuitionTemplatePost />,
      adCopy: { label: "Template", primaryText: "A tuition reminder that isn't awkward. Copy it, fill in the brackets, send. (Or set up autopay and never send it again.) #microschool #tuition", headline: "A tuition reminder template" },
      adCopyVariants: [
        {
          label: "Not awkward",
          primaryText: "Asking families about late tuition is the most awkward email you'll write all month. So we wrote it for you. Copy, fill in, send. 💌 #microschool #tuition #schoolfounder",
          headline: "We wrote the awkward email for you",
        },
        {
          label: "Save it",
          primaryText: "Save this tuition reminder for the 3rd of next month. You'll thank yourself. (Or skip it forever with autopay.) 📌 #microschool #tuition",
          headline: "Save this for the 3rd of the month",
        },
      ],
    },
    {
      id: "job-description",
      fileName: "post-05-founder-job-description.png",
      render: () => <JobDescriptionPost />,
      adCopy: { label: "Job description", primaryText: "Microschool founder, official job description. What did we miss? #microschool #founderlife", headline: "Microschool founder: job description" },
      adCopyVariants: [
        {
          label: "Hiring",
          primaryText: "Now hiring: microschool founder. Must teach, bill, plan, clean, and reply to texts at 9pm. Salary: vibes. Apply within. 😅 What would you add? #microschool #founderlife",
          headline: "Now hiring: microschool founder",
        },
        {
          label: "Tag them",
          primaryText: "Tag a microschool founder who does every job on this list (and three that aren't). 👇 #microschool #founderlife #schoolfounder",
          headline: "Tag the founder who does it all",
        },
      ],
    },
    {
      id: "rate-your-week",
      fileName: "post-06-rate-your-week-fennels.png",
      render: () => <RateWeekPost />,
      adCopy: { label: "1 to 5 Fennels", primaryText: "Rate your week from 1 to 5 Fennels. No judgment. Fennel is a 2 today. #microschool #teacherlife", headline: "Rate your week: 1 to 5 Fennels" },
      adCopyVariants: [
        {
          label: "Emoji only",
          primaryText: "Rate your week with Fennels only. 🐸🐸🐸 is a perfectly respectable Wednesday. Comment yours. #microschool #teacherlife",
          headline: "Comment your Fennel count",
        },
        {
          label: "Honest",
          primaryText: "Honest check-in: how's your week, from 1 to 5 Fennels? If it's a 1, we hope the weekend is a 5. 🐸 #microschool #founderlife",
          headline: "Honest check-in: how's your week?",
        },
      ],
    },
    {
      id: "sage-field",
      fileName: "post-07-sage-field-story.png",
      render: () => <SageFieldPost />,
      adCopy: { label: "Customer story", primaryText: `${STORY_COPY.school.name} went from 0 to 35 students in under 3 months, running enrollment, tuition and family communication from one place. Read the story at trymudkitchen.com/customers/sagefield. #microschool`, headline: "0 → 35 students in under 3 months" },
      adCopyVariants: [
        {
          label: "The number",
          primaryText: `0 to 35 students in under 3 months. 📈 That's ${STORY_COPY.school.name}, running enrollment, tuition and family communication from one place. Full story at trymudkitchen.com/customers/sagefield. #microschool #schoolfounder`,
          headline: "35 students in under 3 months",
        },
        {
          label: "Question",
          primaryText: `What does it take to go from 0 to 35 students in under 3 months? For ${STORY_COPY.school.name}, part of it was running everything from one place. Read how: trymudkitchen.com/customers/sagefield #microschool`,
          headline: `How ${STORY_COPY.school.name} grew to 35`,
        },
      ],
    },
    {
      id: "january-checklist",
      fileName: "post-08-january-checklist.png",
      render: () => <JanuaryChecklistPost />,
      adCopy: { label: "Fridge-worthy", primaryText: "Your January checklist for a calm spring semester. Save it, screenshot it, tape it to the fridge next to the volunteer sheet. #microschool #schoolfounder", headline: "Your January checklist" },
      adCopyVariants: [
        {
          label: "Save it",
          primaryText: "📌 Save this now, thank yourself in January. Your checklist for a calm spring semester. #microschool #schoolfounder #newsemester",
          headline: "Save now. Thank yourself in January.",
        },
        {
          label: "Which first",
          primaryText: "Your January checklist for a calm spring semester. Which one are you tackling first? Comment the number. 👇 #microschool #schoolfounder",
          headline: "Which one are you doing first?",
        },
      ],
    },
    {
      id: "meet-the-crew",
      fileName: "post-09-meet-the-crew.png",
      render: () => <MeetCrewPost />,
      adCopy: { label: "Meet the crew", primaryText: "Meet the MudKitchen crew: twelve tiny coworkers, one for every job at your school. Which one are you this week? #microschool", headline: "Meet the MudKitchen crew" },
      adCopyVariants: [
        {
          label: "Which one",
          primaryText: "Twelve crew members, one for every job at your school. Comment the one you'd hire first. 👇 #microschool #schoolfounder",
          headline: "Which crew member would you hire?",
        },
        {
          label: "Tag a teammate",
          primaryText: "Every school has a Pip (enrollment), a Nutmeg (tuition) and a Loam (the 9pm texts). Tag yours. 👋 #microschool #schoollife",
          headline: "Tag your school's Pip",
        },
      ],
    },
    {
      id: "caption-this",
      fileName: "post-10-caption-this.png",
      render: () => <CaptionThisPost />,
      adCopy: { label: "Caption this", primaryText: "Caption this. Best one gets pinned (and Flicker gets a new camera strap). #microschool #pictureday", headline: "Caption this" },
      adCopyVariants: [
        {
          label: "Best caption",
          primaryText: "We need a caption and we're out of ideas. 📸 Best one gets pinned. Go. #microschool #pictureday #schoollife",
          headline: "We need a caption. Go.",
        },
        {
          label: "Picture day",
          primaryText: "Picture day energy, in one photo. What's the caption? 📸 (Flicker is accepting submissions.) #microschool #pictureday",
          headline: "Picture day, in one photo",
        },
      ],
    },
    {
      id: "only-founders",
      fileName: "post-11-only-founders-understand.png",
      render: () => <OnlyFoundersPost />,
      adCopy: { label: "Only founders", primaryText: "Things only microschool founders understand. Add yours below. #microschool #founderlife", headline: "Things only founders understand" },
      adCopyVariants: [
        {
          label: "Relatable",
          primaryText: "If you laughed at more than two of these, you're definitely a microschool founder. 😅 Add the one we missed. #microschool #founderlife #schoolfounder",
          headline: "Laughed at two? You're a founder.",
        },
        {
          label: "Tag them",
          primaryText: "Tag the microschool founder who will feel personally seen by this. 👇 #microschool #founderlife",
          headline: "Tag a founder who'll feel seen",
        },
      ],
    },
    {
      id: "happy-holidays",
      fileName: "post-12-happy-holidays.png",
      render: () => <HolidayPost />,
      adCopy: { label: "Happy holidays", primaryText: "Happy holidays from the MudKitchen crew. Thank you for everything you do for your students. Rest up. ❄️", headline: "Happy holidays from the crew" },
      adCopyVariants: [
        {
          label: "Thank you",
          primaryText: "To every founder and teacher who made a school happen this year: thank you. Happy holidays from the MudKitchen crew. Go rest. 🧡",
          headline: "Thank you. Go rest.",
        },
        {
          label: "Short",
          primaryText: "Laptops closed. Crew off. Happy holidays. ❄️ See you in the new year.",
          headline: "Laptops closed. Happy holidays.",
        },
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- 1 poll

const POLL: Array<{ letter: string; label: string; aside: string }> = [
  { letter: "A", label: "1–3 tabs", aside: "living the dream" },
  { letter: "B", label: "4–6 tabs", aside: "it’s fine. it’s fine." },
  { letter: "C", label: "I stopped counting", aside: "dig is a C" },
];

function PollTabsPost() {
  return (
    <AdFrame background={G.sky}>
      <AdCopy
        title={
          <>
            How many tabs does your school <Accent>run in?</Accent>
          </>
        }
        hand="vote in the comments."
        size={84}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, width: 680, display: "flex", flexDirection: "column", gap: 20 }}>
          {POLL.map((option, i) => (
            <InkCard key={option.letter} rotate={i % 2 ? 1 : -1} style={{ display: "flex", alignItems: "center", gap: 24, padding: "22px 28px" }}>
              <span style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 999, background: [G.butter, G.peach, G.mint][i], border: `4px solid ${G.ink}`, display: "grid", placeItems: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: G.ink }}>
                {option.letter}
              </span>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 42, color: G.ink }}>{option.label}</span>
                <span style={{ fontFamily: FONT.hand, fontSize: 32, color: G.soft }}>{option.aside}</span>
              </span>
            </InkCard>
          ))}
        </div>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="dig" view="thinking" width={320} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 2 this or that

function ThisOrThatPost() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            This or that: <Accent>forms edition.</Accent>
          </>
        }
        hand="comment “this” or “that.”"
        size={88}
      />
      <Scene style={{ display: "flex", gap: 24, paddingTop: 20 }}>
        <Side label="This" sub="paper forms" bg={G.peach} name="bramble" view="oops">
          <div style={{ position: "absolute", left: 30, top: 90, transform: "rotate(-10deg)" }}>
            <PaperSheet label="Form" width={150} />
          </div>
          <div style={{ position: "absolute", right: 30, top: 110, transform: "rotate(8deg)" }}>
            <PaperSheet width={150} tint="#FFFDF4" />
          </div>
        </Side>
        <Side label="That" sub="online forms" bg={G.mint} name="bramble" view="love">
          <div style={{ position: "absolute", left: "50%", top: 110, transform: "translateX(-50%) rotate(-3deg)", padding: "14px 24px", background: "#FFFFFF", border: `4px solid ${G.ink}`, borderRadius: 18, fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.forest, whiteSpace: "nowrap" }}>
            Signed ✓
          </div>
        </Side>
      </Scene>
      <div style={{ height: 28, flexShrink: 0 }} />
      <AdFooter variant="site" />
    </AdFrame>
  );
}

function Side({ label, sub, bg, name, view, children }: { label: string; sub: string; bg: string; name: MascotName; view: MascotView; children?: ReactNode }) {
  return (
    <InkCard bg={bg} style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "24px 20px 16px", overflow: "hidden" }}>
      <span style={{ position: "absolute", top: 20, left: 24, fontFamily: FONT.display, fontWeight: 800, fontSize: 44, color: G.ink }}>{label}</span>
      <span style={{ position: "absolute", top: 32, right: 24, fontFamily: FONT.hand, fontSize: 32, color: G.soft }}>{sub}</span>
      {children}
      <Crew name={name} view={view} width={300} />
    </InkCard>
  );
}

// ---------------------------------------------------------------- 3 packet tip

const PACKET: Array<{ label: string; detail: string }> = [
  { label: "Health + emergency contacts", detail: "allergies, meds, who to call" },
  { label: "A signed tuition agreement", detail: "rate, schedule, late policy" },
  { label: "Pickup authorizations", detail: "who can take each child" },
];

function PacketTipPost() {
  return (
    <AdFrame background={G.mint}>
      <AdCopy
        title={
          <>
            3 things every enrollment packet <Accent>needs.</Accent>
          </>
        }
        hand="save this for spring."
        size={84}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, width: 700, display: "flex", flexDirection: "column", gap: 18 }}>
          {PACKET.map((item, i) => (
            <InkCard key={item.label} rotate={i % 2 ? 1 : -1} style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 28px" }}>
              <span style={{ width: 60, height: 60, flexShrink: 0, borderRadius: 999, background: G.butter, border: `4px solid ${G.ink}`, display: "grid", placeItems: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: G.ink }}>
                {i + 1}
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 36, lineHeight: 1.1, color: G.ink }}>{item.label}</span>
                <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 26, color: G.soft }}>{item.detail}</span>
              </span>
            </InkCard>
          ))}
        </div>
        <Pin right={-50} bottom={0} z={5}>
          <Crew name="pip" view="point" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 4 tuition template

function TuitionTemplatePost() {
  return (
    <AdFrame background="#F3EEF8">
      <AdCopy
        title={
          <>
            A tuition reminder that <Accent>isn&apos;t awkward.</Accent>
          </>
        }
        hand="copy, paste, done."
        size={84}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={720} rotate={-1.5} bg="#FFFFFF" style={{ padding: "30px 36px" }}>
            <p style={{ margin: "0 0 14px", fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.12em", color: G.clayDeep }}>TEMPLATE</p>
            <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 700, fontSize: 32, lineHeight: 1.4, color: G.ink }}>
              Hi <Mark>[Family]</Mark>! A quick note that <Mark>[Month]</Mark> tuition of <Mark>[$amount]</Mark> is due on <Mark>[date]</Mark>. You can pay here: <Mark>[link]</Mark>. Thank you for being part of <Mark>[School]</Mark>!
            </p>
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="nutmeg" view="hold" width={310} flip />
        </Pin>
        <Pin left={10} bottom={40} z={6}>
          <Hand size={36} color={G.forest} rotate={-3}>
            (or turn on autopay
            <br />
            and never send it again.)
          </Hand>
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

function Mark({ children }: { children: ReactNode }) {
  return <span style={{ background: G.butter, borderRadius: 8, padding: "0 6px" }}>{children}</span>;
}

// ---------------------------------------------------------------- 5 job description

const DUTIES = ["Teacher", "CFO", "School nurse", "Parent hotline"];

function JobDescriptionPost() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            Microschool founder: <Accent>job description.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={620} rotate={-2} bg="#FFFDF8" style={{ padding: "28px 36px" }}>
            <p style={{ margin: "0 0 12px", fontFamily: FONT.body, fontWeight: 800, fontSize: 24, letterSpacing: "0.12em", color: G.clayDeep }}>RESPONSIBILITIES</p>
            <CheckList size={32} rows={DUTIES.map((duty) => ({ label: duty, done: true }))} />
            <Hand size={34} color={G.clay} rotate={-2} style={{ marginTop: 16 }}>
              hours: yes. lunch break: lol.
            </Hand>
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="dig" view="silly" width={320} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 6 rate your week

const SCALE: Array<{ n: number; view: MascotView; label: string }> = [
  { n: 1, view: "tears", label: "send help" },
  { n: 2, view: "oops", label: "surviving" },
  { n: 3, view: "neutral", label: "fine" },
  { n: 4, view: "happy", label: "pretty good" },
  { n: 5, view: "celebrate", label: "thriving" },
];

function RateWeekPost() {
  return (
    <AdFrame background={G.butter}>
      <AdCopy
        title={
          <>
            Rate your week, <Accent>1 to 5 Fennels.</Accent>
          </>
        }
        hand="drop your number below."
        size={88}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          {SCALE.map((step) => (
            <div key={step.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 184 }}>
              <Crew name="fennel" view={step.view} width={180} />
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 56, color: G.ink }}>{step.n}</span>
              <span style={{ fontFamily: FONT.hand, fontSize: 30, color: G.soft, whiteSpace: "nowrap" }}>{step.label}</span>
            </div>
          ))}
        </div>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 7 Sage Field

function SageFieldPost() {
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
        sub={`${STORY_COPY.school.name} · ${STORY_COPY.school.location}`}
        size={86}
      />
      <Scene style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <InkCard bg={G.cream} rotate={-1.5} width={800} style={{ padding: "34px 40px" }}>
          <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 700, fontSize: 40, lineHeight: 1.22, color: G.ink }}>&ldquo;{STORY_COPY.quote}&rdquo;</p>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26 }}>
            <img src={STORY_COPY.author.image} alt="" style={{ width: 76, height: 76, borderRadius: 999, objectFit: "cover", border: `3px solid ${G.ink}` }} />
            <div>
              <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 800, fontSize: 28, color: G.ink }}>{STORY_COPY.author.name}</p>
              <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 600, fontSize: 24, color: G.soft }}>{STORY_COPY.author.title}</p>
            </div>
          </div>
        </InkCard>
        <Pin right={-40} bottom={-10} z={5}>
          <Crew name="pip" view="love" width={260} flip />
        </Pin>
      </Scene>
      <AdFooter tone="dark" variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 8 January checklist

function JanuaryChecklistPost() {
  return (
    <AdFrame background={G.sky} snow>
      <AdCopy
        title={
          <>
            Your January <Accent>checklist.</Accent>
          </>
        }
        hand="save this one."
        size={92}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={700} rotate={-1.5}>
            <CheckList
              size={34}
              rows={[
                { label: "Share the spring calendar" },
                { label: "Open spring applications" },
                { label: "Confirm spring tuition" },
                { label: "Remind families about forms" },
              ]}
            />
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="dot" view="point" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 9 meet the crew

const CREW: Array<{ name: MascotName; label: string; job: string }> = [
  { name: "terra", label: "Terra", job: "website" },
  { name: "pip", label: "Pip", job: "enrollment" },
  { name: "nutmeg", label: "Nutmeg", job: "tuition" },
  { name: "fennel", label: "Fennel", job: "attendance" },
  { name: "clover", label: "Clover", job: "staff hours" },
  { name: "marigold", label: "Marigold", job: "marketing" },
  { name: "dig", label: "Dig", job: "admin" },
  { name: "loam", label: "Loam", job: "messages" },
  { name: "dot", label: "Dot", job: "calendar" },
  { name: "flicker", label: "Flicker", job: "photos" },
  { name: "bramble", label: "Bramble", job: "forms" },
  { name: "tansy", label: "Tansy", job: "committees" },
];

function MeetCrewPost() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            Meet the <Accent>MudKitchen crew.</Accent>
          </>
        }
        sub="Twelve tiny coworkers. One for every job at your school."
        size={84}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", rowGap: 8, width: "100%" }}>
          {CREW.map((member) => (
            <div key={member.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Crew name={member.name} view="happy" width={160} />
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: G.ink }}>{member.label}</span>
              <span style={{ fontFamily: FONT.hand, fontSize: 26, color: G.clay }}>{member.job}</span>
            </div>
          ))}
        </div>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 10 caption this

function CaptionThisPost() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            Caption <Accent>this.</Accent>
          </>
        }
        hand="best caption gets pinned."
        size={110}
      />
      <Scene>
        <Pin left="50%" top={10} z={3} style={{ marginLeft: -300 }}>
          <div style={{ width: 600, padding: "20px 20px 0", background: "#FFFFFF", borderRadius: 8, boxShadow: "0 18px 30px rgba(43,36,29,.22)", transform: "rotate(-3deg)" }}>
            <div style={{ height: 420, borderRadius: 4, background: "#CFE2F3", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "-10%", top: "-20%", width: "70%", height: "90%", borderRadius: "50%", background: "#E9B8A2" }} />
              <div style={{ position: "absolute", right: "8%", bottom: "10%", width: "34%", height: "40%", borderRadius: 20, background: "rgba(43,36,29,.12)" }} />
              <div style={{ position: "absolute", left: "30%", bottom: "6%", width: "30%", height: "16%", borderRadius: 999, background: "rgba(255,255,255,.5)" }} />
            </div>
            <Hand size={34} color={G.ink} rotate={0} style={{ padding: "14px 0 18px", textAlign: "center" }}>
              picture day, take 1 of 347
            </Hand>
          </div>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="flicker" view="oops" width={280} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 11 only founders

const ONLY: string[] = [
  "“I’ll just do it myself” (9× a day)",
  "A “quick question” is never quick",
  "Knowing every kid’s allergy by heart",
  "Your car is also the supply closet",
];

function OnlyFoundersPost() {
  return (
    <AdFrame background="#E9F4E2">
      <AdCopy
        title={
          <>
            Things only microschool founders <Accent>understand:</Accent>
          </>
        }
        size={78}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, width: 720, display: "flex", flexDirection: "column", gap: 16 }}>
          {ONLY.map((line, i) => (
            <InkCard key={line} rotate={i % 2 ? 1 : -1} style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 26px" }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: G.clay }}>{i + 1}.</span>
              <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 32, lineHeight: 1.2, color: G.ink }}>{line}</span>
            </InkCard>
          ))}
        </div>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="loam" view="laughing" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 12 holidays

const HOLIDAY_CREW: Array<{ name: MascotName; view: MascotView }> = [
  { name: "pip", view: "wave" },
  { name: "nutmeg", view: "love" },
  { name: "dig", view: "celebrate" },
  { name: "loam", view: "happy" },
  { name: "dot", view: "wave" },
];

function HolidayPost() {
  return (
    <AdFrame background={G.forest} tone="dark" snow garland>
      <AdCopy
        tone="dark"
        title={
          <>
            Happy holidays
            <br />
            <Accent color={G.butter}>from the crew.</Accent>
          </>
        }
        sub="Thank you for this year. Rest up."
        size={96}
      />
      <Scene>
        <div style={{ position: "absolute", left: -30, right: -30, bottom: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {HOLIDAY_CREW.map((member) => (
            <Crew key={member.name} name={member.name} view={member.view} width={200} />
          ))}
        </div>
      </Scene>
      <AdFooter tone="dark" variant="site" />
    </AdFrame>
  );
}
