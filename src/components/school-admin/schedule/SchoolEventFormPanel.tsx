"use client";

import { useEffect, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import EventColorPicker from "@/components/school-admin/schedule/EventColorPicker";
import EventTimePicker from "@/components/school-admin/schedule/EventTimePicker";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  addMinutesToTimeInput,
  DEFAULT_EVENT_DURATION_MINUTES,
} from "@/lib/school-events/calendar-time";
import {
  getDefaultColorKeyForType,
  SCHOOL_EVENT_TYPE_LABELS,
} from "@/lib/school-events/event-labels";
import type { SchoolEventColorKey, SchoolEventType } from "@/lib/school-events/types";

export type EventFormState = {
  title: string;
  date: string;
  time: string;
  endTime: string;
  isAllDay: boolean;
  eventType: SchoolEventType;
  colorKey: SchoolEventColorKey;
  colorManuallySet: boolean;
  location: string;
  description: string;
};

export const EMPTY_EVENT_FORM: EventFormState = {
  title: "",
  date: "",
  time: "",
  endTime: "",
  isAllDay: true,
  eventType: "other",
  colorKey: getDefaultColorKeyForType("other"),
  colorManuallySet: false,
  location: "",
  description: "",
};

type SchoolEventFormPanelProps = {
  C: AdminThemeTokens;
  open: boolean;
  mode: "create" | "edit";
  form: EventFormState;
  saving: boolean;
  onClose: () => void;
  onChange: (form: EventFormState) => void;
  onSave: () => void;
};

const inputClass = "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2";

function inputStyle(C: AdminThemeTokens): CSSProperties {
  return {
    borderColor: C.inputBorder,
    backgroundColor: C.input,
    color: C.textPrimary,
    ...({ "--tw-ring-color": `${C.accent}40` } as CSSProperties),
  };
}

export default function SchoolEventFormPanel({
  C,
  open,
  mode,
  form,
  saving,
  onClose,
  onChange,
  onSave,
}: SchoolEventFormPanelProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const categoryOptions = (Object.keys(SCHOOL_EVENT_TYPE_LABELS) as SchoolEventType[]).map(
    (type) => ({
      value: type,
      label: SCHOOL_EVENT_TYPE_LABELS[type],
    }),
  );

  const handleStartTimeChange = (time: string) => {
    const nextEnd =
      form.endTime || (time ? addMinutesToTimeInput(time, DEFAULT_EVENT_DURATION_MINUTES) : "");
    onChange({ ...form, time, endTime: nextEnd });
  };

  const handleCategoryChange = (eventType: string) => {
    const typed = eventType as SchoolEventType;
    onChange({
      ...form,
      eventType: typed,
      colorKey: form.colorManuallySet ? form.colorKey : getDefaultColorKeyForType(typed),
    });
  };

  const canSave = Boolean(form.title.trim() && form.date);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.15)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[480px] max-w-[100vw] flex-col overflow-hidden border-l shadow-xl"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <div
              className="flex shrink-0 items-center justify-between border-b px-6 py-5"
              style={{ borderColor: C.border }}
            >
              <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                {mode === "edit" ? "Edit event" : "Add event"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-md p-1.5 transition-colors"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-7 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: C.textTertiary }}>
                  Title
                </label>
                <input
                  placeholder="Event title"
                  value={form.title}
                  onChange={(e) => onChange({ ...form, title: e.target.value })}
                  className={inputClass}
                  style={inputStyle(C)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: C.textTertiary }}>
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => onChange({ ...form, date: e.target.value })}
                  className={inputClass}
                  style={inputStyle(C)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                <input
                  type="checkbox"
                  checked={form.isAllDay}
                  onChange={(e) => {
                    const isAllDay = e.target.checked;
                    if (isAllDay) {
                      onChange({ ...form, isAllDay, time: "", endTime: "" });
                      return;
                    }
                    const time = form.time || "09:00";
                    const endTime =
                      form.endTime || addMinutesToTimeInput(time, DEFAULT_EVENT_DURATION_MINUTES);
                    onChange({ ...form, isAllDay, time, endTime });
                  }}
                />
                All day
              </label>

              {!form.isAllDay ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: C.textTertiary }}>
                      Start time
                    </label>
                    <EventTimePicker
                      C={C}
                      value={form.time}
                      onChange={handleStartTimeChange}
                      ariaLabel="Start time"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: C.textTertiary }}>
                      End time
                    </label>
                    <EventTimePicker
                      C={C}
                      value={form.endTime}
                      onChange={(endTime) => onChange({ ...form, endTime })}
                      ariaLabel="End time"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: C.textTertiary }}>
                  Category
                </label>
                <SchoolAdminSelect
                  C={C}
                  value={form.eventType}
                  onChange={handleCategoryChange}
                  options={categoryOptions}
                  ariaLabel="Event category"
                />
              </div>

              <EventColorPicker
                C={C}
                colorKey={form.colorKey}
                eventType={form.eventType}
                colorManuallySet={form.colorManuallySet}
                onChange={(colorKey) => onChange({ ...form, colorKey })}
                onManualChange={() => onChange({ ...form, colorManuallySet: true })}
                onResetToDefault={() =>
                  onChange({
                    ...form,
                    colorKey: getDefaultColorKeyForType(form.eventType),
                    colorManuallySet: false,
                  })
                }
              />

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: C.textTertiary }}>
                  Location (optional)
                </label>
                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => onChange({ ...form, location: e.target.value })}
                  className={inputClass}
                  style={inputStyle(C)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: C.textTertiary }}>
                  Description (optional)
                </label>
                <textarea
                  placeholder="Add details families should know"
                  value={form.description}
                  onChange={(e) => onChange({ ...form, description: e.target.value })}
                  rows={5}
                  className={`${inputClass} resize-none`}
                  style={inputStyle(C)}
                />
              </div>
            </div>

            <div
              className="flex shrink-0 justify-end gap-2 border-t px-6 py-4"
              style={{ borderColor: C.border }}
            >
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-4 py-2 text-sm"
                style={{ color: C.textSecondary }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving || !canSave}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
              >
                {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Add event"}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
