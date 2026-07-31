"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import { PublicSchedulerPreviewModal } from "@/components/scheduler/PublicSchedulerPreviewModal";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { ADMIN_CALENDAR_COLORS } from "@/lib/admin-ui/tokens";
import {
  TIME_SLOTS,
  MONTH_NAMES,
  todayKey,
  todayMonthYear,
  formatSelectedDate,
} from "@/lib/demo-scheduler";

type OpenSlot = {
  date: string;
  time_slot: string;
};

type BookedSlot = {
  scheduled_time: string;
  name: string;
  school_name: string;
};

export default function AvailabilityPage() {
  const supabase = createClient();
  const initial = todayMonthYear();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openSlots, setOpenSlots] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const today = todayKey();

  const loadMonthSlots = useCallback(async () => {
    const start = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    const endMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const endYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const endDay = new Date(endYear, endMonth + 1, 0).getDate();
    const end = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

    const { data, error: fetchError } = await supabase
      .from("demo_availability_slots")
      .select("date, time_slot")
      .gte("date", start)
      .lte("date", end);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const slotSet = new Set(
      ((data as OpenSlot[]) ?? []).map((row) => `${row.date}|${row.time_slot}`)
    );
    setOpenSlots(slotSet);
  }, [supabase, viewYear, viewMonth]);

  const loadBookedForDate = useCallback(
    async (date: string) => {
      const { data, error: fetchError } = await supabase
        .from("demo_requests")
        .select("scheduled_time, name, school_name")
        .eq("scheduled_date", date)
        .eq("status", "scheduled");

      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setBookedSlots((data as BookedSlot[]) ?? []);
    },
    [supabase]
  );

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      await loadMonthSlots();
      setLoading(false);
    }
    init();
  }, [loadMonthSlots]);

  useEffect(() => {
    if (!selectedDate) {
      queueMicrotask(() => setBookedSlots([]));
      return;
    }
    queueMicrotask(() => {
      void loadBookedForDate(selectedDate);
    });
  }, [selectedDate, loadBookedForDate]);

  const availableDates = new Set(
    [...openSlots].map((key) => key.split("|")[0])
  );

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  async function toggleSlot(timeSlot: string) {
    if (!selectedDate || selectedDate < today) return;

    const key = `${selectedDate}|${timeSlot}`;
    const isOpen = openSlots.has(key);
    setToggling(timeSlot);
    setError(null);

    if (isOpen) {
      const { error: deleteError } = await supabase
        .from("demo_availability_slots")
        .delete()
        .eq("date", selectedDate)
        .eq("time_slot", timeSlot);

      if (deleteError) {
        setError(deleteError.message);
      } else {
        setOpenSlots((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    } else {
      const { error: insertError } = await supabase
        .from("demo_availability_slots")
        .insert({ date: selectedDate, time_slot: timeSlot });

      if (insertError) {
        setError(insertError.message);
      } else {
        setOpenSlots((prev) => new Set(prev).add(key));
      }
    }

    setToggling(null);
  }

  const bookedTimes = new Set(bookedSlots.map((b) => b.scheduled_time));
  const canEditSelected = selectedDate !== null && selectedDate >= today;

  if (loading) return <AdminPageState variant="loading" />;

  return (
    <div className="h-[calc(100vh-3rem)] flex overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-md mx-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-lg font-semibold text-admin-text mb-1">
                  Demo availability
                </h1>
                <p className="text-sm text-admin-muted">
                  Toggle open time slots for each day. Booked slots stay visible
                  but won&apos;t appear on the public calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="shrink-0 flex items-center gap-2 h-9 px-3 rounded-admin-md border border-admin-border text-sm font-medium text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30"
              >
                <Eye size={15} />
                Preview public calendar
              </button>
            </div>

            {error ? (
              <p className="text-sm text-admin-error mb-4">{error}</p>
            ) : null}

            <div className="bg-admin-surface border border-admin-border rounded-admin-md p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-admin-sm text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg transition-all duration-150"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-admin-text">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-admin-sm text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg transition-all duration-150"
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <CalendarGrid
                year={viewYear}
                month={viewMonth}
                selected={selectedDate}
                onSelect={setSelectedDate}
                availableDates={availableDates}
                minDate={today}
                editable
                colors={ADMIN_CALENDAR_COLORS}
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-admin-border bg-admin-surface flex flex-col overflow-hidden">
          <div className="p-4 border-b border-admin-border">
            {selectedDate ? (
              <>
                <p className="text-[10px] font-medium text-admin-faint uppercase tracking-widest mb-0.5">
                  Time slots
                </p>
                <p className="text-sm font-medium text-admin-text">
                  {formatSelectedDate(selectedDate)}
                </p>
              </>
            ) : (
              <p className="text-sm text-admin-muted">
                Select a date to manage slots
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedDate ? (
              <p className="text-sm text-admin-faint text-center py-8">
                Click a date on the calendar to add or remove time slots
              </p>
            ) : selectedDate < today ? (
              <p className="text-sm text-admin-faint text-center py-8">
                Past dates can&apos;t be edited
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isOpen = openSlots.has(`${selectedDate}|${slot}`);
                  const isBooked = bookedTimes.has(slot);
                  const disabled = toggling === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleSlot(slot)}
                      className={`w-full h-10 rounded-admin-md border text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 ${
                        isOpen
                          ? "border-admin-accent bg-admin-accent-soft text-admin-accent"
                          : "border-admin-border text-admin-muted hover:border-admin-accent hover:text-admin-accent"
                      } disabled:opacity-60`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {slot}
                        {isBooked ? (
                          <span className="text-[10px] uppercase tracking-wide text-admin-warning">
                            Booked
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {bookedSlots.length > 0 ? (
              <div className="mt-6 pt-4 border-t border-admin-border">
                <p className="text-[10px] font-medium text-admin-faint uppercase tracking-widest mb-3">
                  Bookings
                </p>
                <ul className="flex flex-col gap-2">
                  {bookedSlots.map((b) => (
                    <li
                      key={b.scheduled_time}
                      className="text-xs text-admin-muted"
                    >
                      <span className="font-medium text-admin-text">
                        {b.scheduled_time}
                      </span>
                      {" — "}
                      {b.name} ({b.school_name})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {canEditSelected ? (
            <div className="p-4 border-t border-admin-border text-[11px] text-admin-faint">
              Click a slot to open or close it. Changes save immediately.
            </div>
          ) : null}
        </div>
      </div>

      <PublicSchedulerPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
