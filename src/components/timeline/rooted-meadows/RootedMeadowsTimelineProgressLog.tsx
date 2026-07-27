import OrganizationProgressLogList from "@/components/mudkitchen-portal/OrganizationProgressLogList";
import type { OrganizationProgressEntry } from "@/lib/organization-progress";

interface Props {
  entries: OrganizationProgressEntry[];
}

export default function RootedMeadowsTimelineProgressLog({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <OrganizationProgressLogList entries={entries} schoolName="Rooted Meadows" />
  );
}
