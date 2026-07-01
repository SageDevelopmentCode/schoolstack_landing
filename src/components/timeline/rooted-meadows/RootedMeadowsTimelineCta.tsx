"use client";

import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { FadeInView } from "@/components/ui/FadeInView";
import { DemoScheduler } from "@/components/scheduler/DemoScheduler";
import { mudkitchenDemoContact } from "@/data/school-demos/mudkitchen-demo-contact";
import { ROOTED_MEADOWS_TIMELINE_THEME } from "@/data/school-demos/rooted-meadows-timeline";
import { formatSelectedDate } from "@/lib/demo-scheduler";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SCHOOL_NAME = "Rooted Meadows Waldorf School";
const SCHOOL_SLUG = "rooted-meadows";

const inputClassName =
  "font-secondary w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2";

export default function RootedMeadowsTimelineCta() {
  const { contact, scheduler, form } = mudkitchenDemoContact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<{ date: string; time: string } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    Record<string, string[]>
  >({});
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );

  const canBook =
    name.trim().length > 0 && email.trim().length > 0 && EMAIL_RE.test(email.trim());

  useEffect(() => {
    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError(null);

    fetch("/api/availability")
      .then(async (res) => {
        const data = (await res.json()) as {
          slots?: Record<string, string[]>;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load availability");
        if (!cancelled) setAvailabilitySlots(data.slots ?? {});
      })
      .catch((err) => {
        if (!cancelled) {
          setAvailabilityError(
            err instanceof Error ? err.message : "Failed to load availability",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleScheduled = async (selected: { date: string; time: string }) => {
    if (isSubmitting || !canBook) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          schoolName: SCHOOL_NAME,
          conceptDemoSlug: SCHOOL_SLUG,
          role: "other",
          priorities: ["full"],
          prepNotes: "Booked from Rooted Meadows rollout timeline page.",
          scheduledDate: selected.date,
          scheduledTime: selected.time,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong");
        return;
      }

      setBooking(selected);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const successMessage = booking
    ? form.successMessage
        .replace("{date}", formatSelectedDate(booking.date))
        .replace("{time}", booking.time)
    : form.successMessage;

  const inputStyle = {
    borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
    color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary,
    backgroundColor: "white",
  } as const;

  return (
    <section className="px-6 pb-20 pt-4 lg:px-16">
      <div className="mx-auto max-w-[1100px]">
        <FadeInView>
          <div
            className="overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: "white",
              borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
            }}
          >
            <div className="grid lg:grid-cols-[1fr_1.1fr]">
              <div
                className="p-8 sm:p-10"
                style={{ backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.purpleStepBg }}
              >
                <p
                  className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.accentDark }}
                >
                  Next steps
                </p>
                <h2
                  className="font-heading mt-3 text-[clamp(1.5rem,2.5vw,2rem)] font-medium leading-tight"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
                >
                  Explore the full prototype
                </h2>
                <p
                  className="font-secondary mt-3 text-[15px] leading-relaxed"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                >
                  Walk through every capability in the interactive prototype —
                  each phase above links directly to the matching step.
                </p>
                <Link
                  href="/prototype/rooted-meadows-school"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-secondary mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.accent }}
                >
                  Open prototype
                  <ArrowRight size={16} aria-hidden />
                </Link>

                <div
                  className="mt-8 rounded-xl border bg-white p-5"
                  style={{ borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border }}
                >
                  <p
                    className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                  >
                    {contact.eyebrow}
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-secondary mt-3 inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.accentDark }}
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    {contact.email}
                  </a>
                  <a
                    href={contact.phoneHref}
                    className="font-secondary mt-2 flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.accentDark }}
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden />
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="border-t p-8 sm:p-10 lg:border-t-0 lg:border-l" style={{ borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border }}>
                <p
                  className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                >
                  {scheduler.heading}
                </p>
                <p
                  className="font-heading mt-2 text-xl font-medium"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
                >
                  {mudkitchenDemoContact.heading}
                </p>
                <p
                  className="font-secondary mt-2 text-sm"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                >
                  {scheduler.subheading}
                </p>

                {booking ? (
                  <div
                    className="font-secondary mt-6 rounded-xl border p-5 text-sm leading-relaxed"
                    style={{
                      borderColor: ROOTED_MEADOWS_TIMELINE_THEME.clayBorder,
                      backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.oliveStepBg,
                      color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary,
                    }}
                  >
                    <p className="font-semibold">{form.successTitle}</p>
                    <p className="mt-1">{successMessage}</p>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="timeline-name"
                          className="font-secondary mb-1.5 block text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                        >
                          {form.nameLabel}
                        </label>
                        <input
                          id="timeline-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={form.namePlaceholder}
                          className={inputClassName}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="timeline-email"
                          className="font-secondary mb-1.5 block text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                        >
                          {form.emailLabel}
                        </label>
                        <input
                          id="timeline-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={form.emailPlaceholder}
                          className={inputClassName}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <p
                      className="font-secondary mt-2 text-xs"
                      style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                    >
                      {form.contactHint}
                    </p>
                    <div className="mt-4">
                      {availabilityLoading ? (
                        <p
                          className="font-secondary text-sm"
                          style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                        >
                          Loading availability…
                        </p>
                      ) : availabilityError ? (
                        <p className="font-secondary text-sm text-red-600">
                          {availabilityError}
                        </p>
                      ) : Object.keys(availabilitySlots).length === 0 ? (
                        <p
                          className="font-secondary text-sm"
                          style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                        >
                          No times available right now — email us directly.
                        </p>
                      ) : (
                        <DemoScheduler
                          availabilitySlots={availabilitySlots}
                          onConfirm={handleScheduled}
                          isSubmitting={isSubmitting}
                          confirmDisabled={!canBook}
                        />
                      )}
                    </div>
                    {submitError ? (
                      <p className="font-secondary mt-3 text-sm text-red-600">
                        {submitError}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </FadeInView>

        <p
          className="font-secondary mt-8 text-center text-xs"
          style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
        >
          Prepared for Rooted Meadows Waldorf School · Platform by MudKitchen
        </p>
      </div>
    </section>
  );
}
