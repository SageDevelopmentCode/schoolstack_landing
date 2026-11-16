"use client";

import { useEffect, useState } from "react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import CommitteeActivityFeed from "@/components/school-admin/committees/CommitteeActivityFeed";
import CommitteeActivityFeedSkeleton from "@/components/school-admin/committees/CommitteeActivityFeedSkeleton";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { GardenLoadError } from "@/components/school-admin/dashboard/garden/shared";

export default function CommitteeActivitySection({
  organizationId,
  committeeId,
  slug,
  theme,
}: {
  organizationId: string;
  committeeId: string;
  slug: string;
  theme: ParentThemeTokens;
}) {
  const [items, setItems] = useState<CommitteeActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => void (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          organizationId,
          committeeId,
          slug,
          limit: "30",
        });
        const res = await fetch(`/api/school-admin/committees/activity?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load activity.");
        }
        if (!cancelled) setItems(data.items ?? []);
      } catch (err) {
        void reportPortalOperationalError(
          "school_admin",
          {
            organizationId,
            operation: "committees.activity.load",
            error: "",
          },
          err,
        );
        if (!cancelled) {
          setItems([]);
          setError(formatActionError(err, "Failed to load activity."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })());

    return () => {
      cancelled = true;
    };
  }, [organizationId, committeeId, slug, nonce]);

  return (
    <CommitteeWorkspaceSectionFrame width="wide">
      <AdminCard theme={theme} padding="default">
        {loading ? (
          <CommitteeActivityFeedSkeleton theme={theme} rowCount={8} />
        ) : error ? (
          <GardenLoadError
            title="Couldn't load activity."
            description={error}
            onRetry={() => setNonce((n) => n + 1)}
          />
        ) : (
          <CommitteeActivityFeed
            theme={theme}
            items={items}
            title="Activity"
            emptyMessage="No recent activity yet."
          />
        )}
      </AdminCard>
    </CommitteeWorkspaceSectionFrame>
  );
}
