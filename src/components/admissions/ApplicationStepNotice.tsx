import { Info } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationStepNoticeProps = {
  body: string;
  C: AdminThemeTokens;
  className?: string;
};

export default function ApplicationStepNotice({
  body,
  C,
  className = "",
}: ApplicationStepNoticeProps) {
  return (
    <div
      className={`flex gap-3 rounded-md border px-4 py-3 ${className}`.trim()}
      style={{
        borderColor: C.border,
        backgroundColor: C.accentLight,
      }}
    >
      <Info
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: C.accent }}
        aria-hidden
      />
      <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
        {body}
      </p>
    </div>
  );
}
