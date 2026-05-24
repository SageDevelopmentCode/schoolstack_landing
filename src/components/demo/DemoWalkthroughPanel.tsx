"use client";

import { CalendarDays } from "lucide-react";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";

interface Props {
  schoolName: string;
  steps: DemoWalkthroughStep[];
  activeStep?: number;
}

export default function DemoWalkthroughPanel({
  schoolName,
  steps,
  activeStep = 0,
}: Props) {
  return (
    <aside
      className="hidden lg:flex flex-col h-screen w-[20%] min-w-[280px] shrink-0 overflow-y-auto border-r border-[#DDD0BE]"
      style={{ backgroundColor: "#F7F1E7" }}
    >
      <div className="flex flex-col flex-1 px-6 py-8">
        <div className="mb-8">
          <p className="text-[11px] font-secondary font-semibold uppercase tracking-widest text-[#B8A898] mb-2">
            Website concept
          </p>
          <h1 className="font-display text-xl font-medium leading-snug text-[#2B241D]">
            {schoolName}
          </h1>
          <p className="mt-3 text-sm font-secondary leading-relaxed text-[#6D6257]">
            A polished admissions landing page concept — use this walkthrough to
            guide your pitch and highlight what parents need to understand.
          </p>
        </div>

        <nav className="flex-1" aria-label="Walkthrough steps">
          <ol className="space-y-1">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;

              return (
                <li key={step.id}>
                  <div
                    className={`relative flex gap-4 rounded-xl px-3 py-4 transition-colors duration-200 ${
                      isActive ? "bg-white shadow-sm border border-[#DDD0BE]" : ""
                    }`}
                  >
                    {i < steps.length - 1 && (
                      <div
                        className="absolute left-[22px] top-12 bottom-0 w-px -mb-1"
                        style={{
                          backgroundColor: isPast ? "#2E4A3C" : "#DDD0BE",
                        }}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold font-secondary ${
                        isActive
                          ? "bg-[#2E4A3C] text-white"
                          : isPast
                            ? "bg-[#2E4A3C]/15 text-[#2E4A3C]"
                            : "bg-[#EDE0CE] text-[#B8A898]"
                      }`}
                    >
                      {i + 1}
                    </div>

                    <div className="min-w-0 flex-1 pb-1">
                      <p
                        className={`text-sm font-semibold font-secondary leading-snug ${
                          isActive ? "text-[#2B241D]" : "text-[#6D6257]"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs font-secondary leading-relaxed text-[#B8A898]">
                        {step.description}
                      </p>
                      {isActive && step.talkingPoint && (
                        <p className="mt-2 text-xs font-secondary leading-relaxed text-[#2E4A3C] italic">
                          &ldquo;{step.talkingPoint}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mt-8 pt-6 border-t border-[#DDD0BE]">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold font-secondary text-white transition-opacity duration-200 hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#A05C45" }}
          >
            <CalendarDays className="w-4 h-4" />
            Schedule a discovery call
          </button>
          <p className="mt-3 text-center text-[11px] font-secondary text-[#B8A898]">
            Placeholder CTA · not wired up yet
          </p>
        </div>
      </div>
    </aside>
  );
}
