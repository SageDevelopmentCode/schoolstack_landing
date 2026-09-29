import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  LayoutDashboard,
  MessageCircle,
  Paperclip,
  Pin,
  Search,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ACTS, beat } from "../timeline";
import { C, CLAMP, EXPO_IN, EXPO_OUT, FONT, SOFT_IN_OUT, uiSpring } from "../theme";
import { Backdrop } from "../components/Backdrop";
import { Kicker, Super } from "../components/Super";
import { useLayout } from "../components/layout";
import { DemoCursor, DemoFrame, type CursorStop } from "../demo/DemoFrame";
import { SITE, STORY, img } from "../demo/tokens";
import { RIVERA_REPLY, RIVERA_THREAD, SCHOOL, TEACHER, TEACHER_EVENTS, TEACHER_FOCUS, TEACHER_STUDENTS, TEACHER_THREADS } from "../demo/data";
import { AttendanceBadge, AttentionItem, StoryButton, StoryCard, StoryHeading, StoryKicker, StudentPhoto } from "../demo/story";

const T0 = ACTS.V.from;
type PageKey = "dashboard" | "attendance" | "messages" | "calendar";
const BEATS: { from: number; to: number; page: PageKey; super: string }[] = [
  { from: 0, to: 60, page: "dashboard", super: "Your class, at a glance." },
  { from: 60, to: 120, page: "attendance", super: "Attendance, done by 8:05." },
  { from: 120, to: 180, page: "messages", super: "Every family, one thread." },
  { from: 180, to: 240, page: "calendar", super: "Teach more. Chase less." },
];
const DOWNBEAT = beat(80) - T0;
const PLINKS = 1452 - T0 - 60;
const SENT = 1538 - T0 - 120;
const body = FONT.storyBody;

// ─── Shell (SchoolTeacherDemoShell) ─────────────────────────────────────────

const HEADER_H = 56;
const LOGO_W = 150;
const NAV: { key: PageKey | "students" | "more"; label: string; icon?: LucideIcon; w: number }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, w: 118 },
  { key: "students", label: "My Students", icon: Users, w: 124 },
  { key: "messages", label: "Messages", icon: MessageCircle, w: 110 },
  { key: "calendar", label: "Calendar", icon: CalendarDays, w: 104 },
  { key: "attendance", label: "Attendance", icon: ClipboardList, w: 118 },
  { key: "more", label: "More", w: 70 },
];
const navX = (key: string, compact: boolean) => {
  let x = 20 + (compact ? 40 : LOGO_W) + 12;
  for (const n of NAV) {
    const w = compact ? navW(n) : n.w;
    if (n.key === key) return x + w / 2;
    x += w + 4;
  }
  return x;
};
const navW = (n: (typeof NAV)[number]) => (n.icon ? 44 : 60);

const Shell: React.FC<{ page: PageKey; compact: boolean; width: number }> = ({ page, compact, width }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width,
      height: HEADER_H,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "0 20px",
      backgroundColor: STORY.white,
      borderBottom: `1px solid ${STORY.line}`,
      zIndex: 10,
      fontFamily: body,
    }}
  >
    <div style={{ width: compact ? 40 : LOGO_W, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <Img src={staticFile(img.logoTeacher)} style={{ width: 32, height: 32, objectFit: "contain" }} />
      {compact ? null : <div style={{ fontFamily: FONT.story, fontWeight: 600, fontSize: 17, color: STORY.ink, letterSpacing: "-0.02em" }}>MudKitchen</div>}
    </div>
    <div style={{ display: "flex", gap: 4 }}>
      {NAV.map((n) => {
        const on = n.key === page;
        const Icon = n.icon;
        return (
          <div
            key={n.key}
            style={{
              width: compact ? navW(n) : n.w,
              height: 34,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: on ? 600 : 500,
              color: on ? STORY.primaryDark : STORY.muted,
              backgroundColor: on ? STORY.primaryLight : "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {Icon ? <Icon size={16} color={on ? STORY.primaryDark : STORY.muted} /> : null}
            {compact && Icon ? null : n.label}
            {n.key === "more" ? <ChevronDown size={14} color={STORY.muted} /> : null}
          </div>
        );
      })}
    </div>
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
      <Bell size={18} color={STORY.muted} />
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 99,
          backgroundColor: STORY.primary,
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {TEACHER.initials}
      </div>
    </div>
  </div>
);

const pageEnter = (lf: number): React.CSSProperties => {
  const p = interpolate(lf, [0, 7], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  return { opacity: p, transform: `translateY(${(1 - p) * 10}px)` };
};
const rise = (lf: number, fps: number, i: number): React.CSSProperties => {
  const p = uiSpring(lf, fps, 2 + i * 3);
  return { opacity: p, transform: `translateY(${(1 - p) * 14}px)` };
};

// ─── Dashboard ──────────────────────────────────────────────────────────────

const FOCUS_ICON: Record<string, LucideIcon> = { message: MessageCircle, calendar: CalendarDays, attendance: ClipboardList };
const CLASSROOMS = [
  { name: "Oak Room", count: 4, program: "Lower Elementary", tint: STORY.childBg[0] },
  { name: "Maple Room", count: 3, program: "Primary", tint: STORY.childBg[1] },
  { name: "Cedar Room", count: 2, program: "Upper Elementary", tint: STORY.childBg[2] },
];

const DashboardPage: React.FC<{ lf: number; fps: number; vertical: boolean }> = ({ lf, fps, vertical }) => {
  const scroll = interpolate(lf, [26, 54], [0, vertical ? 250 : 270], { ...CLAMP, easing: SOFT_IN_OUT });
  return (
    <div style={{ padding: 24, transform: `translateY(${-scroll}px)`, ...pageEnter(lf) }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20, ...rise(lf, fps, 0) }}>
        <div>
          <StoryKicker>{SCHOOL.name} staff</StoryKicker>
          <StoryHeading size={30}>Good morning, {TEACHER.first}. ☀️</StoryHeading>
          <div style={{ marginTop: 8, fontFamily: body, fontSize: 14, color: STORY.muted }}>Here&apos;s your classroom picture for {SCHOOL.today}.</div>
        </div>
        <div style={{ borderRadius: 99, border: `1px solid ${STORY.cardBorder}`, backgroundColor: STORY.white, padding: "6px 12px", fontFamily: body, fontSize: 12, fontWeight: 600, color: STORY.muted, whiteSpace: "nowrap" }}>
          {TEACHER.role}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 0.85fr", gap: 18, marginBottom: 22 }}>
        <StoryCard variant="today" padding={22} style={rise(lf, fps, 1)}>
          <StoryKicker>Start here</StoryKicker>
          <StoryHeading size={16} style={{ marginBottom: 14 }}>
            3 things need your attention
          </StoryHeading>
          {TEACHER_FOCUS.map((it, i) => {
            const Icon = FOCUS_ICON[it.icon];
            return <AttentionItem key={it.title} first={i === 0} icon={<Icon size={18} color={STORY.primary} />} title={it.title} subtitle={it.subtitle} />;
          })}
        </StoryCard>
        <StoryCard variant="primary" padding={22} style={rise(lf, fps, 2)}>
          <StoryKicker light>Classroom snapshot</StoryKicker>
          <StoryHeading size={20} color="#fff">
            {TEACHER_STUDENTS.length} learners in your care
          </StoryHeading>
          <div style={{ marginTop: 8, fontFamily: body, fontSize: 13, lineHeight: 1.6, color: "#D5E3D9" }}>Oak, Maple and Cedar Room are ready for today.</div>
          <div style={{ marginTop: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", padding: 12 }}>
            <div style={{ fontFamily: body, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: STORY.kickerLight }}>Next event</div>
            <div style={{ fontFamily: body, fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 4 }}>Nature Walk</div>
            <div style={{ fontFamily: body, fontSize: 12, color: "#D4E0D7", marginTop: 2 }}>Wednesday, May 13 · 10:00 AM</div>
          </div>
          <div style={{ marginTop: 12, fontFamily: body, fontSize: 13, fontWeight: 700, color: "#D6EFD8" }}>View school calendar →</div>
        </StoryCard>
      </div>
      <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 14, backgroundColor: "#EEF2EE", width: "fit-content", marginBottom: 16, ...rise(lf, fps, 3) }}>
        {["Attendance", "Classrooms", "Students"].map((t, i) => (
          <div
            key={t}
            style={{
              padding: "7px 16px",
              borderRadius: 10,
              fontFamily: body,
              fontSize: 13,
              fontWeight: 700,
              color: i === 1 ? STORY.primary : STORY.muted,
              backgroundColor: i === 1 ? STORY.white : "transparent",
              boxShadow: i === 1 ? STORY.shadowPill : "none",
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
        {CLASSROOMS.map((c, i) => (
          <StoryCard key={c.name} padding={18} style={rise(lf, fps, 4 + i)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: c.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Home size={18} color={STORY.primary} />
              </div>
              <div>
                <StoryHeading size={16}>{c.name}</StoryHeading>
                <div style={{ fontFamily: body, fontSize: 12, color: "#7B878D", marginTop: 2 }}>
                  {c.count} students · {c.program}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 14 }}>
              {TEACHER_STUDENTS.slice(i * 3, i * 3 + c.count).map((s, j) => (
                <div key={s.first} style={{ marginLeft: j ? -8 : 0, borderRadius: 99, border: "2px solid #fff" }}>
                  <StudentPhoto name={s.first} photo={s.photo} size={28} radius={14} bg={STORY.childBg[j]} />
                </div>
              ))}
            </div>
          </StoryCard>
        ))}
      </div>
      <StoryCard padding={22} style={rise(lf, fps, 7)}>
        <StoryKicker>School bulletin</StoryKicker>
        {[
          { t: "Welcome back to a great school year", m: "School Office · Pinned", pin: true },
          { t: "Fire drill scheduled for Friday", m: "School Office · 2 days ago" },
        ].map((p, i) => (
          <div key={p.t} style={{ display: "flex", gap: 12, alignItems: "center", padding: i ? "12px 0 0" : "4px 0 12px", borderTop: i ? `1px solid ${STORY.divider}` : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: i ? "#DCEBF2" : STORY.attentionBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {p.pin ? <Pin size={16} color={STORY.clay} /> : <Bell size={16} color="#2F6480" />}
            </div>
            <div>
              <div style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: STORY.ink }}>{p.t}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: "#76828A", marginTop: 2 }}>{p.m}</div>
            </div>
          </div>
        ))}
      </StoryCard>
    </div>
  );
};

// ─── Attendance ─────────────────────────────────────────────────────────────

const ATT = { pad: 22, head: 64, bar: 50, gap: 12, row: 47 };
const MARK_ALL = 8;
const checkAt = (i: number) => PLINKS + i * 4;

const AttendancePage: React.FC<{ lf: number; fps: number; cw: number }> = ({ lf, fps, cw }) => {
  const marked = TEACHER_STUDENTS.filter((_, i) => lf >= checkAt(i)).length;
  const saved = lf >= checkAt(TEACHER_STUDENTS.length - 1) + 8;
  const savedP = saved ? uiSpring(lf, fps, checkAt(TEACHER_STUDENTS.length - 1) + 8) : 0;
  const press = interpolate(lf, [MARK_ALL - 2, MARK_ALL, MARK_ALL + 5], [1, 0.94, 1], CLAMP);
  return (
    <div style={{ padding: ATT.pad, ...pageEnter(lf) }}>
      <div style={{ height: ATT.head, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <StoryKicker>Oak Room · Maple Room · Cedar Room</StoryKicker>
          <StoryHeading size={28}>Today&apos;s attendance</StoryHeading>
        </div>
        <StoryButton
          label={
            saved ? (
              <>
                <Check size={15} color="#fff" strokeWidth={3} /> Attendance saved
              </>
            ) : (
              <>
                <CheckCheck size={15} color="#fff" /> Mark all present
              </>
            )
          }
          height={38}
          style={{ padding: "0 16px", transform: `scale(${press * (1 + Math.sin(savedP * Math.PI) * 0.05)})`, backgroundColor: saved ? "#2F6B45" : STORY.primary }}
        />
      </div>
      <div
        style={{
          height: ATT.bar,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 12,
          border: "1px solid #EDF1ED",
          backgroundColor: STORY.white,
          padding: "0 16px",
          marginBottom: ATT.gap,
        }}
      >
        <ChevronLeft size={16} color={STORY.muted} />
        <div style={{ textAlign: "center", fontFamily: body }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: STORY.ink }}>{SCHOOL.today}</div>
          <div style={{ fontSize: 11, color: "#7B878D", marginTop: 2 }}>
            {marked} of {TEACHER_STUDENTS.length} marked · {marked} present
          </div>
        </div>
        <ChevronRight size={16} color={STORY.muted} />
      </div>
      <StoryCard padding={0} style={{ padding: "0 18px" }}>
        {TEACHER_STUDENTS.map((s, i) => {
          const at = checkAt(i);
          const on = lf >= at;
          const pop = on ? interpolate(lf, [at, at + 4, at + 10], [0.5, 1.2, 1], CLAMP) : 1;
          const ripple = interpolate(lf, [at, at + 16], [0, 1], CLAMP);
          return (
            <div key={s.first} style={{ height: ATT.row, display: "flex", alignItems: "center", gap: 12, borderTop: i ? `1px solid ${STORY.divider}` : "none", backgroundColor: on && ripple < 1 ? `rgba(46,74,60,${0.05 * (1 - ripple)})` : "transparent" }}>
              <StudentPhoto name={s.first} photo={s.photo} size={32} radius={11} bg={STORY.childBg[i % STORY.childBg.length]} />
              <div style={{ flex: 1, minWidth: 0, fontFamily: body }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: STORY.ink }}>{s.first}</div>
                <div style={{ fontSize: 11, color: "#7B878D", marginTop: 1 }}>
                  {s.grade} · {s.program}
                </div>
              </div>
              {cw > 600 ? <div style={{ width: 70, fontFamily: body, fontSize: 12, color: "#7B878D", opacity: on ? 1 : 0 }}>8:0{Math.min(5, i)} AM</div> : null}
              <div style={{ width: 96, display: "flex", justifyContent: "flex-end" }}>
                <AttendanceBadge status={on ? "present" : "not_marked"} pop={pop} />
              </div>
              <div style={{ position: "relative", width: 28, height: 28 }}>
                {ripple > 0 && ripple < 1 ? (
                  <div style={{ position: "absolute", inset: 0, borderRadius: 99, border: `2px solid ${STORY.primary}`, transform: `scale(${1 + ripple * 1.8})`, opacity: (1 - ripple) * 0.6 }} />
                ) : null}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 99,
                    border: `1.5px solid ${on ? STORY.primary : "#CFD8CF"}`,
                    backgroundColor: on ? STORY.primary : STORY.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {on ? <Check size={15} color="#fff" strokeWidth={3} style={{ transform: `scale(${pop})` }} /> : null}
                </div>
              </div>
            </div>
          );
        })}
      </StoryCard>
    </div>
  );
};

// ─── Messages ───────────────────────────────────────────────────────────────

const TYPE_FROM = 8;
const MessagesPage: React.FC<{ lf: number; fps: number; cw: number; dh: number }> = ({ lf, fps, cw, dh }) => {
  const listW = cw > 800 ? 290 : 240;
  const typedN = Math.max(0, Math.min(RIVERA_REPLY.length, Math.floor((lf - TYPE_FROM) * 3.4)));
  const sent = lf >= SENT;
  const sentP = sent ? uiSpring(lf, fps, SENT) : 0;
  const press = interpolate(lf, [SENT - 2, SENT, SENT + 5], [1, 0.9, 1], CLAMP);
  const h = dh - HEADER_H;
  return (
    <div style={{ display: "flex", height: h, ...pageEnter(lf) }}>
      <div style={{ width: listW, flexShrink: 0, borderRight: `1px solid ${STORY.line}`, backgroundColor: STORY.white, padding: "18px 12px" }}>
        <StoryHeading size={20} style={{ padding: "0 6px" }}>
          Messages
        </StoryHeading>
        <div style={{ margin: "12px 0", height: 34, borderRadius: 10, border: `1px solid ${STORY.line}`, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", fontFamily: body, fontSize: 12, color: "#A3AEB3" }}>
          <Search size={14} color="#A3AEB3" />
          Search conversations
        </div>
        {TEACHER_THREADS.map((t, i) => {
          const on = i === 0;
          return (
            <div key={t.title} style={{ display: "flex", gap: 10, padding: "10px 8px", borderRadius: 12, backgroundColor: on ? STORY.primaryLight : "transparent", marginBottom: 2 }}>
              <div style={{ width: 34, height: 34, borderRadius: 99, backgroundColor: t.color, color: "#fff", fontFamily: body, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {t.title
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0, fontFamily: body }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: STORY.ink, whiteSpace: "nowrap" }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: "#A3AEB3", whiteSpace: "nowrap" }}>{on && sent ? "Now" : t.time}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <div style={{ flex: 1, fontSize: 11, color: STORY.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{on && sent ? `You: ${RIVERA_REPLY}` : t.preview}</div>
                  {t.unread && !(on && lf > 4) ? (
                    <div style={{ minWidth: 16, height: 16, borderRadius: 8, backgroundColor: STORY.primary, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.unread}</div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", backgroundColor: STORY.paper }}>
        <div style={{ height: 62, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", borderBottom: `1px solid ${STORY.line}`, backgroundColor: STORY.white }}>
          <StudentPhoto name="Emma Rivera" photo={img.emma} size={36} radius={99} />
          <div style={{ fontFamily: body }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: STORY.ink }}>Rivera Family</div>
            <div style={{ fontSize: 11, color: "#7B878D", marginTop: 1 }}>Emma Rivera · 3rd · Oak Room</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, justifyContent: "flex-end" }}>
          <div style={{ alignSelf: "center", fontFamily: body, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#A3AEB3" }}>TODAY</div>
          {RIVERA_THREAD.map((m) => (
            <div key={m.body} style={{ alignSelf: "flex-start", maxWidth: "78%" }}>
              <div style={{ fontFamily: body, fontSize: 11, color: "#7B878D", marginBottom: 4 }}>
                {m.name} · {m.time}
              </div>
              <div style={{ fontFamily: body, fontSize: 14, lineHeight: 1.5, color: STORY.ink, backgroundColor: STORY.white, border: `1px solid ${STORY.cardBorder}`, borderRadius: 16, borderBottomLeftRadius: 5, padding: "10px 14px" }}>
                {m.body}
              </div>
            </div>
          ))}
          {sent ? (
            <div style={{ alignSelf: "flex-end", maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, opacity: sentP, transform: `translateY(${(1 - sentP) * 30}px) scale(${0.94 + sentP * 0.06})`, transformOrigin: "right bottom" }}>
              <div style={{ fontFamily: body, fontSize: 14, lineHeight: 1.5, color: "#fff", backgroundColor: STORY.primary, borderRadius: 16, borderBottomRightRadius: 5, padding: "10px 14px" }}>{RIVERA_REPLY}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: body, fontSize: 11, fontWeight: 600, color: STORY.primary }}>
                <CheckCheck size={13} color={STORY.primary} /> Sent · 1:46 PM
              </div>
            </div>
          ) : null}
        </div>
        <div style={{ flexShrink: 0, padding: "12px 16px", borderTop: `1px solid ${STORY.line}`, backgroundColor: STORY.white, display: "flex", alignItems: "center", gap: 10 }}>
          <Paperclip size={17} color={STORY.muted} />
          <div
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: 12,
              border: `1px solid ${typedN > 0 && !sent ? STORY.primary : STORY.line}`,
              padding: "9px 12px",
              fontFamily: body,
              fontSize: 13,
              lineHeight: 1.5,
              color: sent || typedN === 0 ? "#A3AEB3" : STORY.ink,
            }}
          >
            {sent || typedN === 0 ? "Write a message…" : RIVERA_REPLY.slice(0, typedN)}
            {!sent && typedN > 0 && typedN < RIVERA_REPLY.length ? <span style={{ opacity: Math.floor(lf / 4) % 2 ? 1 : 0.2 }}>|</span> : null}
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: STORY.primary, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})` }}>
            <Send size={17} color="#fff" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Calendar ───────────────────────────────────────────────────────────────

const TONE: Record<string, { bg: string; fg: string }> = {
  sky: { bg: "#DCEBF2", fg: "#2F6480" },
  sage: { bg: "#E2EDD9", fg: STORY.primary },
  berry: { bg: "#F4DEE6", fg: "#8E4A62" },
  sun: { bg: "#F7EBCB", fg: "#8A6512" },
};
const MAY_START = 5;

const CalendarPage: React.FC<{ lf: number; fps: number; cw: number }> = ({ lf, fps, cw }) => {
  const side = cw > 800;
  const cells = Array.from({ length: 42 }, (_, i) => i - MAY_START + 1);
  return (
    <div style={{ padding: 24, display: "flex", gap: 18, ...pageEnter(lf) }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <StoryKicker>School calendar</StoryKicker>
            <StoryHeading size={28}>May 2026</StoryHeading>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[ChevronLeft, ChevronRight].map((I, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${STORY.line}`, backgroundColor: STORY.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <I size={15} color={STORY.muted} />
              </div>
            ))}
          </div>
        </div>
        <StoryCard padding={0} radius={18} style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", backgroundColor: "#FBFCFB", borderBottom: `1px solid ${STORY.divider}` }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} style={{ padding: "8px 10px", fontFamily: body, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B9699" }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((day, i) => {
              const inMonth = day >= 1 && day <= 31;
              const evIdx = TEACHER_EVENTS.findIndex((e) => e.day === day);
              const ev = evIdx >= 0 ? TEACHER_EVENTS[evIdx] : null;
              const p = ev ? uiSpring(lf, fps, 6 + evIdx * 4) : 0;
              const today = day === 11;
              return (
                <div key={i} style={{ height: 62, padding: 6, borderTop: i >= 7 ? `1px solid ${STORY.divider}` : "none", borderLeft: i % 7 ? `1px solid ${STORY.divider}` : "none" }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 99,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: body,
                      fontSize: 11,
                      fontWeight: today ? 700 : 500,
                      color: today ? "#fff" : inMonth ? STORY.ink : "#C4CCC6",
                      backgroundColor: today ? STORY.primary : "transparent",
                    }}
                  >
                    {inMonth ? day : day < 1 ? 30 + day : day - 31}
                  </div>
                  {ev ? (
                    <div
                      style={{
                        marginTop: 4,
                        borderRadius: 6,
                        padding: "2px 5px",
                        backgroundColor: TONE[ev.tone].bg,
                        color: TONE[ev.tone].fg,
                        fontFamily: body,
                        fontSize: 9,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        opacity: p,
                        transform: `scale(${0.7 + p * 0.3})`,
                        transformOrigin: "left center",
                      }}
                    >
                      {ev.title}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </StoryCard>
      </div>
      {side ? (
        <div style={{ width: 250, flexShrink: 0, paddingTop: 58 }}>
          <StoryCard variant="today" padding={18} radius={18}>
            <StoryKicker>Coming up</StoryKicker>
            {TEACHER_EVENTS.map((e, i) => {
              const p = uiSpring(lf, fps, 10 + i * 4);
              return (
                <div key={e.title} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderTop: i ? `1px solid ${STORY.divider}` : "none", opacity: p, transform: `translateX(${(1 - p) * 20}px)` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: TONE[e.tone].bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: body }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: TONE[e.tone].fg, letterSpacing: "0.08em" }}>MAY</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TONE[e.tone].fg, lineHeight: 1 }}>{e.day}</div>
                  </div>
                  <div style={{ fontFamily: body }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: STORY.ink }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: "#7B878D", marginTop: 1 }}>{e.time}</div>
                  </div>
                </div>
              );
            })}
          </StoryCard>
        </div>
      ) : null}
    </div>
  );
};

// ─── Act ────────────────────────────────────────────────────────────────────

export const TeacherAct: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const b = BEATS.find((x) => f >= x.from && f < x.to) ?? BEATS[3];
  const lf = f - b.from;
  const enter = interpolate(f, [0, 16], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const bgIn = interpolate(f, [0, 14], [0, 1], { ...CLAMP, easing: SOFT_IN_OUT });
  const exit = interpolate(f, [226, 240], [0, 1], { ...CLAMP, easing: EXPO_IN });
  const drift = interpolate(f, [0, 240], [8, -8]);

  const g = L.vertical
    ? { left: 40, top: 540, w: 1000, h: 800, dw: 720, compact: true }
    : { left: 660, top: 165, w: 1160, h: 730, dw: 960, compact: false };
  const dh = g.h / (g.w / g.dw);
  const cw = g.dw;

  const markAll = { x: cw - 24 - 80, y: HEADER_H + ATT.pad + 19 };
  const sendBtn = { x: cw - 16 - 20, y: dh - 32 };
  const stops: CursorStop[] = [
    { at: 22, x: cw * 0.35, y: HEADER_H + 190 },
    { at: 56, x: navX("attendance", g.compact), y: HEADER_H / 2, click: true },
    { at: 60 + MARK_ALL, x: markAll.x, y: markAll.y, click: true },
    { at: 60 + MARK_ALL + 20, x: cw * 0.62, y: HEADER_H + 250 },
    { at: 116, x: navX("messages", g.compact), y: HEADER_H / 2, click: true },
    { at: 120 + SENT, x: sendBtn.x, y: sendBtn.y, click: true },
    { at: 176, x: navX("calendar", g.compact), y: HEADER_H / 2, click: true },
    { at: 206, x: 24 + ((cw > 800 ? cw - 48 - 268 : cw - 48) / 7) * 4.5, y: HEADER_H + 24 + 70 + 34 + 62 * 2 + 30 },
  ];

  const page =
    b.page === "dashboard" ? (
      <DashboardPage lf={lf} fps={fps} vertical={L.vertical} />
    ) : b.page === "attendance" ? (
      <AttendancePage lf={lf} fps={fps} cw={cw} />
    ) : b.page === "messages" ? (
      <MessagesPage lf={lf} fps={fps} cw={cw} dh={dh} />
    ) : (
      <CalendarPage lf={lf} fps={fps} cw={cw} />
    );

  return (
    <AbsoluteFill>
      <Backdrop color={SITE.bgAlt} light />
      <AbsoluteFill style={{ opacity: bgIn }}>
        <Backdrop color={SITE.bg} light vignette={0.3} fog={SITE.bgAlt} fogOpacity={0.5} />
      </AbsoluteFill>
      <Img
        src={staticFile("brand/illustrations/HeroLeft.webp")}
        style={{
          position: "absolute",
          height: L.vertical ? 700 : 620,
          left: L.vertical ? -300 : -240,
          bottom: L.vertical ? 180 : -220,
          opacity: 0.1 * enter,
          transform: `translateY(${drift * 2}px) rotate(-6deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: g.left,
          top: g.top,
          transform: `translateY(${(1 - enter) * 90 + drift - exit * 60}px) scale(${0.96 + enter * 0.04 - exit * 0.12})`,
          opacity: enter,
        }}
      >
        <DemoFrame width={g.w} height={g.h} designWidth={g.dw} background={STORY.paper}>
          <div style={{ position: "relative", width: cw, height: dh, overflow: "hidden", backgroundColor: STORY.paper }}>
            <Shell page={b.page} compact={g.compact} width={cw} />
            <div key={b.page} style={{ position: "absolute", left: 0, top: HEADER_H, width: cw, height: dh - HEADER_H, overflow: "hidden" }}>
              {page}
            </div>
          </div>
          <DemoCursor f={f} stops={stops} variant="teacher" />
        </DemoFrame>
      </div>

      <div style={{ position: "absolute", ...(L.vertical ? { left: 80, right: 80, top: L.safeTop + 50 } : { left: 110, top: 380, width: 500 }), opacity: 1 - exit }}>
        <Kicker text="Teacher Portal" color={C.clay} size={L.vertical ? 26 : 20} style={{ marginBottom: 22, opacity: enter }} />
        {BEATS.slice(0, 3).map((s) => (
          <Super key={s.super} text={s.super} from={s.from + 2} to={s.to - 1} size={L.vertical ? 80 : 62} color={C.forest} style={{ position: "absolute" }} />
        ))}
        <Super text={BEATS[3].super} from={DOWNBEAT - 3} to={240} size={L.vertical ? 92 : 74} color={C.forest} emphasis="Chase less" emphasisColor={C.clay} style={{ position: "absolute" }} />
      </div>

      {exit > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${exit * 100}%`,
            backgroundColor: C.forest,
            borderTopLeftRadius: (1 - exit) * 500,
            borderTopRightRadius: (1 - exit) * 500,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
