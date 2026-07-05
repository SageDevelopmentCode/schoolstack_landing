import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type SchoolAdminAccessDeniedProps = {
  branding: OrganizationBranding;
  schoolName: string;
  userEmail?: string | null;
};

export default function SchoolAdminAccessDenied({
  branding,
  schoolName,
  userEmail,
}: SchoolAdminAccessDeniedProps) {
  const C = buildAdminThemeTokens(branding);

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6 py-12"
      style={{ backgroundColor: C.bg, color: C.textPrimary }}
    >
      <div
        className="w-full max-w-md rounded-lg border p-6 text-center"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          You don&apos;t have admin access to {schoolName}. Contact your
          administrator if you believe this is a mistake.
        </p>
        {userEmail ? (
          <p className="mt-3 text-xs" style={{ color: C.textTertiary }}>
            Signed in as {userEmail}
          </p>
        ) : null}
      </div>
    </div>
  );
}
