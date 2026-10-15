import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { Calendar, Check, ChevronDown, Copy, Eye, FileText, Plus, Upload } from "lucide-react";
import { CLAMP, FONT } from "../../theme";
import {
  DEMO_NEWSLETTER_ACTIVE,
  DEMO_NEWSLETTER_COLLABORATORS,
  DEMO_NEWSLETTER_SECTIONS,
  DEMO_NEWSLETTER_TEACHER_UPDATES,
} from "../../../../../src/data/school-demos/demo-newsletter-editor-fixtures";
import {
  DEMO_NEWSLETTER_TEACHER_UPDATE_LIBRARY,
  type DemoTeacherUpdateLibraryItem,
} from "../../../../../src/data/school-demos/demo-newsletter-teacher-update-library";

// Port of NewsletterEditorDemoCanvas (teacherUpdates variant) and the Teacher
// Updates library card, at website CSS px, reading the site's own fixtures.

// Demo story theme with the MudKitchen accent (buildDemoParentThemeTokens).
const T = {
  ink: "#283943",
  muted: "#65777F",
  line: "#E4E8E1",
  white: "#FFFFFF",
  primary: "#2E4A3C",
  primarySoft: "rgba(46,74,60,0.12)",
  sage: "#CFE4D6",
  canvas: "#F7F9F7",
  label: "#98A39F",
  cardBorder: "#E0E7E0",
  shadowCard: "0 3px 10px rgba(50, 72, 61, 0.035)",
  soft: { bg: "#E8F2E9", fg: "#346A4E" },
  online: "#348457",
};
const body = FONT.storyBody;

// Site paths (/images/...) are mirrored under public/brand/ by sync-assets.
export const sitePhoto = (p?: string) => (p ? p.replace(/^\/images\//, "brand/") : undefined);

export const COVER_PHOTO = "brand/stock/ImageOne.webp";
export const UPDATE_ITEM: DemoTeacherUpdateLibraryItem = DEMO_NEWSLETTER_TEACHER_UPDATE_LIBRARY[0];
const SAM = DEMO_NEWSLETTER_TEACHER_UPDATES[0];

// Fixed layout so the ad can fly cards into exact slots.
export const NL = {
  head: 52,
  left: 200,
  right: 260,
  canvasPadX: 16,
  canvasPadTop: 12,
  heading: 28,
  buttonGap: 8,
  button: 34,
  cardsGap: 12,
  cardPad: 24,
  avatar: 36,
  textGap: 12,
  metaPad: 12,
  meta: 53,
  metaGap: 16,
  collab: 123,
  coverLabel: 23,
  coverEmpty: 30,
  coverFull: 128,
};

export const newsletterTargets = (dw: number) => {
  const canvasW = dw - NL.left - NL.right;
  const cardTop = NL.head + NL.canvasPadTop + NL.heading + NL.buttonGap + NL.button + NL.cardsGap;
  const textTop = cardTop + NL.cardPad + NL.avatar + NL.textGap;
  const textLeft = NL.left + NL.canvasPadX + NL.cardPad;
  const coverTop = NL.head + NL.metaPad + (NL.meta + NL.metaGap) * 2 + NL.collab + NL.metaGap + NL.coverLabel;
  return {
    samText: { x: textLeft, y: textTop, w: canvasW - NL.canvasPadX * 2 - NL.cardPad * 2, h: 96 },
    cover: { x: dw - NL.right + NL.metaPad, y: coverTop, w: NL.right - NL.metaPad * 2, h: NL.coverFull },
  };
};

const Avatar: React.FC<{ photo?: string; initials: string; size: number }> = ({ photo, initials, size }) =>
  photo ? (
    <Img src={staticFile(photo)} style={{ width: size, height: size, borderRadius: 999, objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: "#827096",
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );

const MetaLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: T.label, lineHeight: "15px" }}>
    {children}
  </div>
);

const MetaField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ height: NL.meta }}>
    <MetaLabel>{label}</MetaLabel>
    <div
      style={{
        marginTop: 4,
        borderRadius: 6,
        border: "1px solid #E2E8F0",
        padding: "8px 10px",
        fontSize: 12,
        fontWeight: 500,
        color: "#1e141f",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {value}
    </div>
  </div>
);

// `updateFill` (0-1) types Sam's copied update into his card; `photoFill` drops
// the classroom photo into the cover image slot.
export const NewsletterEditor: React.FC<{ dw: number; height: number; updateFill: number; photoFill: number }> = ({
  dw,
  height,
  updateFill,
  photoFill,
}) => {
  const canvasW = dw - NL.left - NL.right;
  const coverH = NL.coverEmpty + (NL.coverFull - NL.coverEmpty) * photoFill;
  const flash = interpolate(updateFill, [0.6, 1], [1, 0], CLAMP) * (updateFill > 0 ? 1 : 0);
  return (
    <div style={{ width: dw, height, display: "flex", flexDirection: "column", fontFamily: body, backgroundColor: T.white }}>
      <div style={{ height: NL.head, flexShrink: 0, padding: "12px 16px 0", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ height: NL.head - 13, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14, fontWeight: 600, minWidth: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: T.muted, whiteSpace: "nowrap" }}>
              {DEMO_NEWSLETTER_ACTIVE.title}
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </span>
            <span style={{ color: T.primary, borderBottom: `2px solid ${T.primary}`, paddingBottom: 8, marginTop: 10 }}>Editor</span>
            {dw > 800 ? (
              <span style={{ color: T.muted, whiteSpace: "nowrap" }}>
                Change log
                <span style={{ marginLeft: 6, borderRadius: 6, padding: "2px 6px", fontSize: 10, backgroundColor: T.primarySoft, color: T.primary }}>15</span>
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {dw > 800 ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 6, border: `1px solid ${T.line}`, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: T.muted }}>
                <Calendar size={14} />
                {DEMO_NEWSLETTER_ACTIVE.dateRange}
              </span>
            ) : null}
            <span style={{ display: "inline-flex", borderRadius: 10, padding: "7px 10px", backgroundColor: T.soft.bg, color: T.soft.fg }}>
              <Eye size={14} />
            </span>
            <span style={{ borderRadius: 10, padding: "8px 13px", fontSize: 12, fontWeight: 700, backgroundColor: T.primary, color: T.white }}>Publish</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <div style={{ width: NL.left, flexShrink: 0, padding: 12, borderRight: `1px solid ${T.line}`, backgroundColor: T.canvas }}>
          <MetaLabel>In this newsletter</MetaLabel>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
            {DEMO_NEWSLETTER_SECTIONS.map((s, i) => {
              const on = s.id === "class-updates";
              return (
                <div
                  key={s.id}
                  style={{
                    borderRadius: 6,
                    border: `1px solid ${on ? T.sage : "transparent"}`,
                    backgroundColor: on ? T.primarySoft : "transparent",
                    color: on ? T.primary : T.muted,
                    fontWeight: on ? 700 : 500,
                    padding: "8px 10px",
                  }}
                >
                  <span style={{ marginRight: 6, fontSize: 11, opacity: 0.7 }}>{i + 1}.</span>
                  {s.label}
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: T.primarySoft,
              color: T.primary,
            }}
          >
            <Plus size={14} />
            Add section
          </div>
        </div>

        <div style={{ width: canvasW, flexShrink: 0, padding: `${NL.canvasPadTop}px ${NL.canvasPadX}px`, backgroundColor: T.canvas, overflow: "hidden" }}>
          <div style={{ height: NL.heading, fontFamily: FONT.story, fontWeight: 600, fontSize: 20, letterSpacing: "-0.03em", color: T.ink, lineHeight: `${NL.heading}px` }}>
            Class Updates
          </div>
          <div style={{ marginTop: NL.buttonGap, height: NL.button, display: "flex" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 10,
                padding: "0 13px",
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: T.soft.bg,
                color: T.soft.fg,
              }}
            >
              <FileText size={14} />
              View Teacher Updates
            </span>
          </div>
          <div style={{ marginTop: NL.cardsGap, display: "flex", flexDirection: "column", gap: 12 }}>
            {DEMO_NEWSLETTER_TEACHER_UPDATES.map((t) => {
              const isSam = t.id === SAM.id;
              const text = isSam ? (updateFill > 0 ? SAM.preview : undefined) : t.preview;
              const noUpdate = !t.hasUpdate && !t.preview;
              return (
                <div
                  key={t.id}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${T.cardBorder}`,
                    backgroundColor: T.white,
                    boxShadow: T.shadowCard,
                    padding: NL.cardPad,
                  }}
                >
                  <div style={{ height: NL.avatar, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar photo={sitePhoto(t.photoUrl)} initials={t.initials} size={NL.avatar} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{t.name}</span>
                    </div>
                    {noUpdate ? (
                      <span style={{ borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 600, backgroundColor: "rgba(124,58,237,0.08)", color: "#7C3AED", whiteSpace: "nowrap" }}>
                        No update yet
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      marginTop: NL.textGap,
                      minHeight: 96,
                      borderRadius: 6,
                      border: `1px solid ${isSam && flash > 0 ? "rgba(46,74,60,0.45)" : T.line}`,
                      backgroundColor: isSam && flash > 0 ? `rgba(232,242,233,${flash})` : T.white,
                      padding: "10px 12px",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: text ? T.ink : T.muted,
                    }}
                  >
                    {text ? (
                      <span style={{ opacity: isSam ? interpolate(updateFill, [0, 0.5], [0, 1], CLAMP) : 1 }}>{text}</span>
                    ) : (
                      `${t.name.split(" ")[0]}'s update for this week…`
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ width: NL.right, flexShrink: 0, padding: NL.metaPad, borderLeft: `1px solid ${T.line}`, backgroundColor: T.white, display: "flex", flexDirection: "column", gap: NL.metaGap }}>
          <MetaField label="Newsletter title" value={DEMO_NEWSLETTER_ACTIVE.title} />
          <MetaField label="Week" value={DEMO_NEWSLETTER_ACTIVE.dateRange} />
          <div style={{ height: NL.collab }}>
            <MetaLabel>Collaborators</MetaLabel>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {DEMO_NEWSLETTER_COLLABORATORS.map((p) => (
                <div key={p.id} style={{ height: 28, display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: T.ink }}>
                  <Avatar photo={sitePhoto(p.photoUrl)} initials={p.initials} size={28} />
                  <span>
                    {p.name}
                    {p.isYou ? " (You)" : ""}
                  </span>
                  <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: 99, backgroundColor: p.online ? T.online : T.line }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ height: NL.coverLabel - 8 }}>
              <MetaLabel>Cover image</MetaLabel>
            </div>
            <div
              style={{
                marginTop: 8,
                height: coverH,
                position: "relative",
                overflow: "hidden",
                borderRadius: 6,
                border: `1px ${photoFill > 0.5 ? "solid" : "dashed"} ${T.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {photoFill < 1 ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: T.ink, opacity: 1 - photoFill }}>
                  <Upload size={14} color={T.primary} />
                  Drag or upload photo
                </span>
              ) : null}
              <Img src={staticFile(COVER_PHOTO)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: photoFill }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// One Teacher Updates library card (NewsletterTeacherUpdatesImportModal, "All" tab).
export const TeacherUpdateCard: React.FC<{ copied: boolean; width: number }> = ({ copied, width }) => (
  <div
    style={{
      width,
      borderRadius: 6,
      border: `1px solid ${T.line}`,
      backgroundColor: T.white,
      padding: "6px 8px 8px",
      fontFamily: body,
    }}
  >
    <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, marginBottom: 4 }}>{UPDATE_ITEM.teacherName}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Avatar photo={sitePhoto(UPDATE_ITEM.studentPhotoUrl)} initials="NC" size={28} />
      <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 600, color: T.ink }}>For {UPDATE_ITEM.studentName}</div>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          borderRadius: 10,
          padding: "2px 6px",
          fontSize: 10,
          fontWeight: 700,
          backgroundColor: copied ? T.soft.bg : T.white,
          color: T.primary,
          border: "1px solid #B9CDBD",
        }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </span>
    </div>
    <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.4, color: T.muted }}>{UPDATE_ITEM.preview}</div>
  </div>
);
