"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import { PublicSchedulerPreviewModal } from "@/components/scheduler/PublicSchedulerPreviewModal";
import {
  TIME_SLOTS,
  MONTH_NAMES,
  todayKey,
  todayMonthYear,
  formatSelectedDate,
} from "@/lib/demo-scheduler";

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
      (data ?? []).map((row) => `${row.date}|${row.time_slot}`)
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
      setBookedSlots([]);
      return;
    }
    loadBookedForDate(selectedDate);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-text-faint font-secondary">
        Loading…
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-3rem)] flex overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
    >
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-md mx-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-lg font-medium text-text mb-1">Demo availability</h1>
                <p className="text-sm text-text-muted font-secondary">
                  Toggle open time slots for each day. Booked slots stay visible but
                  won&apos;t appear on the public calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="shrink-0 flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm font-medium font-secondary text-text-muted hover:text-text hover:border-border-strong transition-colors"
              >
                <Eye size={15} />
                Preview public calendar
              </button>
            </div>

            {error && (
              <p className="text-sm text-clay font-secondary mb-4">{error}</p>
            )}

            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-all duration-150"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[14px] font-medium font-secondary text-text">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-all duration-150"
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
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-border bg-surface flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            {selectedDate ? (
              <>
                <p className="text-[10px] font-medium font-secondary text-text-faint uppercase tracking-widest mb-0.5">
                  Time slots
                </p>
                <p className="text-[13px] font-medium font-secondary text-text">
                  {formatSelectedDate(selectedDate)}
                </p>
              </>
            ) : (
              <p className="text-sm text-text-muted font-secondary">
                Select a date to manage slots
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedDate ? (
              <p className="text-sm text-text-faint text-center py-8">
                Click a date on the calendar to add or remove time slots
              </p>
            ) : selectedDate < today ? (
              <p className="text-sm text-text-faint text-center py-8">
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
                      className={`w-full h-10 rounded-lg border-2 text-[13px] font-medium font-secondary transition-all duration-150 ${
                        isOpen
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-text-muted hover:border-accent hover:text-accent"
                      } disabled:opacity-60`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {slot}
                        {isBooked && (
                          <span className="text-[10px] uppercase tracking-wide text-clay">
                            Booked
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {bookedSlots.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[10px] font-medium font-secondary text-text-faint uppercase tracking-widest mb-3">
                  Bookings
                </p>
                <ul className="flex flex-col gap-2">
                  {bookedSlots.map((b) => (
                    <li
                      key={b.scheduled_time}
                      className="text-[12px] font-secondary text-text-muted"
                    >
                      <span className="font-medium text-text">
                        {b.scheduled_time}
                      </span>
                      {" — "}
                      {b.name} ({b.school_name})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {canEditSelected && (
            <div className="p-4 border-t border-border text-[11px] text-text-faint font-secondary">
              Click a slot to open or close it. Changes save immediately.
            </div>
          )}
        </div>
      </div>

      <PublicSchedulerPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
