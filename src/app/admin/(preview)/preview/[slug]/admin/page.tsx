import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminPageContentShell from "@/components/school-admin/AdminPageContentShell";
import { getFirstAdminNavPath } from "@/lib/organization-settings/admin-nav";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ familyId?: string }>;
};

export default async function SchoolAdminPreviewPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { familyId } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const C = buildAdminThemeTokens(org.branding);
  const firstPath = getFirstAdminNavPath(
    org.features.admin,
    org.features.feature_nav?.admin,
  );
  const liveAdminHref = firstPath
    ? schoolAdminPath(slug, firstPath.feature, firstPath.subtab)
    : null;

  return (
    <AdminPageContentShell>
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: C.textPrimary }}
        >
          School admin preview
        </h2>
        <p className="text-sm max-w-md mb-6" style={{ color: C.textSecondary }}>
          Use the profile menu in the sidebar to switch between school admin and
          family views. Sidebar links open the live admin portal for full feature
          exploration.
        </p>
        {liveAdminHref ? (
          <Link
            href={liveAdminHref}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition hover:opacity-90"
            style={{
              borderColor: C.secondaryBtnBorder,
              backgroundColor: C.surface,
              color: C.textPrimary,
            }}
          >
            Open live admin feature
          </Link>
        ) : null}
        {familyId ? (
          <p className="mt-4 text-xs" style={{ color: C.textTertiary }}>
            Dual-access preview family:{" "}
            <span className="font-mono">{familyId}</span>
          </p>
        ) : null}
      </div>
    </AdminPageContentShell>
  );
}
