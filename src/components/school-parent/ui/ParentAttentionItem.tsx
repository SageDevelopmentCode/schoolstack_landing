import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentAttentionItemProps = {
  theme: ParentThemeTokens;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  iconBg?: string;
  iconIncludesWrapper?: boolean;
  urgent?: boolean;
};

export default function ParentAttentionItem({
  theme,
  icon,
  title,
  subtitle,
  iconBg = "#F7E5DE",
  iconIncludesWrapper = false,
  urgent = false,
}: ParentAttentionItemProps) {
  const showSubtitle = Boolean(subtitle?.trim());
  const resolvedIconBg = urgent ? `${theme.alert}22` : iconBg;

  const row = (
    <>
      {iconIncludesWrapper ? (
        icon
      ) : (
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px]"
          style={{ backgroundColor: resolvedIconBg }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <strong
          className="block text-sm font-semibold"
          style={{ color: theme.ink }}
        >
          {title}
        </strong>
        {showSubtitle ? (
          <span
            className="mt-0.5 block text-xs leading-relaxed"
            style={{ color: urgent ? theme.muted : "#76828A" }}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </>
  );

  if (urgent) {
    return (
      <div
        className="mb-2 rounded-[14px] border px-3 py-2.5"
        style={{
          backgroundColor: theme.alertBg,
          borderColor: `${theme.alert}40`,
        }}
      >
        <div
          className={`flex gap-3.5 ${showSubtitle ? "items-start" : "items-center"}`}
        >
          {row}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3.5 border-t py-3 first:border-t-0 first:pt-0 ${showSubtitle ? "items-start" : "items-center"}`}
      style={{ borderColor: "#E7EBE2" }}
    >
      {row}
    </div>
  );
}
