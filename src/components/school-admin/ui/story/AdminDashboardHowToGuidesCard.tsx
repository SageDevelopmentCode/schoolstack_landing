import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminDocGuide } from "@/lib/school-admin/admin-documentation";
import AdminCard from "./AdminCard";
import AdminDisplayHeading from "./AdminDisplayHeading";
import AdminSectionKicker from "./AdminSectionKicker";

type AdminDashboardHowToGuidesCardProps = {
  theme: ParentThemeTokens;
  slug: string;
  groupedGuides: Array<{ category: string; guides: AdminDocGuide[] }>;
  onOpenGuide: (guide: AdminDocGuide) => void;
};

export default function AdminDashboardHowToGuidesCard({
  theme,
  slug,
  groupedGuides,
  onOpenGuide,
}: AdminDashboardHowToGuidesCardProps) {
  return (
    <AdminCard theme={theme} padding="canvas">
      <AdminSectionKicker theme={theme}>How-to guides</AdminSectionKicker>
      <AdminDisplayHeading
        theme={theme}
        as="h3"
        size="section"
        className="mt-1.5 text-[19px] leading-tight"
      >
        Step-by-step help
      </AdminDisplayHeading>

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {groupedGuides.map((group) => (
          <section key={group.category}>
            <h4
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.04em]"
              style={{ color: theme.muted }}
            >
              {group.category}
            </h4>
            <ul className="flex flex-col">
              {group.guides.map((guide, index) => (
                <li
                  key={guide.id}
                  style={{
                    borderTop: index === 0 ? "none" : "1px solid #E9EFEA",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onOpenGuide(guide)}
                    className="flex w-full items-center justify-between gap-2 py-[11px] text-left text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ color: theme.ink }}
                  >
                    <span className="min-w-0">{guide.title}</span>
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: theme.muted }}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-4 border-t border-[#E9EFEA] pt-3">
        <Link
          href={`/school/${slug}/admin/documentation`}
          className="text-xs font-extrabold no-underline"
          style={{ color: theme.primary }}
        >
          View full how-to guides →
        </Link>
      </div>
    </AdminCard>
  );
}
