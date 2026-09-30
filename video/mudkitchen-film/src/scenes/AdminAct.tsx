import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  Eye,
  GitBranch,
  GraduationCap,
  Home,
  LayoutDashboard,
  Lightbulb,
  ListFilter,
  Megaphone,
  MessageSquare,
  School,
  Search,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ACTS, HIT } from "../timeline";
import { C, CLAMP, EXPO_IN, EXPO_IN_OUT, EXPO_OUT, FONT, SOFT_IN_OUT, uiSpring } from "../theme";
import { Backdrop } from "../components/Backdrop";
import { Kicker, Super } from "../components/Super";
import { useLayout, type Layout } from "../components/layout";
import { DemoCursor, DemoFrame, countUp, type CursorStop } from "../demo/DemoFrame";
import { ADMIN, SITE, STORY, img } from "../demo/tokens";
import {
  ADMIN_ATTENDANCE,
  ADMIN_FOCUS,
  ADMIN_METRICS,
  ADMIN_ROSTER,
  ADMIN_SIGNAL,
  BUDGET_CATS,
  FIN_STATS,
  LEAD_FILTERS,
  LEADS,
  MONTHLY_REVENUE,
  SCHOOL,
  type LeadStatus,
} from "../demo/data";
import { AttendanceBadge, StoryButton, StoryCard, StoryHeading, StoryKicker, StudentPhoto } from "../demo/story";

const A0 = ACTS.III.from;
type PageKey = "dashboard" | "leads" | "myschool" | "budget";
const BEATS: { from: number; to: number; page: PageKey; super: string }[] = [
  { from: 0, to: 72, page: "dashboard", super: "Know what needs you." },
  { from: 72, to: 144, page: "leads", super: "Every family. One pipeline." },
  { from: 144, to: 216, page: "myschool", super: "Records that stay current." },
  { from: 216, to: 288, page: "budget", super: "Finances without the spreadsheet." },
];
const FIN = { from: HIT.finFlash - A0, to: HIT.finFlash - A0 + 15 };
const MORPH = HIT.bubbleMorph - A0;
const FLOOD = HIT.creamFlood - A0;
const PING_A = 816 - A0;
const PING_B = 836 - A0;
const RIVERA_CLICK = 110;

// ─── Sidebar (AdminDashboardDemo Sidebar) ───────────────────────────────────

type NavItem = { key: string; name: string; icon: LucideIcon; subs?: [string, LucideIcon][] };
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { key: "dashboard", name: "Dashboard", icon: LayoutDashboard },
      { key: "leads", name: "Admissions", icon: GraduationCap, subs: [["Enrollment Flows", GitBranch], ["Submissions", ClipboardList]] },
      {
        key: "myschool",
        name: "My School",
        icon: School,
        subs: [["My Students", Users], ["Programs", BookOpen], ["Staff", UserCheck], ["Classrooms", Home], ["Tuition", DollarSign]],
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        key: "budget",
        name: "Finances",
        icon: DollarSign,
        subs: [["Overview", LayoutDashboard], ["Expenses", CreditCard], ["Revenue", TrendingUp], ["Insights", Lightbulb], ["Transactions", ListFilter], ["Payroll", Wallet]],
      },
      { key: "marketing", name: "Marketing", icon: Megaphone },
      { key: "impersonate", name: "Impersonate", icon: Eye },
    ],
  },
];
const ACTIVE_SUB: Record<string, number> = { leads: 1, myschool: 0, budget: 0 };
const SB = { logoH: 56, helpH: 45, padTop: 16, labelH: 22, itemH: 36, gap: 2, groupGap: 20, subRow: 26 };
const subsHeight = (n: number) => 4 + n * SB.subRow + (n - 1) * 2 + 2;

const beatAt = (f: number) => BEATS.find((b) => f >= b.from && f < b.to) ?? BEATS[BEATS.length - 1];

// How far each page's subtab list is expanded at act frame `f`.
const openAmount = (key: string, f: number) => {
  const b = BEATS.find((x) => x.page === key);
  if (!b) return 0;
  const inP = interpolate(f, [b.from, b.from + 7], [0, 1], { ...CLAMP, easing: SOFT_IN_OUT });
  const last = b === BEATS[BEATS.length - 1];
  const outP = last ? 0 : interpolate(f, [b.to, b.to + 7], [0, 1], { ...CLAMP, easing: SOFT_IN_OUT });
  return inP * (1 - outP);
};

function navLayout(f: number, collapsed: boolean) {
  let y = SB.logoH + SB.helpH + SB.padTop;
  const items: Record<string, number> = {};
  const subs: Record<string, { y: number; h: number }> = {};
  const labels: { y: number; text: string }[] = [];
  NAV_GROUPS.forEach((g, gi) => {
    if (gi > 0) y += SB.groupGap;
    if (!collapsed) {
      labels.push({ y, text: g.label });
      y += SB.labelH;
    } else if (gi > 0) {
      labels.push({ y, text: "" });
      y += 9;
    }
    g.items.forEach((it, ii) => {
      if (ii > 0) y += SB.gap;
      items[it.key] = y;
      y += SB.itemH;
      if (it.subs && !collapsed) {
        const h = subsHeight(it.subs.length) * openAmount(it.key, f);
        subs[it.key] = { y, h };
        y += h;
      }
    });
  });
  return { items, subs, labels };
}

const Sidebar: React.FC<{ f: number; collapsed: boolean; height: number }> = ({ f, collapsed, height }) => {
  const { fps } = useVideoConfig();
  const beat = beatAt(f);
  const prev = BEATS[Math.max(0, BEATS.indexOf(beat) - 1)];
  const lay = navLayout(f, collapsed);
  const hop = beat === BEATS[0] ? 1 : uiSpring(f, fps, beat.from);
  const hiY = interpolate(hop, [0, 1], [lay.items[prev.page], lay.items[beat.page]]);
  const w = collapsed ? 52 : 185;
  const padX = collapsed ? 6 : 12;
  return (
    <div
      style={{
        width: w,
        height,
        flexShrink: 0,
        position: "relative",
        backgroundColor: ADMIN.surface,
        borderRight: `1px solid ${ADMIN.border}`,
        fontFamily: FONT.admin,
        overflow: "hidden",
      }}
    >
      <div style={{ height: SB.logoH, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? 0 : "0 16px" }}>
        <Img src={staticFile(img.logo)} style={{ width: collapsed ? 28 : 120, height: 28, objectFit: "contain", objectPosition: "left center" }} />
      </div>
      <div style={{ height: SB.helpH, padding: collapsed ? "0 6px 10px" : "0 10px 10px", borderBottom: `1px solid ${ADMIN.border}` }}>
        <div
          style={{
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 8,
            padding: "0 8px",
            borderRadius: ADMIN.r.sm,
            border: `1px solid ${ADMIN.clayBorder}`,
            backgroundColor: ADMIN.clayBg,
            color: ADMIN.textSecondary,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <Img src={staticFile(img.logo)} style={{ width: 20, height: 20, objectFit: "contain" }} />
          {collapsed ? null : "Need help?"}
        </div>
      </div>
      {lay.labels.map((l, i) =>
        l.text ? (
          <div key={i} style={{ position: "absolute", top: l.y, left: padX + 12, fontSize: 12, fontWeight: 500, color: ADMIN.textQuaternary, lineHeight: "16px" }}>
            {l.text}
          </div>
        ) : (
          <div key={i} style={{ position: "absolute", top: l.y, left: padX + 6, right: padX + 6, height: 1, backgroundColor: ADMIN.border }} />
        ),
      )}
      <div
        style={{
          position: "absolute",
          left: padX,
          right: padX,
          top: hiY,
          height: SB.itemH,
          borderRadius: ADMIN.r.sm,
          backgroundColor: ADMIN.accentLight,
          borderLeft: collapsed ? "none" : `2px solid ${ADMIN.accent}`,
        }}
      />
      {NAV_GROUPS.flatMap((g) => g.items).map((it) => {
        const on = it.key === beat.page;
        const Icon = it.icon;
        const color = on ? ADMIN.accent : ADMIN.textTertiary;
        const sub = lay.subs[it.key];
        return (
          <React.Fragment key={it.key}>
            <div
              style={{
                position: "absolute",
                left: padX,
                right: padX,
                top: lay.items[it.key],
                height: SB.itemH,
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 10,
                padding: collapsed ? 0 : "0 12px",
                fontSize: 14,
                fontWeight: 500,
                color,
              }}
            >
              <Icon size={16} color={color} style={{ flexShrink: 0 }} />
              {collapsed ? null : <span style={{ flex: 1 }}>{it.name}</span>}
              {!collapsed && it.subs ? (
                <ChevronDown size={12} color={color} style={{ transform: `rotate(${openAmount(it.key, f) * 180}deg)` }} />
              ) : null}
            </div>
            {sub && sub.h > 0.5 && it.subs ? (
              <div style={{ position: "absolute", left: padX + 12, right: padX, top: sub.y, height: sub.h, overflow: "hidden", display: "flex" }}>
                <div style={{ width: 1, backgroundColor: ADMIN.border, marginRight: 10, marginTop: 4, marginBottom: 2 }} />
                <div style={{ flex: 1, paddingTop: 4, display: "flex", flexDirection: "column", gap: 2, opacity: Math.min(1, sub.h / 30) }}>
                  {it.subs.map(([label, SubIcon], si) => {
                    const subOn = on && ACTIVE_SUB[it.key] === si;
                    const sc = subOn ? ADMIN.accent : ADMIN.textTertiary;
                    return (
                      <div
                        key={label}
                        style={{
                          height: SB.subRow,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "0 8px",
                          borderRadius: ADMIN.r.sm,
                          backgroundColor: subOn ? ADMIN.accentLight : "transparent",
                          fontSize: 12,
                          fontWeight: 500,
                          color: sc,
                        }}
                      >
                        <SubIcon size={14} color={sc} />
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Page enter from the demo's AnimatePresence: opacity 0, y 8 over 0.2s.
const pageEnter = (lf: number): React.CSSProperties => {
  const p = interpolate(lf, [0, 6], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  return { opacity: p, transform: `translateY(${(1 - p) * 8}px)` };
};
const fadeUp = (lf: number, fps: number, i: number): React.CSSProperties => {
  const p = uiSpring(lf, fps, 2 + i * 3);
  return { opacity: p, transform: `translateY(${(1 - p) * 14}px)` };
};

// ─── Dashboard (DemoAdminDashboardPage) ─────────────────────────────────────

const FOCUS_ICON: Record<string, LucideIcon> = { application: ClipboardList, schedule: Calendar, attendance: ClipboardList };
const DASH_PAD = 24;

const DashboardPage: React.FC<{ lf: number; cw: number }> = ({ lf, cw }) => {
  const { fps } = useVideoConfig();
  const scroll = interpolate(lf, [30, 64], [0, -150], { ...CLAMP, easing: SOFT_IN_OUT });
  return (
    <div style={{ width: cw, padding: DASH_PAD, transform: `translateY(${scroll}px)`, fontFamily: FONT.storyBody, ...pageEnter(lf) }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 20, ...fadeUp(lf, fps, 0) }}>
        <div>
          <StoryKicker admin>School workspace</StoryKicker>
          <StoryHeading size={30} style={{ marginTop: 6 }}>
            Good morning, Admin. ☀️
          </StoryHeading>
          <div style={{ marginTop: 8, fontSize: 13, color: STORY.muted }}>
            Here is {SCHOOL.name}&apos;s operating picture for {SCHOOL.weekday}.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              border: `1px solid ${STORY.cardBorder}`,
              backgroundColor: STORY.white,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: STORY.muted,
            }}
          >
            <CalendarDays size={13} color={STORY.kicker} />
            {SCHOOL.today}
          </div>
          <StoryButton label="Review admissions →" height={36} style={{ padding: "0 16px" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 15, marginBottom: 19 }}>
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${STORY.adminCardBorder}`,
            boxShadow: STORY.shadowCard,
            background: "linear-gradient(135deg, #FFFDF8, #EEF7EF)",
            padding: 22,
            ...fadeUp(lf, fps, 1),
          }}
        >
          <StoryKicker admin>Today&apos;s focus</StoryKicker>
          <StoryHeading size={23} style={{ marginTop: 6, letterSpacing: "-0.03em" }}>
            3 things need your attention
          </StoryHeading>
          <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.6, color: STORY.muted, maxWidth: 420 }}>
            Prioritize the work only you can do, then let the rest of the system stay organized in the background.
          </div>
          <div style={{ marginTop: 14 }}>
            {ADMIN_FOCUS.map((item, i) => {
              const Icon = FOCUS_ICON[item.icon];
              const p = uiSpring(lf, fps, 8 + i * 4);
              return (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 0",
                    borderTop: i === 0 ? "none" : "1px solid #E9EFEA",
                    opacity: p,
                    transform: `translateX(${(1 - p) * 16}px)`,
                  }}
                >
                  <div style={{ width: 31, height: 31, borderRadius: 10, backgroundColor: "#F8E5DE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color={STORY.primary} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: STORY.ink }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: STORY.muted }}>{item.subtitle}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: STORY.primary, flexShrink: 0 }}>{item.cta}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ borderRadius: 17, padding: 20, backgroundColor: STORY.primary, color: "#fff", ...fadeUp(lf, fps, 2) }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: "#C5E1CB" }}>School signal</div>
          <StoryHeading size={20} color="#fff" style={{ marginTop: 6, letterSpacing: "-0.01em" }}>
            {ADMIN_SIGNAL.headline}
          </StoryHeading>
          <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.6, color: "#D8E6DB" }}>{ADMIN_SIGNAL.body}</div>
          <div style={{ marginTop: 12, fontSize: 11, fontWeight: 800, color: "#D6EFD8" }}>{ADMIN_SIGNAL.cta}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 13, marginBottom: 19 }}>
        {ADMIN_METRICS.map((m, i) => (
          <div
            key={m.label}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 15,
              border: `1px solid ${STORY.adminCardBorder}`,
              backgroundColor: "#fff",
              padding: 15,
              ...fadeUp(lf, fps, 3 + i * 0.6),
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: STORY.metricAccent[m.accent] }} />
            <div style={{ fontFamily: FONT.story, fontWeight: 600, fontSize: 24, color: STORY.ink, marginBottom: 2 }}>
              {m.format(countUp(lf, 10 + i * 2, 22, m.value))}
            </div>
            <div style={{ fontSize: 11, color: STORY.muted }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: 16, border: `1px solid ${STORY.adminCardBorder}`, backgroundColor: "#fff", boxShadow: STORY.shadowCard, padding: 22, ...fadeUp(lf, fps, 6) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <StoryHeading size={24} style={{ letterSpacing: "-0.03em" }}>
            Today&apos;s attendance
          </StoryHeading>
          <StoryButton label="Preview attendance →" variant="soft" height={34} style={{ padding: "0 14px" }} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 12,
            border: "1px solid #EDF1ED",
            backgroundColor: ADMIN.elevated,
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          <ChevronLeft size={16} color={ADMIN.textSecondary} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: ADMIN.textPrimary }}>{SCHOOL.today}</div>
            <div style={{ fontSize: 11, color: ADMIN.textTertiary, marginTop: 2 }}>2 present · 1 absent · 1 picked up</div>
          </div>
          <ChevronRight size={16} color={ADMIN.textSecondary} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {ADMIN_ATTENDANCE.map((s, i) => (
            <StoryCard key={s.name} padding={16} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <StudentPhoto name={s.name} photo={[img.emma, img.noah, img.ava, img.liam][i]} size={48} radius={16} bg={STORY.childBg[i]} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                <StoryHeading size={15}>{s.name.split(" ")[0]}</StoryHeading>
                <AttendanceBadge status={s.status} />
              </div>
            </StoryCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Admissions / Submissions (LeadsListTab) ───────────────────────────────

const STATUS: Record<LeadStatus, { bg: string; border: string; text: string; label: string }> = {
  new: { bg: ADMIN.infoBg, border: ADMIN.infoBorder, text: ADMIN.info, label: "New" },
  contacted: { bg: ADMIN.accentLight, border: "rgba(94,124,104,0.3)", text: ADMIN.accent, label: "Contacted" },
  application_sent: { bg: ADMIN.purpleBg, border: ADMIN.purpleBorder, text: ADMIN.purple, label: "App Sent" },
  enrolled: { bg: ADMIN.successBg, border: ADMIN.successBorder, text: ADMIN.success, label: "Enrolled" },
  in_review: { bg: ADMIN.infoBg, border: ADMIN.infoBorder, text: ADMIN.info, label: "In Review" },
};

const StatusBadge: React.FC<{ status: LeadStatus; scale?: number }> = ({ status, scale = 1 }) => {
  const s = STATUS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
        transform: `scale(${scale})`,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

const leadCols = (vertical: boolean): [string, number][] =>
  vertical
    ? [["Form", 118], ["Name", 130], ["Child", 176], ["Status", 104], ["Date", 120]]
    : [["Form", 108], ["Name", 118], ["Contact", 128], ["Child", 150], ["Status", 90], ["Date", 101]];
const LEADS_TOOLBAR = 51;
const LEADS_HEAD = 41;
const LEADS_ROW = 61;

const riveraStatusPoint = (sb: number, vertical: boolean) => {
  const cols = leadCols(vertical);
  const x = cols.slice(0, cols.findIndex(([c]) => c === "Status")).reduce((a, [, w]) => a + w, 0);
  return { x: sb + x + 16 + 30, y: LEADS_TOOLBAR + LEADS_HEAD + LEADS_ROW + LEADS_ROW / 2 };
};

const AdmissionsPage: React.FC<{ lf: number; cw: number; vertical: boolean }> = ({ lf, cw, vertical }) => {
  const cols = leadCols(vertical);
  const insert = interpolate(lf, [8, 18], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const flash = interpolate(lf, [8, 44], [1, 0], CLAMP);
  const click = RIVERA_CLICK - 72;
  const enrolled = lf >= click;
  const pop = enrolled ? interpolate(lf, [click, click + 4, click + 10], [1, 1.25, 1], CLAMP) : 1;
  const riveraFlash = enrolled ? interpolate(lf, [click, click + 30], [1, 0], CLAMP) : 0;
  const counts: Record<string, number> = { new: 3, contacted: enrolled ? 1 : 2, enrolled: enrolled ? 2 : 1 };
  return (
    <div style={{ width: cw, height: "100%", backgroundColor: ADMIN.surface, fontFamily: FONT.admin, ...pageEnter(lf) }}>
      <div style={{ height: LEADS_TOOLBAR, display: "flex", alignItems: "center", gap: 6, padding: "0 20px", borderBottom: `1px solid ${ADMIN.border}` }}>
        {LEAD_FILTERS.slice(0, vertical ? 5 : 6).map((fl, i) => {
          const active = i === 0;
          const n = counts[fl.key] ?? fl.count;
          const bump = (fl.key === "enrolled" || fl.key === "contacted") && enrolled ? interpolate(lf, [click, click + 4, click + 10], [1, 1.15, 1], CLAMP) : 1;
          return (
            <div
              key={fl.key}
              style={{
                padding: "5px 10px",
                borderRadius: ADMIN.r.sm,
                fontSize: 12,
                fontWeight: 500,
                backgroundColor: active ? ADMIN.accent : ADMIN.accentLight,
                border: `1px solid ${active ? ADMIN.accent : ADMIN.secondaryBtnBorder}`,
                color: active ? "#fff" : ADMIN.accent,
                transform: `scale(${bump})`,
                whiteSpace: "nowrap",
              }}
            >
              {fl.label}
              <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, opacity: 0.7 }}>{n}</span>
            </div>
          );
        })}
        <div
          style={{
            marginLeft: "auto",
            width: 32,
            height: 32,
            borderRadius: ADMIN.r.sm,
            border: `1px solid ${ADMIN.border}`,
            backgroundColor: ADMIN.input,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ListFilter size={16} color={ADMIN.textSecondary} />
        </div>
      </div>
      <div style={{ height: LEADS_HEAD, display: "flex", alignItems: "center", borderBottom: `1px solid ${ADMIN.border}` }}>
        {cols.map(([c, w]) => (
          <div key={c} style={{ width: w, padding: "0 16px", fontSize: 12, fontWeight: 500, color: ADMIN.textTertiary }}>
            {c}
          </div>
        ))}
      </div>
      {LEADS.map((lead) => {
        const isNew = lead.isNew;
        const h = isNew ? LEADS_ROW * insert : LEADS_ROW;
        const status: LeadStatus = lead.rivera && enrolled ? "enrolled" : lead.status;
        const bg = isNew ? `rgba(46,74,60,${0.1 * flash})` : lead.rivera ? `rgba(22,163,74,${0.08 * riveraFlash})` : "transparent";
        return (
          <div
            key={lead.name}
            style={{
              height: h,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              borderBottom: `1px solid ${ADMIN.border}`,
              backgroundColor: bg,
              opacity: isNew ? insert : 1,
              transform: isNew ? `translateX(${(1 - insert) * 56}px)` : undefined,
            }}
          >
            {cols.map(([c, w]) => (
              <div key={c} style={{ width: w, padding: "0 16px", minWidth: 0, flexShrink: 0 }}>
                {c === "Form" ? (
                  <div style={{ fontSize: 12, fontWeight: 500, color: ADMIN.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.form}</div>
                ) : c === "Name" ? (
                  <div style={{ fontSize: 14, fontWeight: 500, color: ADMIN.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.name}</div>
                ) : c === "Contact" ? (
                  <div style={{ fontSize: 13, color: ADMIN.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.email}</div>
                ) : c === "Child" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    {lead.photo ? (
                      <StudentPhoto name={lead.child} photo={lead.photo} size={32} radius={16} />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: ADMIN.accentLight,
                          color: ADMIN.accent,
                          fontSize: 10,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {lead.child
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: ADMIN.textSecondary, whiteSpace: "nowrap" }}>{lead.child}</div>
                      <div style={{ fontSize: 11, color: ADMIN.textTertiary }}>{lead.childMeta}</div>
                    </div>
                  </div>
                ) : c === "Status" ? (
                  <StatusBadge status={status} scale={lead.rivera ? pop : 1} />
                ) : (
                  <div style={{ fontSize: 12, color: ADMIN.textTertiary, whiteSpace: "nowrap" }}>{lead.date}</div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ─── My School / My Students (StudentsPage) ─────────────────────────────────

const MS = { padX: 28, padY: 30, metricH: 76, gap: 19, filterH: 36, gap2: 15, head: 35, row: 58 };
const rosterCols = (vertical: boolean): [string, number][] =>
  vertical
    ? [["Student", 190], ["Grade", 52], ["Program", 120], ["Classroom", 110], ["Teacher", 120]]
    : [["Student", 200], ["Grade", 60], ["Program", 140], ["Classroom", 115], ["Teacher", 124]];
const emmaCell = (sb: number, vertical: boolean, col: "Classroom" | "Teacher") => {
  const cols = rosterCols(vertical);
  const x = cols.slice(0, cols.findIndex(([c]) => c === col)).reduce((a, [, w]) => a + w, 0);
  return { x: sb + MS.padX + x + 15 + 36, y: MS.padY + MS.metricH + MS.gap + MS.filterH + MS.gap2 + MS.head + MS.row / 2 };
};

const MyStudentsPage: React.FC<{ lf: number; cw: number; vertical: boolean; fps: number }> = ({ lf, cw, vertical, fps }) => {
  const cols = rosterCols(vertical);
  const a = PING_A - 144;
  const b = PING_B - 144;
  const classroomSet = lf >= a;
  const teacherSet = lf >= b;
  const needs = teacherSet ? 0 : classroomSet ? 1 : 2;
  const popA = classroomSet ? interpolate(lf, [a, a + 4, a + 10], [0.6, 1.2, 1], CLAMP) : 1;
  const popB = teacherSet ? interpolate(lf, [b, b + 4, b + 10], [0.6, 1.2, 1], CLAMP) : 1;
  const needsPop = (classroomSet ? interpolate(lf, [a, a + 4, a + 10], [1, 1.12, 1], CLAMP) : 1) * (teacherSet ? interpolate(lf, [b, b + 4, b + 10], [1, 1.12, 1], CLAMP) : 1);
  const rowFlash = Math.max(classroomSet ? interpolate(lf, [a, a + 26], [1, 0], CLAMP) : 0, teacherSet ? interpolate(lf, [b, b + 26], [1, 0], CLAMP) : 0);
  const metrics = [
    { value: "24", label: "All enrolled", accent: STORY.metricAccent.forest },
    { value: String(needs), label: "Needs attention", accent: STORY.metricAccent.gold, pop: needsPop },
    { value: "4", label: "Programs", accent: STORY.metricAccent.sky },
    { value: "3", label: "New enrollments", accent: STORY.metricAccent.berry },
  ];
  return (
    <div style={{ width: cw, padding: `${MS.padY}px ${MS.padX}px`, fontFamily: FONT.storyBody, backgroundColor: ADMIN.bg, height: "100%", ...pageEnter(lf) }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 13, height: MS.metricH, marginBottom: MS.gap }}>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 15,
              border: `1px solid ${STORY.adminCardBorder}`,
              backgroundColor: "#fff",
              padding: 15,
              ...fadeUp(lf, fps, i * 0.7),
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: m.accent }} />
            <div style={{ fontFamily: FONT.story, fontWeight: 600, fontSize: 24, color: STORY.ink, marginBottom: 2, transform: `scale(${m.pop ?? 1})`, transformOrigin: "left center" }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: STORY.muted }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ height: MS.filterH, marginBottom: MS.gap2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            ["All", "24", true],
            ["Unassigned", String(needs), false],
          ].map(([label, n, on]) => (
            <div
              key={String(label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: on ? STORY.primary : STORY.white,
                color: on ? "#fff" : STORY.muted,
                border: `1px solid ${on ? STORY.primary : "#DCE4DC"}`,
              }}
            >
              {label}
              <span style={{ opacity: 0.75, fontWeight: 600 }}>{n}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            flex: 1,
            maxWidth: 280,
            height: 34,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            borderRadius: 6,
            border: "1px solid #DCE4DC",
            backgroundColor: STORY.white,
            fontSize: 13,
            color: "#8B9699",
          }}
        >
          <Search size={14} color="#8B9699" />
          Search students, families, or email
        </div>
      </div>
      <div style={{ borderRadius: 16, border: `1px solid ${STORY.adminCardBorder}`, backgroundColor: "#fff", boxShadow: STORY.shadowCard, overflow: "hidden", ...fadeUp(lf, fps, 2) }}>
        <div style={{ height: MS.head, display: "flex", alignItems: "center", backgroundColor: "#FBFCFB" }}>
          {cols.map(([c, w]) => (
            <div key={c} style={{ width: w, padding: "0 15px", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B9699" }}>
              {c}
            </div>
          ))}
        </div>
        {ADMIN_ROSTER.map((s) => {
          const isEmma = "emma" in s && s.emma;
          const classroom = isEmma ? (classroomSet ? "Oak Room" : null) : s.classroom;
          const teacher = isEmma ? (teacherSet ? "Jordan Taylor" : null) : s.teacher;
          return (
            <div
              key={s.name}
              style={{
                height: MS.row,
                display: "flex",
                alignItems: "center",
                borderTop: "1px solid #EDF1ED",
                backgroundColor: isEmma ? `rgba(46,74,60,${0.04 + rowFlash * 0.08})` : "transparent",
              }}
            >
              {cols.map(([c, w]) => (
                <div key={c} style={{ width: w, padding: "0 15px", minWidth: 0, flexShrink: 0 }}>
                  {c === "Student" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <StudentPhoto name={s.name} photo={s.photo} size={32} radius={16} bg={ADMIN.accentLight} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#2C3E43", whiteSpace: "nowrap" }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: ADMIN.textTertiary, marginTop: 2, whiteSpace: "nowrap" }}>{s.family}</div>
                      </div>
                    </div>
                  ) : c === "Grade" ? (
                    <div style={{ fontSize: 12, color: "#607078" }}>{s.grade}</div>
                  ) : c === "Program" ? (
                    <div style={{ fontSize: 12, fontWeight: 600, color: STORY.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.program}</div>
                  ) : c === "Classroom" ? (
                    classroom ? (
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "3px 9px",
                          borderRadius: 999,
                          backgroundColor: ADMIN.accentLight,
                          color: ADMIN.accent,
                          fontSize: 11,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          transform: isEmma ? `scale(${popA})` : undefined,
                        }}
                      >
                        {classroom}
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 999, border: `1px dashed ${ADMIN.textQuaternary}`, color: ADMIN.textTertiary, fontSize: 11, fontWeight: 600 }}>
                        + Assign
                      </span>
                    )
                  ) : teacher ? (
                    <div style={{ fontSize: 12, color: STORY.ink, whiteSpace: "nowrap", transform: isEmma ? `scale(${popB})` : undefined, transformOrigin: "left center" }}>{teacher}</div>
                  ) : (
                    <div style={{ fontSize: 12, color: ADMIN.textQuaternary }}>—</div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Finances overview (BudgetPage) ─────────────────────────────────────────

const toneColor = (tone: string) => (ADMIN as unknown as Record<string, string>)[tone] ?? ADMIN.accent;
const STAT_ICON: LucideIcon[] = [DollarSign, Wallet, TrendingUp, Timer];

const RevenueChart: React.FC<{ width: number; draw: number }> = ({ width, draw }) => {
  const H = 170;
  const PAD = { top: 12, right: 16, bottom: 28, left: 48 };
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = 10200;
  const step = innerW / (MONTHLY_REVENUE.length - 1);
  const pt = (i: number, v: number) => [PAD.left + i * step, PAD.top + innerH - (v / max) * innerH] as const;
  const rev = MONTHLY_REVENUE.map((m, i) => pt(i, m.revenue));
  const exp = MONTHLY_REVENUE.map((m, i) => pt(i, m.expenses));
  const line = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line(rev)} L${rev[rev.length - 1][0]},${PAD.top + innerH} L${rev[0][0]},${PAD.top + innerH} Z`;
  const clipW = PAD.left + innerW * draw + 2;
  return (
    <svg width={width} height={H}>
      <defs>
        <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={ADMIN.accent} stopOpacity={0.2} />
          <stop offset="100%" stopColor={ADMIN.accent} stopOpacity={0} />
        </linearGradient>
        <clipPath id="revClip">
          <rect x={0} y={0} width={clipW} height={H} />
        </clipPath>
      </defs>
      {[0, 5000, 10000].map((v) => {
        const y = PAD.top + innerH - (v / max) * innerH;
        return (
          <g key={v}>
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y} y2={y} stroke={ADMIN.border} strokeWidth={0.6} strokeDasharray="3 4" />
            <text x={PAD.left - 8} y={y + 3} textAnchor="end" fontSize={10} fill={ADMIN.textQuaternary} fontFamily={FONT.admin}>
              {v === 0 ? "$0" : `$${v / 1000}k`}
            </text>
          </g>
        );
      })}
      {MONTHLY_REVENUE.map((m, i) => (
        <text key={m.month} x={PAD.left + i * step} y={H - 8} textAnchor="middle" fontSize={9} fill={ADMIN.textTertiary} fontFamily={FONT.admin}>
          {m.month}
        </text>
      ))}
      <g clipPath="url(#revClip)">
        <path d={area} fill="url(#revFill)" />
        <path d={line(exp)} fill="none" stroke={ADMIN.textQuaternary} strokeWidth={1.5} strokeDasharray="4 4" />
        <path d={line(rev)} fill="none" stroke={ADMIN.accent} strokeWidth={2} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

const FinancesPage: React.FC<{ lf: number; cw: number; vertical: boolean; fps: number }> = ({ lf, cw, vertical, fps }) => {
  const draw = interpolate(lf, [12, 46], [0, 1], { ...CLAMP, easing: SOFT_IN_OUT });
  const scroll = interpolate(lf, [36, 62], [0, vertical ? -60 : -125], { ...CLAMP, easing: SOFT_IN_OUT });
  const inner = cw - 48;
  return (
    <div style={{ width: cw, padding: 24, fontFamily: FONT.admin, backgroundColor: ADMIN.bg, transform: `translateY(${scroll}px)`, ...pageEnter(lf) }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {FIN_STATS.map((s, i) => {
          const Icon = STAT_ICON[i];
          const color = toneColor(s.tone);
          const v = countUp(lf, 4 + i * 2, 24, s.value);
          return (
            <div key={s.label} style={{ borderRadius: ADMIN.r.sm, padding: 16, backgroundColor: ADMIN.surface, border: `1px solid ${ADMIN.border}`, ...fadeUp(lf, fps, i * 0.6) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Icon size={14} color={color} />
                <div style={{ fontSize: 12, fontWeight: 500, color: ADMIN.textTertiary }}>{s.label}</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                ${Math.round(v).toLocaleString("en-US")}
                {s.suffix}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ borderRadius: ADMIN.r.lg, border: `1px solid ${ADMIN.border}`, backgroundColor: ADMIN.surface, boxShadow: ADMIN.shadowCard, padding: 20, marginBottom: 20, ...fadeUp(lf, fps, 2) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: ADMIN.textSecondary }}>Revenue vs Expenses</div>
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: ADMIN.textTertiary }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 2, backgroundColor: ADMIN.accent, borderRadius: 2 }} />
              Revenue
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, borderTop: `2px dashed ${ADMIN.textQuaternary}` }} />
              Expenses
            </span>
          </div>
        </div>
        <RevenueChart width={inner - 40} draw={draw} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: ADMIN.textSecondary, marginBottom: 14 }}>Category Spending</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${vertical ? 3 : 6}, 1fr)`, gap: 12 }}>
        {BUDGET_CATS.map((cat, i) => {
          const pct = Math.round((cat.actual / cat.planned) * 100);
          const over = cat.actual > cat.planned;
          const color = over ? ADMIN.error : toneColor(cat.tone);
          const r = 29;
          const circ = 2 * Math.PI * r;
          const p = interpolate(lf, [16 + i * 2.4, 46 + i * 2.4], [0, 1], { ...CLAMP, easing: EXPO_OUT });
          return (
            <div key={cat.name} style={{ borderRadius: ADMIN.r.sm, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: ADMIN.surface, border: `1px solid ${ADMIN.border}` }}>
              <div style={{ position: "relative", width: 64, height: 64, marginBottom: 10 }}>
                <svg width={64} height={64}>
                  <circle cx={32} cy={32} r={r} fill="none" stroke={ADMIN.border} strokeWidth={6} />
                  <circle
                    cx={32}
                    cy={32}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - (Math.min(pct, 100) / 100) * p)}
                    transform="rotate(-90 32 32)"
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{cat.emoji}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: ADMIN.textSecondary, textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap" }}>{cat.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 2 }}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Finance stutter + Rivera thread handoff ────────────────────────────────

const FinanceFlash: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const i = Math.min(2, Math.floor((f - FIN.from) / 5));
  const set = [
    { bg: SITE.bg, fg: C.forest, t: "$47,320", sub: "Total revenue · this school year" },
    { bg: C.forest, fg: C.cream, t: "$12,480", sub: "Collected this month" },
    { bg: C.clay, fg: "#fff", t: "Paid", sub: "Autopay · 31 families" },
  ][i];
  return (
    <AbsoluteFill style={{ backgroundColor: set.bg, overflow: "hidden", justifyContent: "center", paddingLeft: L.vertical ? 60 : 110 }}>
      <div
        style={{
          fontFamily: FONT.admin,
          fontWeight: 700,
          fontSize: L.vertical ? 230 : 400,
          letterSpacing: "-0.06em",
          lineHeight: 0.85,
          color: set.fg,
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
          transform: `translateX(${-(f - FIN.from - i * 5) * 12}px)`,
        }}
      >
        {set.t}
      </div>
      <div style={{ fontFamily: FONT.admin, fontWeight: 500, fontSize: L.vertical ? 40 : 34, color: set.fg, opacity: 0.8, marginTop: L.vertical ? 90 : 120, paddingLeft: 12 }}>{set.sub}</div>
    </AbsoluteFill>
  );
};

// White admin notification -> parent message bubble (same thread) -> soft reveal into the parent phone.
const ThreadMorph: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const { fps } = useVideoConfig();
  const start = FIN.to;
  const inP = uiSpring(f, fps, start);
  const m = interpolate(f, [MORPH, MORPH + 14], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const sent = f >= 322 ? uiSpring(f, fps, 322) : 0;
  const fly = interpolate(f, [FLOOD, 358], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const reveal = interpolate(f, [FLOOD, 360], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const k = L.vertical ? 1.5 : 1.35;
  const w = 460 * k;
  const target = L.vertical ? { x: L.cx, y: 560 } : { x: 1300, y: 240 };
  const dx = (target.x - L.cx) * fly;
  const dy = (target.y - L.cy) * fly;
  const alertA = 1 - Math.min(1, m * 2);
  const bubbleA = Math.max(0, m * 2 - 1);
  return (
    <AbsoluteFill>
      <Backdrop color={SITE.bg} light vignette={0.35} fog={SITE.bgAlt} fogOpacity={0.55} />
      <div
        style={{
          position: "absolute",
          left: L.cx,
          top: L.cy,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(46,74,60,0.10) 0%, rgba(46,74,60,0) 70%)`,
          transform: `translate(-50%, -50%) scale(${(reveal * Math.hypot(L.W, L.H)) / 10 * 1.2})`,
          opacity: 1 - reveal,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: L.cx - w / 2,
          top: L.cy - 60 * k,
          width: w,
          transform: `translate(${dx}px, ${dy}px) translateY(${(1 - inP) * 60}px) scale(${(0.92 + inP * 0.08) * (1 - fly * 0.45)})`,
          opacity: inP * (1 - interpolate(f, [350, 358], [0, 1], CLAMP)),
        }}
      >
        <div
          style={{
            position: "relative",
            height: 120 * k,
            borderRadius: interpolate(m, [0, 1], [8, 22]) * k,
            borderBottomLeftRadius: interpolate(m, [0, 1], [8, 6]) * k,
            backgroundColor: "#fff",
            border: `${k}px solid ${m < 0.5 ? SITE.border : STORY.cardBorder}`,
            boxShadow: "0 30px 70px rgba(43,36,29,0.14), 0 6px 18px rgba(43,36,29,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, padding: `${22 * k}px ${24 * k}px`, display: "flex", gap: 16 * k, alignItems: "center", opacity: alertA, fontFamily: FONT.admin }}>
            <div style={{ width: 44 * k, height: 44 * k, borderRadius: 8 * k, backgroundColor: ADMIN.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bell size={22 * k} color={ADMIN.accent} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11 * k, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: ADMIN.clay }}>Admin alert · Thread #218</div>
              <div style={{ fontSize: 19 * k, fontWeight: 600, color: ADMIN.textPrimary, marginTop: 4 * k }}>Rivera family is enrolled</div>
              <div style={{ fontSize: 12 * k, color: ADMIN.textTertiary, marginTop: 3 * k }}>Admissions · just now</div>
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, padding: `${20 * k}px ${22 * k}px`, display: "flex", gap: 14 * k, alignItems: "center", opacity: bubbleA, fontFamily: FONT.storyBody }}>
            <div
              style={{
                width: 40 * k,
                height: 40 * k,
                borderRadius: 99,
                backgroundColor: "#5E7C68",
                color: "#fff",
                fontSize: 14 * k,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              JT
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11 * k, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: STORY.kicker }}>Messages · Oak Room</div>
              <div style={{ fontSize: 19 * k, fontWeight: 600, color: STORY.ink, marginTop: 4 * k }}>Welcome to Oak Room, Emma!</div>
            </div>
            <div
              style={{
                width: 24 * k,
                height: 24 * k,
                borderRadius: 99,
                backgroundColor: STORY.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${sent})`,
                flexShrink: 0,
              }}
            >
              <Check size={14 * k} color="#fff" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.vertical ? L.safeTop + 40 : 150,
          display: "flex",
          justifyContent: "center",
          opacity: inP * (1 - fly),
        }}
      >
        <Kicker text={m < 0.5 ? "School Admin" : "Parent Portal"} color={C.clay} size={L.vertical ? 26 : 20} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Act ────────────────────────────────────────────────────────────────────

export const AdminAct: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const beat = beatAt(f);
  const lf = f - beat.from;
  const enter = interpolate(f, [0, 18], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const exitFrame = interpolate(f, [BEATS[3].to - 4, BEATS[3].to], [0, 1], { ...CLAMP, easing: EXPO_IN });
  const drift = interpolate(f, [0, 288], [8, -8]);

  if (f >= FIN.from && f < FIN.to) return <FinanceFlash f={f} L={L} />;
  if (f >= FIN.to) return <ThreadMorph f={f} L={L} />;

  const g = L.vertical
    ? { left: 40, top: 540, w: 1000, h: 800, dw: 700, collapsed: true }
    : { left: 660, top: 165, w: 1160, h: 730, dw: 880, collapsed: false };
  const sb = g.collapsed ? 52 : 185;
  const cw = g.dw - sb;
  const dh = g.h / (g.w / g.dw);
  const navX = g.collapsed ? 26 : 72;
  const navY = (key: string, at: number) => navLayout(at, g.collapsed).items[key] + SB.itemH / 2;
  const rivera = riveraStatusPoint(sb, L.vertical);
  const cellA = emmaCell(sb, L.vertical, "Classroom");
  const cellB = emmaCell(sb, L.vertical, "Teacher");
  const stops: CursorStop[] = [
    { at: 34, x: sb + cw - 110, y: 96 },
    { at: 68, x: navX, y: navY("leads", 60), click: true },
    { at: RIVERA_CLICK, x: rivera.x, y: rivera.y, click: true },
    { at: 140, x: navX, y: navY("myschool", 130), click: true },
    { at: PING_A, x: cellA.x, y: cellA.y, click: true },
    { at: PING_B, x: cellB.x, y: cellB.y, click: true },
    { at: 212, x: navX, y: navY("budget", 200), click: true },
    { at: 256, x: sb + cw * 0.62, y: 250 },
  ];

  const page =
    beat.page === "dashboard" ? (
      <DashboardPage lf={lf} cw={cw} />
    ) : beat.page === "leads" ? (
      <AdmissionsPage lf={lf} cw={cw} vertical={L.vertical} />
    ) : beat.page === "myschool" ? (
      <MyStudentsPage lf={lf} cw={cw} vertical={L.vertical} fps={fps} />
    ) : (
      <FinancesPage lf={lf} cw={cw} vertical={L.vertical} fps={fps} />
    );

  return (
    <AbsoluteFill>
      <Backdrop color={SITE.bg} light vignette={0.3} fog={SITE.bgAlt} fogOpacity={0.5} />
      <div
        style={{
          position: "absolute",
          left: g.left,
          top: g.top,
          transform: `translateY(${(1 - enter) * 90 + drift}px) scale(${0.96 + enter * 0.04 - exitFrame * 0.04})`,
          opacity: enter * (1 - exitFrame),
        }}
      >
        <DemoFrame width={g.w} height={g.h} designWidth={g.dw} background={ADMIN.bg}>
          <Sidebar f={f} collapsed={g.collapsed} height={dh} />
          <div key={beat.page} style={{ width: cw, height: dh, overflow: "hidden", position: "relative", backgroundColor: ADMIN.bg }}>
            {page}
          </div>
          <DemoCursor f={f} stops={stops} />
        </DemoFrame>
      </div>

      <div
        style={{
          position: "absolute",
          ...(L.vertical ? { left: 80, right: 80, top: L.safeTop + 50 } : { left: 110, top: 380, width: 500 }),
        }}
      >
        <Kicker text="School Admin" color={C.clay} size={L.vertical ? 26 : 20} style={{ marginBottom: 22, opacity: enter }} />
        {BEATS.map((b) => (
          <Super key={b.super} text={b.super} from={b.from + 2} to={b.to - 1} size={L.vertical ? 80 : 62} color={C.forest} style={{ position: "absolute" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
