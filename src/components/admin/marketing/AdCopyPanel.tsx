"use client";

import { useState } from "react";
import type { MarketingAdCopy } from "@/components/admin/marketing/carousels/types";
import { CopyChip, GardenSegmented } from "@/components/admin/marketing/garden/marketing-ui";

/** Text to paste into the ad manager next to this image, with a switch when the slide has several versions. */
export function AdCopyPanel({
  versions,
  layout = "row",
}: {
  versions: MarketingAdCopy[];
  /** "column" stacks the fields (side panel next to the stage on wide screens). */
  layout?: "row" | "column";
}) {
  const [selected, setSelected] = useState(0);
  const copy = versions[selected] ?? versions[0];
  if (!copy) return null;
  const fields: Array<{ key: string; label: string; value: string; what: string }> = [
    { key: "primary", label: "Primary text", value: copy.primaryText, what: "Primary text" },
    { key: "headline", label: "Headline", value: copy.headline, what: "Headline" },
    ...(copy.description ? [{ key: "description", label: "Description", value: copy.description, what: "Description" }] : []),
  ];
  return (
    <section
      aria-label="Ad copy"
      className={`rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-4 py-3 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] ${
        layout === "column" ? "flex min-h-0 flex-col overflow-y-auto" : "shrink-0"
      }`}
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Ad copy</p>
        {versions.length > 1 ? (
          <GardenSegmented
            label="Caption version"
            size="sm"
            value={String(selected)}
            onChange={(value) => setSelected(Number(value))}
            options={versions.map((version, versionIndex) => ({
              value: String(versionIndex),
              label: (
                <>
                  {versionIndex + 1}
                  {version.label ? <span className="font-bold opacity-80">&nbsp;· {version.label}</span> : null}
                </>
              ),
            }))}
          />
        ) : null}
      </div>
      <div className={layout === "column" ? "flex flex-col gap-2.5" : "grid gap-2.5 md:grid-cols-[2fr_1fr_1fr]"}>
        {fields.map((field) => (
          <div key={field.key} className="min-w-0 rounded-[14px] bg-[var(--sf-paper)] px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-[12px] font-extrabold text-[var(--sf-ink)]">
                {field.label}{" "}
                <span className="font-bold tabular-nums text-[var(--sf-soft)]">· {field.value.length} chars</span>
              </p>
              <CopyChip text={field.value} what={field.what} ariaLabel={`Copy ${field.label.toLowerCase()}`} />
            </div>
            <p className={`m-0 mt-1.5 ${layout === "column" ? "" : "max-h-28 overflow-y-auto"} whitespace-pre-line text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/85`}>
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
