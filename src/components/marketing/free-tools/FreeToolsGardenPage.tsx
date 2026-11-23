"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Reveal } from "@/components/garden/motion";
import { Draw, Squiggle, Sun, btnButter } from "@/components/garden/ui";
import { FreeToolPostcard } from "@/components/home-garden/FreeToolsPostcards";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import {
  FREE_TOOLS_HUB_STAGES,
  FREE_TOOLS_HUB_TOOLS,
  freeToolsStageSectionId,
  toolsByStage,
  type FreeToolsHubStageId,
} from "@/lib/marketing/free-tools-hub-content";

/** Words unchanged from the previous /tools page. */
const COPY = {
  eyebrow: "Free tools",
  headingLead: "Free tools for",
  headingAccent: "microschool founders",
  body: "Three free tools for enrollment, tuition, and operations. No MudKitchen account required.",
  cta: {
    kicker: "When you’re ready for the school day",
    heading: "Planning is one part. Running school is the rest.",
    body: "Explore how MudKitchen brings enrollment, tuition, family communication, and school operations into a shared workspace.",
    label: "See MudKitchen",
  },
} as const;

type ViewTab = "by_stage" | "all";

const VIEW_TABS: { id: ViewTab; label: string; tint: string }[] = [
  { id: "by_stage", label: "By stage", tint: "bg-[var(--sf-butter)]" },
  { id: "all", label: "All tools", tint: "bg-[var(--sf-mint)]" },
];

/** Literal classes per stage (no dynamic Tailwind). */
const STAGE_TINT: Record<FreeToolsHubStageId, string> = {
  prospective_family: "bg-[var(--sf-peach)]/45",
  applying_family: "bg-[var(--sf-sky)]/60",
  accepted_enrolling: "bg-[var(--sf-mint)]/60",
  enrolled: "bg-[var(--sf-butter)]/40",
  staff: "bg-[var(--sf-lav)]/60",
  founder_admin: "bg-[var(--sf-paper)]",
};

const STAGE_TILTS = [-0.6, 0.5, -0.4, 0.6, -0.5, 0.3];

function Hero() {
  return (
    <section className="sf-grid relative overflow-hidden pb-14 pt-32 lg:pb-20 lg:pt-40">
      <Draw className="absolute right-[9%] top-32 hidden w-16 lg:block" delay={0.6}>
        <Sun />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <h1 className="sf-display max-w-4xl text-[12.5vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:text-[5.2rem]">
          {COPY.headingLead}{" "}
          <span className="relative isolate inline-block text-[var(--sf-clay)]">
            <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.3}>
              <Squiggle className="h-4 w-full md:h-5" color="var(--sf-butter)" />
            </Draw>
            {COPY.headingAccent}
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--sf-soft)]">{COPY.body}</p>
      </div>
    </section>
  );
}

function ByStage() {
  const byStage = toolsByStage();
  return (
    <div className="grid gap-6">
      {FREE_TOOLS_HUB_STAGES.map((stage, i) => {
        const tools = byStage.get(stage.id) ?? [];
        const Icon = stage.flowIcon;
        const headingId = `free-tools-stage-heading-${stage.id}`;
        return (
          <section
            key={stage.id}
            id={freeToolsStageSectionId(stage.id)}
            aria-labelledby={headingId}
            className={`scroll-mt-28 rounded-[30px] border-2 border-[var(--sf-ink)] px-5 shadow-[0_5px_0_0_var(--sf-ink)] sm:px-7 ${STAGE_TINT[stage.id]} ${tools.length > 0 ? "pb-8 pt-5 sm:pb-10 sm:pt-6" : "py-5 sm:py-6"}`}
            style={{ rotate: tools.length > 0 ? "0deg" : `${STAGE_TILTS[i % STAGE_TILTS.length]}deg` }}
          >
            <h2 id={headingId} className="flex items-center gap-3 text-xl font-extrabold leading-snug text-[var(--sf-ink)] sm:text-2xl">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white ring-2 ring-[var(--sf-ink)]" aria-hidden="true">
                <Icon size={20} strokeWidth={2.3} />
              </span>
              {stage.label}
            </h2>
            {tools.length > 0 ? (
              <Reveal className="mt-8 grid gap-8 md:grid-cols-3" stagger={0.1} y={40}>
                {tools.map((tool) => (
                  <div key={tool.id}>
                    <FreeToolPostcard tool={tool} index={FREE_TOOLS_HUB_TOOLS.indexOf(tool)} />
                  </div>
                ))}
              </Reveal>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function AllTools() {
  return (
    <Reveal className="grid gap-8 md:grid-cols-3" stagger={0.12} y={50}>
      {FREE_TOOLS_HUB_TOOLS.map((tool, i) => (
        <div key={tool.id}>
          <FreeToolPostcard tool={tool} index={i} headingAs="h2" />
        </div>
      ))}
    </Reveal>
  );
}

function ToolsPanel() {
  const [active, setActive] = useState<ViewTab>("by_stage");
  return (
    <section id="tools" className="scroll-mt-24 pb-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div
          role="tablist"
          aria-label="Free tools views"
          className="inline-flex rounded-full border-2 border-[var(--sf-ink)] bg-white p-1.5 shadow-[0_4px_0_0_var(--sf-ink)]"
        >
          {VIEW_TABS.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                id={`free-tools-hub-tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`free-tools-hub-panel-${tab.id}`}
                data-testid={`free-tools-hub-tab-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className="relative cursor-pointer rounded-full px-5 py-2 text-sm font-extrabold text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              >
                {selected ? (
                  <motion.span
                    layoutId="free-tools-hub-tab-pill"
                    className={`absolute inset-0 rounded-full ${tab.tint}`}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                ) : null}
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          <div
            id="free-tools-hub-panel-by_stage"
            role="tabpanel"
            aria-labelledby="free-tools-hub-tab-by_stage"
            hidden={active !== "by_stage"}
          >
            {active === "by_stage" ? <ByStage /> : null}
          </div>
          <div
            id="free-tools-hub-panel-all"
            role="tabpanel"
            aria-labelledby="free-tools-hub-tab-all"
            hidden={active !== "all"}
          >
            {active === "all" ? <AllTools /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCta() {
  return (
    <section className="px-3 pb-24 lg:px-6 lg:pb-32">
      <div className="mx-auto max-w-[1320px] rounded-[44px] bg-[var(--sf-forest)] px-6 py-14 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-16 lg:py-16">
        <div className="max-w-2xl">
          <h2 className="sf-display text-4xl leading-[0.98] text-[var(--sf-cream)] md:text-5xl">{COPY.cta.heading}</h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--sf-cream)]/85">{COPY.cta.body}</p>
        </div>
        <Link href={GET_STARTED_PAGE_PATH} className={`${btnButter} mt-8 shrink-0 lg:mt-0`}>
          {COPY.cta.label}
          <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
        </Link>
      </div>
    </section>
  );
}

/** /tools in Garden: hero, the tools by stage or as postcards, then the forest CTA. */
export default function FreeToolsGardenPage() {
  return (
    <HomeGardenShell>
      <Hero />
      <ToolsPanel />
      <ProductCta />
    </HomeGardenShell>
  );
}
