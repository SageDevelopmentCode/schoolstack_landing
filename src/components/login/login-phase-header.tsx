"use client";

import type { ReactNode } from "react";
import { Pill } from "@/components/garden/ui";

export type BrightAuthPreset = "login" | "parent" | "apply";

export type BrightAuthHeaderPhase =
  | "select_org"
  | "email"
  | "verify"
  | "password";

type LoginPhaseHeaderProps = {
  preset?: BrightAuthPreset;
  phase: BrightAuthHeaderPhase;
  subtitle: ReactNode;
  schoolWordmark?: ReactNode;
};

const ACCENT = "text-[var(--sf-clay)]";

function phaseTitle(preset: BrightAuthPreset, phase: BrightAuthHeaderPhase): ReactNode {
  if (phase === "verify") {
    return (
      <>
        Check <span className={ACCENT}>your email</span>
      </>
    );
  }

  if (phase === "select_org") {
    return (
      <>
        Choose <span className={ACCENT}>your school</span>
      </>
    );
  }

  if (preset === "parent") {
    return (
      <>
        Sign in to your <span className={ACCENT}>parent portal</span>
      </>
    );
  }

  if (preset === "apply") {
    return (
      <>
        Sign in to your <span className={ACCENT}>applications</span>
      </>
    );
  }

  return (
    <>
      Sign in to <span className={ACCENT}>continue</span>
    </>
  );
}

function phaseKicker(phase: BrightAuthHeaderPhase): string {
  switch (phase) {
    case "select_org":
      return "Your schools";
    case "email":
    case "password":
      return "Sign in";
    case "verify":
      return "Verification";
  }
}

const PHASE_EMOJI: Record<BrightAuthHeaderPhase, string> = {
  select_org: "🏫",
  email: "🌱",
  password: "🌱",
  verify: "💌",
};

/** Calm Garden headings for auth steps (`/login`, parent/apply gates). Needs a `.sf-garden` ancestor. */
export default function LoginPhaseHeader({
  preset = "login",
  phase,
  subtitle,
  schoolWordmark,
}: LoginPhaseHeaderProps) {
  return (
    <div className="mb-7">
      {schoolWordmark}
      <Pill tint="clay">
        <span aria-hidden>{PHASE_EMOJI[phase]}</span>
        {phaseKicker(phase)}
      </Pill>
      <h1 className="sf-display mt-4 text-[2.35rem] leading-[0.98] text-[var(--sf-ink)] sm:text-5xl sm:leading-[0.95]">
        {phaseTitle(preset, phase)}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--sf-soft)]">{subtitle}</p>
    </div>
  );
}
