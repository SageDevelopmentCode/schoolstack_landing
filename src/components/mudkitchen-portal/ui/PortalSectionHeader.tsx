"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";

type PortalSectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
};

export default function PortalSectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
}: PortalSectionHeaderProps) {
  const T = usePortalTheme();

  return (
    <FadeInView>
      <div
        className={`mb-10 ${centered ? "text-center" : "text-center lg:text-left"}`}
      >
        <p
          className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: T.textSecondary }}
        >
          {eyebrow}
        </p>
        <h2
          className="font-heading mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight"
          style={{ color: T.textPrimary }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={`font-secondary mt-3 max-w-[640px] text-[15px] leading-relaxed ${
              centered ? "mx-auto" : "mx-auto lg:mx-0"
            }`}
            style={{ color: T.textSecondary }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </FadeInView>
  );
}
