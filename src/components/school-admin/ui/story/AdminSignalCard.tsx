import Link from "next/link";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminSignalCardProps = {
  theme: ParentThemeTokens;
  headline: string;
  body: string;
  href: string;
  ctaLabel: string;
};

export default function AdminSignalCard({
  theme,
  headline,
  body,
  href,
  ctaLabel,
}: AdminSignalCardProps) {
  return (
    <div
      className="rounded-[17px] p-5 text-white"
      style={{ backgroundColor: theme.primary }}
    >
      <p
        className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
        style={{ color: "#C5E1CB" }}
      >
        School signal
      </p>
      <h2
        className="mt-1.5 font-heading text-xl font-semibold leading-tight"
        style={{ fontFamily: theme.fontDisplay }}
      >
        {headline}
      </h2>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: "#D8E6DB" }}>
        {body}
      </p>
      <Link
        href={href}
        className="mt-3 inline-block text-[11px] font-extrabold no-underline"
        style={{ color: "#D6EFD8" }}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
