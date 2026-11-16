"use client";

import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarHeart, Pencil, Plus, Trash2 } from "lucide-react";
import GardenCalendarToolbar from "@/components/school-parent/calendar/garden/GardenCalendarToolbar";
import GardenMonthGrid from "@/components/school-parent/calendar/garden/GardenMonthGrid";
import GardenWeekGrid from "@/components/school-parent/calendar/garden/GardenWeekGrid";
import GardenCalendarLegend from "@/components/school-parent/calendar/garden/GardenCalendarLegend";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GSkeleton, G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import {
  BusyLabel,
  GardenField,
  GardenSelect,
  GardenSwitch,
  gBtnDangerSm,
  gInputClass,
} from "@/components/school-admin/garden/kit";
import { GardenFacts } from "@/components/school-admin/garden/blocks";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import { useEventsCalendarNavigation } from "@/components/school-events-calendar/useEventsCalendarNavigation";
import type { EventFormState } from "@/components/school-admin/schedule/SchoolEventFormPanel";
import { dateKey, parseEventDate } from "@/lib/committees/calendar-utils";
import { addMinutesToTimeInput, DEFAULT_EVENT_DURATION_MINUTES, formatEventTimeRange } from "@/lib/school-events/calendar-time";
import {
  getColorStyle,
  getDefaultColorKeyForType,
  getEventDisplayStyle,
  SCHOOL_EVENT_COLOR_KEYS,
  SCHOOL_EVENT_TYPE_LABELS,
} from "@/lib/school-events/event-labels";
import type { OrganizationEvent, SchoolEventType } from "@/lib/school-events/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type EventFormErrors = { title?: string; date?: string; time?: string };

export function formatEventDateLong(date: string): string {
  return parseEventDate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventDateShort(date: string): string {
  return parseEventDate(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const pluralEvents = (count: number) => `${count} ${count === 1 ? "event" : "events"}`;

/* ------------------------------------------------------------------ */
/* Calendar card                                                       */
/* ------------------------------------------------------------------ */

/**
 * Admin Garden events calendar: the parent Garden toolbar + month/week grid +
 * legend in one card, with the page's one toy "Add event". Clicking a day
 * opens the add form for that date (same as before); clicking an event opens
 * its details.
 */
export function GardenAdminEventsCalendar({
  events,
  loading,
  view,
  onViewChange,
  selectedEventId,
  readOnly,
  emptyHint,
  onDayClick,
  onEventClick,
  onAdd,
}: {
  events: OrganizationEvent[];
  loading: boolean;
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  selectedEventId: string | null;
  readOnly: boolean;
  emptyHint: string;
  onDayClick?: (date: string) => void;
  onEventClick: (event: OrganizationEvent) => void;
  onAdd: () => void;
}) {
  const reduce = useReducedMotion() === true;
  const headingId = useId();
  // Phones show event dots, not pills, so a tap selects the day and the day
  // list under the grid opens events or adds one. Larger screens keep
  // "click a day to add".
  const handleDayClick = onDayClick
    ? (date: string) => {
        if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) return;
        onDayClick(date);
      }
    : undefined;
  const nav = useEventsCalendarNavigation({
    events,
    view,
    onViewChange,
    readOnly,
    onDayClick: handleDayClick,
    onEventClick,
  });
  const selectedDayEvents = nav.selectedDate ? nav.eventsByDate.get(nav.selectedDate) ?? [] : [];

  const periodCount = useMemo(() => {
    if (view === "month") {
      const prefix = `${nav.year}-${String(nav.month + 1).padStart(2, "0")}`;
      return events.filter((event) => event.date.startsWith(prefix)).length;
    }
    const keys = new Set(nav.weekDates.map((d) => dateKey(d)));
    return events.filter((event) => keys.has(event.date)).length;
  }, [events, nav.month, nav.weekDates, nav.year, view]);

  const where = view === "month" ? "this month" : "this week";
  const summary = loading
    ? "Loading events…"
    : periodCount === 0
      ? readOnly
        ? `Nothing on the calendar ${where}.`
        : `Nothing on the calendar ${where} — pick a day to add an event.`
      : `${pluralEvents(periodCount)} ${where} · ${readOnly ? "open an event for details" : "pick a day to add one, or open an event to edit it"}.`;

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)]"
      data-testid="admin-events-calendar"
    >
      <div className="flex flex-col gap-3 border-b-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <GardenCalendarToolbar
            view={view}
            periodLabel={nav.periodLabel}
            isCurrentPeriod={nav.isCurrentPeriod}
            loading={loading}
            onPrev={nav.goPrev}
            onNext={nav.goNext}
            onToday={nav.goToday}
            onViewChange={nav.handleViewChange}
            headingId={headingId}
            summary={summary}
          />
        </div>
        {!readOnly ? (
          <button type="button" className={`${gBtnPopSm} shrink-0 self-start lg:self-center`} onClick={onAdd} data-testid="admin-events-add">
            <Plus className="h-4 w-4" aria-hidden />
            Add event
          </button>
        ) : null}
      </div>

      {!loading ? (
        events.length === 0 ? (
          <div className="flex items-center gap-2.5 border-b-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-accent-wash)] px-4 py-2.5 sm:px-6">
            <CalendarHeart className="h-[18px] w-[18px] shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
            <p className="m-0 text-[13.5px] font-semibold text-[var(--sf-ink)]/80">{emptyHint}</p>
          </div>
        ) : (
          <div className="border-b-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-4 py-2.5 sm:px-6">
            <GardenCalendarLegend events={events} />
          </div>
        )
      ) : null}

      {loading ? (
        <div className="p-4 sm:p-6" aria-busy="true" aria-label="Loading events">
          <GSkeleton className="min-h-[420px] !rounded-[18px]" />
        </div>
      ) : (
        <motion.div
          key={`${view}-${nav.periodLabel}`}
          className="flex min-h-[460px] flex-col"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: PORTAL_EASE }}
        >
          {view === "month" ? (
            <GardenMonthGrid
              year={nav.year}
              month={nav.month}
              eventsByDate={nav.eventsByDate}
              selectedDate={nav.selectedDate}
              selectedEventId={selectedEventId}
              onDayClick={nav.handleDayClick}
              onEventClick={onEventClick}
              testIdPrefix="admin-calendar"
            />
          ) : (
            <div className="flex max-h-[640px] min-h-0 flex-1 flex-col overflow-auto">
              <GardenWeekGrid
                weekDates={nav.weekDates}
                eventsByDate={nav.eventsByDate}
                selectedDate={nav.selectedDate}
                selectedEventId={selectedEventId}
                onDayClick={nav.handleDayClick}
                onEventClick={onEventClick}
                testIdPrefix="admin-calendar"
              />
            </div>
          )}
        </motion.div>
      )}

      {!loading && view === "month" && nav.selectedDate ? (
        <div className="border-t-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4 sm:hidden" aria-live="polite">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
            {formatEventDateLong(nav.selectedDate)}
          </p>
          {selectedDayEvents.length === 0 ? (
            <p className="m-0 mt-1 text-[13.5px] font-semibold text-[var(--sf-soft)]">Nothing on this day.</p>
          ) : (
            <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
              {selectedDayEvents.map((event) => {
                const colors = getEventDisplayStyle(event);
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => onEventClick(event)}
                      className={`flex w-full items-center gap-2.5 rounded-[12px] bg-white px-3 py-2.5 text-left ${G_FOCUS}`}
                      style={{ borderLeft: `4px solid ${colors.text}` }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{event.title}</span>
                        <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">
                          {event.isAllDay ? "All day" : formatEventTimeRange(event)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!readOnly && onDayClick ? (
            <button type="button" className={`${gBtnOutlineSm} mt-3 w-full`} onClick={() => onDayClick(nav.selectedDate!)}>
              <Plus className="h-4 w-4" aria-hidden />
              Add event on this day
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Detail drawer                                                       */
/* ------------------------------------------------------------------ */

export function GardenEventDetailPanel({
  theme,
  event,
  audienceLabel,
  onClose,
  onEdit,
  onDelete,
  actionsDisabled,
  deleting,
}: {
  theme: ParentThemeTokens;
  event: OrganizationEvent | null;
  audienceLabel?: string;
  onClose: () => void;
  onEdit: (event: OrganizationEvent) => void;
  onDelete: (event: OrganizationEvent) => void;
  actionsDisabled: boolean;
  deleting: boolean;
}) {
  // Keep the last event while the drawer animates out.
  const [shown, setShown] = useState<OrganizationEvent | null>(event);
  if (event && event !== shown) setShown(event);
  const current = event ?? shown;
  const colors = current ? getEventDisplayStyle(current) : null;

  return (
    <GSidePanel
      theme={theme}
      open={event != null}
      onClose={onClose}
      kicker="School event"
      title={current?.title ?? "Event"}
      testId="admin-event-detail-panel"
      panelId="admin-event-detail"
      headerAside={
        current && colors ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-extrabold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.text }} />
            {SCHOOL_EVENT_TYPE_LABELS[current.type]}
          </span>
        ) : null
      }
      footer={
        actionsDisabled || !current ? undefined : (
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              className={gBtnDangerSm}
              onClick={() => onDelete(current)}
              disabled={deleting}
              aria-busy={deleting || undefined}
              data-testid="admin-event-delete"
            >
              <BusyLabel busy={deleting} busyLabel="Deleting…" icon={<Trash2 className="h-4 w-4" aria-hidden />}>
                Delete
              </BusyLabel>
            </button>
            <button type="button" className={gBtnPopSm} onClick={() => onEdit(current)} disabled={deleting} data-testid="admin-event-edit">
              <Pencil className="h-4 w-4" aria-hidden />
              Edit event
            </button>
          </div>
        )
      }
    >
      {current ? (
        <div className="flex flex-col gap-5">
          <GardenFacts
            items={[
              { label: "Date", value: formatEventDateLong(current.date) },
              { label: "Time", value: current.isAllDay ? "All day" : formatEventTimeRange(current) || "—" },
              { label: "Who sees it", value: audienceLabel ?? "All families (school-wide)" },
              ...(current.location ? [{ label: "Location", value: current.location }] : []),
            ]}
          />
          {current.description ? (
            <div>
              <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">Details</p>
              <p className="m-0 mt-1 whitespace-pre-wrap text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]/85">
                {current.description}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </GSidePanel>
  );
}

/* ------------------------------------------------------------------ */
/* Form drawer                                                         */
/* ------------------------------------------------------------------ */

export function GardenEventFormPanel({
  theme,
  open,
  mode,
  form,
  errors,
  saving,
  programOptions,
  onClose,
  onChange,
  onSave,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  mode: "create" | "edit";
  form: EventFormState;
  errors: EventFormErrors;
  saving: boolean;
  programOptions: Array<{ id: string; name: string }>;
  onClose: () => void;
  onChange: (form: EventFormState) => void;
  onSave: () => void;
}) {
  const categoryOptions = (Object.keys(SCHOOL_EVENT_TYPE_LABELS) as SchoolEventType[]).map((type) => ({
    value: type,
    label: SCHOOL_EVENT_TYPE_LABELS[type],
  }));
  const audienceOptions = [
    { value: "", label: "All families (school-wide)" },
    ...programOptions.map((program) => ({ value: program.id, label: `${program.name} only` })),
  ];
  const defaultColor = getDefaultColorKeyForType(form.eventType);
  const showColorReset = form.colorManuallySet && form.colorKey !== defaultColor;
  const preview = getColorStyle(form.colorKey);

  const handleStartTimeChange = (time: string) => {
    const nextEnd = form.endTime || (time ? addMinutesToTimeInput(time, DEFAULT_EVENT_DURATION_MINUTES) : "");
    onChange({ ...form, time, endTime: nextEnd });
  };

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={onClose}
      kicker="School event"
      title={mode === "edit" ? "Edit event" : "Add event"}
      subtitle={form.date ? formatEventDateLong(form.date) : "Families see school events in the parent portal."}
      testId="admin-event-form-panel"
      panelId="admin-event-form"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={gBtnOutlineSm} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className={gBtnPopSm}
            onClick={onSave}
            disabled={saving}
            aria-busy={saving || undefined}
            data-testid="admin-event-save"
          >
            <BusyLabel busy={saving} busyLabel="Saving…">
              {mode === "edit" ? "Save changes" : "Add to calendar"}
            </BusyLabel>
          </button>
        </div>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <GardenField id="admin-event-title" label="Title" required error={errors.title}>
          <input
            id="admin-event-title"
            placeholder="Event title"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className={gInputClass(errors.title)}
            aria-invalid={errors.title ? true : undefined}
            data-garden-skip
            autoFocus
          />
        </GardenField>

        <GardenField id="admin-event-date" label="Date" required error={errors.date}>
          <input
            id="admin-event-date"
            type="date"
            value={form.date}
            onChange={(e) => onChange({ ...form, date: e.target.value })}
            className={gInputClass(errors.date)}
            aria-invalid={errors.date ? true : undefined}
            disabled={saving}
            data-garden-skip
          />
        </GardenField>

        <div className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
          <GardenSwitch
            checked={form.isAllDay}
            onChange={(isAllDay) => {
              if (isAllDay) {
                onChange({ ...form, isAllDay, time: "", endTime: "" });
                return;
              }
              const time = form.time || "09:00";
              const endTime = form.endTime || addMinutesToTimeInput(time, DEFAULT_EVENT_DURATION_MINUTES);
              onChange({ ...form, isAllDay, time, endTime });
            }}
            label="All day"
            description={form.isAllDay ? "No start or end time" : "Set a start and end time"}
          />
          {!form.isAllDay ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <GardenField id="admin-event-start" label="Start time" required error={errors.time}>
                <input
                  id="admin-event-start"
                  type="time"
                  value={form.time}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className={gInputClass(errors.time)}
                  data-garden-skip
                />
              </GardenField>
              <GardenField id="admin-event-end" label="End time">
                <input
                  id="admin-event-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => onChange({ ...form, endTime: e.target.value })}
                  className={gInputClass(null)}
                  data-garden-skip
                />
              </GardenField>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <GardenField id="admin-event-category" label="Category">
            <GardenSelect
              id="admin-event-category"
              value={form.eventType}
              onChange={(value) => {
                const typed = value as SchoolEventType;
                onChange({
                  ...form,
                  eventType: typed,
                  colorKey: form.colorManuallySet ? form.colorKey : getDefaultColorKeyForType(typed),
                });
              }}
              options={categoryOptions}
            />
          </GardenField>
          <GardenField
            id="admin-event-audience"
            label="Audience"
            hint="School-wide events appear on the main portal and every program portal. Program-only events appear in that program's portal."
          >
            <GardenSelect
              id="admin-event-audience"
              value={form.programId ?? ""}
              onChange={(value) => onChange({ ...form, programId: value ? value : null })}
              options={audienceOptions}
            />
          </GardenField>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-extrabold text-[var(--sf-ink)]" id="admin-event-color-label">
              Color
            </span>
            {showColorReset ? (
              <button
                type="button"
                className="text-[12px] font-extrabold text-[var(--sf-clay-deep)] hover:underline"
                onClick={() => onChange({ ...form, colorKey: defaultColor, colorManuallySet: false })}
              >
                Reset to category default
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-labelledby="admin-event-color-label">
            {SCHOOL_EVENT_COLOR_KEYS.map((key) => {
              const style = getColorStyle(key);
              const selected = form.colorKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Color ${key}`}
                  onClick={() => onChange({ ...form, colorKey: key, colorManuallySet: true })}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${G_FOCUS} ${
                    selected ? "border-[var(--sf-ink)] shadow-[0_2px_0_0_var(--sf-ink)]" : "border-white"
                  }`}
                  style={{ backgroundColor: style.text }}
                />
              );
            })}
            <span
              className="ml-1 inline-flex max-w-[200px] items-center truncate rounded-md px-2 py-1 text-[12px] font-bold"
              style={{ backgroundColor: preview.bg, color: preview.text, borderLeft: `3px solid ${preview.text}` }}
              aria-hidden
            >
              {form.title.trim() || "Preview"}
            </span>
          </div>
        </div>

        <GardenField id="admin-event-location" label="Location" optional>
          <input
            id="admin-event-location"
            placeholder="Location"
            value={form.location}
            onChange={(e) => onChange({ ...form, location: e.target.value })}
            className={gInputClass(null)}
            data-garden-skip
          />
        </GardenField>

        <GardenField id="admin-event-description" label="Description" optional>
          <textarea
            id="admin-event-description"
            placeholder="Add details families should know"
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            rows={4}
            className={gInputClass(null, "resize-y leading-relaxed")}
            data-garden-skip
          />
        </GardenField>
      </form>
    </GSidePanel>
  );
}
