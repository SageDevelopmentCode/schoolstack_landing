"use client";

import { Clock, Users, Video } from "lucide-react";
import { DEMO_BOOKING_STORY_COPY } from "@/lib/marketing/demo-booking-story-copy";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 mt-1"
      aria-hidden
    >
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MeetingMetaRow({
  theme,
  variant,
}: {
  theme: ParentThemeTokens;
  variant: "mobile" | "desktop";
}) {
  const copy = DEMO_BOOKING_STORY_COPY;
  const metaOnGreen = "#E5EFE7";
  const items = [
    { icon: Clock, label: copy.meetingDuration },
    { icon: Video, label: copy.meetingVideo },
    ...(variant === "desktop"
      ? [{ icon: Users, label: copy.meetingBuiltAround }]
      : []),
  ];
  const color = variant === "desktop" ? metaOnGreen : theme.muted;
  const wrapClass =
    variant === "desktop" ? "flex flex-col gap-2.5" : "flex flex-wrap gap-x-5 gap-y-1";

  return (
    <div className={wrapClass}>
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="flex items-center gap-2 text-[11px]"
          style={{ color }}
        >
          <Icon size={14} className="shrink-0" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

export function DemoBookingContextColumn({ theme }: { theme: ParentThemeTokens }) {
  const copy = DEMO_BOOKING_STORY_COPY;
  const accentOnGreen = "#BDDEC4";
  const textOnGreen = "#E1ECE4";

  return (
    <aside
      className="flex flex-col lg:min-h-full border-b lg:border-b-0 lg:border-r"
      style={{
        backgroundColor: theme.cream,
        borderColor: theme.line,
        fontFamily: theme.fontBody,
      }}
    >
      <div
        className="lg:hidden p-5 border-b"
        style={{ borderColor: theme.line, backgroundColor: theme.cream }}
      >
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <div>
            <div
              className="text-[9px] font-extrabold uppercase tracking-[0.13em]"
              style={{ color: theme.sage }}
            >
              {copy.contextKicker}
            </div>
            <h2
              className="text-[23px] font-medium leading-tight mt-1"
              style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
            >
              {copy.contextTitle}
            </h2>
          </div>
          <MeetingMetaRow theme={theme} variant="mobile" />
        </div>
      </div>

      <div
        className="hidden lg:flex flex-col flex-1 p-7 text-white"
        style={{ backgroundColor: theme.primary }}
      >
        <div
          className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
          style={{ color: accentOnGreen }}
        >
          {copy.contextKicker}
        </div>
        <h2
          className="text-[29px] font-medium leading-tight mt-3"
          style={{ fontFamily: theme.fontDisplay, letterSpacing: "-0.035em" }}
        >
          {copy.contextTitle}
        </h2>
        <p className="text-[12px] leading-[1.9] mt-3.5" style={{ color: "#D8E6DB" }}>
          {copy.contextIntro}
        </p>

        <div
          className="py-4 mt-1 border-b"
          style={{ borderColor: "rgba(255,255,255,0.17)" }}
        >
          <MeetingMetaRow theme={theme} variant="desktop" />
        </div>

        <div className="mt-6">
          <div
            className="text-[9px] font-extrabold uppercase tracking-[0.12em]"
            style={{ color: accentOnGreen }}
          >
            {copy.coverSectionLabel}
          </div>
          <ul className="list-none p-0 m-0 mt-3 space-y-3">
            {copy.coverBullets.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-[11px] leading-[1.8]"
                style={{ color: textOnGreen }}
              >
                <span style={{ color: accentOnGreen }}>
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
