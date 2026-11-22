"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { MarketingAdCopy } from "@/components/admin/marketing/carousels/types";

/** Text to paste into the ad manager next to this image, with a switch when the slide has several versions. */
export function AdCopyPanel({ versions }: { versions: MarketingAdCopy[] }) {
  const [selected, setSelected] = useState(0);
  const copy = versions[selected] ?? versions[0];
  if (!copy) return null;
  const fields: Array<{ key: string; label: string; value: string }> = [
    { key: "primary", label: "Primary text", value: copy.primaryText },
    { key: "headline", label: "Headline", value: copy.headline },
    ...(copy.description ? [{ key: "description", label: "Description", value: copy.description }] : []),
  ];
  return (
    <section aria-label="Ad copy" className="shrink-0 border-t border-admin-border px-6 py-3">
      {versions.length > 1 ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-admin-faint">Caption</span>
          <div
            role="radiogroup"
            aria-label="Caption version"
            className="flex flex-wrap items-center rounded-admin-md border border-admin-border bg-admin-canvas p-0.5"
          >
            {versions.map((version, versionIndex) => (
              <button
                key={versionIndex}
                type="button"
                role="radio"
                aria-checked={versionIndex === selected}
                onClick={() => setSelected(versionIndex)}
                className={`rounded-admin-md px-2.5 py-1 text-xs font-medium ${
                  versionIndex === selected ? "bg-admin-surface text-admin-text shadow-sm" : "text-admin-muted"
                }`}
              >
                {versionIndex + 1}
                {version.label ? <span className="font-normal"> · {version.label}</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr]">
        {fields.map((field) => (
          <AdCopyField key={field.key} label={field.label} value={field.value} />
        ))}
      </div>
    </section>
  );
}

function AdCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="min-w-0 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-admin-faint">
          {label} <span className="font-normal normal-case">· {value.length} chars</span>
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(value).then(() => setCopied(true));
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-admin-accent"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-line text-xs leading-snug text-admin-text">{value}</p>
    </div>
  );
}
