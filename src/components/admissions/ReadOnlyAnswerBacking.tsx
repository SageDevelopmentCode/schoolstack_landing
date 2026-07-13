import type { ReactNode } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ReadOnlyAnswerBackingProps = {
  C: Pick<AdminThemeTokens, "elevated">;
  children: ReactNode;
  className?: string;
};

export default function ReadOnlyAnswerBacking({
  C,
  children,
  className = "",
}: ReadOnlyAnswerBackingProps) {
  return (
    <div
      className={`rounded-md px-3 py-2.5 ${className}`.trim()}
      style={{ backgroundColor: C.elevated }}
    >
      {children}
    </div>
  );
}
