"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  AdCopy,
  AdFooter,
  AdFrame,
  BERRY,
  CheckList,
  Crew,
  FONT,
  G,
  GiftBox,
  GiftTag,
  Hand,
  InkCard,
  Pin,
  Scene,
} from "@/components/admin/marketing/ads/ad-kit";
import { Leaf } from "@/components/admin/marketing/carousels/ads-preview-thanksgiving";
import { ChatBubble, CrewAvatar } from "@/components/admin/marketing/carousels/crew-chat-kit";
import { LetterLine, NotebookPaper, Stamp } from "@/components/admin/marketing/carousels/founder-notes-kit";

// Thanksgiving-break versions of the $200 Amazon gift card ads. Like `ads-holiday-gift`, the gift card is
// the whole message, so there is no offer switch: the chip and fine print always show.

const TAIL = "Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.";
const DESCRIPTION = "Get a $200 gift card.";
const AMBER = "#E3A64A";

const copy = (label: string, hook: string, headline: string) => ({ label, primaryText: `${hook} ${TAIL}`, headline, description: DESCRIPTION });

export const ADS_GIFT_THANKSGIVING_BREAK_CAROUSEL = {
  id: "ads-gift-thanksgiving-break",
  title: "Ads: Thanksgiving break gift card (6)",
  description: "Offer-led single ads for Thanksgiving break (Nov 22–29): pie, naps and a $200 Amazon gift card when you sign up. Feed + story.",
  fileSlug: "mudkitchen-ads-gift-thanksgiving-break",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "break-todo",
      fileName: "ad-g1-thanksgiving-break-todo.png",
      render: () => <BreakTodoAd />,
      adCopy: copy("Break to-do", "Thanksgiving break to-do: pie, nap, $200. 🥧", "Pie, nap, $200"),
      adCopyVariants: [
        copy("One task", "One 30-minute task this Thanksgiving break. 🥧", "One task. $200."),
        copy("Between naps", "Between the pie and the nap, book a demo. 😴", "Between naps: $200"),
      ],
    },
    {
      id: "thankful-for",
      fileName: "ad-g2-thankful-for-200.png",
      render: () => <ThankfulAd />,
      adCopy: copy("Thankful for", "This year I'm thankful for my teachers, our families and $200. 🧡", "Thankful for $200"),
      adCopyVariants: [
        copy("Gratitude list", "Gratitude list, updated: teachers ✓ families ✓ $200 ✓ 🍂", "Add $200 to the list"),
        copy("Short", "Thankful. Rested. $200 richer. 🧡", "Thankful for $200"),
      ],
    },
    {
      id: "out-for-break",
      fileName: "ad-g3-out-for-thanksgiving.png",
      render: () => <OutForBreakAd />,
      adCopy: copy("Your $200 isn't", "School's out for Thanksgiving. Your $200 isn't. 🥧", "Your $200 isn't on break"),
      adCopyVariants: [
        copy("Closed sign", "Closed for Thanksgiving. Open to $200. 🍂", "Closed for break. Open to $200."),
        copy("Pie first", "Pie first. Then a demo. Then $200. 🥧", "Pie, demo, $200"),
      ],
    },
    {
      id: "pip-chat",
      fileName: "ad-g4-pip-break-plans.png",
      render: () => <PipChatAd />,
      adCopy: copy("Break plans", "Pip asked about your break plans. 🥧 Pie, nap, a demo… and $200.", "Break plans? Pie, nap, $200."),
      adCopyVariants: [
        copy("Pip approves", "Pie ✓ Nap ✓ Demo ✓ Pip approves this break plan. 👀", "Pip approves this plan"),
        copy("Short", "Break plans: pie, nap, $200. 👀", "Pie, nap, $200"),
      ],
    },
    {
      id: "black-friday",
      fileName: "ad-g5-black-friday-no-line.png",
      render: () => <BlackFridayAd />,
      adCopy: copy("No 5am line", "Skip the 5am line this Black Friday. 🛍️", "No line. $200 gift card."),
      adCopyVariants: [
        copy("The one deal", "The only Black Friday deal you can get from the couch. 🛋️", "A Black Friday deal from the couch"),
        copy("Doorbuster", "Doorbuster, minus the door. 🛍️", "Doorbuster, minus the door"),
      ],
    },
    {
      id: "leftovers",
      fileName: "ad-g6-leftovers-200.png",
      render: () => <LeftoversAd />,
      adCopy: copy("Leftovers", "Leftovers for days. $200 for you. 🥧", "Leftovers for days. $200 for you."),
      adCopyVariants: [
        copy("Second slice", "Take the second slice. Then take the $200. 🥧", "Second slice. Then $200."),
        copy("Fridge", "Fridge: full of leftovers. Inbox: a $200 gift card. 🧊", "Leftovers in the fridge, $200 for you"),
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- art

/** A pumpkin pie with a lattice-free crust and a missing slice. */
function Pie({ width = 220 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.62} viewBox="0 0 220 136" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <ellipse cx="110" cy="96" rx="104" ry="36" fill="#D9CFC2" stroke={G.ink} strokeWidth="5" />
      <path d="M14 78 Q110 22 206 78 L198 96 Q110 128 22 96 Z" fill="#C9772F" stroke={G.ink} strokeWidth="5" strokeLinejoin="round" />
      <path d="M30 76 Q110 36 190 76" fill="none" stroke="#E9B86A" strokeWidth="14" strokeLinecap="round" />
      <path d="M110 62 L150 50 L158 86 Z" fill="#F7F1E7" stroke={G.ink} strokeWidth="4" strokeLinejoin="round" />
      {[46, 78, 142, 174].map((x) => (
        <circle key={x} cx={x} cy={66} r="5" fill="#FFF3CF" />
      ))}
    </svg>
  );
}

function FallingLeaves({ dark = false }: { dark?: boolean }) {
  const leaves: Array<{ left: number | string; top: number; r: number; color: string; size: number }> = [
    { left: 40, top: 10, r: 20, color: G.clay, size: 46 },
    { left: "46%", top: 70, r: -35, color: AMBER, size: 38 },
    { left: "80%", top: 0, r: 60, color: dark ? G.butter : "#B5562F", size: 42 },
  ];
  return (
    <>
      {leaves.map((leaf, i) => (
        <Pin key={i} left={leaf.left} top={leaf.top} z={2}>
          <Leaf color={leaf.color} size={leaf.size} rotate={leaf.r} />
        </Pin>
      ))}
    </>
  );
}

// ---------------------------------------------------------------- G1 break to-do

function BreakTodoAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            Thanksgiving break to-do:
            <br />
            <Accent>pie, nap, $200.</Accent>
          </>
        }
        size={86}
      />
      <Scene>
        <Pin left={0} top={40} z={4}>
          <InkCard width={660} rotate={-2}>
            <p style={{ margin: "0 0 22px", fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: G.clayDeep }}>Break to-do</p>
            <CheckList
              rows={[
                { label: "Pie (two slices)", done: true },
                { label: "Nap", done: true },
                { label: "30-min MudKitchen demo", note: "+ $200 gift card*", highlight: true },
              ]}
            />
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="bramble" view="point" width={340} flip />
        </Pin>
        <Pin left={40} bottom={20} z={3}>
          <Leaf color={AMBER} size={48} rotate={-20} />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G2 thankful for

function ThankfulAd() {
  return (
    <AdFrame background="#FFF1E2">
      <AdCopy
        title={
          <>
            This year I&apos;m thankful
            <br />
            <Accent>for $200.</Accent>
          </>
        }
        size={90}
      />
      <Scene>
        <Pin left={0} top={40} z={4}>
          <NotebookPaper width={640} rotate={-2} lineGap={70} padding="44px 40px 34px 112px">
            <LetterLine size={50} color={G.clayDeep}>
              Thankful for:
            </LetterLine>
            <LetterLine size={46}>my teachers ✓</LetterLine>
            <LetterLine size={46}>our families ✓</LetterLine>
            <LetterLine size={46} color={G.clay}>
              a $200 gift card* ✓
            </LetterLine>
          </NotebookPaper>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="nutmeg" view="love" width={330} flip />
        </Pin>
        <Pin right={300} top={10} z={3}>
          <Leaf color={G.clay} size={54} rotate={30} />
        </Pin>
        <Pin right={40} top={110} z={3}>
          <Leaf color={AMBER} size={42} rotate={-40} />
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G3 out for break

function OutForBreakAd() {
  return (
    <AdFrame background={G.forestDeep} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            School&apos;s out for Thanksgiving.
            <br />
            <Accent color={G.butter}>Your $200 isn&apos;t.</Accent>
          </>
        }
        size={88}
      />
      <Scene>
        <FallingLeaves dark />
        <Pin left={-10} bottom={0} z={5}>
          <Crew name="pip" view="sit" width={360} />
        </Pin>
        <Pin left={300} bottom={24} z={6}>
          <Pie width={230} />
        </Pin>
        <Pin right={0} top={150} z={4}>
          <GiftTag width={420} rotate={6} to="for your break" />
        </Pin>
      </Scene>
      <AdFooter tone="dark" chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G4 Pip chat

function PipChatAd() {
  return (
    <AdFrame background={G.butter}>
      <AdCopy
        title={
          <>
            Break plans?
            <br />
            <Accent>Pie, nap, $200.</Accent>
          </>
        }
        size={92}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, right: 0, top: 50, display: "flex", flexDirection: "column", gap: 34, zIndex: 4 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <CrewAvatar name="pip" view="curious" size={116} />
            <ChatBubble from="crew" size={42} style={{ marginTop: 14 }}>
              break plans?
            </ChatBubble>
          </div>
          <ChatBubble from="you" size={42}>
            pie. nap. a demo.
          </ChatBubble>
          <ChatBubble from="crew" size={42} style={{ marginLeft: 136 }}>
            and $200!*
          </ChatBubble>
        </div>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="pip" view="excited" width={300} flip />
        </Pin>
        <Pin left={30} bottom={30} z={3}>
          <Leaf color={G.clay} size={50} rotate={15} />
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G5 Black Friday

function BlackFridayAd() {
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            Skip the 5am line.
            <br />
            <Accent>$200 from the couch.*</Accent>
          </>
        }
        size={86}
      />
      <Scene>
        <Pin left={40} bottom={10} z={4}>
          <GiftBox width={300} color={BERRY} ribbon={AMBER} label="$200" rotate={-4} />
        </Pin>
        <Pin left={340} top={40} z={6}>
          <Stamp color={BERRY} rotate={-8} size={40}>
            no line
          </Stamp>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="dig" view="sit" width={340} flip />
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G6 leftovers

function LeftoversAd() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            Leftovers for days.
            <br />
            <Accent>$200 for you.</Accent>
          </>
        }
        size={94}
      />
      <Scene>
        <Pin left={0} top={60} z={3}>
          <InkCard bg="#FFFFFF" rotate={-4} style={{ padding: "22px 30px" }}>
            <Pie width={250} />
            <Hand size={34} color={G.clayDeep} rotate={0} style={{ marginTop: 10, textAlign: "center" }}>
              pie (day 3)
            </Hand>
          </InkCard>
        </Pin>
        <Pin left={30} bottom={10} z={4}>
          <GiftTag width={420} rotate={-6} to="for after the pie" />
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="loam" view="happy" width={320} flip />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}
