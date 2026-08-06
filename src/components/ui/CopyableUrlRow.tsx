"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast } from "@/lib/school-admin/admin-toast";

type CopyableUrlRowProps = {
  url: string;
  C: AdminThemeTokens;
  className?: string;
  truncate?: boolean;
};

export default function CopyableUrlRow({
  url,
  C,
  className = "",
  truncate = false,
}: CopyableUrlRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      adminToast.success("Link copied");
    } catch {
      adminToast.error("Could not copy link to clipboard.");
    }
  }, [url]);

  return (
    <div
      className={`mt-1 flex max-w-full items-center gap-1 rounded-md border px-2.5 py-1.5 ${className}`}
      style={{
        backgroundColor: C.elevated,
        borderColor: C.border,
      }}
    >
      <span
        className={`min-w-0 flex-1 font-mono text-[11px] ${truncate ? "truncate" : "break-all"}`}
        style={{ color: C.textSecondary }}
      >
        {url}
      </span>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="shrink-0 rounded p-1"
        style={{ color: copied ? C.success : C.textTertiary }}
        aria-label="Copy link"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
