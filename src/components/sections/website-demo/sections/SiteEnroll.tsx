"use client";

import { useState, type FormEvent, type RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { Tape } from "@/components/garden/ui";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import { SITE_BODY, SITE_CONTAINER, SITE_EASE, SITE_SECTION } from "../site-garden-theme";
import { keepHyphenated, SitePill, SiteReveal } from "../garden/SiteKit";

const FIELD =
  "h-14 w-full rounded-2xl border-2 border-[var(--sf-ink)] bg-white px-5 text-[15px] font-semibold text-[var(--sf-ink)] placeholder:font-semibold placeholder:text-[var(--sf-soft)] transition focus:outline-none focus:ring-4 focus:ring-[var(--sf-clay)]/25";

const NEXT_STEPS = [
  { title: "Send your inquiry", desc: "Share a little about your family and learner." },
  { title: "Hear back from the school", desc: "Someone follows up to answer your questions." },
  { title: "Find your next step", desc: "Talk through fit, timing, and how to enroll." },
] as const;

const STEP_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-sky)]"] as const;

type Props = {
  form: SchoolWebsiteDemoConfig["form"];
  formRef: RefObject<HTMLElement | null>;
  onExplorePrograms: () => void;
};

function SelectField({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        aria-label={placeholder}
        className={`${FIELD} cursor-pointer appearance-none pr-12 ${value ? "" : "text-[var(--sf-soft)]"}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]"
        strokeWidth={2.6}
        aria-hidden
      />
    </div>
  );
}

/** "What happens next" beside the inquiry form, written on notebook paper. Calm: no tilt on the form. */
export default function SiteEnroll({ form, formRef, onExplorePrograms }: Props) {
  const [data, setData] = useState({ name: "", email: "", studentName: "", grade: "", program: "" });
  const [submitted, setSubmitted] = useState(false);
  const reduce = useReducedMotion();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="form" ref={formRef} className={`scroll-mt-[88px] bg-[var(--sf-peach)] ${SITE_SECTION}`}>
      <div className={`${SITE_CONTAINER} grid gap-10 @5xl/site:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] @5xl/site:gap-12`}>
        <SiteReveal className="flex flex-col gap-8">
          <div className="sf-polaroid relative mx-auto w-full max-w-[420px]" style={{ rotate: "-2deg" }}>
            <Tape color="var(--sf-mint)" className="-top-3 left-1/2 h-5 w-16 -translate-x-1/2 rotate-3" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[3px]">
              <Image src={form.sidebarImage} fill sizes="420px" className="object-cover" alt="" />
            </div>
            <p className="px-2 pb-1 pt-3 text-[15px] font-bold leading-snug text-[var(--sf-ink)]">
              &ldquo;{form.sidebarQuote}&rdquo;
            </p>
          </div>

          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-ink)]/70">What happens next</p>
            <ol className="mt-5 space-y-3">
              {NEXT_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-[20px] border-2 border-[var(--sf-ink)] bg-white p-4 shadow-[0_3px_0_0_var(--sf-ink)]"
                >
                  <span
                    className={`sf-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] text-[0.95rem] text-[var(--sf-ink)] ${STEP_TINTS[i]}`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[16px] font-extrabold text-[var(--sf-ink)]">{step.title}</span>
                    <span className="mt-0.5 block text-[14px] leading-snug text-[var(--sf-soft)]">{step.desc}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </SiteReveal>

        <SiteReveal delay={0.08}>
          {/* The walkthrough and "Start an inquiry" scroll here, so phones land on the fields, not the photo above. */}
          <div id="form-card" className="sf-paper scroll-mt-[88px] rounded-[26px] border-2 border-[var(--sf-ink)] p-7 shadow-[0_8px_0_0_var(--sf-ink)] @3xl/site:rounded-[32px] @3xl/site:p-10">
            <SitePill>{form.eyebrow}</SitePill>
            <h2 className="sf-display mt-5 text-balance text-[clamp(2rem,3.4cqw,3rem)] leading-[1] text-[var(--sf-ink)]">
              {keepHyphenated(form.heading)}
            </h2>
            <p className={`${SITE_BODY} mt-4`}>{form.description}</p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="mt-10 rounded-[24px] border-2 border-[var(--sf-ink)] bg-[var(--sf-mint)] px-6 py-12 text-center"
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: SITE_EASE }}
                >
                  <motion.span
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] text-[var(--sf-on-clay)] shadow-[0_4px_0_0_var(--sf-ink)]"
                    initial={reduce ? false : { scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
                  >
                    <Check className="h-8 w-8" strokeWidth={3} aria-hidden />
                  </motion.span>
                  <p className="sf-display mt-6 text-[1.8rem] leading-none text-[var(--sf-ink)]">{form.successTitle}</p>
                  <p className={`${SITE_BODY} mx-auto mt-3 max-w-[420px] !text-[var(--sf-ink)]/75`}>{form.successMessage}</p>
                  <DemoWebsiteButton variant="outline" className="mt-7" onClick={onExplorePrograms}>
                    Explore our programs
                    <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                  </DemoWebsiteButton>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="mt-9 grid gap-3 @3xl/site:grid-cols-2"
                  onSubmit={handleSubmit}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                >
                  <input
                    type="text"
                    placeholder="Your name"
                    aria-label="Parent or guardian name"
                    value={data.name}
                    onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
                    required
                    className={FIELD}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    aria-label="Email address"
                    value={data.email}
                    onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
                    required
                    className={FIELD}
                  />
                  {form.studentFields ? (
                    <>
                      <input
                        type="text"
                        placeholder={form.studentFields.namePlaceholder}
                        aria-label={form.studentFields.namePlaceholder}
                        value={data.studentName}
                        onChange={(e) => setData((p) => ({ ...p, studentName: e.target.value }))}
                        required
                        className={FIELD}
                      />
                      <SelectField
                        value={data.grade}
                        onChange={(v) => setData((p) => ({ ...p, grade: v }))}
                        placeholder={form.studentFields.gradePlaceholder}
                        options={form.studentFields.gradeOptions}
                      />
                    </>
                  ) : null}
                  <div className="@3xl/site:col-span-2">
                    <SelectField
                      value={data.program}
                      onChange={(v) => setData((p) => ({ ...p, program: v }))}
                      placeholder="Select a program"
                      options={form.programOptions}
                    />
                  </div>
                  <DemoWebsiteButton
                    type="submit"
                    variant="primary"
                    className="mt-3 !h-14 w-full !text-[16px] @3xl/site:col-span-2"
                  >
                    {form.submitLabel}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                  </DemoWebsiteButton>
                  <div className="space-y-1 pt-1 text-center @3xl/site:col-span-2">
                    {form.trustNote ? (
                      <p className="text-[13px] font-bold text-[var(--sf-ink)]/75">{form.trustNote}</p>
                    ) : null}
                    <p className="text-[12px] text-[var(--sf-soft)]">{form.disclaimer}</p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </SiteReveal>
      </div>
    </section>
  );
}
