"use client";

import { useMemo, type FormEvent, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import PopupTimePicker from "@/components/school-events/PopupTimePicker";
import SchoolAdminDatePicker from "@/components/school-admin/ui/SchoolAdminDatePicker";
import CommitteeFormSidePanel, {
  CommitteeFormSection,
} from "@/components/school-admin/committees/sections/CommitteeFormSidePanel";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import type { CommitteeEventType } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";

export type CommitteeAddEventFormState = {
  title: string;
  date: string;
  time: string;
  eventType: CommitteeEventType;
  location: string;
};

type CommitteeAddEventPanelProps = {
  open: boolean;
  theme: ParentThemeTokens;
  saving?: boolean;
  form: CommitteeAddEventFormState;
  onChange: (form: CommitteeAddEventFormState) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  title?: string;
  submitLabel?: string;
  formId?: string;
};

function FieldLabel({
  theme,
  htmlFor,
  children,
}: {
  theme: ParentThemeTokens;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-wide"
      style={{ color: theme.muted }}
    >
      {children}
    </label>
  );
}

export default function CommitteeAddEventPanel({
  open,
  theme,
  saving = false,
  form,
  onChange,
  onClose,
  onSubmit,
  title = "Add event",
  submitLabel,
  formId = "committee-add-event-form",
}: CommitteeAddEventPanelProps) {
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);
  const inputClassName = committeeStoryInputClassName;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <CommitteeFormSidePanel
      open={open}
      theme={theme}
      kicker="Committee"
      title={title}
      icon={<CalendarDays className="h-4 w-4" style={{ color: theme.primary }} />}
      onRequestClose={onClose}
      saving={saving}
      formId={formId}
      onSubmit={handleSubmit}
      footer={
        <div className="flex justify-end gap-2">
          <AdminButton theme={theme} variant="soft" onClick={onClose} disabled={saving}>
            Cancel
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            type="submit"
            form={formId}
            disabled={saving || !form.title.trim() || !form.date}
          >
            {saving ? "Saving…" : submitLabel ?? title}
          </AdminButton>
        </div>
      }
    >
      <CommitteeFormSection theme={theme} title="Event details">
        <div className="space-y-2">
          <FieldLabel theme={theme} htmlFor="committee-event-title">
            Title
          </FieldLabel>
          <input
            id="committee-event-title"
            placeholder="Title"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className={inputClassName}
            style={inputStyle}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel theme={theme}>Date</FieldLabel>
          <SchoolAdminDatePicker
            id="committee-event-date"
            C={C}
            value={form.date}
            onChange={(date) => onChange({ ...form, date })}
            placeholder="Select date…"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel theme={theme}>Time</FieldLabel>
          <PopupTimePicker
            theme={theme}
            value={form.time}
            onChange={(time) => onChange({ ...form, time })}
            ariaLabel="Event time"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel theme={theme} htmlFor="committee-event-type">
            Type
          </FieldLabel>
          <select
            id="committee-event-type"
            value={form.eventType}
            onChange={(e) =>
              onChange({ ...form, eventType: e.target.value as CommitteeEventType })
            }
            className={inputClassName}
            style={inputStyle}
          >
            <option value="meeting">Meeting</option>
            <option value="deadline">Deadline</option>
            <option value="service">Service</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div className="space-y-2">
          <FieldLabel theme={theme} htmlFor="committee-event-location">
            Location
          </FieldLabel>
          <input
            id="committee-event-location"
            placeholder="Location (optional)"
            value={form.location}
            onChange={(e) => onChange({ ...form, location: e.target.value })}
            className={inputClassName}
            style={inputStyle}
          />
        </div>
      </CommitteeFormSection>
    </CommitteeFormSidePanel>
  );
}
