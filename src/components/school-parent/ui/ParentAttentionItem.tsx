import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentAttentionItemProps = {
  theme: ParentThemeTokens;
  icon: ReactNode;
  title: string;
  subtitle: string;
  iconBg?: string;
};

export default function ParentAttentionItem({
  theme,
  icon,
  title,
  subtitle,
  iconBg = "#F7E5DE",
}: ParentAttentionItemProps) {
  return (
    <div
      className="flex items-start gap-3.5 border-t py-3 first:border-t-0 first:pt-0"
      style={{ borderColor: "#E7EBE2" }}
    >
      <div
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px]"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <strong
          className="block text-sm font-semibold"
          style={{ color: theme.ink }}
        >
          {title}
        </strong>
        <span className="block text-xs" style={{ color: "#76828A" }}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}
