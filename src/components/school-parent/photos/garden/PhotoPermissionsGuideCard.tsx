"use client";

import { GCard, GChip } from "@/components/school-parent/garden/ui";
import {
  CONSENT_ICONS,
  CONSENT_TINTS,
  consentChipTone,
} from "@/components/school-parent/photos/photo-permissions-ui";
import { PHOTO_MEDIA_CONSENT_OPTIONS } from "@/lib/students/photo-media-consent";

/** Rail reference: the three permission levels in the product's own words. */
export default function PhotoPermissionsGuideCard({ index = 2 }: { index?: number }) {
  return (
    <GCard
      index={index}
      kicker="Good to know"
      title="What each level means"
      data-testid="parent-photo-permissions-guide"
    >
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {PHOTO_MEDIA_CONSENT_OPTIONS.map((option) => {
          const Icon = CONSENT_ICONS[option.value];
          return (
            <li key={option.value} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-[1.5px] ring-[var(--sf-ink)]/15 ${CONSENT_TINTS[option.value]}`}
              >
                <Icon className="h-4 w-4 text-[var(--sf-ink)]" strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <h3 className="m-0">
                  <GChip tone={consentChipTone(option.value)}>{option.label}</GChip>
                </h3>
                <p className="m-0 mt-1 text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                  {option.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="m-0 mt-4 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-3 text-[13px] font-semibold text-[var(--sf-soft)]">
        You can change a child&apos;s permission here at any time.
      </p>
    </GCard>
  );
}
