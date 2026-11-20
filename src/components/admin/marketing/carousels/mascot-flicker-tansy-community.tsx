"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  At,
  FONT,
  G,
  Hand,
  MascotHookSlide,
  MascotListSlide,
  MascotOutroSlide,
  MascotTurnSlide,
  ReactionListSlide,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Illustrated only: there are no Photos or Committees demo screens, so these slides draw paper
// props and describe the parent portal in general terms (no screenshots, no specific UI claims).

export const MASCOT_FLICKER_TANSY_COMMUNITY_CAROUSEL = {
  id: "mascot-flicker-tansy-community",
  title: "Picture day + the sign-up sheet (Photos & Committees)",
  description: "Mascot carousel: Flicker's photos and Tansy's volunteer sheet. Illustrated, no product screens.",
  fileSlug: "mudkitchen-flicker-tansy-community",
  slides: [
    {
      id: "hook",
      fileName: "01-picture-day-347-photos.png",
      render: () => (
        <MascotHookSlide
          kicker="Meet Flicker and Tansy"
          headline={
            <>
              Picture day: 347 photos. <Accent>2 usable.</Accent>
            </>
          }
          name="flicker"
          view="oops"
          background="#E3EDFB"
          aside="flicker calls it “candid.”"
        >
          <At x={60} y={470} rotate={-8} z={3}>
            <Polaroid caption="blurry (art)" tint="#CFE2F3" />
          </At>
          <At x={780} y={500} rotate={7} z={3}>
            <Polaroid caption="thumb" tint="#F8DDCF" />
          </At>
        </MascotHookSlide>
      ),
      adCopy: {
        primaryText:
          "Picture day and the volunteer sign-up sheet: two things every microschool does and nobody can find afterward. Meet Flicker and Tansy. Swipe →. #microschool",
        headline: "Picture day, sorted",
      },
    },
    {
      id: "ranked",
      fileName: "02-flickers-photos-ranked.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Flicker&rsquo;s picture-day photos, <Accent>ranked</Accent>
            </>
          }
          name="flicker"
          rows={[
            { label: "Blurry (artistic)", aside: "it’s a vibe", view: "silly" },
            { label: "Eyes closed, all 12 kids", aside: "statistically impressive", view: "tears" },
            { label: "Thumb over the lens", aside: "a cameo", view: "oops" },
            { label: "One perfect shot", aside: "framed forever", view: "love" },
            { label: "…of the ceiling", aside: "nice ceiling though", view: "confused" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-the-sign-up-sheet.png",
      render: () => (
        <MascotTurnSlide
          name="tansy"
          view="curious"
          background="#FFF3CF"
          bubble={
            <>
              and the volunteer sheet? <Accent>still on the fridge.</Accent>
            </>
          }
          aside="(tansy has questions.)"
        />
      ),
    },
    {
      id: "signups",
      fileName: "04-sign-ups-families-can-find.png",
      render: () => (
        <MascotListSlide
          kicker="Committees & sign-ups"
          title={
            <>
              Sign-ups families <Accent>can actually find.</Accent>
            </>
          }
          body="Committees and volunteer slots live in the parent portal, next to everything else."
          mascot={{ name: "tansy", view: "happy" }}
          tip="tansy filled the bake sale."
        >
          <SignupSheet />
        </MascotListSlide>
      ),
    },
    {
      id: "photos",
      fileName: "05-photos-for-the-right-families.png",
      render: () => (
        <MascotListSlide
          kicker="Photos"
          title={
            <>
              Class photos, <Accent>not a group-chat flood.</Accent>
            </>
          }
          body="Share photos with families in the parent portal instead of 40 texts."
          mascot={{ name: "flicker", view: "celebrate" }}
          lane="left"
          tip="flicker kept the good ones."
        >
          <div style={{ position: "relative", flex: 1 }}>
            <div style={{ position: "absolute", left: 0, top: 10 }}>
              <Polaroid caption="field trip" tint="#DDEBD5" rotate={-5} width={280} />
            </div>
            <div style={{ position: "absolute", left: 330, top: 40 }}>
              <Polaroid caption="art day" tint="#F8DDCF" rotate={4} width={280} />
            </div>
            <div style={{ position: "absolute", left: 160, top: 360 }}>
              <Polaroid caption="the good one" tint="#FFF3CF" rotate={-2} width={280} />
            </div>
          </div>
        </MascotListSlide>
      ),
    },
    {
      id: "outro",
      fileName: "06-sorted.png",
      render: () => <MascotOutroSlide name="tansy" view="celebrate" lead="Picture day and sign-ups," accent="sorted." aside="flicker is still practicing." />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- props

function Polaroid({ caption, tint, rotate = 0, width = 240 }: { caption: string; tint: string; rotate?: number; width?: number }) {
  return (
    <div style={{ width, padding: "14px 14px 0", background: "#FFFFFF", borderRadius: 6, boxShadow: "0 14px 26px rgba(43,36,29,.2)", transform: `rotate(${rotate}deg)` }}>
      <div style={{ height: width * 0.78, borderRadius: 3, background: tint, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "30%", top: "24%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(43,36,29,.1)" }} />
        <div style={{ position: "absolute", left: "12%", right: "12%", bottom: "14%", height: "18%", borderRadius: "40px 40px 6px 6px", background: "rgba(43,36,29,.08)" }} />
      </div>
      <Hand size={28} color={G.ink} rotate={0} style={{ padding: "10px 0 14px", textAlign: "center" }}>
        {caption}
      </Hand>
    </div>
  );
}

const SLOTS: Array<{ job: string; who?: string }> = [
  { job: "Bake sale table", who: "the Okafors" },
  { job: "Field trip driver", who: "Sam’s dad" },
  { job: "Garden day", who: "the Riveras" },
  { job: "Library helper" },
];

function SignupSheet() {
  return (
    <div style={{ background: "#FFFFFF", border: `4px solid ${G.ink}`, borderRadius: 26, boxShadow: `0 10px 0 ${G.ink}`, padding: "26px 30px", transform: "rotate(-1.5deg)" }}>
      <p style={{ margin: "0 0 14px", fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: G.ink }}>Spring fair volunteers</p>
      {SLOTS.map((slot) => (
        <div key={slot.job} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "2px dashed #E4D8C8" }}>
          <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.ink }}>{slot.job}</span>
          {slot.who ? (
            <span style={{ fontFamily: FONT.hand, fontSize: 32, color: G.forest }}>{slot.who} ✓</span>
          ) : (
            <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: G.clay, padding: "6px 14px", background: G.peach, borderRadius: 999 }}>open</span>
          )}
        </div>
      ))}
    </div>
  );
}
