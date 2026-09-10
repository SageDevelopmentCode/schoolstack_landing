import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { BuilderQuestionCard } from "./builder-question-card";

type ProgramCoopPlaceholderCardProps = {
  C: AdminThemeTokens;
  question: string;
  helper?: string;
  message: string;
};

export default function ProgramCoopPlaceholderCard({
  C,
  question,
  helper,
  message,
}: ProgramCoopPlaceholderCardProps) {
  return (
    <BuilderQuestionCard C={C} tone="accent" question={question} helper={helper}>
      <p className="text-sm" style={{ color: C.textSecondary }}>
        {message}
      </p>
    </BuilderQuestionCard>
  );
}
