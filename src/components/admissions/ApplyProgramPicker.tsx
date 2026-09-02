import Link from "next/link";
import {
  APPLY_FORM_PUBLIC_SLUG,
  listPublishedApplyForms,
  publicApplicationFormPath,
} from "@/lib/admissions/application-forms";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { SupabaseClient } from "@supabase/supabase-js";

type ProgramRow = {
  id: string;
  name: string;
};

type ApplyProgramPickerProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  forms: ApplicationFormVersion[];
  programsById: Map<string, string>;
};

export function buildProgramsByIdMap(rows: ProgramRow[]): Map<string, string> {
  return new Map(rows.map((row) => [row.id, row.name]));
}

export async function loadApplyProgramPickerData(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{
  forms: ApplicationFormVersion[];
  programsById: Map<string, string>;
}> {
  const forms = await listPublishedApplyForms(supabase, organizationId);
  const programIds = [
    ...new Set(
      forms
        .map((form) => form.program_id)
        .filter((programId): programId is string => Boolean(programId)),
    ),
  ];

  let programsById = new Map<string, string>();
  if (programIds.length > 0) {
    const { data, error } = await supabase
      .from("programs")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", programIds);

    if (error) throw error;
    programsById = buildProgramsByIdMap(
      (data ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name),
      })),
    );
  }

  return { forms, programsById };
}

export default function ApplyProgramPicker({
  branding,
  schoolName,
  schoolSlug,
  forms,
  programsById,
}: ApplyProgramPickerProps) {
  const theme = buildParentThemeTokens(branding);

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ backgroundColor: theme.paper, color: theme.ink }}
    >
      <div className="mx-auto w-full max-w-lg">
        <ParentSectionKicker theme={theme}>Apply to {schoolName}</ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h1" size="section" className="mt-2">
          Choose a program
        </ParentDisplayHeading>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>
          Select the program you want to apply for. Each program has its own application
          form.
        </p>

        <ul className="mt-8 space-y-3">
          {forms.map((form) => {
            const programName =
              (form.program_id && programsById.get(form.program_id)) ||
              form.title ||
              "Application";
            const href = publicApplicationFormPath(
              schoolSlug,
              form.public_slug ?? APPLY_FORM_PUBLIC_SLUG,
            );

            return (
              <li key={form.id}>
                <Link
                  href={`${href}?new=1`}
                  className="flex items-center justify-between rounded-2xl border px-4 py-4 transition-colors"
                  style={{
                    borderColor: theme.line,
                    backgroundColor: theme.white,
                    boxShadow: theme.shadowCard,
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                      {programName}
                    </p>
                    {form.intro ? (
                      <p
                        className="mt-1 line-clamp-2 text-xs leading-relaxed"
                        style={{ color: theme.muted }}
                      >
                        {form.intro}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                        {form.title}
                      </p>
                    )}
                  </div>
                  <span
                    className="ml-3 shrink-0 text-xs font-semibold"
                    style={{ color: theme.primary }}
                  >
                    Apply
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <ParentButtonLink theme={theme} href={`/school/${schoolSlug}/apply`} variant="soft">
            Back to your applications
          </ParentButtonLink>
        </div>
      </div>
    </div>
  );
}
