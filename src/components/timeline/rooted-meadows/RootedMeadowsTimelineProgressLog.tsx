import OrganizationProgressLogList from "@/components/mudkitchen-portal/OrganizationProgressLogList";
import type { OrganizationProgressEntry } from "@/lib/organization-progress";

interface Props {
  entries: OrganizationProgressEntry[];
}

export default function RootedMeadowsTimelineProgressLog({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="px-6 pb-20 lg:px-16 lg:pb-24">
      <div className="mx-auto max-w-[1100px]">
        <OrganizationProgressLogList
          entries={entries}
          schoolName="Rooted Meadows"
        />
      </div>
    </div>
  );
}
