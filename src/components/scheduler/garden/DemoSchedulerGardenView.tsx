"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import { DemoTimezoneSelect } from "@/components/scheduler/DemoTimezoneSelect";
import type { DemoSchedulerBooking } from "@/components/scheduler/demo-scheduler-types";
import { btnPop } from "@/components/garden/ui";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import { MONTH_NAMES, formatSelectedDate } from "@/lib/demo-scheduler";
import {
  formatDemoWhenInTimezone,
  type DemoDisplaySlot,
  type DemoSlotPeriod,
} from "@/lib/demo-scheduler-timezone";
import { DEMO_BOOKING_STORY_COPY } from "@/lib/marketing/demo-booking-story-copy";
import type { DemoTimezoneOption } from "@/lib/marketing/demo-timezone-options";

export type SlotPeriodFilter = "all" | DemoSlotPeriod;

export function demoDisplaySlotKey(slot: DemoDisplaySlot): string {
  return `${slot.canonicalDate}|${slot.canonicalTime}`;
}

const copy = DEMO_BOOKING_STORY_COPY;
const EASE = [0.22, 1, 0.36, 1] as const;

const PERIOD_LABELS: Record<SlotPeriodFilter, string> = {
  all: copy.periodAll,
  morning: copy.periodMorning,
  afternoon: copy.periodAfternoon,
  evening: copy.periodEvening,
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

const MONTH_BUTTON = `grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)]/15 transition-all duration-200 hover:-translate-y-0.5 hover:ring-[var(--sf-ink)] disabled:pointer-events-none disabled:opacity-30 ${FOCUS_RING}`;

const PERIOD_SEGMENT = {
  on: "bg-[var(--sf-forest)] text-white",
  off: "text-[var(--sf-soft)] hover:text-[var(--sf-ink)]",
} as const;

const SLOT = {
  on: "border-[var(--sf-ink)] bg-[var(--sf-butter)] text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]",
  off: "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)] hover:-translate-y-0.5 hover:border-[var(--sf-ink)] hover:shadow-[0_3px_0_0_var(--sf-ink)] focus-visible:border-[var(--sf-ink)]",
} as const;

const CONFIRM_BUTTON = `${btnPop} ${BUTTON_LOADING_LAYOUT_CLASS} shrink-0 !px-6 !py-3 !text-[15px] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:translate-y-0`;

type TimesPaneProps = {
  dateStr: string | null;
  slots: DemoDisplaySlot[];
  displayTimezone: string;
  selectedSlotKey: string | null;
  onSelectSlot: (key: string) => void;
  periodOptions: SlotPeriodFilter[];
  activePeriod: SlotPeriodFilter;
  onPeriodChange: (period: SlotPeriodFilter) => void;
};

function TimesPane({
  dateStr,
  slots,
  displayTimezone,
  selectedSlotKey,
  onSelectSlot,
  periodOptions,
  activePeriod,
  onPeriodChange,
}: TimesPaneProps) {
  return (
    <div className="flex min-h-[280px] flex-col p-5 md:p-6 lg:h-full">
      {dateStr ? (
        <div>
          <p className="sf-display text-xl leading-tight text-[var(--sf-ink)]">
            {formatSelectedDate(dateStr)}
          </p>
          <p className="mt-1 text-xs font-semibold text-[var(--sf-soft)]">
            {formatOrganizationTimezoneLabel(displayTimezone)}
          </p>
        </div>
      ) : (
        <p className="text-[13px] leading-snug text-[var(--sf-soft)]">
          Select a highlighted date to see available times.
        </p>
      )}

      {dateStr && periodOptions.length > 1 ? (
        <div
          className="mt-4 flex gap-1 overflow-x-auto rounded-full bg-white p-1 ring-2 ring-[var(--sf-ink)]/10"
          role="group"
          aria-label="Filter times by period"
        >
          {periodOptions.map((period) => {
            const on = activePeriod === period;
            return (
              <button
                key={period}
                type="button"
                onClick={() => onPeriodChange(period)}
                aria-pressed={on}
                className={`min-w-0 flex-1 cursor-pointer rounded-full px-2 py-1.5 text-xs font-extrabold transition-colors ${FOCUS_RING} ${on ? PERIOD_SEGMENT.on : PERIOD_SEGMENT.off}`}
              >
                {PERIOD_LABELS[period]}
              </button>
            );
          })}
        </div>
      ) : null}

      {dateStr ? (
        slots.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[var(--sf-soft)]">
            No times available for this date.
          </p>
        ) : (
          <div className="mt-4 grid flex-1 grid-cols-2 content-start gap-2.5 overflow-y-auto p-0.5 pb-1.5 sm:grid-cols-3 lg:grid-cols-2">
            {slots.map((slot) => {
              const key = demoDisplaySlotKey(slot);
              const on = selectedSlotKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectSlot(key)}
                  aria-pressed={on}
                  className={`min-h-[42px] cursor-pointer rounded-full border-2 px-2 text-[13px] font-extrabold tabular-nums transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${FOCUS_RING} ${on ? SLOT.on : SLOT.off}`}
                >
                  {slot.displayTime}
                </button>
              );
            })}
          </div>
        )
      ) : null}
    </div>
  );
}

export type DemoSchedulerGardenViewProps = {
  titleAs?: "h2" | "h3";
  displayTimezone: string;
  timezoneOptions: DemoTimezoneOption[];
  onDisplayTimezoneChange: (timezone: string) => void;
  viewYear: number;
  viewMonth: number;
  canGoPrev: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  availableDates: Set<string>;
  minDate: string;
  daySlots: DemoDisplaySlot[];
  periodOptions: SlotPeriodFilter[];
  activePeriod: SlotPeriodFilter;
  onPeriodChange: (period: SlotPeriodFilter) => void;
  selectedSlotKey: string | null;
  onSelectSlot: (key: string) => void;
  selectedBooking: DemoSchedulerBooking | null;
  onConfirm?: (booking: DemoSchedulerBooking) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
};

/**
 * Book-a-demo date & time picker in MudKitchen Garden: an index card with a
 * calendar, a times pane and a ticket-stub footer. Needs a `.sf-garden` ancestor.
 */
export default function DemoSchedulerGardenView({
  titleAs: Title = "h2",
  displayTimezone,
  timezoneOptions,
  onDisplayTimezoneChange,
  viewYear,
  viewMonth,
  canGoPrev,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  onSelectDate,
  availableDates,
  minDate,
  daySlots,
  periodOptions,
  activePeriod,
  onPeriodChange,
  selectedSlotKey,
  onSelectSlot,
  selectedBooking,
  onConfirm,
  isSubmitting,
  preview = false,
  confirmDisabled = false,
}: DemoSchedulerGardenViewProps) {
  const reduce = useReducedMotion();
  const whenLabel =
    selectedBooking &&
    formatDemoWhenInTimezone(
      selectedBooking.date,
      selectedBooking.time,
      selectedBooking.displayTimezone,
    );

  const timesProps: TimesPaneProps = {
    dateStr: selectedDate,
    slots: daySlots,
    displayTimezone,
    selectedSlotKey,
    onSelectSlot,
    periodOptions,
    activePeriod,
    onPeriodChange,
  };

  return (
    <div className="flex min-h-[500px] min-w-0 flex-col overflow-hidden rounded-[28px] border-2 border-[var(--sf-ink)] bg-white text-[var(--sf-ink)] shadow-[0_8px_0_0_var(--sf-ink)]">
      <header className="flex flex-col gap-4 border-b-2 border-dashed border-[var(--sf-ink)]/15 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7">
        <div className="min-w-0">
          <Title className="sf-display text-[1.75rem] leading-none text-[var(--sf-ink)]">
            {copy.schedulerTitle}
          </Title>
          <p className="mt-2 text-sm text-[var(--sf-soft)]">{copy.schedulerSubtitle}</p>
        </div>
        <div className="w-full shrink-0 sm:max-w-[250px]">
          <DemoTimezoneSelect
            value={displayTimezone}
            options={timezoneOptions}
            onChange={onDisplayTimezoneChange}
            appearance="garden"
            id="demo-display-timezone-garden"
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 p-5 md:px-7 md:py-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onPrevMonth}
              disabled={!canGoPrev}
              className={MONTH_BUTTON}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} strokeWidth={2.6} />
            </button>
            <p className="sf-display text-xl text-[var(--sf-ink)]" aria-live="polite">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={onNextMonth}
              className={MONTH_BUTTON}
              aria-label="Next month"
            >
              <ChevronRight size={16} strokeWidth={2.6} />
            </button>
          </div>

          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            selected={selectedDate}
            onSelect={onSelectDate}
            availableDates={availableDates}
            minDate={minDate}
            variant="demoGarden"
          />

          <p className="mt-4 flex items-center gap-2 text-xs font-bold text-[var(--sf-soft)]">
            <span className="h-2 w-2 rounded-full bg-[var(--sf-forest)]" aria-hidden />
            {copy.legendAvailable}
          </p>

          <div
            className="mt-6 hidden items-start gap-2.5 rounded-md bg-[var(--sf-butter)] p-3 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)] md:flex"
            style={{ rotate: "-1deg" }}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]">
              <Info className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />
            </span>
            <p className="pt-0.5 text-[13px] font-bold leading-snug text-[var(--sf-ink)]">
              {copy.calendarHint}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 border-l-2 border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-cream)]/60 lg:block">
          <TimesPane {...timesProps} />
        </div>

        <AnimatePresence initial={false}>
          {selectedDate ? (
            <motion.div
              key="times-mobile"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", transition: { duration: 0.3, ease: EASE } }}
              exit={reduce ? undefined : { opacity: 0, height: 0, transition: { duration: 0.2 } }}
              className="w-full overflow-hidden border-t-2 border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-cream)]/60 lg:hidden"
            >
              <TimesPane {...timesProps} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <footer className="flex min-h-[84px] flex-col gap-4 border-t-2 border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="min-w-0" aria-live="polite">
          {selectedBooking && whenLabel ? (
            <>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-forest)]">
                {copy.footerSelectedLabel}
              </p>
              <p className="sf-display mt-1 text-lg leading-tight text-[var(--sf-ink)]">
                {whenLabel}
              </p>
              <p className="mt-0.5 text-xs text-[var(--sf-soft)]">20-minute video call</p>
            </>
          ) : (
            <p className="flex items-center gap-2 text-[13px] text-[var(--sf-soft)]">
              <Calendar size={15} className="shrink-0" aria-hidden />
              {copy.footerEmpty}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!selectedBooking || isSubmitting || preview || confirmDisabled}
          onClick={() => {
            if (selectedBooking && onConfirm) onConfirm(selectedBooking);
          }}
          className={CONFIRM_BUTTON}
        >
          {preview ? (
            "Preview only"
          ) : (
            <ButtonLoadingLabel loading={Boolean(isSubmitting)} loadingLabel="Booking…">
              {copy.footerConfirm}
            </ButtonLoadingLabel>
          )}
        </button>
      </footer>
    </div>
  );
}

/** Loading state with the same frame and layout as the Garden scheduler. */
export function DemoSchedulerGardenSkeleton() {
  const block = "animate-pulse rounded-lg bg-[var(--sf-ink)]/[0.07] motion-reduce:animate-none";
  return (
    <div
      className="flex min-h-[500px] min-w-0 flex-col overflow-hidden rounded-[28px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_8px_0_0_var(--sf-ink)]"
      role="status"
      aria-busy="true"
      aria-label="Loading available times"
    >
      <div className="flex flex-col justify-between gap-4 border-b-2 border-dashed border-[var(--sf-ink)]/15 px-5 py-5 sm:flex-row sm:px-7">
        <div className="flex-1 space-y-2.5">
          <div className={`${block} h-7 w-56`} />
          <div className={`${block} h-3.5 w-64 max-w-full`} />
        </div>
        <div className="w-full space-y-2 sm:max-w-[250px]">
          <div className={`${block} h-3 w-24`} />
          <div className={`${block} h-11 w-full !rounded-full`} />
        </div>
      </div>
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="p-5 md:px-7 md:py-6">
          <div className="mb-5 flex items-center justify-between">
            <div className={`${block} h-9 w-9 !rounded-full`} />
            <div className={`${block} h-5 w-36`} />
            <div className={`${block} h-9 w-9 !rounded-full`} />
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className={`${block} h-[43px] !rounded-[12px]`} />
            ))}
          </div>
        </div>
        <div className="hidden space-y-3 border-l-2 border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-cream)]/60 p-6 lg:block">
          <div className={`${block} h-5 w-40`} />
          <div className={`${block} h-3 w-28`} />
          <div className="grid grid-cols-2 gap-2.5 pt-3">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`${block} h-[42px] !rounded-full`} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-5 py-5 sm:px-7">
        <div className={`${block} h-4 w-56`} />
        <div className={`${block} h-11 w-28 !rounded-full`} />
      </div>
    </div>
  );
}
