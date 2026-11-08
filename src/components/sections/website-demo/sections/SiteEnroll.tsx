"use client";

import { useState, type FormEvent, type RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import DemoWebsiteSectionKicker from "../DemoWebsiteSectionKicker";
import { DEMO_BODY, DEMO_GUTTER, DEMO_HEADING, DEMO_INK, STORY_EASE } from "../bright-demo-theme";

const FIELD =
  "font-secondary h-14 w-full rounded-pill border border-black/10 bg-[var(--demo-tint-3)] px-6 text-[15px] text-[var(--demo-ink)] placeholder:text-[var(--demo-muted)] transition focus:border-[var(--demo-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--demo-tint-1)]";

const NEXT_STEPS = [
  { title: "Send your inquiry", desc: "Share a little about your family and learner." },
  { title: "Talk with our team", desc: "We follow up to answer questions and find a time." },
  { title: "Visit and meet us", desc: "Tour the space and see a school day up close." },
] as const;

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
        className={`${FIELD} cursor-pointer appearance-none pr-12`}
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
      <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--demo-muted)]" aria-hidden />
    </div>
  );
}

/** Ink sidebar with next steps beside a floating white inquiry form. */
export default function SiteEnroll({ form, formRef, onExplorePrograms }: Props) {
  const [data, setData] = useState({ name: "", email: "", studentName: "", grade: "", program: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="form" ref={formRef} className={`scroll-mt-[88px] py-3 ${DEMO_GUTTER}`}>
      <div className="mx-auto grid max-w-[1400px] gap-3 rounded-[32px] bg-[var(--demo-tint-1)] p-3 @3xl/site:rounded-[40px] @5xl/site:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-[var(--demo-ink)] p-7 text-white @3xl/site:rounded-[32px] @3xl/site:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--demo-glow)] blur-3xl" aria-hidden />
          <div className="relative h-48 overflow-hidden rounded-[24px] @3xl/site:h-56">
            <Image src={form.sidebarImage} fill sizes="520px" className="object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="font-secondary absolute inset-x-5 bottom-5 text-[16px] font-semibold leading-snug text-white">
              &ldquo;{form.sidebarQuote}&rdquo;
            </p>
          </div>
          <p className="font-secondary relative mt-9 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">
            What happens next
          </p>
          <ol className="relative mt-5 space-y-5">
            {NEXT_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="font-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[14px] font-bold text-white ring-1 ring-white/15">
                  {i + 1}
                </span>
                <span>
                  <span className="font-secondary block text-[16px] font-bold text-white">{step.title}</span>
                  <span className="font-secondary mt-0.5 block text-[14px] leading-snug text-white/65">{step.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[28px] bg-white p-7 shadow-[var(--demo-shadow-card)] @3xl/site:rounded-[32px] @3xl/site:p-10">
          <DemoWebsiteSectionKicker>{form.eyebrow}</DemoWebsiteSectionKicker>
          <h2 className={`${DEMO_HEADING} ${DEMO_INK} mt-4 text-balance text-[clamp(1.75rem,3cqw,2.6rem)]`}>{form.heading}</h2>
          <p className={`${DEMO_BODY} mt-4`}>{form.description}</p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="mt-10 rounded-[28px] bg-[var(--demo-tint-1)] px-6 py-12 text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: STORY_EASE }}
              >
                <motion.span
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--demo-ink)] text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
                >
                  <Check className="h-8 w-8" strokeWidth={3} aria-hidden />
                </motion.span>
                <p className={`${DEMO_HEADING} ${DEMO_INK} mt-6 text-[1.6rem]`}>{form.successTitle}</p>
                <p className={`${DEMO_BODY} mx-auto mt-3 max-w-[420px]`}>{form.successMessage}</p>
                <DemoWebsiteButton variant="outline" className="mt-7" onClick={onExplorePrograms}>
                  Explore our programs
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </DemoWebsiteButton>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="mt-9 grid gap-3 @3xl/site:grid-cols-2"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="text"
                  placeholder="Parent / guardian name"
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
                <DemoWebsiteButton type="submit" variant="primary" className="mt-2 h-14! w-full text-[16px]! @3xl/site:col-span-2">
                  {form.submitLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </DemoWebsiteButton>
                <div className="space-y-1 text-center @3xl/site:col-span-2">
                  {form.trustNote ? (
                    <p className="font-secondary text-[13px] font-medium text-[var(--demo-ink)]/70">{form.trustNote}</p>
                  ) : null}
                  <p className="font-secondary text-[12px] text-[var(--demo-muted)]">{form.disclaimer}</p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
