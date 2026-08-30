import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import {
  deriveSubmissionNextStep,
  type SubmissionNextStep,
} from "@/lib/admissions/admin-submission-next-step";
import type { AdminApplicationSubmission } from "@/lib/admissions/application-submissions";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type SubmissionNextStepCellProps = {
  submission: AdminApplicationSubmission;
  theme: ParentThemeTokens;
};

function NextStepContent({
  nextStep,
  theme,
}: {
  nextStep: SubmissionNextStep;
  theme: ParentThemeTokens;
}) {
  if (nextStep.presentation === "cta") {
    return (
      <div className="min-w-[8.5rem]">
        <AdminButton theme={theme} variant="soft" size="compact" tabIndex={-1}>
          {nextStep.primary}
        </AdminButton>
        {nextStep.secondary ? (
          <div className="mt-1 text-[10px]" style={{ color: theme.muted }}>
            {nextStep.secondary}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-w-[7rem]">
      <AdminChip theme={theme} tone={nextStep.tone}>
        {nextStep.primary}
      </AdminChip>
      {nextStep.secondary ? (
        <div className="mt-1 text-[10px]" style={{ color: theme.muted }}>
          {nextStep.secondary}
        </div>
      ) : null}
    </div>
  );
}

export default function SubmissionNextStepCell({
  submission,
  theme,
}: SubmissionNextStepCellProps) {
  const nextStep = deriveSubmissionNextStep(submission);

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <NextStepContent nextStep={nextStep} theme={theme} />
    </div>
  );
}
