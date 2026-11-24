"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { CSSProperties } from "react";
import SlideCanvas, { CornerLogoPill, useSlideSize } from "@/components/admin/marketing/slide-frame";
import { FONT, G, Hand, NotificationCard, SAMPLE_NOTIFS, Tape, type Notif } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";

// App Store 6.3" (1206×2622) and Google Play (1080×1920) screenshots in the MudKitchen Garden look.
// Headlines are the slides' alt text in src/lib/marketing/download-app-slides.ts (keep them in sync),
// plus TEACHER_COPY.bullets[0] for slide 8. Notes are the real sample notifications (SAMPLE_NOTIFS).
// Exports replace public/images/mobileapp/{1..10}.png (App Store) and public/images/mobileapp/play/ (Play).

/**
 * Real screenshots of the MudKitchen app (iOS Simulator, native 1206×2622, 9:41 status bar), signed in to
 * the fictional "Your School" on the local stack (scripts/seed-your-school-marketing-local.ts).
 */
export const STORE_SCREENS = {
  parentHome: "/images/marketing/app-store-screens/parent-home.png",
  parentMessages: "/images/marketing/app-store-screens/parent-messages.png",
  parentBilling: "/images/marketing/app-store-screens/parent-billing.png",
  parentEnrollment: "/images/marketing/app-store-screens/parent-enrollment.png",
  teacherHome: "/images/marketing/app-store-screens/teacher-home.png",
  teacherRollCall: "/images/marketing/app-store-screens/teacher-roll-call.png",
  teacherStudents: "/images/marketing/app-store-screens/teacher-students.png",
  adminDashboard: "/images/marketing/app-store-screens/admin-dashboard.png",
  adminAdmissions: "/images/marketing/app-store-screens/admin-admissions.png",
} as const;

type StoreScreen = keyof typeof STORE_SCREENS;

/** Simulator capture aspect (iPhone 17 Pro: 1206×2622). */
const SCREEN_ASPECT = 1206 / 2622;

type Role = "family" | "teacher" | "admin";

type PillCopy = { emoji: string; label: string };

const ROLE: Record<Role, { pill: PillCopy; panel: string; accent: string; squiggle: string }> = {
  family: { pill: { emoji: "🏡", label: "For families" }, panel: G.sky, accent: G.clay, squiggle: G.butter },
  teacher: { pill: { emoji: "🍎", label: "For teachers" }, panel: G.mint, accent: G.forest, squiggle: G.butter },
  admin: { pill: { emoji: "🧺", label: "For school admins" }, panel: G.peach, accent: G.clayDeep, squiggle: G.mint },
};

/** Per-size layout. Everything else scales from the slide width. */
function useStoreLayout() {
  const { size, width, height } = useSlideSize();
  const play = size === "playStore";
  const k = width / 1242;
  // App Store values were drawn on a 1242-wide canvas; scale them to the export width (1206).
  const app = (value: number) => Math.round(value * k);
  return {
    play,
    width,
    height,
    k,
    top: play ? 64 : app(128),
    gapLogo: play ? 30 : app(48),
    gapPill: play ? 26 : app(40),
    headline: play ? 80 : app(104),
    phoneTop: play ? 630 : app(840),
    phoneW: play ? 700 : app(900),
    panelTop: play ? 860 : app(1160),
  };
}

// ---------------------------------------------------------------- pieces

function Squiggle({ color, width }: { color: string; width: number }) {
  return (
    <svg width={width} height={width * 0.12} viewBox="0 0 200 24" fill="none" aria-hidden style={{ display: "block" }}>
      <path d="M4 14 C 24 2, 40 26, 60 13 S 96 2, 116 13 S 152 26, 172 12 S 192 6, 196 10" stroke={color} strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function RolePill({ pill, scale, dark = false }: { pill: PillCopy; scale: number; dark?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12 * scale,
        padding: `${12 * scale}px ${30 * scale}px`,
        borderRadius: 999,
        background: dark ? "rgba(255,250,244,0.12)" : G.paper,
        border: `${3 * scale}px solid ${dark ? "rgba(255,250,244,0.5)" : G.ink}`,
        boxShadow: dark ? "none" : `0 ${5 * scale}px 0 0 ${G.ink}`,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: 32 * scale,
        lineHeight: 1.1,
        color: dark ? G.cream : G.ink,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ fontSize: 34 * scale, lineHeight: 1 }}>
        {pill.emoji}
      </span>
      <span>{pill.label}</span>
    </span>
  );
}

/** A real app capture in an ink phone bezel (the capture includes the 9:41 status bar). */
function StorePhone({ screen, width, rotate = 0, style }: { screen: StoreScreen; width: number; rotate?: number; style?: CSSProperties }) {
  const bezel = Math.round(width * 0.026);
  const screenW = width - bezel * 2;
  const screenH = Math.round(screenW / SCREEN_ASPECT);
  const outerR = Math.round(width * 0.15);
  const innerR = outerR - bezel;
  return (
    <div
      style={{
        position: "absolute",
        width,
        height: screenH + bezel * 2,
        boxSizing: "border-box",
        padding: bezel,
        background: G.ink,
        borderRadius: outerR,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        boxShadow: `0 ${Math.round(width * 0.03)}px 0 0 rgba(43,36,29,0.22), 0 ${Math.round(width * 0.05)}px ${Math.round(width * 0.09)}px rgba(43,36,29,0.28)`,
        ...style,
      }}
    >
      <div data-demo-window style={{ position: "relative", width: screenW, height: screenH, borderRadius: innerR, overflow: "hidden", background: G.cream }}>
        <img
          data-store-screen={screen}
          src={STORE_SCREENS[screen]}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: Math.round(screenW * 0.032),
            left: "50%",
            width: Math.round(screenW * 0.3),
            height: Math.round(screenW * 0.088),
            marginLeft: -Math.round(screenW * 0.15),
            borderRadius: 999,
            background: "#000000",
          }}
        />
      </div>
    </div>
  );
}

function StoreHeader({
  pill,
  lead,
  accent,
  accentColor,
  squiggle,
  dark = false,
}: {
  pill: PillCopy;
  lead: string;
  accent: string;
  accentColor: string;
  squiggle: string;
  dark?: boolean;
}) {
  const L = useStoreLayout();
  return (
    <div
      style={{
        position: "absolute",
        top: L.top,
        left: 0,
        right: 0,
        zIndex: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: `0 ${Math.round(56 * L.k)}px`,
      }}
    >
      <div style={{ transform: `scale(${L.k * 1.25})`, transformOrigin: "top center", height: 76 * L.k * 1.25 }}>
        <CornerLogoPill />
      </div>
      <div style={{ marginTop: L.gapLogo }}>
        <RolePill pill={pill} scale={L.k} dark={dark} />
      </div>
      <h1
        style={{
          margin: `${L.gapPill}px 0 0`,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: L.headline,
          lineHeight: 1,
          letterSpacing: "-0.035em",
          color: dark ? G.cream : G.ink,
          textWrap: "balance",
          maxWidth: L.width - 112 * L.k,
        }}
      >
        {lead} <span style={{ color: accentColor }}>{accent}</span>
      </h1>
      <div style={{ marginTop: 18 * L.k }}>
        <Squiggle color={squiggle} width={260 * L.k} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- slides

type FeatureSlideProps = {
  role: Role;
  lead: string;
  accent: string;
  screen: StoreScreen;
  note?: Notif;
  /** Phone tilt; alternate the sign between neighbouring slides. */
  tilt: number;
  /** Which side the notification note sits on. */
  noteSide?: "left" | "right";
  /** Note position as a fraction of the visible phone (0 = top, 1 = slide bottom): pick a spot where it hides nothing important. */
  noteAt?: number;
  /** Play 9:16 override for `noteAt` (less of the phone is visible there). */
  notePlayAt?: number;
};

function FeatureSlide({ role, lead, accent, screen, note, tilt, noteSide = "left", noteAt = 0.5, notePlayAt }: FeatureSlideProps) {
  const L = useStoreLayout();
  const at = L.play && notePlayAt !== undefined ? notePlayAt : noteAt;
  const r = ROLE[role];
  const inset = Math.round(56 * L.k);
  const noteScale = L.k * 1.12;
  const visiblePhone = Math.min(L.phoneW / SCREEN_ASPECT, L.height - L.phoneTop);
  const noteTop = Math.min(L.phoneTop + Math.round(visiblePhone * at), L.height - Math.round(190 * L.k));
  return (
    <SlideCanvas background={G.cream} logo="none" pattern="dots">
      <StoreHeader pill={r.pill} lead={lead} accent={accent} accentColor={r.accent} squiggle={r.squiggle} />
      {/* The garden bed the phone stands in. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: inset,
          right: inset,
          top: L.panelTop,
          bottom: -Math.round(80 * L.k),
          zIndex: 1,
          background: r.panel,
          border: `${Math.round(4 * L.k)}px solid ${G.ink}`,
          borderRadius: Math.round(96 * L.k),
        }}
      />
      <StorePhone screen={screen} width={L.phoneW} rotate={tilt} style={{ left: (L.width - L.phoneW) / 2, top: L.phoneTop, zIndex: 2 }} />
      <Tape
        color="rgba(255, 229, 138, 0.9)"
        width={Math.round(200 * L.k)}
        rotate={tilt > 0 ? -8 : 8}
        style={{
          top: L.phoneTop - Math.round(16 * L.k),
          left: tilt > 0 ? (L.width + L.phoneW) / 2 - Math.round(150 * L.k) : (L.width - L.phoneW) / 2 - Math.round(50 * L.k),
          height: Math.round(44 * L.k),
          zIndex: 3,
        }}
      />
      {note ? (
        <div
          style={{
            position: "absolute",
            zIndex: 5,
            top: noteTop,
            ...(noteSide === "left" ? { left: Math.round(12 * L.k) } : { right: Math.round(12 * L.k) }),
            transform: `scale(${noteScale})`,
            transformOrigin: noteSide === "left" ? "top left" : "top right",
          }}
        >
          <NotificationCard title={note.title} sub={note.sub} color={note.color} rotate={noteSide === "left" ? -3 : 3} />
        </div>
      ) : null}
    </SlideCanvas>
  );
}

/** Slide 1: the one forest panel, with all three portals. */
function HeroSlide() {
  const L = useStoreLayout();
  const front = Math.round(L.phoneW * 0.86);
  const side = Math.round(L.phoneW * 0.7);
  const sideTop = L.phoneTop + Math.round(200 * L.k);
  return (
    <SlideCanvas background={G.forest} logo="none" pattern="none">
      <StoreHeader
        pill={{ emoji: "🌱", label: "Families · Teachers · Admins" }}
        lead="Everything your microschool needs"
        accent="together in one app."
        accentColor={G.butter}
        squiggle={G.mint}
        dark
      />
      <StorePhone screen="teacherHome" width={side} rotate={-8} style={{ left: -Math.round(side * 0.3), top: sideTop, zIndex: 1 }} />
      <StorePhone screen="adminDashboard" width={side} rotate={8} style={{ right: -Math.round(side * 0.3), top: sideTop, zIndex: 1 }} />
      <StorePhone screen="parentHome" width={front} rotate={-1.5} style={{ left: (L.width - front) / 2, top: L.phoneTop + Math.round(30 * L.k), zIndex: 2 }} />
      <Tape
        color="rgba(221, 235, 213, 0.92)"
        width={Math.round(210 * L.k)}
        rotate={-6}
        style={{ top: L.phoneTop + Math.round(10 * L.k), left: (L.width - front) / 2 - Math.round(40 * L.k), height: Math.round(46 * L.k), zIndex: 3 }}
      />
      <Hand
        size={Math.round(48 * L.k)}
        color={G.butter}
        rotate={-6}
        style={{ position: "absolute", zIndex: 4, right: Math.round(70 * L.k), top: L.phoneTop - Math.round(70 * L.k) }}
      >
        <span aria-hidden>pull up a chair!</span>
      </Hand>
    </SlideCanvas>
  );
}

// ---------------------------------------------------------------- set

const N = SAMPLE_NOTIFS;

const feature = (id: string, n: number, props: FeatureSlideProps): MarketingSlide => ({
  id,
  fileName: `${String(n).padStart(2, "0")}.png`,
  render: () => <FeatureSlide {...props} />,
});

export const APP_STORE_SCREENS_CAROUSEL: MarketingCarousel = {
  id: "app-store-screens",
  title: "App Store + Google Play screenshots",
  description:
    "The 10 store screenshots in Garden, from real app captures (public/images/marketing/app-store-screens). App Store 6.5\" → public/images/mobileapp/{1..10}.png (+ .webp for the site); Play 9:16 → public/images/mobileapp/play/.",
  fileSlug: "app-store-screens",
  kind: "store",
  sizes: ["appStore", "playStore"],
  slides: [
    { id: "store-hero", fileName: "01.png", render: () => <HeroSlide /> },
    feature("store-family-home", 2, {
      role: "family",
      lead: "Give families one place",
      accent: "to stay in the loop.",
      screen: "parentHome",
      note: N.checklistDone,
      tilt: 1.5,
      noteSide: "left",
      noteAt: 0.7,
      notePlayAt: 0.9,
    }),
    feature("store-family-messages", 3, {
      role: "family",
      lead: "Real conversations with teachers,",
      accent: "not lost in email.",
      screen: "parentMessages",
      note: N.newMessage,
      tilt: -1.5,
      noteSide: "right",
      noteAt: 0.66,
      notePlayAt: 0.88,
    }),
    feature("store-family-billing", 4, {
      role: "family",
      lead: "Tuition and billing",
      accent: "where families already are.",
      screen: "parentBilling",
      note: N.tuitionPaid,
      tilt: 1.5,
      noteSide: "right",
      noteAt: 0.27,
    }),
    feature("store-family-enrollment", 5, {
      role: "family",
      lead: "From application to enrolled,",
      accent: "progress families can see.",
      screen: "parentEnrollment",
      note: N.packetSigned,
      tilt: -1.5,
      noteSide: "right",
      noteAt: 0.86,
    }),
    feature("store-teacher-home", 6, {
      role: "teacher",
      lead: "Support teachers with",
      accent: "a calmer school day.",
      screen: "teacherHome",
      note: N.parentReplied,
      tilt: 1.5,
      noteSide: "right",
      noteAt: 0.86,
    }),
    feature("store-teacher-attendance", 7, {
      role: "teacher",
      lead: "Attendance and rosters,",
      accent: "quick on the classroom floor.",
      screen: "teacherRollCall",
      note: N.pickupConfirmed,
      tilt: -1.5,
      noteSide: "right",
      noteAt: 0.82,
    }),
    feature("store-teacher-students", 8, {
      role: "teacher",
      lead: "Keep schedules, notes, and student details",
      accent: "in one place.",
      screen: "teacherStudents",
      tilt: 1.5,
    }),
    feature("store-admin-dashboard", 9, {
      role: "admin",
      lead: "Enrollment is on track",
      accent: "with admissions at a glance.",
      screen: "adminDashboard",
      note: N.tourBooked,
      tilt: -1.5,
      noteSide: "right",
      noteAt: 0.82,
    }),
    feature("store-admin-admissions", 10, {
      role: "admin",
      lead: "Admissions and enrollment",
      accent: "that move as fast as you do.",
      screen: "adminAdmissions",
      note: N.newInquiry,
      tilt: 1.5,
      noteSide: "right",
      noteAt: 0.88,
    }),
  ],
};
