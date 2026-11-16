"use client";

import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Draw, Leaf, Tape } from "@/components/garden/ui";
import TryFreeHeadline from "@/components/try/TryFreeHeadline";
import TryFreeSchoolForm from "@/components/try/TryFreeSchoolForm";

/**
 * /try in Garden: the headline above the fold, then the signup form on
 * notebook paper (Calm Garden: no tilt on the form, one primary button).
 */
export default function TryGardenPage() {
  return (
    <HomeGardenShell>
      <section className="sf-grid relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 lg:pb-32 lg:pt-40">
        <Draw className="absolute right-[12%] top-36 hidden w-14 lg:block" delay={0.6}>
          <Leaf />
        </Draw>
        <div className="mx-auto w-full max-w-lg">
          <TryFreeHeadline />
          <p className="mt-5 text-lg leading-relaxed text-[var(--sf-soft)]">
            Tell us your school name and email. We&apos;ll send a 6-digit code to this
            page, then open your dashboard.
          </p>
          <div className="sf-paper relative mt-8 rounded-[30px] border-2 border-[var(--sf-ink)] px-5 pb-7 pt-1 shadow-[0_8px_0_0_var(--sf-ink)] sm:px-7">
            <Tape color="var(--sf-butter)" className="-top-3 left-10 w-24 -rotate-6" />
            <TryFreeSchoolForm />
          </div>
        </div>
      </section>
    </HomeGardenShell>
  );
}
