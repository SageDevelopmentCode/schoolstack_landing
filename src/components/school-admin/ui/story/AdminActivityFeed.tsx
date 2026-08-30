import Link from "next/link";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { SchoolAdminActivityNotification } from "@/lib/school-admin/activity-notifications";
import {
  activityCategoryChipTone,
  activityCategoryLabel,
} from "@/lib/school-admin/dashboard-summary";
import AdminChip from "./AdminChip";

type AdminActivityFeedProps = {
  theme: ParentThemeTokens;
  items: SchoolAdminActivityNotification[];
  onViewAll?: () => void;
};

export default function AdminActivityFeed({
  theme,
  items,
  onViewAll,
}: AdminActivityFeedProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b px-[17px] py-4" style={{ borderColor: "#EDF1ED" }}>
        <div>
          <h2 className="text-[15px] font-semibold" style={{ color: theme.ink }}>
            Recent school activity
          </h2>
          <p className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
            Important changes across families and operations.
          </p>
        </div>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="border-0 bg-transparent p-0 text-[11px] font-extrabold"
            style={{ color: theme.primary, cursor: "pointer" }}
          >
            View all
          </button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="px-[17px] py-6 text-xs" style={{ color: theme.muted }}>
          No recent activity yet.
        </p>
      ) : (
        <div>
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t px-[15px] py-3"
              style={{ borderColor: "#EDF1ED" }}
            >
              <AdminChip theme={theme} tone={activityCategoryChipTone(item.category)}>
                {activityCategoryLabel(item.category)}
              </AdminChip>
              <div className="min-w-0">
                <b className="block text-xs" style={{ color: theme.ink }}>
                  {item.title}
                </b>
                <span className="text-[11px]" style={{ color: theme.muted }}>
                  {item.summary}
                </span>
              </div>
              <Link
                href={item.href}
                className="shrink-0 text-[11px] font-extrabold no-underline"
                style={{ color: theme.primary }}
              >
                {item.ctaLabel} →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
