"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";

type PortalPageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export default function PortalPageHero({
  eyebrow,
  title,
  subtitle,
}: PortalPageHeroProps) {
  const T = usePortalTheme();

  return (
    <FadeInView>
      <section className="px-6 pb-10 pt-14 lg:px-16 lg:pb-14 lg:pt-20">
        <div className="mx-auto max-w-[760px] text-center">
          <span
            className="font-secondary inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest"
            style={{
              color: T.accentDark,
              backgroundColor: T.stepBg,
              borderColor: T.secondaryBtnBorder,
            }}
          >
            {eyebrow}
          </span>

          <h1
            className="font-heading mt-6 text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.08]"
            style={{ color: T.textPrimary }}
          >
            {title}
          </h1>

          {subtitle ? (
            <p
              className="font-secondary mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed"
              style={{ color: T.textSecondary }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </section>
    </FadeInView>
  );
}
