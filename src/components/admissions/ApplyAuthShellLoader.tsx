import { Loader2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export function ApplyAuthShellLoader({
  message,
  C,
}: {
  message: string;
  C: AdminThemeTokens;
}) {
  return (
    <div
      className="mt-10 flex flex-col items-center gap-3"
      style={{ color: C.textSecondary }}
      aria-busy="true"
    >
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.accent }} />
      <p className="text-sm">{message}</p>
    </div>
  );
}
