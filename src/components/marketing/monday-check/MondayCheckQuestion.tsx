import { PILLAR_LABELS } from "@/lib/marketing/microschool-monday-check";
import type { MondayCheckQuestion as MondayCheckQuestionType } from "@/lib/marketing/microschool-monday-check";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type MondayCheckQuestionProps = {
  theme: ParentThemeTokens;
  question: MondayCheckQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
};

export default function MondayCheckQuestion({
  theme,
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelect,
}: MondayCheckQuestionProps) {
  const pillarLabel = PILLAR_LABELS[question.pillar];

  return (
    <div>
      <p
        className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
        style={{ color: "#759077", fontFamily: theme.fontBody }}
      >
        {questionNumber} of {totalQuestions} · {pillarLabel}
      </p>
      <h2
        id={`question-${question.id}`}
        className="mt-5 mb-4 font-[family-name:var(--font-fraunces)] text-[clamp(1.25rem,3.5vw,1.45rem)] font-medium leading-[1.3] tracking-[-0.025em]"
        style={{ color: theme.ink }}
      >
        {question.prompt}
      </h2>
      <div
        className="flex flex-col gap-2.5"
        role="listbox"
        aria-labelledby={`question-${question.id}`}
      >
        {question.options.map((option) => {
          const selected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(option.id)}
              className="w-full rounded-[15px] border px-4 py-4 text-left shadow-sm transition-all duration-150"
              style={{
                fontFamily: theme.fontBody,
                borderColor: selected ? "#B9D1C1" : "#E0E7E0",
                backgroundColor: selected ? theme.primarySoft : theme.white,
                color: theme.ink,
                boxShadow: theme.shadowCard,
              }}
            >
              <span className="text-[14px] font-semibold leading-relaxed">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
