import type { ReactNode } from "react";
import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

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

function phaseTitle(preset: BrightAuthPreset, phase: BrightAuthHeaderPhase): ReactNode {
  if (phase === "verify") {
    return (
      <>
        Check <span className={ACCENT_HIGHLIGHT}>your email</span>
      </>
    );
  }

  if (phase === "select_org") {
    return (
      <>
        Choose <span className={ACCENT_HIGHLIGHT}>your school</span>
      </>
    );
  }

  if (preset === "parent") {
    return (
      <>
        Sign in to your <span className={ACCENT_HIGHLIGHT}>parent portal</span>
      </>
    );
  }

  if (preset === "apply") {
    return (
      <>
        Sign in to your <span className={ACCENT_HIGHLIGHT}>applications</span>
      </>
    );
  }

  return (
    <>
      Sign in to <span className={ACCENT_HIGHLIGHT}>continue</span>
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

/** Bright marketing headings for auth steps (`/login`, parent/apply gates). */
export default function LoginPhaseHeader({
  preset = "login",
  phase,
  subtitle,
  schoolWordmark,
}: LoginPhaseHeaderProps) {
  const titleClassName =
    phase === "select_org"
      ? "text-[clamp(1.75rem,3.5vw,2.25rem)]"
      : "text-[clamp(1.6rem,3.2vw,2rem)]";

  return (
    <div className="mb-8">
      {schoolWordmark}
      <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
        {phaseKicker(phase)}
      </p>
      <h1 className={`mt-2 ${titleClassName} ${BOLD_HEADING}`}>
        {phaseTitle(preset, phase)}
      </h1>
      <p className="mt-3 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
        {subtitle}
      </p>
    </div>
  );
}
