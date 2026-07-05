import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationFormSetupRequiredProps = {
  branding: OrganizationBranding;
  schoolName: string;
  formTitle: string;
};

export default function ApplicationFormSetupRequired({
  branding,
  schoolName,
  formTitle,
}: ApplicationFormSetupRequiredProps) {
  const C = buildAdminThemeTokens(branding);

  return (
    <ApplicationFormPageShell branding={branding}>
      <div
        className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12 sm:px-6"
        style={{ color: C.textPrimary }}
      >
        <SchoolDemoWordmark
          logo={{
            src: branding.logo.src,
            alt: branding.logo.alt || schoolName,
            width: branding.logo.width,
            height: branding.logo.height,
            text: branding.logo.src ? undefined : schoolName,
          }}
          className="mb-6 h-8 w-auto max-w-[200px] object-contain"
        />
        <h1
          className="font-display text-xl font-medium sm:text-2xl"
          style={{ color: C.accentDark }}
        >
          Applications are not open yet
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          <span className="font-medium" style={{ color: C.textPrimary }}>
            {formTitle}
          </span>{" "}
          is still being set up. Please contact {schoolName} if you need help
          finishing your application.
        </p>
      </div>
    </ApplicationFormPageShell>
  );
}
