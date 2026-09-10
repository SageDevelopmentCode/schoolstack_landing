import { Megaphone } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type BulletinEmptyStateProps = {
  theme: ParentThemeTokens;
  title: string;
  subtitle: string;
};

export default function BulletinEmptyState({
  theme,
  title,
  subtitle,
}: BulletinEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-lg border border-dashed px-4 py-5"
      style={{ borderColor: theme.line }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.infoBg }}
      >
        <Megaphone className="h-4 w-4" style={{ color: theme.info }} />
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: theme.ink }}>
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.muted }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
