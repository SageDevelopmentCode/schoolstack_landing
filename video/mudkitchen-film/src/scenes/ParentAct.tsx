import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { IconType } from "react-icons";
import {
  IoAlertCircleOutline,
  IoArrowForward,
  IoCalendarOutline,
  IoCameraOutline,
  IoCardOutline,
  IoCheckmark,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
  IoClipboardOutline,
  IoCreateOutline,
  IoDocumentAttachOutline,
  IoDocumentTextOutline,
  IoHeartOutline,
  IoHelpCircleOutline,
  IoMedkitOutline,
  IoMegaphoneOutline,
  IoNotificationsOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { ACTS, HIT } from "../timeline";
import { C, CLAMP, EXPO_IN, EXPO_IN_OUT, EXPO_OUT, FONT, SOFT_IN_OUT, uiSpring } from "../theme";
import { Backdrop } from "../components/Backdrop";
import { Phone } from "../components/Phone";
import { Kicker, Super } from "../components/Super";
import { useLayout, type Layout } from "../components/layout";
import { MobileChip, MobilePillNav, MobileTabBar, type ParentTab } from "../demo/mobile";
import { StoryButton, StoryCard, StoryHeading, StoryKicker, StudentPhoto } from "../demo/story";
import { SITE, STORY } from "../demo/tokens";
import { BILLING, CHECKLIST, CHILDREN, PARENT, PARENT_AGENDA, PARENT_EVENTS, PARENT_FORMS, PARENT_THREADS } from "../demo/data";

const P0 = ACTS.IV.from;
const B = {
  home: { from: 0, to: 75 },
  apply: { from: 75, to: 165 },
  bill: { from: 165, to: 255 },
  carousel: { from: 255, to: 324 },
  gag: { from: HIT.gmailPeek - P0, to: 360 },
};
const THUD = HIT.gmailThud - P0;
const PRESS = 1236 - P0 - B.bill.from;
const TOP_INSET = 54;
const body = FONT.storyBody;

const ICONS: Record<string, IconType> = {
  "document-text-outline": IoDocumentTextOutline,
  "people-outline": IoPeopleOutline,
  "heart-outline": IoHeartOutline,
  "medkit-outline": IoMedkitOutline,
  "shield-checkmark-outline": IoShieldCheckmarkOutline,
  "clipboard-outline": IoClipboardOutline,
  "camera-outline": IoCameraOutline,
  "warning-outline": IoWarningOutline,
  "person-add-outline": IoPersonAddOutline,
  "card-outline": IoCardOutline,
};

const Screen: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: STORY.paper, overflow: "hidden", ...style }}>{children}</div>
);

const Tap: React.FC<{ lf: number; at: number; size?: number }> = ({ lf, at, size = 90 }) => {
  if (lf < at || lf > at + 14) return null;
  const p = interpolate(lf, [at, at + 14], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: 999,
        backgroundColor: STORY.primary,
        opacity: 0.22 * (1 - p),
        transform: `scale(${0.2 + p})`,
        pointerEvents: "none",
      }}
    />
  );
};

const AttentionRow: React.FC<{ icon: IconType; color: string; bg: string; title: string; subtitle: string; first?: boolean }> = ({
  icon: Icon,
  color,
  bg,
  title,
  subtitle,
  first,
}) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", borderTop: first ? "none" : `1px solid ${STORY.divider}`, padding: first ? "0 0 12px" : "12px 0" }}>
    <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: STORY.ink, lineHeight: "19px" }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 12, color: "#76828A", lineHeight: "17px", marginTop: 1 }}>{subtitle}</div>
    </div>
  </div>
);

// ─── Home (ParentHomeScreen) ────────────────────────────────────────────────

const HeaderIcon: React.FC<{ icon: IconType; badge?: number }> = ({ icon: Icon, badge }) => (
  <div
    style={{
      position: "relative",
      width: 40,
      height: 40,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.18)",
      border: "0.5px solid rgba(255,255,255,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Icon size={20} color="#fff" />
    {badge ? (
      <div
        style={{
          position: "absolute",
          top: -4,
          right: -4,
          minWidth: 18,
          height: 18,
          borderRadius: 99,
          backgroundColor: "#fff",
          color: STORY.primaryDark,
          fontFamily: body,
          fontSize: 10,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {badge}
      </div>
    ) : null}
  </div>
);

const HOME_TAP = 64;
const homeScroll = (lf: number) => interpolate(lf, [24, 54], [0, 480], { ...CLAMP, easing: SOFT_IN_OUT });

const HomeScreen: React.FC<{ lf: number; fps: number }> = ({ lf, fps }) => {
  const scroll = homeScroll(lf);
  const rise = (i: number) => {
    const p = uiSpring(lf, fps, 4 + i * 4);
    return { opacity: p, transform: `translateY(${(1 - p) * 18}px)` };
  };
  return (
    <Screen>
      <div style={{ transform: `translateY(${-scroll}px)` }}>
        <div
          style={{
            background: `linear-gradient(180deg, ${STORY.primaryDark}, ${STORY.primary})`,
            padding: `${TOP_INSET + 24}px 24px 24px`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              alignSelf: "flex-start",
              borderRadius: 99,
              border: "0.5px solid rgba(255,255,255,0.35)",
              backgroundColor: "rgba(255,255,255,0.18)",
              padding: "6px 8px",
              fontFamily: body,
              fontSize: 12,
              lineHeight: "16px",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {PARENT.date}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, fontFamily: FONT.story, fontWeight: 600, color: "#fff" }}>
              <div style={{ fontSize: 18, lineHeight: "24px" }}>Good morning,</div>
              <div style={{ fontSize: 26, lineHeight: "32px", letterSpacing: "-0.02em" }}>{PARENT.first}. ☀️</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <HeaderIcon icon={IoHelpCircleOutline} />
              <HeaderIcon icon={IoMegaphoneOutline} badge={2} />
              <HeaderIcon icon={IoNotificationsOutline} badge={3} />
            </div>
          </div>
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 24 }}>
          <StoryCard variant="today" padding={16} style={rise(0)}>
            <StoryKicker style={{ marginBottom: 6 }}>Start here</StoryKicker>
            <StoryHeading size={16} style={{ lineHeight: "22px", marginBottom: 8 }}>
              3 things need your attention
            </StoryHeading>
            <AttentionRow first icon={IoCreateOutline} color={STORY.clay} bg={STORY.attentionBg} title="Sign Emma's community agreement" subtitle="Enrollment checklist · 4 steps left" />
            <AttentionRow icon={IoCardOutline} color={STORY.primary} bg="#E2EDD9" title={`May tuition ${BILLING.dueLabel.toLowerCase()}`} subtitle={`${BILLING.due} · Family billing`} />
            <AttentionRow icon={IoCalendarOutline} color="#2F6480" bg="#DCEBF2" title="RSVP for the art showcase" subtitle="Thursday · 5:30 PM" />
          </StoryCard>

          <StoryCard variant="primary" padding={16} style={rise(1)}>
            <StoryKicker light style={{ marginBottom: 6 }}>
              Upcoming events
            </StoryKicker>
            <div style={{ borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", padding: 10 }}>
              <div style={{ fontFamily: body, fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: "18px" }}>{PARENT_EVENTS[0].title}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: "#D4E0D7", lineHeight: "18px", marginTop: 2 }}>{PARENT_EVENTS[0].meta}</div>
            </div>
            <div style={{ marginTop: 8, fontFamily: body, fontSize: 13, fontWeight: 700, color: "#D6EFD8" }}>View family calendar →</div>
          </StoryCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, ...rise(2) }}>
            <StoryKicker style={{ marginBottom: -6 }}>Your children</StoryKicker>
            {CHILDREN.map((c, i) => (
              <StoryCard key={c.first} padding={16}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
                  <StudentPhoto name={c.first} photo={c.photo} size={56} radius={18} bg={STORY.childBg[i]} />
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <StoryHeading size={16} style={{ lineHeight: "22px" }}>
                        {c.first}
                      </StoryHeading>
                      <MobileChip label={`● ${c.status}`} tone={c.tone} />
                    </div>
                    <div style={{ fontFamily: body, fontSize: 12, lineHeight: "18px", color: "#7B878D" }}>{c.line}</div>
                  </div>
                </div>
                <StoryButton
                  label={
                    <>
                      See {c.first}&apos;s details <IoArrowForward size={16} color="#fff" />
                    </>
                  }
                  height={44}
                  fontSize={14}
                />
                <div style={{ position: "relative", marginTop: 8, padding: "6px 0", fontFamily: body, fontSize: 13, fontWeight: 700, color: STORY.primary }}>
                  Enrollment checklist
                  {i === 0 ? <Tap lf={lf} at={HOME_TAP} size={120} /> : null}
                </div>
              </StoryCard>
            ))}
          </div>
        </div>
      </div>
      <MobileTabBar active="home" unread={2} />
    </Screen>
  );
};

// ─── Enrollment checklist (pushed from Emma's card) ─────────────────────────

const TICK: Record<string, number> = { "Health Info": 16, "Photo Release": 26, Immunizations: 44, "Community Agreement": 84 };
const UPLOAD = { from: 32, land: 42 };
const SHEET = { up: 48, sign: [56, 74] as const, press: 77, down: 82 };

const EnrollmentScreen: React.FC<{ lf: number; fps: number }> = ({ lf, fps }) => {
  const scroll = interpolate(lf, [10, 30], [0, 96], { ...CLAMP, easing: SOFT_IN_OUT });
  const doneCount = CHECKLIST.filter((r) => ("done" in r && r.done) || (TICK[r.title] !== undefined && lf >= TICK[r.title])).length;
  const pct = doneCount / CHECKLIST.length;
  const sheetIn = uiSpring(lf, fps, SHEET.up);
  const sheetOut = interpolate(lf, [SHEET.down, SHEET.down + 8], [0, 1], { ...CLAMP, easing: EXPO_IN });
  const sheet = lf >= SHEET.up ? sheetIn * (1 - sheetOut) : 0;
  const sign = interpolate(lf, SHEET.sign, [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const signed = lf >= SHEET.press;
  const press = interpolate(lf, [SHEET.press - 2, SHEET.press, SHEET.press + 5], [1, 0.95, 1], CLAMP);
  return (
    <Screen>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: TOP_INSET + 44,
          paddingTop: TOP_INSET,
          backgroundColor: STORY.paper,
          borderBottom: `1px solid rgba(40,57,67,${Math.min(1, scroll / 40) * 0.08})`,
          display: "flex",
          alignItems: "center",
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 10px", fontFamily: body, fontSize: 16, fontWeight: 600, color: STORY.primary }}>
          <IoChevronBack size={22} color={STORY.primary} />
          Home
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 12,
            textAlign: "center",
            fontFamily: body,
            fontSize: 16,
            fontWeight: 700,
            color: STORY.ink,
            opacity: interpolate(scroll, [50, 80], [0, 1], CLAMP),
          }}
        >
          Enrollment
        </div>
      </div>
      <div style={{ paddingTop: TOP_INSET + 44, transform: `translateY(${-scroll}px)` }}>
        <div style={{ padding: "4px 16px 0", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <StoryHeading size={24} style={{ lineHeight: "30px" }}>
              Emma&apos;s enrollment
            </StoryHeading>
            <div style={{ fontFamily: body, fontSize: 13, lineHeight: "18px", color: STORY.muted, marginTop: 6 }}>2026–27 school year · Lower Elementary</div>
          </div>
          <StoryCard variant="today" padding={16}>
            <StoryKicker style={{ marginBottom: 6 }}>Enrollment checklist</StoryKicker>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <StoryHeading size={16} style={{ lineHeight: "22px" }}>
                {doneCount} of {CHECKLIST.length} complete
              </StoryHeading>
              <div style={{ fontFamily: body, fontSize: 12, fontWeight: 700, color: STORY.primary }}>{Math.round(pct * 100)}%</div>
            </div>
            <div style={{ marginTop: 10, height: 8, borderRadius: 4, backgroundColor: "#E4E8E1", overflow: "hidden" }}>
              <div style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 4, backgroundColor: STORY.primary }} />
            </div>
          </StoryCard>
          <StoryCard padding={0} style={{ padding: "0 16px" }}>
            {CHECKLIST.map((row, i) => {
              const Icon = ICONS[row.icon];
              const at = TICK[row.title];
              const done = ("done" in row && row.done) || (at !== undefined && lf >= at);
              const pop = at !== undefined && lf >= at ? interpolate(lf, [at, at + 4, at + 10], [0.3, 1.25, 1], CLAMP) : 1;
              const isUpload = "upload" in row && row.upload;
              const isSign = "sign" in row && row.sign;
              const drop = isUpload ? interpolate(lf, [UPLOAD.from, UPLOAD.land], [0, 1], { ...CLAMP, easing: EXPO_OUT }) : 0;
              const status = done
                ? isUpload
                  ? "Uploaded · immunizations.pdf"
                  : isSign
                    ? "Signed by Sarah Mitchell"
                    : "Completed"
                : isSign
                  ? "Needs your signature"
                  : isUpload
                    ? lf >= UPLOAD.from
                      ? "Uploading…"
                      : "Upload required"
                    : "Not started";
              return (
                <div key={row.title} style={{ height: 60, display: "flex", alignItems: "center", gap: 12, borderTop: i === 0 ? "none" : `1px solid ${STORY.divider}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: row.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={STORY.primary} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: STORY.ink, lineHeight: "19px" }}>{row.title}</div>
                    <div
                      style={{
                        fontFamily: body,
                        fontSize: 12,
                        lineHeight: "17px",
                        color: done ? "#2F6B45" : isSign || isUpload ? STORY.clay : "#76828A",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {status}
                    </div>
                  </div>
                  <div style={{ position: "relative", width: 24, height: 24, flexShrink: 0 }}>
                    {done ? (
                      <IoCheckmarkCircle size={24} color={STORY.primary} style={{ transform: `scale(${pop})` }} />
                    ) : (
                      <IoChevronForward size={18} color="#A3AEB3" style={{ marginTop: 3 }} />
                    )}
                    {isUpload && drop > 0 && !done ? (
                      <div
                        style={{
                          position: "absolute",
                          right: 30,
                          top: -4,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 9px",
                          borderRadius: 99,
                          backgroundColor: STORY.white,
                          border: `1px solid ${STORY.cardBorder}`,
                          boxShadow: "0 8px 18px rgba(50,72,61,0.16)",
                          fontFamily: body,
                          fontSize: 11,
                          fontWeight: 700,
                          color: STORY.ink,
                          whiteSpace: "nowrap",
                          opacity: drop,
                          transform: `translateY(${(1 - drop) * -120}px) rotate(${(1 - drop) * -8}deg)`,
                        }}
                      >
                        <IoDocumentAttachOutline size={13} color={STORY.primary} />
                        immunizations.pdf
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </StoryCard>
        </div>
      </div>

      {sheet > 0.001 ? (
        <>
          <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(40,57,67,${0.28 * sheet})` }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 330,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              backgroundColor: STORY.white,
              padding: "10px 20px 40px",
              transform: `translateY(${(1 - sheet) * 340}px)`,
              boxShadow: "0 -10px 30px rgba(40,57,67,0.12)",
            }}
          >
            <div style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: "#DCE2DA", margin: "0 auto 16px" }} />
            <StoryKicker style={{ marginBottom: 4 }}>Step 2 of 10</StoryKicker>
            <StoryHeading size={20} style={{ lineHeight: "26px" }}>
              Community Agreement
            </StoryHeading>
            <div style={{ fontFamily: body, fontSize: 13, lineHeight: "18px", color: STORY.muted, marginTop: 4 }}>Sign to confirm you&apos;ve read and agree for Emma.</div>
            <div style={{ position: "relative", marginTop: 14, height: 104, borderRadius: 14, border: "1.5px dashed #D3DBD2", backgroundColor: "#FBFCFA" }}>
              <div style={{ position: "absolute", left: 16, right: 16, bottom: 24, height: 1, backgroundColor: "#D3DBD2" }} />
              <div style={{ position: "absolute", left: 16, bottom: 8, fontFamily: body, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#A3AEB3" }}>SIGN HERE</div>
              <svg viewBox="0 0 300 80" style={{ position: "absolute", left: 30, top: 6, width: 280, height: 76 }}>
                <path
                  d="M6 56 C 20 14, 34 12, 30 50 S 58 22, 70 44 S 92 62, 104 32 C 110 20, 120 20, 118 44 S 150 56, 170 28 C 182 14, 196 32, 206 40 S 250 34, 290 22"
                  fill="none"
                  stroke={STORY.ink}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - sign}
                />
              </svg>
            </div>
            <StoryButton
              label={
                signed ? (
                  <>
                    <IoCheckmark size={18} color="#fff" /> Signed
                  </>
                ) : (
                  "Sign & continue"
                )
              }
              height={48}
              fontSize={15}
              style={{ marginTop: 16, transform: `scale(${press})` }}
            />
          </div>
        </>
      ) : null}
    </Screen>
  );
};

// ─── Billing (ParentBillingScreen, family view) ─────────────────────────────

const BillingScreen: React.FC<{ lf: number; fps: number }> = ({ lf, fps }) => {
  const paid = lf >= PRESS;
  const squash = interpolate(lf, [PRESS - 3, PRESS, PRESS + 6], [1, 0.94, 1], CLAMP);
  const banner = paid ? uiSpring(lf, fps, PRESS + 3) : 0;
  const ring = paid ? interpolate(lf, [PRESS, PRESS + 18], [0, 1], { ...CLAMP, easing: EXPO_OUT }) : 0;
  const rise = (i: number) => {
    const p = uiSpring(lf, fps, 2 + i * 4);
    return { opacity: p, transform: `translateY(${(1 - p) * 18}px)` };
  };
  const charges = [
    { who: "Emma · May tuition", due: "Due May 15", amt: BILLING.due, live: true },
    { who: "Emma · June tuition", due: "Due Jun 15", amt: "$1,250.00" },
    { who: "Liam · Summer camp", due: "Due Jun 1", amt: "$750.00" },
  ];
  return (
    <Screen>
      <div style={{ padding: `${TOP_INSET + 16}px 16px 0`, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, ...rise(0) }}>
          <StoryHeading size={24} style={{ lineHeight: "30px" }}>
            Family tuition
          </StoryHeading>
          <div style={{ fontFamily: body, fontSize: 13, lineHeight: "18px", color: STORY.muted }}>
            {paid ? "3 payments remaining · $3,250.00 left this school year" : BILLING.subtitle}
          </div>
          <MobilePillNav items={["Family view", "Emma", "Jake", "Liam", "Forms"]} active={0} />
        </div>

        <StoryCard variant="today" padding={20} style={{ display: "flex", flexDirection: "column", gap: 8, ...rise(1) }}>
          <StoryKicker style={{ marginBottom: 0 }}>Next payment</StoryKicker>
          <StoryHeading size={30} style={{ lineHeight: "36px", marginTop: 4 }}>
            {BILLING.due}
          </StoryHeading>
          <div style={{ fontFamily: body, fontSize: 13, lineHeight: "18px", color: STORY.muted }}>{BILLING.dueLabel} · Family total due</div>
          <div style={{ fontFamily: body, fontSize: 13, lineHeight: "18px", color: STORY.muted }}>
            Family total remaining: {paid ? "$3,250.00" : BILLING.remaining}
          </div>
          {banner > 0 ? (
            <div
              style={{
                borderRadius: 10,
                border: `1px solid ${STORY.line}`,
                backgroundColor: "#E6F2E8",
                padding: "8px 12px",
                marginTop: 4,
                fontFamily: body,
                fontSize: 13,
                lineHeight: "18px",
                color: "#2F6B45",
                opacity: banner,
                transform: `translateY(${(1 - banner) * 8}px)`,
              }}
            >
              Last payment: {BILLING.due} on May 11 for Emma
            </div>
          ) : null}
          <div style={{ position: "relative", marginTop: 8 }}>
            <StoryButton
              label={
                paid ? (
                  <>
                    <IoCheckmark size={18} color="#fff" /> Paid · Thank you!
                  </>
                ) : (
                  `Pay ${BILLING.due}`
                )
              }
              height={48}
              fontSize={15}
              style={{ transform: `scale(${squash})`, backgroundColor: paid ? "#2F6B45" : STORY.primary }}
            />
            {ring > 0 && ring < 1 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  border: `2px solid ${STORY.primary}`,
                  opacity: 1 - ring,
                  transform: `scale(${1 + ring * 0.18}, ${1 + ring * 0.8})`,
                }}
              />
            ) : null}
          </div>
        </StoryCard>

        <div style={rise(2)}>
          <StoryKicker>Upcoming charges</StoryKicker>
          <StoryCard padding={0} style={{ padding: "0 16px" }}>
            {charges.map((c, i) => {
              const isPaid = c.live && paid;
              const pop = isPaid ? interpolate(lf, [PRESS + 2, PRESS + 6, PRESS + 12], [0.4, 1.2, 1], CLAMP) : 1;
              return (
                <div key={c.who} style={{ height: 60, display: "flex", alignItems: "center", gap: 12, borderTop: i === 0 ? "none" : `1px solid ${STORY.divider}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: STORY.ink, lineHeight: "19px" }}>{c.who}</div>
                    <div style={{ fontFamily: body, fontSize: 12, color: "#76828A", lineHeight: "17px" }}>{c.due}</div>
                  </div>
                  <div style={{ fontFamily: body, fontSize: 14, fontWeight: 700, color: STORY.ink }}>{c.amt}</div>
                  <MobileChip
                    label={isPaid ? "Paid" : c.live ? "Due" : "Scheduled"}
                    tone={isPaid ? "success" : c.live ? "warning" : "neutral"}
                    style={{ transform: `scale(${pop})`, minWidth: 58, justifyContent: "center" }}
                  />
                </div>
              );
            })}
          </StoryCard>
        </div>
      </div>
      <MobileTabBar active="billing" unread={2} press={interpolate(lf, [0, 3, 8], [0, 1, 0], CLAMP)} />
    </Screen>
  );
};

// ─── Carousel screens ───────────────────────────────────────────────────────

const ScreenTitle: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <StoryHeading size={24} style={{ lineHeight: "30px" }}>
      {title}
    </StoryHeading>
    <div style={{ fontFamily: body, fontSize: 13, lineHeight: "18px", color: STORY.muted }}>{subtitle}</div>
  </div>
);

const MessagesScreen: React.FC = () => (
  <Screen>
    <div style={{ padding: `${TOP_INSET + 16}px 16px 0`, display: "flex", flexDirection: "column", gap: 16 }}>
      <ScreenTitle title="Messages" subtitle="1 unread · Oak Room, Maple Room, Office" />
      <div
        style={{
          height: 40,
          borderRadius: 12,
          border: `1px solid ${STORY.line}`,
          backgroundColor: STORY.white,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          fontFamily: body,
          fontSize: 14,
          color: "#A3AEB3",
        }}
      >
        <IoSearchOutline size={16} color="#A3AEB3" />
        Search conversations
      </div>
      <StoryCard padding={0} style={{ padding: "0 14px" }}>
        {PARENT_THREADS.map((t, i) => (
          <div key={t.name} style={{ display: "flex", gap: 12, padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${STORY.divider}` }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 99,
                backgroundColor: t.color,
                color: "#fff",
                fontFamily: body,
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {t.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .replace(".", "")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontFamily: body, fontSize: 14, fontWeight: t.unread ? 700 : 600, color: STORY.ink }}>{t.name}</div>
                <div style={{ fontFamily: body, fontSize: 11, color: t.unread ? STORY.primary : "#A3AEB3", fontWeight: t.unread ? 700 : 500 }}>{t.time}</div>
              </div>
              <div style={{ fontFamily: body, fontSize: 11, color: STORY.kicker, fontWeight: 600, marginTop: 1 }}>{t.sub}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <div style={{ flex: 1, fontFamily: body, fontSize: 13, color: t.unread ? STORY.ink : STORY.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t.preview}
                </div>
                {t.unread ? <div style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: STORY.primary }} /> : null}
              </div>
            </div>
          </div>
        ))}
      </StoryCard>
    </div>
    <MobileTabBar active="messages" unread={1} />
  </Screen>
);

const CalendarScreen: React.FC = () => (
  <Screen>
    <div style={{ padding: `${TOP_INSET + 16}px 16px 0`, display: "flex", flexDirection: "column", gap: 16 }}>
      <ScreenTitle title="Family calendar" subtitle="May 2026 · Emma, Jake and Liam" />
      <MobilePillNav items={["Agenda", "Month"]} active={0} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PARENT_AGENDA.map((e, i) => (
          <StoryCard key={e.title} padding={14} radius={18} variant={i === 2 ? "today" : "default"} style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 48, textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: body, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: STORY.kicker }}>{e.day}</div>
              <div style={{ fontFamily: FONT.story, fontWeight: 600, fontSize: 24, lineHeight: "28px", color: STORY.ink }}>{e.date}</div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", backgroundColor: STORY.divider }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: STORY.ink, lineHeight: "19px" }}>{e.title}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: "#76828A", lineHeight: "17px", marginTop: 2 }}>{e.meta}</div>
            </div>
          </StoryCard>
        ))}
      </div>
    </div>
    <MobileTabBar active="calendar" unread={1} />
  </Screen>
);

const FormsScreen: React.FC = () => (
  <Screen>
    <div style={{ padding: `${TOP_INSET + 16}px 16px 0`, display: "flex", flexDirection: "column", gap: 16 }}>
      <ScreenTitle title="Forms & agreements" subtitle="1 needs your signature" />
      <MobilePillNav items={["Family view", "Emma", "Jake", "Liam", "Forms"]} active={4} />
      <StoryCard padding={0} style={{ padding: "0 14px" }}>
        {PARENT_FORMS.map((fm, i) => {
          const needs = fm.status !== "Signed";
          return (
            <div key={fm.title} style={{ height: 64, display: "flex", alignItems: "center", gap: 12, borderTop: i === 0 ? "none" : `1px solid ${STORY.divider}` }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: needs ? STORY.attentionBg : "#E2EDD9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {needs ? <IoAlertCircleOutline size={18} color={STORY.clay} /> : <IoDocumentTextOutline size={18} color={STORY.primary} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: STORY.ink }}>{fm.title}</div>
                <div style={{ fontFamily: body, fontSize: 12, color: "#76828A", marginTop: 1 }}>{fm.meta}</div>
              </div>
              <MobileChip label={fm.status} tone={needs ? "warning" : "success"} />
            </div>
          );
        })}
      </StoryCard>
    </div>
    <MobileTabBar active="billing" unread={1} />
  </Screen>
);

const ChildrenScreen: React.FC = () => (
  <Screen>
    <div style={{ padding: `${TOP_INSET + 16}px 16px 0`, display: "flex", flexDirection: "column", gap: 16 }}>
      <ScreenTitle title="My children" subtitle="3 children at MudKitchen Microschool" />
      {CHILDREN.map((c, i) => (
        <StoryCard key={c.first} padding={16} style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <StudentPhoto name={c.first} photo={c.photo} size={56} radius={18} bg={STORY.childBg[i]} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <StoryHeading size={16} style={{ lineHeight: "22px" }}>
              {c.first}
            </StoryHeading>
            <div style={{ fontFamily: body, fontSize: 12, color: "#7B878D" }}>{c.line}</div>
            <MobileChip label={`● ${c.status === "Enrolling" ? "Enrolled" : c.status}`} tone="success" style={{ alignSelf: "flex-start" }} />
          </div>
          <IoChevronForward size={18} color="#A3AEB3" />
        </StoryCard>
      ))}
    </div>
    <MobileTabBar active="more" unread={1} />
  </Screen>
);

const CAROUSEL: { key: string; screen: React.ReactNode; tab: ParentTab }[] = [
  { key: "messages", screen: <MessagesScreen />, tab: "messages" },
  { key: "calendar", screen: <CalendarScreen />, tab: "calendar" },
  { key: "forms", screen: <FormsScreen />, tab: "billing" },
  { key: "children", screen: <ChildrenScreen />, tab: "more" },
];

const Carousel: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const step = 17;
  const pos = interpolate(f, [0, step * 3], [0, 3], CLAMP);
  const idx = Math.floor(pos);
  const frac = pos - idx;
  const eased = idx + EXPO_IN_OUT(Math.min(1, frac * 1.6));
  const pw = L.vertical ? 440 : 330;
  const ph = pw * 2.048;
  const gap = L.vertical ? 70 : 70;
  const cy = L.vertical ? L.cy + 20 : L.cy + 40;
  return (
    <AbsoluteFill>
      {CAROUSEL.map((c, i) => {
        const off = i - eased;
        const focus = 1 - Math.min(1, Math.abs(off));
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: L.cx - pw / 2 + off * (pw + gap),
              top: cy - ph / 2,
              transform: `scale(${0.86 + focus * 0.14}) rotate(${off * -2}deg)`,
              opacity: 0.5 + focus * 0.5,
            }}
          >
            <Phone width={pw} height={ph}>
              {c.screen}
            </Phone>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Competitor ghosts (dissolve into the phone) ────────────────────────────

const Ghosts: React.FC<{ f: number; logos: string[]; L: Layout; target: { x: number; y: number } }> = ({ f, logos, L, target }) => {
  const size = L.vertical ? 170 : 150;
  return (
    <>
      {logos.map((logo, i) => {
        const side = i === 0 ? -1 : 1;
        const home = {
          x: target.x + side * (L.vertical ? 330 : 420),
          y: target.y + (i === 0 ? -140 : 120) * (L.vertical ? 1.3 : 1),
        };
        const appear = interpolate(f, [0, 10], [0, 1], { ...CLAMP, easing: EXPO_OUT });
        const t = interpolate(f, [16, 40], [0, 1], { ...CLAMP, easing: EXPO_IN });
        const x = home.x + (target.x - home.x) * t;
        const y = home.y + (target.y - home.y) * t + Math.sin(f / 7 + i) * 6 * (1 - t);
        return (
          <React.Fragment key={logo}>
            <div
              style={{
                position: "absolute",
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
                borderRadius: size * 0.26,
                backgroundColor: "rgba(255,255,255,0.85)",
                border: `1px solid ${SITE.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: appear * (1 - t) * 0.9,
                filter: `grayscale(${0.3 + t * 0.7}) blur(${t * 14}px)`,
                transform: `scale(${1 - t * 0.6}) rotate(${side * (6 - t * 20)}deg)`,
                boxShadow: "0 20px 40px rgba(43,36,29,0.10)",
                zIndex: 3,
              }}
            >
              <Img src={staticFile(logo)} style={{ width: size * 0.56, height: size * 0.56, objectFit: "contain" }} />
            </div>
            {t > 0.05 && t < 1
              ? Array.from({ length: 10 }).map((_, d) => {
                  const td = Math.min(1, t + d * 0.05);
                  return (
                    <div
                      key={d}
                      style={{
                        position: "absolute",
                        left: home.x + (target.x - home.x) * td + (random(`g${i}${d}x`) - 0.5) * 60 * (1 - td),
                        top: home.y + (target.y - home.y) * td + (random(`g${i}${d}y`) - 0.5) * 60 * (1 - td),
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        backgroundColor: d % 2 ? C.clay : C.forest,
                        opacity: (1 - td) * 0.8,
                        zIndex: 3,
                      }}
                    />
                  );
                })
              : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ─── Act ────────────────────────────────────────────────────────────────────

export const ParentAct: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const phoneW = L.vertical ? 440 : 418;
  const phoneH = phoneW * 2.048;
  const phoneX = L.vertical ? L.cx : 1300;
  const phoneY = L.vertical ? 905 : L.cy + 5;
  const enter = uiSpring(f, fps, 0);
  const inCarousel = f >= B.carousel.from && f < B.carousel.to;

  const peek = interpolate(f, [B.gag.from, B.gag.from + 8], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const shut = interpolate(f, [THUD - 5, THUD], [0, 1], { ...CLAMP, easing: EXPO_IN });
  const thud = interpolate(f, [THUD, THUD + 2, THUD + 8], [0, 1, 0], CLAMP);
  const exitWipe = interpolate(f, [350, 360], [0, 1], { ...CLAMP, easing: EXPO_IN });
  const gagIn = f >= B.gag.from ? uiSpring(f, fps, B.gag.from) : 0;

  const beat = f < B.apply.from ? "home" : f < B.bill.from ? "apply" : f < B.carousel.from ? "bill" : "gag";
  const push = interpolate(f, [B.apply.from, B.apply.from + 12], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const billIn = f >= B.bill.from ? uiSpring(f, fps, B.bill.from) : 0;

  const screen =
    beat === "home" ? (
      <HomeScreen lf={f} fps={fps} />
    ) : beat === "apply" ? (
      <>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-push * 110}px)`, filter: `brightness(${1 - push * 0.06})` }}>
          <HomeScreen lf={B.home.to} fps={fps} />
        </div>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - push) * 375}px)`, boxShadow: "-12px 0 30px rgba(40,57,67,0.12)" }}>
          <EnrollmentScreen lf={f - B.apply.from} fps={fps} />
        </div>
      </>
    ) : beat === "bill" ? (
      <div style={{ position: "absolute", inset: 0, opacity: billIn }}>
        <BillingScreen lf={f - B.bill.from} fps={fps} />
      </div>
    ) : (
      <MessagesScreen />
    );

  const supers = [
    { t: "One place to stay in the loop.", ...B.home },
    { t: "Apply, upload, sign. Done.", ...B.apply },
    { t: "One tuition. One button.", ...B.bill },
  ];

  return (
    <AbsoluteFill>
      <Backdrop color={SITE.bg} light vignette={0.3} fog={SITE.bgAlt} fogOpacity={0.5} />
      {inCarousel ? (
        <Carousel f={f - B.carousel.from} L={L} />
      ) : (
        <>
          {beat === "gag" ? (
            <div
              style={{
                position: "absolute",
                left: phoneX + phoneW / 2 - 70 + peek * 90 - shut * 90,
                top: phoneY - 140,
                width: 110,
                height: 110,
                borderRadius: 30,
                backgroundColor: "#fff",
                boxShadow: "0 16px 30px rgba(43,36,29,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotate(${14 - shut * 14}deg) scaleX(${1 - shut * 0.35})`,
                transformOrigin: "left center",
                opacity: 1 - shut,
              }}
            >
              <Img src={staticFile("brand/competitors/Gmail.png")} style={{ width: 70, height: 70, objectFit: "contain" }} />
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: phoneX - phoneW / 2,
              top: phoneY - phoneH / 2,
              transform:
                beat === "gag"
                  ? `translateY(${(1 - gagIn) * 60}px) translateX(${shut * 20 - thud * 6}px) scale(${0.96 + gagIn * 0.04 + thud * 0.012})`
                  : `translateY(${(1 - enter) * 200}px) rotate(${(1 - enter) * 4}deg)`,
              zIndex: 2,
            }}
          >
            <Phone width={phoneW} height={phoneH} statusTone={beat === "home" && homeScroll(f) < 130 ? "light" : "dark"}>
              {screen}
            </Phone>
          </div>
          {beat === "apply" ? (
            <Ghosts f={f - B.apply.from} L={L} logos={["brand/competitors/GoogleForms.png", "brand/competitors/DocuSign.png"]} target={{ x: phoneX, y: phoneY }} />
          ) : null}
          {beat === "bill" ? (
            <Ghosts f={f - B.bill.from} L={L} logos={["brand/competitors/Venmo.png", "brand/competitors/Paypal.svg"]} target={{ x: phoneX, y: phoneY - 40 }} />
          ) : null}
        </>
      )}

      {inCarousel ? null : beat !== "gag" ? (
        <div style={{ position: "absolute", ...(L.vertical ? { left: 80, right: 80, top: L.safeTop + 10 } : { left: 140, top: 390, width: 860 }) }}>
          <Kicker text="Parent Portal" color={C.clay} size={L.vertical ? 26 : 20} style={{ marginBottom: 22, opacity: enter }} />
          {supers.map((s) => (
            <Super
              key={s.t}
              text={s.t}
              from={s.from + 2}
              to={s.to - 1}
              size={L.vertical ? 72 : 70}
              color={C.forest}
              maxWidth={L.vertical ? undefined : 820}
              style={{ position: "absolute" }}
            />
          ))}
        </div>
      ) : null}
      {inCarousel ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: L.vertical ? L.safeTop + 20 : 70, display: "flex", justifyContent: "center" }}>
          <Kicker text="Everything families need" color={C.clay} size={L.vertical ? 26 : 20} />
        </div>
      ) : null}

      {exitWipe > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${exitWipe * 100}%`,
            backgroundColor: SITE.bgAlt,
            borderTopLeftRadius: (1 - exitWipe) * 400,
            borderTopRightRadius: (1 - exitWipe) * 400,
            zIndex: 10,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
