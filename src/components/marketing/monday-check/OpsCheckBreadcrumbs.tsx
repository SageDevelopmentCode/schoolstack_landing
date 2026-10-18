import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type OpsCheckBreadcrumbsProps = {
  theme: ParentThemeTokens;
  tail?: string;
};

export default function OpsCheckBreadcrumbs({ theme, tail }: OpsCheckBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-2 text-[11px]"
      style={{ color: theme.muted, fontFamily: theme.fontBody }}
    >
      <Link href="/tools" className="transition-opacity hover:opacity-80" style={{ color: theme.muted }}>
        Free tools
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
      {tail ? (
        <>
          <span>Microschool Ops Check</span>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          <span style={{ color: theme.ink }}>{tail}</span>
        </>
      ) : (
        <span style={{ color: theme.ink }}>Microschool Ops Check</span>
      )}
    </nav>
  );
}
