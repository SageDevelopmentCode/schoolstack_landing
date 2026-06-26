"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import RootedMeadowsDateTimePicker from "@/components/demo/rootedmeadows/RootedMeadowsDateTimePicker";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import {
  getDefaultObservationDate,
  ROOTED_MEADOWS_OBSERVATION_AVAILABILITY,
  ROOTED_MEADOWS_OBSERVATION_COPY,
  ROOTED_MEADOWS_OBSERVATION_FIELDS,
} from "@/data/school-demos/rooted-meadows-observation";
import type { ApplicationField } from "@/data/school-demos/rooted-meadows-application";
import { ROOTED_MEADOWS_ADMIN_COLORS } from "@/data/school-demos/rootedmeadows-admin-demo";
import { rootedMeadowsConfig } from "@/data/school-demos/rooted-meadows";
import { formatSelectedDate, todayKey } from "@/lib/demo-scheduler";

const C = ROOTED_MEADOWS_ADMIN_COLORS;
const inputFontClass = "font-[family-name:var(--font-poppins)]";

const stepVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const stepTransition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const };

function fieldClassName() {
  return `w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${inputFontClass}`;
}

function ObservationFieldInput({
  field,
  value,
  onChange,
}: {
  field: ApplicationField;
  value: string;
  onChange: (value: string) => void;
}) {
  const style = {
    borderColor: C.border,
    color: C.textPrimary,
    backgroundColor: "#FFFFFF",
  } as const;

  const focusRing = { "--tw-ring-color": `${C.accent}40` } as CSSProperties;

  if (field.type === "textarea") {
    return (
      <textarea
        id={field.id}
        rows={field.rows ?? 3}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClassName()} min-h-[88px] resize-y`}
        style={{ ...style, ...focusRing }}
      />
    );
  }

  if (field.type === "radio") {
    return (
      <div className="flex gap-2" role="radiogroup" aria-labelledby={`${field.id}-label`}>
        {field.options?.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className="flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-all duration-150"
              style={
                isSelected
                  ? {
                      backgroundColor: C.accent,
                      borderColor: C.accent,
                      color: "#FFFFFF",
                    }
                  : {
                      backgroundColor: "#FFFFFF",
                      borderColor: C.border,
                      color: C.textPrimary,
                    }
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <input
      id={field.id}
      type={field.type}
      placeholder={field.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldClassName()}
      style={{ ...style, ...focusRing }}
    />
  );
}

const defaultObservationDate = getDefaultObservationDate(
  ROOTED_MEADOWS_OBSERVATION_AVAILABILITY,
  todayKey(),
);

export default function RootedMeadowsObservationDemo() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"form" | "confirmed">("form");
  const [selectedDate, setSelectedDate] = useState<string | null>(defaultObservationDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const updateValue = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const requiredFieldsFilled = ROOTED_MEADOWS_OBSERVATION_FIELDS.every((field) => {
    if (!field.required) return true;
    return Boolean(values[field.id]?.trim());
  });

  const canReserve =
    Boolean(selectedDate) &&
    Boolean(selectedTime) &&
    requiredFieldsFilled;

  const handleReserve = () => {
    if (!canReserve) return;
    setPhase("confirmed");
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReschedule = () => {
    setPhase("form");
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelVisit = () => {
    setSelectedDate(defaultObservationDate);
    setSelectedTime(null);
    setPhase("form");
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const outlineButtonStyle = {
    borderColor: C.border,
    color: C.textPrimary,
    backgroundColor: "#FFFFFF",
  } as const;

  const sectionLabelClassName =
    "text-xs font-medium uppercase tracking-wide";

  return (
    <div
      className={`flex h-full flex-col ${inputFontClass}`}
      style={{ backgroundColor: rootedMeadowsConfig.theme.pageBg }}
    >
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/Logo.png"
                alt="MudKitchen"
                width={28}
                height={28}
                className="h-7 w-auto shrink-0 object-contain"
              />
              <span className="font-display text-xs font-semibold leading-tight text-clay">
                MudKitchen
              </span>
            </div>
            <div
              className="h-8 w-px shrink-0"
              style={{ backgroundColor: C.border }}
              aria-hidden
            />
            <SchoolDemoWordmark
              logo={rootedMeadowsConfig.logo}
              className="h-8 w-auto max-w-[160px] object-contain"
            />
          </div>

          <AnimatePresence mode="wait">
            {phase === "confirmed" ? (
              <motion.div
                key="confirmed"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
              >
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-6">
                  <p className="mb-1 text-xs font-medium text-emerald-600">
                    {ROOTED_MEADOWS_OBSERVATION_COPY.confirmationHeading}
                  </p>
                  <h1
                    className="font-heading text-2xl font-semibold leading-tight text-emerald-800"
                  >
                    {selectedDate && selectedTime
                      ? `${formatSelectedDate(selectedDate)} at ${selectedTime}`
                      : "Visit scheduled"}
                  </h1>
                  <p className="mt-4 text-sm leading-relaxed text-emerald-800">
                    {ROOTED_MEADOWS_OBSERVATION_COPY.confirmation}
                  </p>
                </div>

                <div
                  className="mt-5 rounded-md border p-5"
                  style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                    {ROOTED_MEADOWS_OBSERVATION_COPY.confirmationNoActionNeeded}
                  </p>

                  <p
                    className={`${sectionLabelClassName} mt-5`}
                    style={{ color: C.textSecondary }}
                  >
                    {ROOTED_MEADOWS_OBSERVATION_COPY.confirmationChangePrompt}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleReschedule}
                      className="flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
                      style={outlineButtonStyle}
                    >
                      {ROOTED_MEADOWS_OBSERVATION_COPY.confirmationReschedule}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelVisit}
                      className="flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
                      style={outlineButtonStyle}
                    >
                      {ROOTED_MEADOWS_OBSERVATION_COPY.confirmationCancel}
                    </button>
                  </div>

                  <div
                    className="my-4 border-t"
                    style={{ borderColor: C.border }}
                    aria-hidden
                  />

                  <p
                    className={sectionLabelClassName}
                    style={{ color: C.textSecondary }}
                  >
                    {ROOTED_MEADOWS_OBSERVATION_COPY.confirmationQuestionsPrefix}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <a
                      href={`mailto:${ROOTED_MEADOWS_OBSERVATION_COPY.confirmationEmail}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
                      style={outlineButtonStyle}
                    >
                      <Mail size={14} aria-hidden />
                      {ROOTED_MEADOWS_OBSERVATION_COPY.confirmationEmailCta}
                    </a>
                    <a
                      href="tel:+12085571316"
                      className="flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
                      style={outlineButtonStyle}
                    >
                      <Phone size={14} aria-hidden />
                      {ROOTED_MEADOWS_OBSERVATION_COPY.confirmationPhoneCta}
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
              >
                <div className="mb-8">
                  <h1
                    className="font-heading text-3xl font-semibold leading-tight"
                    style={{ color: C.accentDark }}
                  >
                    {ROOTED_MEADOWS_OBSERVATION_COPY.heading}
                  </h1>
                  <p
                    className="mt-4 text-sm leading-relaxed"
                    style={{ color: C.textSecondary }}
                  >
                    {ROOTED_MEADOWS_OBSERVATION_COPY.intro}
                  </p>
                </div>

                <RootedMeadowsDateTimePicker
                  availabilitySlots={ROOTED_MEADOWS_OBSERVATION_AVAILABILITY}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                />

                <div className="mt-8 space-y-5">
                  {ROOTED_MEADOWS_OBSERVATION_FIELDS.map((field) => (
                    <label key={field.id} className="block min-w-0">
                      <span
                        id={`${field.id}-label`}
                        className="mb-1.5 block text-sm font-medium"
                        style={{ color: C.textPrimary }}
                      >
                        {field.label}
                        {field.required ? (
                          <span style={{ color: C.accent }}> *</span>
                        ) : null}
                      </span>
                      <ObservationFieldInput
                        field={field}
                        value={values[field.id] ?? ""}
                        onChange={(value) => updateValue(field.id, value)}
                      />
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {phase === "form" ? (
        <footer className="shrink-0 px-6 py-4">
          <div className="mx-auto flex max-w-3xl justify-end">
            <button
              type="button"
              onClick={handleReserve}
              disabled={!canReserve}
              className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: C.accent }}
            >
              {ROOTED_MEADOWS_OBSERVATION_COPY.reserveObservation}
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
