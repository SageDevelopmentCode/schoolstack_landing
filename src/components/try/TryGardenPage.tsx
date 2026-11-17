"use client";

import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Tape } from "@/components/garden/ui";
import TryFreeHeadline from "@/components/try/TryFreeHeadline";
import TryFreeSchoolForm from "@/components/try/TryFreeSchoolForm";
import TryShowcaseApp from "@/components/try/TryShowcaseApp";
import TryShowcaseSteps from "@/components/try/TryShowcaseSteps";

/**
 * /try in Garden (Calm): the headline and signup form on notebook paper sit
 * in the centre column; on wide screens the signup steps flank the left and
 * a real app screen the right. Below xl both panels stack under the form so
 * the form stays first on phones. No tilt on the form, one primary button.
 */
export default function TryGardenPage() {
  return (
    <HomeGardenShell>
      <section className="sf-grid relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 lg:pb-32 lg:pt-40">
        <div className="mx-auto grid w-full max-w-[1320px] gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)_minmax(0,1fr)] xl:items-start xl:gap-12">
          <div className="mx-auto w-full max-w-lg xl:col-start-2 xl:row-start-1">
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

          <div className="mx-auto grid w-full max-w-lg gap-14 md:max-w-3xl md:grid-cols-2 md:items-start xl:contents">
            <div className="xl:col-start-1 xl:row-start-1 xl:mt-24 xl:max-w-sm xl:justify-self-end">
              <TryShowcaseSteps />
            </div>
            <div className="xl:col-start-3 xl:row-start-1 xl:mt-16 xl:justify-self-start">
              <TryShowcaseApp />
            </div>
          </div>
        </div>
      </section>
    </HomeGardenShell>
  );
}
