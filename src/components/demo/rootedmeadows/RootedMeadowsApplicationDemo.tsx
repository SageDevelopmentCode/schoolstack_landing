"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import {
  ROOTED_MEADOWS_APPLICATION_ACKNOWLEDGMENTS,
  ROOTED_MEADOWS_APPLICATION_COPY,
  ROOTED_MEADOWS_APPLICATION_SECTIONS,
  type ApplicationField,
} from "@/data/school-demos/rooted-meadows-application";
import { ROOTED_MEADOWS_ADMIN_COLORS } from "@/data/school-demos/rootedmeadows-admin-demo";
import { rootedMeadowsConfig } from "@/data/school-demos/rooted-meadows";

const C = ROOTED_MEADOWS_ADMIN_COLORS;
const TOTAL_STEPS = ROOTED_MEADOWS_APPLICATION_SECTIONS.length + 1;

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 16 : -16,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -16 : 16,
  }),
};

const stepTransition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const };

const inputFontClass = "font-[family-name:var(--font-poppins)]";

function fieldClassName() {
  return `w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${inputFontClass}`;
}

function ApplicationFieldInput({
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
        className={`${fieldClassName()} resize-y min-h-[88px]`}
        style={{ ...style, ...focusRing }}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={field.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClassName()}
        style={{ ...style, ...focusRing }}
      >
        <option value="">Select...</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="flex flex-wrap gap-4">
        {field.options?.map((option) => (
          <label
            key={option.value}
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: C.textPrimary }}
          >
            <input
              type="radio"
              name={field.id}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4"
              style={{ accentColor: C.accent }}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div>
        <input
          id={field.id}
          type="file"
          className={`block w-full text-sm ${inputFontClass} file:mr-3 file:rounded file:border-0 file:px-3 file:py-2 file:text-sm file:font-medium file:font-[family-name:var(--font-poppins)]`}
          style={{ color: C.textSecondary }}
        />
        {field.helpText ? (
          <p className="mt-1.5 text-xs" style={{ color: C.textSecondary }}>
            {field.helpText}
          </p>
        ) : null}
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

function ApplicationSignatureBlock({
  parentName,
  signedName,
  onSign,
}: {
  parentName: string;
  signedName: string | null;
  onSign: (name: string) => void;
}) {
  const [nameInput, setNameInput] = useState(parentName);
  const [editing, setEditing] = useState(false);

  if (signedName && !editing) {
    return (
      <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4">
        <p className="mb-1 text-xs font-medium text-emerald-600">Signed</p>
        <p
          className="text-2xl text-emerald-700"
          style={{ fontFamily: "'Georgia', cursive", fontStyle: "italic" }}
        >
          {signedName}
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-2 cursor-pointer text-xs text-emerald-600 underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div
      className="mt-6 rounded-md border p-4"
      style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
    >
      <p className="mb-2 text-xs font-medium" style={{ color: C.textSecondary }}>
        Parent / Guardian Signature
      </p>
      <input
        type="text"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        placeholder="Type your full name"
        className={`mb-3 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 ${inputFontClass}`}
        style={{
          borderColor: C.border,
          color: C.textPrimary,
          backgroundColor: rootedMeadowsConfig.theme.pageBg,
          "--tw-ring-color": `${C.accent}40`,
        } as CSSProperties}
      />
      <button
        type="button"
        disabled={!nameInput.trim()}
        onClick={() => {
          onSign(nameInput.trim());
          setEditing(false);
        }}
        className="cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        style={{ backgroundColor: C.accent }}
      >
        Click to Sign
      </button>
    </div>
  );
}

export default function RootedMeadowsApplicationDemo({
  onPayApplicationFee,
}: {
  onPayApplicationFee?: () => void;
} = {}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [acknowledgments, setAcknowledgments] = useState<Record<string, boolean>>({});
  const [signature, setSignature] = useState<string | null>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isAcknowledgmentStep = step === ROOTED_MEADOWS_APPLICATION_SECTIONS.length;
  const section = isAcknowledgmentStep
    ? null
    : ROOTED_MEADOWS_APPLICATION_SECTIONS[step];

  const stepContentKey = isAcknowledgmentStep
    ? "acknowledgments"
    : section?.id ?? "step";

  const allAcknowledged = ROOTED_MEADOWS_APPLICATION_ACKNOWLEDGMENTS.every(
    (item) => acknowledgments[item.id],
  );
  const canPayFee = allAcknowledged && Boolean(signature);

  const updateValue = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleContinue = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((current) => current + 1);
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((current) => current - 1);
      scrollToTop();
    }
  };

  const handlePayApplicationFee = () => {
    if (!canPayFee) return;
    onPayApplicationFee?.();
  };

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

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {step === 0 ? (
              <motion.div
                key="intro"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
                className="mb-8"
              >
                <h1
                  className="font-heading text-3xl font-semibold leading-tight"
                  style={{ color: C.accentDark }}
                >
                  {ROOTED_MEADOWS_APPLICATION_COPY.heading}
                </h1>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: C.textPrimary }}>
                  {ROOTED_MEADOWS_APPLICATION_COPY.intro}
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                  {ROOTED_MEADOWS_APPLICATION_COPY.helper}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mb-6 flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <div
                key={index}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    index <= step ? C.accent : C.border,
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={stepContentKey}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
            >
              {isAcknowledgmentStep ? (
                <div>
                  <h2
                    className="font-heading text-xl font-semibold"
                    style={{ color: C.accentDark }}
                  >
                    Parent acknowledgments
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
                    Please confirm the following before submitting your application.
                  </p>
                  <div className="mt-5 space-y-4">
                    {ROOTED_MEADOWS_APPLICATION_ACKNOWLEDGMENTS.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-3 rounded-md border px-4 py-3"
                        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(acknowledgments[item.id])}
                          onChange={(e) =>
                            setAcknowledgments((prev) => ({
                              ...prev,
                              [item.id]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ accentColor: C.accent }}
                        />
                        <span className="text-sm leading-relaxed" style={{ color: C.textPrimary }}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <ApplicationSignatureBlock
                    parentName={values.parentName ?? ""}
                    signedName={signature}
                    onSign={setSignature}
                  />
                </div>
              ) : section ? (
                <div>
                  <h2
                    className="font-heading text-xl font-semibold"
                    style={{ color: C.accentDark }}
                  >
                    {section.title}
                  </h2>
                  {section.description ? (
                    <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
                      {section.description}
                    </p>
                  ) : null}
                  <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                    {section.fields.map((field) => (
                      <label
                        key={field.id}
                        className={
                          field.width === "half" ? "block min-w-0" : "block min-w-0 sm:col-span-2"
                        }
                      >
                        <span
                          className="mb-1.5 block text-sm font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          {field.label}
                          {field.required ? (
                            <span style={{ color: C.accent }}> *</span>
                          ) : null}
                        </span>
                        <ApplicationFieldInput
                          field={field}
                          value={values[field.id] ?? ""}
                          onChange={(value) => updateValue(field.id, value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="shrink-0 px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-md border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
                style={{
                  borderColor: C.secondaryBtnBorder,
                  color: C.textPrimary,
                  backgroundColor: rootedMeadowsConfig.theme.pageBg,
                }}
              >
                {ROOTED_MEADOWS_APPLICATION_COPY.back}
              </button>
            ) : null}

            <div className="ml-auto flex shrink-0 gap-3">
              {isAcknowledgmentStep ? (
                <button
                  type="button"
                  onClick={handlePayApplicationFee}
                  disabled={!canPayFee}
                  className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: C.accent }}
                >
                  {ROOTED_MEADOWS_APPLICATION_COPY.payApplicationFee}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: C.accent }}
                >
                  {ROOTED_MEADOWS_APPLICATION_COPY.saveAndContinue}
                </button>
              )}
            </div>
          </div>
        </footer>
    </div>
  );
}
