"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/sections/Navbar";
import { DemoScheduler } from "@/components/scheduler/DemoScheduler";
import { formatSelectedDate } from "@/lib/demo-scheduler";

// ── Types ──────────────────────────────────────────────────────────────────────

type Role = "starting" | "running" | "private" | "program" | "other";
type Priority =
  | "enrollment"
  | "communication"
  | "billing"
  | "admissions"
  | "operations"
  | "full";
type StudentCount = "0-10" | "11-25" | "26-75" | "76+";
type LaunchTimeline = "within-3" | "3-6" | "6-12" | "exploring";

interface FormData {
  name: string;
  email: string;
  schoolName: string;
  role: Role | "";
  launchTimeline: LaunchTimeline | "";
  studentCount: StudentCount | "";
  currentSystems: string;
  priorities: Priority[];
  websiteUrl: string;
  currentTools: string;
  prepNotes: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const ROLES: { id: Role; label: string }[] = [
  { id: "starting", label: "Starting a microschool" },
  { id: "running", label: "Already running one" },
  { id: "private", label: "Private school operator" },
  { id: "program", label: "Program / enrichment model" },
  { id: "other", label: "Other" },
];

const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "enrollment", label: "Enrollment & inquiries" },
  { id: "communication", label: "Family communication" },
  { id: "billing", label: "Tuition & billing" },
  { id: "admissions", label: "Admissions / onboarding" },
  { id: "operations", label: "Daily operations" },
  { id: "full", label: "I want the full system" },
];

const STUDENT_COUNTS: { id: StudentCount; label: string }[] = [
  { id: "0-10", label: "0–10 students" },
  { id: "11-25", label: "11–25 students" },
  { id: "26-75", label: "26–75 students" },
  { id: "76+", label: "76+ students" },
];

const LAUNCH_TIMELINES: { id: LaunchTimeline; label: string }[] = [
  { id: "within-3", label: "Within 3 months" },
  { id: "3-6", label: "3–6 months from now" },
  { id: "6-12", label: "6–12 months from now" },
  { id: "exploring", label: "Just exploring for now" },
];

// ── Scheduler ──────────────────────────────────────────────────────────────────

// ── Animation ──────────────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

const slideIn = {
  initial: { opacity: 0, x: 48 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease },
  },
  exit: {
    opacity: 0,
    x: -48,
    transition: { duration: 0.28, ease: exitEase },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22 },
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-lg border-2 text-[14px] font-medium font-secondary transition-all duration-150 cursor-pointer ${
        selected
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
            selected ? "border-accent bg-accent" : "border-border-strong bg-transparent"
          }`}
        >
          {selected && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path
                d="M1.5 4L3.5 6L6.5 2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        {label}
      </span>
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium font-secondary text-text-faint uppercase tracking-widest mb-3">
      {children}
    </div>
  );
}

function TextInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hasError,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium font-secondary text-text-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-12 px-4 rounded-lg border text-[14px] font-secondary text-text placeholder:text-text-faint focus:outline-none transition-colors duration-150 w-full bg-surface md:bg-bg ${
          hasError
            ? "border-clay focus:border-clay"
            : "border-border focus:border-accent"
        }`}
      />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function GetStartedPage() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [showOptional, setShowOptional] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booking, setBooking] = useState<{ date: string; time: string } | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, string[]>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    schoolName: "",
    role: "",
    launchTimeline: "",
    studentCount: "",
    currentSystems: "",
    priorities: [],
    websiteUrl: "",
    currentTools: "",
    prepNotes: "",
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (step !== 1) return;

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
            err instanceof Error ? err.message : "Failed to load availability"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;

    const colors = ["#A05C45", "#2E4A3C", "#C5D5B8", "#E8D5C8", "#F7F1E7"];

    const burst = (origin: { x: number; y: number }, angle: number) =>
      confetti({
        particleCount: 60,
        spread: 70,
        angle,
        origin,
        colors,
        scalar: 1.1,
        gravity: 0.9,
        drift: 0,
      });

    // Two cannons from the bottom-left and bottom-right
    const t1 = setTimeout(() => burst({ x: 0.2, y: 0.9 }, 65), 0);
    const t2 = setTimeout(() => burst({ x: 0.8, y: 0.9 }, 115), 80);
    const t3 = setTimeout(() => burst({ x: 0.15, y: 0.85 }, 75), 300);
    const t4 = setTimeout(() => burst({ x: 0.85, y: 0.85 }, 105), 380);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [step]);

  const branchType =
    form.role === "starting"
      ? "launch"
      : form.role === "private"
      ? "systems"
      : form.role !== ""
      ? "students"
      : null;

  const branchFilled =
    branchType === "launch"
      ? !!form.launchTimeline
      : branchType === "systems"
      ? !!form.currentSystems.trim()
      : branchType === "students"
      ? !!form.studentCount
      : form.role === "";

  function validate(): boolean {
    const errs = new Set<string>();
    if (!form.name.trim()) errs.add("name");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.add("email");
    if (!form.schoolName.trim()) errs.add("schoolName");
    if (!form.role) errs.add("role");
    if (!branchFilled) errs.add("branch");
    if (form.priorities.length === 0) errs.add("priority");
    setErrors(errs);
    return errs.size === 0;
  }

  function handleContinue() {
    if (validate()) {
      setSubmitError(null);
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleScheduled(selected: { date: string; time: string }) {
    if (isSubmitting || !form.role) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          schoolName: form.schoolName,
          role: form.role,
          launchTimeline: form.launchTimeline || null,
          studentCount: form.studentCount || null,
          currentSystems: form.currentSystems,
          priorities: form.priorities,
          websiteUrl: form.websiteUrl,
          currentTools: form.currentTools,
          prepNotes: form.prepNotes,
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
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleLabel = ROLES.find((r) => r.id === form.role)?.label ?? "";
  const hasErrors = errors.size > 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-[108px] pb-28 px-6">
        <div className={`${step === 1 ? "max-w-[760px]" : "max-w-[600px]"} mx-auto transition-[max-width] duration-300`}>

          {/* Progress indicator */}
          <AnimatePresence>
            {step < 2 && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex flex-col items-center mb-6 md:mb-10 gap-3"
              >
                <div className="text-[11px] font-medium font-secondary text-text-faint uppercase tracking-widest">
                  Step {step + 1} of 2
                </div>
                <div className="flex items-center gap-2">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      style={{
                        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                      }}
                      className={`rounded-full ${
                        i === step
                          ? "w-6 h-2 bg-accent"
                          : i < step
                          ? "w-2 h-2 bg-accent-soft"
                          : "w-2 h-2 bg-border"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ── STEP 0: Qualification form ────────────────────────────────── */}
            {step === 0 && (
              <motion.div key="step-form" {...slideIn}>

                <div className="mb-8">
                  <h1 className="font-display text-[clamp(1.85rem,4.5vw,2.6rem)] leading-[1.05] text-text">
                    Let&apos;s make this{" "}
                    <em style={{ color: "var(--color-clay)", fontStyle: "italic" }}>
                      relevant to your school.
                    </em>
                  </h1>
                  <p className="text-[15px] text-text-muted font-secondary mt-3 leading-relaxed">
                    A few quick details so we can tailor the demo to how you run things.
                  </p>
                </div>

                <div className="flex flex-col gap-7 md:gap-9 md:bg-surface md:border md:border-border md:rounded-xl md:p-8 md:shadow-sm">

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <TextInput
                      label="Full name"
                      value={form.name}
                      onChange={(v) => {
                        set("name", v);
                        setErrors((e) => { const n = new Set(e); n.delete("name"); return n; });
                      }}
                      placeholder="Jane Smith"
                      hasError={errors.has("name")}
                    />
                    <TextInput
                      label="Work email"
                      type="email"
                      value={form.email}
                      onChange={(v) => {
                        set("email", v);
                        setErrors((e) => { const n = new Set(e); n.delete("email"); return n; });
                      }}
                      placeholder="jane@yourschool.com"
                      hasError={errors.has("email")}
                    />
                  </div>

                  {/* School name */}
                  <TextInput
                    label="School name"
                    value={form.schoolName}
                    onChange={(v) => {
                      set("schoolName", v);
                      setErrors((e) => { const n = new Set(e); n.delete("schoolName"); return n; });
                    }}
                    placeholder="Maple Ridge Microschool"
                    hasError={errors.has("schoolName")}
                  />

                  {/* Role */}
                  <div>
                    <FieldLabel>What best describes you?</FieldLabel>
                    <div
                      className={`rounded-xl ${errors.has("role") ? "ring-1 ring-clay/40" : ""}`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ROLES.map((r) => (
                          <ChoiceButton
                            key={r.id}
                            label={r.label}
                            selected={form.role === r.id}
                            onClick={() => {
                              set("role", r.id);
                              set("launchTimeline", "");
                              set("studentCount", "");
                              set("currentSystems", "");
                              setErrors((e) => {
                                const n = new Set(e);
                                n.delete("role");
                                n.delete("branch");
                                return n;
                              });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Branching follow-up */}
                  <AnimatePresence mode="wait">
                    {branchType === "launch" && (
                      <motion.div key="branch-launch" {...fadeUp}>
                        <FieldLabel>When are you planning to launch?</FieldLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {LAUNCH_TIMELINES.map((t) => (
                            <ChoiceButton
                              key={t.id}
                              label={t.label}
                              selected={form.launchTimeline === t.id}
                              onClick={() => {
                                set("launchTimeline", t.id);
                                setErrors((e) => { const n = new Set(e); n.delete("branch"); return n; });
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {branchType === "students" && (
                      <motion.div key="branch-students" {...fadeUp}>
                        <FieldLabel>
                          {form.role === "running"
                            ? "How many students are you managing today?"
                            : "Student count or expected enrollment"}
                        </FieldLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {STUDENT_COUNTS.map((s) => (
                            <ChoiceButton
                              key={s.id}
                              label={s.label}
                              selected={form.studentCount === s.id}
                              onClick={() => {
                                set("studentCount", s.id);
                                setErrors((e) => { const n = new Set(e); n.delete("branch"); return n; });
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {branchType === "systems" && (
                      <motion.div key="branch-systems" {...fadeUp}>
                        <label className="text-[11px] font-medium font-secondary text-text-faint uppercase tracking-widest block mb-2">
                          What systems are you currently using?
                        </label>
                        <input
                          type="text"
                          value={form.currentSystems}
                          onChange={(e) => {
                            set("currentSystems", e.target.value);
                            setErrors((e2) => { const n = new Set(e2); n.delete("branch"); return n; });
                          }}
                          placeholder="e.g. FACTS, Veracross, Google Workspace…"
                          className={`h-12 px-4 rounded-lg border text-[14px] font-secondary text-text placeholder:text-text-faint focus:outline-none transition-colors duration-150 w-full bg-surface md:bg-bg ${
                            errors.has("branch") ? "border-clay" : "border-border focus:border-accent"
                          }`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Priority — multi-select */}
                  <div>
                    <FieldLabel>Biggest priority right now <span className="normal-case tracking-normal font-normal text-text-faint">(pick all that apply)</span></FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PRIORITIES.map((p) => (
                        <ChoiceButton
                          key={p.id}
                          label={p.label}
                          selected={form.priorities.includes(p.id)}
                          onClick={() => {
                            set(
                              "priorities",
                              form.priorities.includes(p.id)
                                ? form.priorities.filter((x) => x !== p.id)
                                : [...form.priorities, p.id]
                            );
                            setErrors((e) => { const n = new Set(e); n.delete("priority"); return n; });
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Optional accordion */}
                  <div className="border-t border-border pt-5">
                    <button
                      type="button"
                      onClick={() => setShowOptional(!showOptional)}
                      className="flex items-center gap-1.5 text-[13px] font-medium font-secondary text-text-muted hover:text-text transition-colors duration-150"
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${showOptional ? "rotate-180" : ""}`}
                      />
                      Add a little context{" "}
                      <span className="text-text-faint font-normal">(optional)</span>
                    </button>

                    <AnimatePresence>
                      {showOptional && (
                        <motion.div
                          key="optional-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            transition: { duration: 0.32, ease },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: { duration: 0.22 },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-5 pt-5">
                            <TextInput
                              label="Website URL"
                              type="url"
                              value={form.websiteUrl}
                              onChange={(v) => set("websiteUrl", v)}
                              placeholder="https://yourschool.com"
                            />
                            <TextInput
                              label="Current tools used"
                              value={form.currentTools}
                              onChange={(v) => set("currentTools", v)}
                              placeholder="Google Sheets, Notion, Stripe…"
                            />
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-medium font-secondary text-text-muted">
                                Anything you want us to prep before the demo
                              </label>
                              <textarea
                                value={form.prepNotes}
                                onChange={(e) => set("prepNotes", e.target.value)}
                                placeholder="e.g. We're mid-enrollment season and struggling with…"
                                rows={3}
                                className="px-4 py-3 rounded-lg border border-border bg-surface md:bg-bg text-[14px] font-secondary text-text placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors duration-150 w-full resize-none"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Inline error message */}
                  <AnimatePresence>
                    {hasErrors && (
                      <motion.p
                        key="error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[13px] font-secondary -mt-2"
                        style={{ color: "var(--color-clay)" }}
                      >
                        Please fill in the highlighted fields above.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4">
                    <button
                      type="button"
                      onClick={handleContinue}
                      className="inline-flex items-center gap-2 bg-clay text-white rounded-pill h-12 px-8 text-sm font-medium font-secondary hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
                      style={{ backgroundColor: "var(--color-clay)" }}
                    >
                      Pick a time
                      <ChevronRight size={15} />
                    </button>
                    <p className="text-[12px] text-text-faint font-secondary leading-snug text-center sm:text-left">
                      No commitment. We&apos;ll tailor everything to your school.
                    </p>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Scheduler ─────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step-scheduler" {...slideIn}>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitError(null);
                    setStep(0);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-1.5 text-[13px] font-medium font-secondary text-text-muted hover:text-text transition-colors duration-150 mb-6"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>

                <div className="mb-8">
                  <h1 className="font-display text-[clamp(1.85rem,4.5vw,2.6rem)] leading-[1.05] text-text">
                    Pick a time{" "}
                    <em style={{ color: "var(--color-clay)", fontStyle: "italic" }}>
                      that works.
                    </em>
                  </h1>
                  <p className="text-[15px] text-text-muted font-secondary mt-3 leading-relaxed">
                    We&apos;ll walk through the workflows that matter most to your school.
                  </p>
                </div>

                {/* Reassurance strip */}
                <div
                  className="flex items-start gap-3 mb-6 px-4 py-3.5 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-accent-highlight)",
                    borderColor: "var(--color-accent-soft)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--color-accent)" }}
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M8 5.5v3.5M8 11v.25"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p
                    className="text-[13px] font-secondary leading-snug"
                    style={{ color: "var(--color-accent)" }}
                  >
                    You&apos;ll see how this could work for your school, with time for
                    questions. 30 minutes, no slides, just your workflows.
                  </p>
                </div>

                {/* Scheduler */}
                <div className="md:bg-surface md:border md:border-border md:rounded-xl md:overflow-hidden md:shadow-sm">
                  {availabilityLoading ? (
                    <div className="flex items-center justify-center py-24 text-sm text-text-faint font-secondary">
                      Loading available times…
                    </div>
                  ) : availabilityError ? (
                    <div className="flex items-center justify-center py-24 text-sm text-clay font-secondary">
                      {availabilityError}
                    </div>
                  ) : Object.keys(availabilitySlots).length === 0 ? (
                    <div className="flex items-center justify-center py-24 text-sm text-text-muted font-secondary">
                      No demo times are available right now. Please check back soon.
                    </div>
                  ) : (
                    <DemoScheduler
                      availabilitySlots={availabilitySlots}
                      onConfirm={handleScheduled}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>

                {submitError && (
                  <p
                    className="mt-4 text-[13px] font-secondary text-center"
                    style={{ color: "var(--color-clay)" }}
                  >
                    {submitError} Please try again or contact us directly.
                  </p>
                )}
              </motion.div>
            )}

            {/* ── STEP 2: Confirmation ──────────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step-confirm" {...fadeUp} className="text-center">

                {/* Check icon */}
                <div className="flex justify-center mb-7">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-accent-highlight)" }}
                  >
                    <Check size={26} style={{ color: "var(--color-accent)" }} strokeWidth={2.5} />
                  </div>
                </div>

                <h1 className="font-display text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.02] text-text mb-4">
                  You&apos;re booked.
                </h1>

                <p className="text-[16px] text-text-muted font-secondary leading-relaxed max-w-[44ch] mx-auto mb-4">
                  We&apos;ll tailor the session around your school
                  {roleLabel ? `, your situation as ${roleLabel.toLowerCase()},` : ","} and
                  what you want to improve first.
                </p>

                {booking && (
                  <p className="text-[15px] font-medium font-secondary text-text mb-10">
                    {formatSelectedDate(booking.date)} at {booking.time}{" "}
                    <span className="text-text-faint font-normal">Central (CT)</span>
                  </p>
                )}

                {!booking && <div className="mb-10" />}

                {/* Prep card */}
                <div
                  className="text-left mb-8 md:bg-surface md:border md:border-border md:rounded-xl md:p-7 md:shadow-sm"
                >
                  <div className="text-[11px] font-medium font-secondary text-text-faint uppercase tracking-widest mb-4">
                    Helpful before the call
                  </div>
                  <ul className="flex flex-col gap-3.5">
                    {[
                      "Your current enrollment process",
                      "How you handle tuition and billing today",
                      "How you communicate with families",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div
                          className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: "var(--color-accent-highlight)" }}
                        >
                          <Check
                            size={9}
                            style={{ color: "var(--color-accent)" }}
                            strokeWidth={2.5}
                          />
                        </div>
                        <span className="text-[14px] font-secondary text-text-muted leading-snug">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href="/"
                    className="text-[13px] font-secondary text-text-faint hover:text-text-muted transition-colors duration-150"
                  >
                    ← Back to home
                  </Link>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
