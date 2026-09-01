import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentDatePillProps = {
  theme: ParentThemeTokens;
  date?: Date;
  label?: string;
};

export default function ParentDatePill({
  theme,
  date = new Date(),
  label,
}: ParentDatePillProps) {
  const displayLabel =
    label ??
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div
      className="shrink-0 rounded-xl px-3 py-2.5 text-[13px]"
      style={{
        backgroundColor: theme.white,
        color: "#5E6D71",
        boxShadow: theme.shadowPill,
      }}
    >
      {displayLabel}
    </div>
  );
}
