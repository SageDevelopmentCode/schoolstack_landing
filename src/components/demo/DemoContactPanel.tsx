"use client";

import { Check, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DemoScheduler } from "@/components/scheduler/DemoScheduler";
import { mudkitchenDemoContact } from "@/data/school-demos/mudkitchen-demo-contact";
import { formatSelectedDate } from "@/lib/demo-scheduler";

const inputClassName =
  "w-full rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  schoolSlug: string;
  schoolName: string;
  logo: { src: string; alt: string; width?: number; height?: number };
}

export default function DemoContactPanel({ schoolSlug, schoolName, logo }: Props) {
  const { heading, subheading, scheduler, contact, form } = mudkitchenDemoContact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<{ date: string; time: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, string[]>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

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
          schoolName,
          role: "other",
          priorities: ["full"],
          prepNotes: `Booked from school concept demo walkthrough (${schoolSlug}).`,
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

  return (
    <div className="h-full overflow-y-auto bg-[#F7F1E7]">
      <div className="mx-auto flex max-w-3xl flex-col px-6 py-10 sm:px-10 sm:py-12">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width ?? 48}
            height={logo.height ?? 40}
            className="h-10 w-auto object-contain"
          />
          <h2 className="font-display text-xl font-semibold text-[#2E4A3C] sm:text-2xl">
            {heading}
          </h2>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-[#2E4A3C]/70 font-body">
          {subheading}
        </p>

        {booking ? (
          <div className="rounded-lg border border-[#2E4A3C]/10 bg-white px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2E4A3C] text-white">
              <Check className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-lg font-medium text-[#2E4A3C]">
              {form.successTitle}
            </h3>
            <p className="mt-2 text-sm text-[#2E4A3C]/70 font-body">{successMessage}</p>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-lg border border-black/[0.07] bg-white p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#2E4A3C]/80 font-body">
                    {form.nameLabel}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={form.namePlaceholder}
                    className={inputClassName}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#2E4A3C]/80 font-body">
                    {form.emailLabel}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={form.emailPlaceholder}
                    className={inputClassName}
                  />
                </label>
              </div>
              {!canBook ? (
                <p className="mt-3 text-xs text-[#2E4A3C]/55 font-body">{form.contactHint}</p>
              ) : null}
            </div>

            <div className="mb-4">
              <h3 className="font-display text-base font-semibold text-[#2E4A3C]">
                {scheduler.heading}
              </h3>
              <p className="mt-1 text-xs text-[#2E4A3C]/60 font-body">{scheduler.subheading}</p>
            </div>

            <div className="overflow-hidden rounded-lg border border-black/[0.07] bg-white">
              {availabilityLoading ? (
                <div className="flex items-center justify-center py-24 text-sm text-text-faint font-secondary">
                  Loading available times…
                </div>
              ) : availabilityError ? (
                <div className="flex items-center justify-center py-24 text-sm text-clay font-secondary">
                  {availabilityError}
                </div>
              ) : Object.keys(availabilitySlots).length === 0 ? (
                <div className="flex items-center justify-center py-24 text-sm text-[#2E4A3C]/70 font-body">
                  No demo times are available right now. Please reach out by email or phone below.
                </div>
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
              <p className="mt-3 text-sm text-red-600 font-body">{submitError}</p>
            ) : null}
          </>
        )}

        <div className="mt-8 rounded-lg border border-black/[0.07] bg-white px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2E4A3C]/50 font-body">
            {contact.eyebrow}
          </p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2E4A3C] font-body hover:text-[#233B2F] transition-colors"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            {contact.email}
          </a>
          <a
            href={contact.phoneHref}
            className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#2E4A3C] font-body hover:text-[#233B2F] transition-colors"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            {contact.phone}
            <span className="font-normal text-[#2E4A3C]/60">· text or call</span>
          </a>
          <p className="mt-2 text-xs text-[#2E4A3C]/60 font-body">{contact.blurb}</p>
        </div>
      </div>
    </div>
  );
}
