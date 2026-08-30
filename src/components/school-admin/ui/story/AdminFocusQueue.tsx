import Link from "next/link";
import { Calendar, ClipboardList, MessageSquare, Settings2 } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { DashboardFocusItem } from "@/lib/school-admin/dashboard-summary";
import AdminSectionKicker from "./AdminSectionKicker";

const ICONS = {
  application: ClipboardList,
  schedule: Calendar,
  message: MessageSquare,
  setup: Settings2,
} as const;

type AdminFocusQueueProps = {
  theme: ParentThemeTokens;
  items: DashboardFocusItem[];
};

export default function AdminFocusQueue({ theme, items }: AdminFocusQueueProps) {
  return (
    <div>
      <AdminSectionKicker theme={theme}>Today&apos;s focus</AdminSectionKicker>
      <h2
        className="mt-1.5 font-heading text-[23px] font-semibold leading-tight tracking-[-0.03em]"
        style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
      >
        {items.length > 0
          ? `${items.length} thing${items.length === 1 ? "" : "s"} need your attention`
          : "You're caught up for now"}
      </h2>
      {items.length > 0 ? (
        <p className="mt-2 max-w-lg text-xs leading-relaxed" style={{ color: theme.muted }}>
          Prioritize the work only you can do, then let the rest of the system stay
          organized in the background.
        </p>
      ) : null}
      <div className="mt-4">
        {items.length === 0 ? null : (
          items.map((item, index) => {
            const Icon = ICONS[item.icon];
            return (
              <div
                key={item.id}
                className="flex items-center gap-2.5 py-[11px]"
                style={{
                  borderTop: index === 0 ? "none" : "1px solid #E9EFEA",
                }}
              >
                <span
                  className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-[10px]"
                  style={{ backgroundColor: "#F8E5DE" }}
                >
                  <Icon className="h-4 w-4" style={{ color: theme.primary }} />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-xs" style={{ color: theme.ink }}>
                    {item.title}
                  </b>
                  <span className="text-[10px]" style={{ color: theme.muted }}>
                    {item.subtitle}
                  </span>
                </div>
                <Link
                  href={item.href}
                  className="shrink-0 text-xs font-extrabold no-underline"
                  style={{ color: theme.primary }}
                >
                  {item.ctaLabel}
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
