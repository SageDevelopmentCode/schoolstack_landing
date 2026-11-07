import type { ReactNode } from "react";
import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

type LoginPhase = "select_org" | "email" | "verify" | "password";

type LoginPhaseHeaderProps = {
  phase: LoginPhase;
  subtitle: ReactNode;
  schoolWordmark?: ReactNode;
};

function phaseTitle(phase: LoginPhase): ReactNode {
  switch (phase) {
    case "select_org":
      return (
        <>
          Choose <span className={ACCENT_HIGHLIGHT}>your school</span>
        </>
      );
    case "email":
    case "password":
      return (
        <>
          Sign in to <span className={ACCENT_HIGHLIGHT}>continue</span>
        </>
      );
    case "verify":
      return (
        <>
          Check <span className={ACCENT_HIGHLIGHT}>your email</span>
        </>
      );
  }
}

function phaseKicker(phase: LoginPhase): string {
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

/** Bright marketing headings for `/login` steps (accessible names unchanged for e2e). */
export default function LoginPhaseHeader({
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
      <h1 className={`mt-2 ${titleClassName} ${BOLD_HEADING}`}>{phaseTitle(phase)}</h1>
      <p className="mt-3 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
        {subtitle}
      </p>
    </div>
  );
}
