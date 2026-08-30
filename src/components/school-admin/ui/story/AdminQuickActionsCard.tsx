import Link from "next/link";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { DashboardQuickAction } from "@/lib/school-admin/dashboard-summary";
import AdminDisplayHeading from "./AdminDisplayHeading";
import AdminSectionKicker from "./AdminSectionKicker";

type AdminQuickActionsCardProps = {
  theme: ParentThemeTokens;
  actions: DashboardQuickAction[];
};

export default function AdminQuickActionsCard({
  theme,
  actions,
}: AdminQuickActionsCardProps) {
  return (
    <div className="p-[19px]">
      <AdminSectionKicker theme={theme}>Quick actions</AdminSectionKicker>
      <AdminDisplayHeading
        theme={theme}
        as="h3"
        size="section"
        className="mt-1.5 text-[19px] leading-tight"
      >
        Keep moving
      </AdminDisplayHeading>
      <div className="mt-3">
        {actions.map((action, index) => (
          <Link
            key={action.id}
            href={action.href}
            className="block py-[11px] no-underline"
            style={{
              borderTop: index === 0 ? "none" : "1px solid #E9EFEA",
            }}
          >
            <b className="block text-xs" style={{ color: theme.ink }}>
              {action.title}
            </b>
            <span className="text-[11px]" style={{ color: theme.muted }}>
              {action.subtitle}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
