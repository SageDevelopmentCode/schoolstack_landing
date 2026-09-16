"use client";

import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import ParentFormListCard, {
  parentFormListItemFromSnapshotItem,
} from "@/components/school-parent/forms-documents/ParentFormListCard";
import type { ParentFormHomeSnapshot } from "@/lib/school-parent/forms-documents/load-parent-form-home-snapshot";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentHomeFormsSnapshotSectionProps = {
  theme: ParentThemeTokens;
  snapshot: ParentFormHomeSnapshot;
};

export default function ParentHomeFormsSnapshotSection({
  theme,
  snapshot,
}: ParentHomeFormsSnapshotSectionProps) {
  return (
    <ParentCard theme={theme} className="p-5 sm:p-6">
      <ParentSectionKicker theme={theme}>Forms &amp; documents</ParentSectionKicker>
      <ParentDisplayHeading
        theme={theme}
        as="h3"
        size="section"
        className="mt-1.5 text-[19px] leading-tight"
      >
        Your family&apos;s forms
      </ParentDisplayHeading>

      <div className="mt-3 flex flex-wrap gap-2">
        {snapshot.counts.needsAction > 0 ? (
          <ParentChip theme={theme} tone="warning">
            Needs action · {snapshot.counts.needsAction}
          </ParentChip>
        ) : null}
        {snapshot.counts.signed > 0 ? (
          <ParentChip theme={theme} tone="success">
            Signed · {snapshot.counts.signed}
          </ParentChip>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {snapshot.items.map((item) => (
          <ParentFormListCard
            key={item.formId}
            item={parentFormListItemFromSnapshotItem(item)}
            theme={theme}
            variant="compact"
            href={item.formsHref}
            testId={`parent-home-form-card-${item.formId}`}
          />
        ))}
      </div>

      <ParentTextLink theme={theme} href={snapshot.formsPageHref} className="mt-4 inline-flex">
        View all forms
      </ParentTextLink>
    </ParentCard>
  );
}
