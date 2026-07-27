"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";

type PortalSectionLinkProps = {
  href: string;
  title: string;
  description: string;
  delay?: number;
  badgeLabel?: string;
  highlighted?: boolean;
};

export default function PortalSectionLink({
  href,
  title,
  description,
  delay = 0,
  badgeLabel,
  highlighted = false,
}: PortalSectionLinkProps) {
  const T = usePortalTheme();

  return (
    <FadeInView delay={delay}>
      <Link
        href={href}
        className="group flex items-center justify-between gap-6 rounded-2xl border px-6 py-5 transition-colors sm:px-7 sm:py-6"
        style={{
          backgroundColor: T.surface,
          borderColor: highlighted ? T.clayBorder : T.border,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p
              className="font-heading text-[1.15rem] font-medium leading-snug sm:text-[1.25rem]"
              style={{ color: T.textPrimary }}
            >
              {title}
            </p>
            {badgeLabel ? (
              <span
                className="font-secondary inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  color: T.clay,
                  backgroundColor: T.clayBg,
                  border: `1px solid ${T.clayBorder}`,
                }}
              >
                {badgeLabel}
              </span>
            ) : null}
          </div>
          <p
            className="font-secondary mt-1.5 text-[14px] leading-relaxed sm:text-[15px]"
            style={{ color: T.textSecondary }}
          >
            {description}
          </p>
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{
            backgroundColor: T.stepBg,
            color: T.accent,
            border: `1px solid ${T.secondaryBtnBorder}`,
          }}
        >
          <ArrowUpRight size={18} strokeWidth={2} aria-hidden />
        </span>
      </Link>
    </FadeInView>
  );
}
