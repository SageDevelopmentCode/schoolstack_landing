"use client";

import { Calendar } from "lucide-react";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import { DEMO_BOOKING_STORY_COPY } from "@/lib/marketing/demo-booking-story-copy";
import { formatDemoWhenInTimezone } from "@/lib/demo-scheduler-timezone";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { DemoSchedulerBooking } from "@/components/scheduler/demo-scheduler-types";

type DemoBookingFooterProps = {
  theme: ParentThemeTokens;
  selectedBooking: DemoSchedulerBooking | null;
  onConfirm?: (booking: DemoSchedulerBooking) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
};

export function DemoBookingFooter({
  theme,
  selectedBooking,
  onConfirm,
  isSubmitting,
  preview = false,
  confirmDisabled = false,
}: DemoBookingFooterProps) {
  const copy = DEMO_BOOKING_STORY_COPY;
  const whenLabel =
    selectedBooking &&
    formatDemoWhenInTimezone(
      selectedBooking.date,
      selectedBooking.time,
      selectedBooking.displayTimezone,
    );

  return (
    <footer
      className="border-t px-6 py-[18px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-h-[83px]"
      style={{
        borderColor: theme.line,
        backgroundColor: theme.cream,
        fontFamily: theme.fontBody,
      }}
    >
      <div className="min-w-0" aria-live="polite">
        {selectedBooking && whenLabel ? (
          <>
            <div
              className="text-[9px] font-extrabold uppercase tracking-[0.08em] mb-1"
              style={{ color: "#7F8D7D" }}
            >
              {copy.footerSelectedLabel}
            </div>
            <div className="text-[12px] font-semibold leading-snug" style={{ color: theme.ink }}>
              {whenLabel}
            </div>
            <p className="text-[10px] mt-0.5 leading-snug" style={{ color: theme.muted }}>
              20-minute video call
            </p>
          </>
        ) : (
          <div
            className="flex items-center gap-2 text-[12px]"
            style={{ color: theme.muted }}
          >
            <Calendar size={14} className="shrink-0" aria-hidden />
            {copy.footerEmpty}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!selectedBooking || isSubmitting || preview || confirmDisabled}
        onClick={() => {
          if (selectedBooking && onConfirm) onConfirm(selectedBooking);
        }}
        className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[12px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_LOADING_LAYOUT_CLASS}`}
        style={{
          backgroundColor: theme.primary,
          borderRadius: theme.radiusButton,
          fontFamily: theme.fontBody,
        }}
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
  );
}
