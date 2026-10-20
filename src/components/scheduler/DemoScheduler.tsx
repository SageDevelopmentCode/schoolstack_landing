"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import {
  CalendarGrid,
  type CalendarGridColors,
} from "@/components/scheduler/CalendarGrid";
import { DemoBookingContextColumn } from "@/components/scheduler/DemoBookingContextColumn";
import { DemoBookingFooter } from "@/components/scheduler/DemoBookingFooter";
import { DemoTimezoneSelect } from "@/components/scheduler/DemoTimezoneSelect";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import {
  todayKeyInTimezone,
  todayMonthYearInTimezone,
  formatOrganizationTimezoneLabel,
} from "@/lib/admissions/admissions-availability";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  MONTH_NAMES,
  formatSelectedDate,
  SCHEDULER_TIMEZONE,
} from "@/lib/demo-scheduler";
import {
  buildDisplayAvailabilitySlots,
  classifyDemoSlotPeriod,
  firstAvailableDisplayDemoDate,
  type DemoDisplaySlot,
  type DemoSlotPeriod,
} from "@/lib/demo-scheduler-timezone";
import { DEMO_BOOKING_STORY_COPY } from "@/lib/marketing/demo-booking-story-copy";
import {
  detectBrowserTimezone,
  resolveDemoDisplayTimezoneOptions,
} from "@/lib/marketing/demo-timezone-options";
import { SITE_NAME } from "@/lib/site";
import type { DemoSchedulerBooking } from "@/components/scheduler/demo-scheduler-types";

export type { DemoSchedulerBooking } from "@/components/scheduler/demo-scheduler-types";

const ease = [0.16, 1, 0.3, 1] as const;

function displaySlotKey(slot: DemoDisplaySlot): string {
  return `${slot.canonicalDate}|${slot.canonicalTime}`;
}

function storyCalendarColors(theme: ParentThemeTokens): CalendarGridColors {
  return {
    accent: theme.primary,
    accentLight: theme.primaryLight,
    text: theme.ink,
    textFaint: theme.muted,
    textSecondary: theme.muted,
    border: theme.line,
    bg: theme.white,
    warning: theme.warning,
    warningBg: theme.warningBg,
  };
}

type SlotPeriodFilter = "all" | DemoSlotPeriod;

function TimeSlotList({
  dateStr,
  displaySlots,
  selectedSlotKey,
  onSelectSlot,
  onConfirm,
  isSubmitting,
  preview,
  confirmDisabled,
  storyTheme,
  displayTimezone,
  storyLayout = false,
  useInlineConfirm = true,
  activePeriod = "all",
  onPeriodChange,
  periodOptions,
}: {
  dateStr: string | null;
  displaySlots: DemoDisplaySlot[];
  selectedSlotKey: string | null;
  onSelectSlot: (key: string) => void;
  onConfirm?: (booking: DemoSchedulerBooking) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
  storyTheme?: ParentThemeTokens;
  displayTimezone: string;
  storyLayout?: boolean;
  useInlineConfirm?: boolean;
  activePeriod?: SlotPeriodFilter;
  onPeriodChange?: (period: SlotPeriodFilter) => void;
  periodOptions?: SlotPeriodFilter[];
}) {
  const copy = DEMO_BOOKING_STORY_COPY;
  const timezoneLabel = formatOrganizationTimezoneLabel(displayTimezone);
  const selectedSlot = displaySlots.find(
    (s) => displaySlotKey(s) === selectedSlotKey,
  );

  const faintTextClass = storyTheme
    ? ""
    : "font-secondary text-text-faint";
  const faintTextStyle = storyTheme
    ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
    : undefined;

  const periodLabels: Record<SlotPeriodFilter, string> = {
    all: copy.periodAll,
    morning: copy.periodMorning,
    afternoon: copy.periodAfternoon,
    evening: copy.periodEvening,
  };

  return (
    <div
      className={`flex flex-col md:h-full min-h-[280px] ${storyLayout ? "p-5 md:p-6" : "p-4"}`}
      style={storyLayout ? { backgroundColor: "#FCFDFB", fontFamily: storyTheme?.fontBody } : undefined}
    >
      <div className="mb-3 space-y-1">
        {!storyLayout ? (
          <div
            className={`mb-0.5 text-[10px] font-medium uppercase tracking-widest ${storyTheme ? "" : "font-secondary text-text-faint"}`}
            style={
              storyTheme
                ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
                : undefined
            }
          >
            Select a time
          </div>
        ) : null}
        {dateStr ? (
          <>
            <div
              className={`${storyLayout ? "text-[13px] font-bold leading-snug" : "text-[12px] font-medium leading-snug"} ${storyTheme ? "" : "font-secondary text-text"}`}
              style={
                storyTheme
                  ? { color: storyTheme.ink, fontFamily: storyTheme.fontBody }
                  : undefined
              }
            >
              {formatSelectedDate(dateStr)}
            </div>
            <p
              className={`${storyLayout ? "text-[10px]" : "text-[11px]"} ${faintTextClass}`}
              style={faintTextStyle}
            >
              {timezoneLabel}
            </p>
          </>
        ) : (
          <p className={`text-[12px] leading-snug ${faintTextClass}`} style={faintTextStyle}>
            Select a highlighted date to see available times.
          </p>
        )}
      </div>

      {storyLayout && periodOptions && periodOptions.length > 1 && dateStr ? (
        <div
          className="flex p-0.5 rounded-lg gap-0.5 mt-2 mb-1 overflow-x-auto"
          style={{ backgroundColor: "#EAF2EB" }}
          role="group"
          aria-label="Filter times by period"
        >
          {periodOptions.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => onPeriodChange?.(period)}
              className="flex-1 min-w-0 border-0 py-1.5 px-1 text-[9px] font-bold rounded-[5px] transition-shadow"
              style={{
                fontFamily: storyTheme?.fontBody,
                backgroundColor: activePeriod === period ? storyTheme?.white : "transparent",
                color: activePeriod === period ? storyTheme?.primary : "#728079",
                boxShadow: activePeriod === period ? "0 1px 4px #dbe2dc" : undefined,
              }}
              aria-pressed={activePeriod === period}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={`flex-1 overflow-y-auto ${storyLayout ? "grid grid-cols-2 gap-2 mt-3 content-start" : "flex flex-col gap-1.5"}`}
      >
        {!dateStr ? null : displaySlots.length === 0 ? (
          <p
            className={`text-center py-4 text-[13px] ${storyTheme ? "" : "text-text-faint font-secondary"}`}
            style={faintTextStyle}
          >
            No times available for this date.
          </p>
        ) : (
          displaySlots.map((slot) => {
            const key = displaySlotKey(slot);
            const isSelected = selectedSlotKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectSlot(key)}
                className={
                  storyLayout
                    ? "min-h-[38px] border text-[11px] font-semibold transition-all duration-150 cursor-pointer rounded-[10px] py-2.5 px-1"
                    : storyTheme
                    ? "w-full h-10 border-2 text-[13px] font-semibold transition-all duration-150 cursor-pointer"
                    : `w-full h-10 rounded-lg border-2 text-[13px] font-medium font-secondary transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "border-accent bg-accent text-white"
                          : "border-border text-text hover:border-accent hover:text-accent"
                      }`
                }
                style={
                  storyLayout && storyTheme
                    ? {
                        fontFamily: storyTheme.fontBody,
                        borderColor: isSelected ? storyTheme.primary : "#D9E3D6",
                        backgroundColor: isSelected ? storyTheme.primary : storyTheme.white,
                        color: isSelected ? storyTheme.white : "#466251",
                        boxShadow: isSelected ? "0 2px 6px rgba(32,55,49,0.08)" : undefined,
                      }
                    : storyTheme
                    ? {
                        fontFamily: storyTheme.fontBody,
                        borderRadius: storyTheme.radiusButton,
                        borderColor: isSelected ? storyTheme.primary : storyTheme.line,
                        backgroundColor: isSelected ? storyTheme.primary : storyTheme.white,
                        color: isSelected ? storyTheme.white : storyTheme.ink,
                      }
                    : undefined
                }
              >
                {slot.displayTime}
              </button>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {useInlineConfirm && selectedSlot && (
          <motion.div
            key="confirm-btn"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
            className={`mt-3 pt-3 border-t ${storyTheme ? "" : "border-border"}`}
            style={storyTheme ? { borderColor: storyTheme.line } : undefined}
          >
            <button
              type="button"
              disabled={isSubmitting || preview || confirmDisabled}
              onClick={() => {
                if (selectedSlot && onConfirm) {
                  onConfirm({
                    date: selectedSlot.canonicalDate,
                    time: selectedSlot.canonicalTime,
                    displayTimezone,
                  });
                }
              }}
              className={
                storyTheme
                  ? `w-full h-10 text-white text-[13px] font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${BUTTON_LOADING_LAYOUT_CLASS}`
                  : `w-full h-10 rounded-pill text-white text-[13px] font-medium font-secondary hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${BUTTON_LOADING_LAYOUT_CLASS}`
              }
              style={{
                backgroundColor: storyTheme
                  ? storyTheme.primary
                  : "var(--color-clay)",
                borderRadius: storyTheme?.radiusButton,
                fontFamily: storyTheme?.fontBody,
              }}
            >
              {preview ? (
                "Preview only"
              ) : (
                <ButtonLoadingLabel loading={Boolean(isSubmitting)} loadingLabel="Booking…">
                  Confirm
                </ButtonLoadingLabel>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DemoMetaRow({
  storyTheme,
  durationMinutes,
}: {
  storyTheme?: ParentThemeTokens;
  durationMinutes: number;
}) {
  const mutedClass = storyTheme
    ? "text-[12px] font-semibold"
    : "text-[12px] font-secondary text-text-muted";
  const mutedStyle = storyTheme
    ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
    : undefined;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className={`flex items-center gap-1.5 ${mutedClass}`} style={mutedStyle}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {durationMinutes} min
      </span>
      <span className={`flex items-center gap-1.5 ${mutedClass}`} style={mutedStyle}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
          <rect x="1" y="3.5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9 6l3.5-2v6L9 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Video call
      </span>
    </div>
  );
}

function DemoSchedulerHeader({
  storyTheme,
  durationMinutes,
  titleStyle,
  borderColor,
  displayTimezone,
  timezoneOptions,
  onDisplayTimezoneChange,
}: {
  storyTheme?: ParentThemeTokens;
  durationMinutes: number;
  titleStyle: CSSProperties;
  borderColor?: string;
  displayTimezone: string;
  timezoneOptions: ReturnType<typeof resolveDemoDisplayTimezoneOptions>;
  onDisplayTimezoneChange: (tz: string) => void;
}) {
  return (
    <header
      className={`border-b p-4 md:p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ${storyTheme ? "" : "border-border"}`}
      style={borderColor ? { borderColor } : undefined}
    >
      <div className="min-w-0 flex flex-col gap-1">
        <div
          className={`text-[10px] font-medium uppercase tracking-widest ${storyTheme ? "" : "font-secondary text-text-faint"}`}
          style={
            storyTheme
              ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
              : undefined
          }
        >
          {SITE_NAME}
        </div>
        <div
          className={storyTheme ? "leading-snug" : "font-display leading-snug text-text"}
          style={titleStyle}
        >
          Demo Call
        </div>
        <DemoMetaRow storyTheme={storyTheme} durationMinutes={durationMinutes} />
      </div>

      <div className="w-full lg:max-w-[240px] shrink-0">
        <DemoTimezoneSelect
          value={displayTimezone}
          options={timezoneOptions}
          onChange={onDisplayTimezoneChange}
          storyTheme={storyTheme}
          id="demo-display-timezone-header"
        />
      </div>
    </header>
  );
}

function DemoSchedulerStoryHeader({
  theme,
  displayTimezone,
  timezoneOptions,
  onDisplayTimezoneChange,
}: {
  theme: ParentThemeTokens;
  displayTimezone: string;
  timezoneOptions: ReturnType<typeof resolveDemoDisplayTimezoneOptions>;
  onDisplayTimezoneChange: (tz: string) => void;
}) {
  const copy = DEMO_BOOKING_STORY_COPY;
  return (
    <header
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-6 py-5 border-b"
      style={{ borderColor: theme.line, fontFamily: theme.fontBody }}
    >
      <div className="min-w-0">
        <h2
          className="text-[25px] font-medium leading-tight"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink, letterSpacing: "-0.035em" }}
        >
          {copy.schedulerTitle}
        </h2>
        <p className="text-[11px] leading-[1.8] mt-1.5" style={{ color: theme.muted }}>
          {copy.schedulerSubtitle}
        </p>
      </div>
      <div className="w-full sm:max-w-[235px] shrink-0">
        <DemoTimezoneSelect
          value={displayTimezone}
          options={timezoneOptions}
          onChange={onDisplayTimezoneChange}
          storyTheme={theme}
          id="demo-display-timezone-story"
        />
      </div>
    </header>
  );
}

function initialDemoSchedulerView(
  displaySlots: Record<string, DemoDisplaySlot[]>,
  minDisplayDate: string | null,
  displayTimezone: string,
) {
  const first = firstAvailableDisplayDemoDate(displaySlots, minDisplayDate);
  if (!first) {
    const { year, month } = todayMonthYearInTimezone(displayTimezone);
    return { viewYear: year, viewMonth: month, selectedDate: null as string | null };
  }
  const [y, m] = first.split("-").map(Number);
  return { viewYear: y, viewMonth: m - 1, selectedDate: first };
}

function isCurrentMonthInTimezone(
  year: number,
  month: number,
  displayTimezone: string,
) {
  const { year: y, month: m } = todayMonthYearInTimezone(displayTimezone);
  return year === y && month === m;
}

type DemoSchedulerCalendarProps = {
  onConfirm?: (booking: DemoSchedulerBooking) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
  storyTheme?: ParentThemeTokens;
  displayTimezone: string;
  displaySlots: Record<string, DemoDisplaySlot[]>;
  minDisplayDate: string | null;
  timezoneOptions: ReturnType<typeof resolveDemoDisplayTimezoneOptions>;
  onDisplayTimezoneChange: (timezone: string) => void;
};

function DemoSchedulerCalendar({
  onConfirm,
  isSubmitting,
  preview = false,
  confirmDisabled = false,
  storyTheme,
  displayTimezone,
  displaySlots,
  minDisplayDate,
  timezoneOptions,
  onDisplayTimezoneChange,
}: DemoSchedulerCalendarProps) {
  const initialView = initialDemoSchedulerView(
    displaySlots,
    minDisplayDate,
    displayTimezone,
  );
  const [viewYear, setViewYear] = useState(initialView.viewYear);
  const [viewMonth, setViewMonth] = useState(initialView.viewMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialView.selectedDate,
  );
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [slotPeriod, setSlotPeriod] = useState<SlotPeriodFilter>("all");

  const today = todayKeyInTimezone(displayTimezone);
  const availableDates = new Set(Object.keys(displaySlots));
  const selectedDaySlots = useMemo(
    () => (selectedDate ? displaySlots[selectedDate] ?? [] : []),
    [selectedDate, displaySlots],
  );

  const periodOptions = useMemo((): SlotPeriodFilter[] => {
    if (!storyTheme || selectedDaySlots.length === 0) return ["all"];
    const periods = new Set<DemoSlotPeriod>();
    for (const slot of selectedDaySlots) {
      periods.add(classifyDemoSlotPeriod(slot, displayTimezone));
    }
    const ordered: SlotPeriodFilter[] = ["all"];
    if (periods.has("morning")) ordered.push("morning");
    if (periods.has("afternoon")) ordered.push("afternoon");
    if (periods.has("evening")) ordered.push("evening");
    return ordered;
  }, [storyTheme, selectedDaySlots, displayTimezone]);

  const filteredDaySlots = useMemo(() => {
    if (slotPeriod === "all") return selectedDaySlots;
    return selectedDaySlots.filter(
      (slot) => classifyDemoSlotPeriod(slot, displayTimezone) === slotPeriod,
    );
  }, [selectedDaySlots, slotPeriod, displayTimezone]);

  const selectedBooking = useMemo((): DemoSchedulerBooking | null => {
    if (!selectedSlotKey) return null;
    const slot = selectedDaySlots.find((s) => displaySlotKey(s) === selectedSlotKey);
    if (!slot) return null;
    return {
      date: slot.canonicalDate,
      time: slot.canonicalTime,
      displayTimezone,
    };
  }, [selectedSlotKey, selectedDaySlots, displayTimezone]);

  const durationMinutes = storyTheme ? 20 : 30;
  const calendarColors = storyTheme ? storyCalendarColors(storyTheme) : undefined;
  const borderColor = storyTheme?.line;

  function handleDisplayTimezoneChange(tz: string) {
    onDisplayTimezoneChange(tz);
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedSlotKey(null);
    setSlotPeriod("all");
  }

  function prevMonth() {
    if (isCurrentMonthInTimezone(viewYear, viewMonth, displayTimezone)) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDate(null);
    setSelectedSlotKey(null);
    setSlotPeriod("all");
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDate(null);
    setSelectedSlotKey(null);
    setSlotPeriod("all");
  }

  const titleStyle = storyTheme
    ? {
        fontFamily: storyTheme.fontDisplay,
        color: storyTheme.ink,
        fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
      }
    : { fontSize: "clamp(1rem, 2.5vw, 1.15rem)" };

  const timeSlotListProps = {
    dateStr: selectedDate,
    displaySlots: storyTheme ? filteredDaySlots : selectedDaySlots,
    selectedSlotKey,
    onSelectSlot: setSelectedSlotKey,
    onConfirm,
    isSubmitting,
    preview,
    confirmDisabled,
    storyTheme,
    displayTimezone,
    storyLayout: Boolean(storyTheme),
    useInlineConfirm: !storyTheme,
    activePeriod: slotPeriod,
    onPeriodChange: setSlotPeriod,
    periodOptions: storyTheme ? periodOptions : undefined,
  };

  const calendarPane = (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={prevMonth}
          disabled={isCurrentMonthInTimezone(viewYear, viewMonth, displayTimezone)}
          className={
            storyTheme
              ? "w-[30px] h-[30px] flex items-center justify-center rounded-[9px] border transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none"
              : "w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none"
          }
          style={
            storyTheme
              ? { borderColor: storyTheme.line, color: storyTheme.primary, backgroundColor: storyTheme.white }
              : undefined
          }
          aria-label="Previous month"
        >
          <ChevronLeft size={storyTheme ? 14 : 16} />
        </button>
        <span
          className={`${storyTheme ? "text-sm font-semibold" : "text-[14px] font-medium"} ${storyTheme ? "" : "font-secondary text-text"}`}
          style={
            storyTheme
              ? { color: storyTheme.ink, fontFamily: storyTheme.fontBody }
              : undefined
          }
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className={
            storyTheme
              ? "w-[30px] h-[30px] flex items-center justify-center rounded-[9px] border transition-all duration-150"
              : "w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-all duration-150"
          }
          style={
            storyTheme
              ? { borderColor: storyTheme.line, color: storyTheme.primary, backgroundColor: storyTheme.white }
              : undefined
          }
          aria-label="Next month"
        >
          <ChevronRight size={storyTheme ? 14 : 16} />
        </button>
      </div>

      <CalendarGrid
        year={viewYear}
        month={viewMonth}
        selected={selectedDate}
        onSelect={handleDateSelect}
        availableDates={availableDates}
        minDate={today}
        colors={calendarColors}
        variant={storyTheme ? "demoStory" : "default"}
      />

      {storyTheme ? (
        <>
          <div
            className="flex flex-wrap gap-4 text-[9px] mt-4 leading-[1.7]"
            style={{ color: storyTheme.muted, fontFamily: storyTheme.fontBody }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-[#8AAF91]" aria-hidden />
              {DEMO_BOOKING_STORY_COPY.legendAvailable}
            </span>
          </div>
          <div
            className="hidden md:flex items-start gap-2 mt-6 p-3.5 rounded-xl border text-[10px] leading-[1.8]"
            style={{
              borderColor: "#E7EADD",
              backgroundColor: storyTheme.cream,
              color: "#758478",
              fontFamily: storyTheme.fontBody,
            }}
          >
            <Info size={13} className="shrink-0 mt-0.5" aria-hidden />
            <span>{DEMO_BOOKING_STORY_COPY.calendarHint}</span>
          </div>
        </>
      ) : null}
    </>
  );

  if (storyTheme) {
    return (
      <div
        className="grid lg:grid-cols-[260px_minmax(0,1fr)] overflow-hidden min-h-[500px] bg-white"
        style={{
          borderRadius: storyTheme.radiusCard,
          boxShadow: storyTheme.shadowCard,
          border: `1px solid ${storyTheme.line}`,
        }}
      >
        <DemoBookingContextColumn theme={storyTheme} />
        <div className="flex flex-col min-w-0">
          <DemoSchedulerStoryHeader
            theme={storyTheme}
            displayTimezone={displayTimezone}
            timezoneOptions={timezoneOptions}
            onDisplayTimezoneChange={handleDisplayTimezoneChange}
          />
          <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] flex-1 min-h-0">
            <div
              className="p-5 md:px-7 md:py-6 lg:border-r min-w-0"
              style={{ borderColor: storyTheme.line }}
            >
              {calendarPane}
            </div>
            <div className="hidden lg:block min-w-0 border-l" style={{ borderColor: storyTheme.line }}>
              <TimeSlotList {...timeSlotListProps} />
            </div>
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  key="times-col-mobile"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto", transition: { duration: 0.28, ease } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  className="lg:hidden w-full border-t overflow-hidden"
                  style={{ borderColor: storyTheme.line }}
                >
                  <TimeSlotList {...timeSlotListProps} dateStr={selectedDate} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <DemoBookingFooter
            theme={storyTheme}
            selectedBooking={selectedBooking}
            onConfirm={onConfirm}
            isSubmitting={isSubmitting}
            preview={preview}
            confirmDisabled={confirmDisabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:min-h-[500px]">
      <DemoSchedulerHeader
        storyTheme={storyTheme}
        durationMinutes={durationMinutes}
        titleStyle={titleStyle}
        borderColor={borderColor}
        displayTimezone={displayTimezone}
        timezoneOptions={timezoneOptions}
        onDisplayTimezoneChange={handleDisplayTimezoneChange}
      />

      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <div className="md:w-[70%] md:min-w-0 p-4 md:p-5 md:border-r border-border">
          {calendarPane}
        </div>

        <div
          className={`hidden md:block md:w-[30%] md:min-w-0 overflow-hidden ${storyTheme ? "" : "border-border"}`}
          style={borderColor ? { borderColor } : undefined}
        >
          <TimeSlotList {...timeSlotListProps} />
        </div>

        <AnimatePresence>
          {selectedDate && (
            <motion.div
              key="times-col-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", transition: { duration: 0.28, ease } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              className={`md:hidden w-full border-t overflow-hidden ${storyTheme ? "" : "border-border"}`}
              style={borderColor ? { borderColor } : undefined}
            >
              <TimeSlotList {...timeSlotListProps} dateStr={selectedDate} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DemoScheduler({
  availabilitySlots,
  onConfirm,
  isSubmitting,
  preview = false,
  confirmDisabled = false,
  storyTheme,
  displayTimezone: displayTimezoneProp,
  onDisplayTimezoneChange,
}: {
  availabilitySlots: Record<string, string[]>;
  onConfirm?: (booking: DemoSchedulerBooking) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
  storyTheme?: ParentThemeTokens;
  displayTimezone?: string;
  onDisplayTimezoneChange?: (timezone: string) => void;
}) {
  const [internalTimezone, setInternalTimezone] = useState(() =>
    detectBrowserTimezone(SCHEDULER_TIMEZONE),
  );
  const timezoneOptions = useMemo(
    () => resolveDemoDisplayTimezoneOptions(detectBrowserTimezone(SCHEDULER_TIMEZONE)),
    [],
  );

  const displayTimezone = displayTimezoneProp ?? internalTimezone;

  const { slots: displaySlots, minDisplayDate } = useMemo(
    () => buildDisplayAvailabilitySlots(availabilitySlots, displayTimezone),
    [availabilitySlots, displayTimezone],
  );

  const viewResetKey = useMemo(
    () =>
      `${displayTimezone}|${minDisplayDate ?? ""}|${Object.keys(displaySlots).sort().join(",")}`,
    [displayTimezone, minDisplayDate, displaySlots],
  );

  const handleDisplayTimezoneChange = (timezone: string) => {
    onDisplayTimezoneChange?.(timezone);
    if (!displayTimezoneProp) {
      setInternalTimezone(timezone);
    }
  };

  return (
    <DemoSchedulerCalendar
      key={viewResetKey}
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
      preview={preview}
      confirmDisabled={confirmDisabled}
      storyTheme={storyTheme}
      displayTimezone={displayTimezone}
      displaySlots={displaySlots}
      minDisplayDate={minDisplayDate}
      timezoneOptions={timezoneOptions}
      onDisplayTimezoneChange={handleDisplayTimezoneChange}
    />
  );
}
