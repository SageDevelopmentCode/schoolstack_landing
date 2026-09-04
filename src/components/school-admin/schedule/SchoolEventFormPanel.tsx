"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EventColorPicker from "@/components/school-admin/schedule/EventColorPicker";
import PopupTimePicker from "@/components/school-events/PopupTimePicker";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
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
  programId: string | null;
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
  programId: null,
};

type SchoolEventFormPanelProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  open: boolean;
  mode: "create" | "edit";
  form: EventFormState;
  saving: boolean;
  programOptions: Array<{ id: string; name: string }>;
  onClose: () => void;
  onChange: (form: EventFormState) => void;
  onSave: () => void;
};

const inputClass =
  "w-full rounded-[10px] border px-3 py-2 text-sm outline-none focus:ring-2";

function inputStyle(theme: ParentThemeTokens): CSSProperties {
  return {
    borderColor: "#E0E7E0",
    backgroundColor: theme.white,
    color: theme.ink,
    ...({ "--tw-ring-color": `${theme.primary}40` } as CSSProperties),
  };
}

function FieldLabel({
  theme,
  children,
}: {
  theme: ParentThemeTokens;
  children: ReactNode;
}) {
  return (
    <label
      className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide"
      style={{ color: theme.muted }}
    >
      {children}
    </label>
  );
}

export default function SchoolEventFormPanel({
  theme,
  C,
  open,
  mode,
  form,
  saving,
  programOptions,
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

  const audienceOptions = [
    { value: "", label: "All families (school-wide)" },
    ...programOptions.map((program) => ({
      value: program.id,
      label: `${program.name} only`,
    })),
  ];

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
  const title = mode === "edit" ? "Edit event" : "Add event";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(34,48,44,0.47)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[min(100%,30rem)] max-w-[100vw] flex-col overflow-hidden"
            style={{
              backgroundColor: "#F8FAF8",
              borderLeft: "1px solid #E0E8E0",
              boxShadow: "0 -18px 45px rgba(26,47,37,0.2)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3 bg-white px-[21px] py-[17px]"
              style={{ borderBottom: "1px solid #E0E8E0" }}
            >
              <div className="min-w-0 flex-1">
                <AdminSectionKicker theme={theme}>School event</AdminSectionKicker>
                <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-1">
                  {title}
                </AdminDisplayHeading>
              </div>
              <AdminButton
                theme={theme}
                variant="soft"
                size="compact"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0"
              >
                Close ×
              </AdminButton>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-[21px] py-5">
              <div>
                <FieldLabel theme={theme}>Title</FieldLabel>
                <input
                  placeholder="Event title"
                  value={form.title}
                  onChange={(e) => onChange({ ...form, title: e.target.value })}
                  className={inputClass}
                  style={inputStyle(theme)}
                />
              </div>

              <div>
                <FieldLabel theme={theme}>Date</FieldLabel>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => onChange({ ...form, date: e.target.value })}
                  className={inputClass}
                  style={inputStyle(theme)}
                />
              </div>

              <label
                className="flex cursor-pointer items-center gap-2 text-sm"
                style={{ color: theme.ink }}
              >
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
                  className="rounded"
                  style={{ accentColor: theme.primary }}
                />
                All day
              </label>

              {!form.isAllDay ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel theme={theme}>Start time</FieldLabel>
                    <PopupTimePicker
                      theme={theme}
                      value={form.time}
                      onChange={handleStartTimeChange}
                      ariaLabel="Start time"
                    />
                  </div>
                  <div>
                    <FieldLabel theme={theme}>End time</FieldLabel>
                    <PopupTimePicker
                      theme={theme}
                      value={form.endTime}
                      scrollToTime={form.time}
                      onChange={(endTime) => onChange({ ...form, endTime })}
                      ariaLabel="End time"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <FieldLabel theme={theme}>Category</FieldLabel>
                <SchoolAdminSelect
                  C={C}
                  value={form.eventType}
                  onChange={handleCategoryChange}
                  options={categoryOptions}
                  ariaLabel="Event category"
                />
              </div>

              <div>
                <FieldLabel theme={theme}>Audience</FieldLabel>
                <SchoolAdminSelect
                  C={C}
                  value={form.programId ?? ""}
                  onChange={(value) =>
                    onChange({
                      ...form,
                      programId: value ? value : null,
                    })
                  }
                  options={audienceOptions}
                  ariaLabel="Event audience"
                />
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
                  School-wide events appear on the main portal and every program portal.
                  Program-only events appear in that program&apos;s portal.
                </p>
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
                <FieldLabel theme={theme}>Location (optional)</FieldLabel>
                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => onChange({ ...form, location: e.target.value })}
                  className={inputClass}
                  style={inputStyle(theme)}
                />
              </div>

              <div>
                <FieldLabel theme={theme}>Description (optional)</FieldLabel>
                <textarea
                  placeholder="Add details families should know"
                  value={form.description}
                  onChange={(e) => onChange({ ...form, description: e.target.value })}
                  rows={5}
                  className={`${inputClass} resize-none`}
                  style={inputStyle(theme)}
                />
              </div>
            </div>

            <div
              className="flex shrink-0 justify-end gap-2 border-t bg-white px-[21px] py-4"
              style={{ borderColor: "#E0E8E0" }}
            >
              <AdminButton theme={theme} variant="soft" onClick={onClose}>
                Cancel
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="primary"
                onClick={onSave}
                disabled={saving || !canSave}
              >
                {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Add event"}
              </AdminButton>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
