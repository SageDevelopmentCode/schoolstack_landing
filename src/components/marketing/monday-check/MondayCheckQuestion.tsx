import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { MondayCheckQuestion as MondayCheckQuestionType } from "@/lib/marketing/microschool-monday-check";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type MondayCheckQuestionProps = {
  theme: ParentThemeTokens;
  question: MondayCheckQuestionType;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
};

export default function MondayCheckQuestion({
  theme,
  question,
  selectedOptionId,
  onSelect,
}: MondayCheckQuestionProps) {
  return (
    <div>
      <ParentCard theme={theme} className="mb-5">
        <ParentDisplayHeading
          theme={theme}
          as="h2"
          size="section"
          id={`question-${question.id}`}
          className="!text-[clamp(1.2rem,3vw,1.5rem)]"
        >
          {question.prompt}
        </ParentDisplayHeading>
      </ParentCard>
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
              className="w-full text-left px-4 py-3.5 text-[15px] leading-relaxed font-semibold transition-all duration-150 cursor-pointer"
              style={{
                fontFamily: theme.fontBody,
                borderRadius: theme.radiusButton,
                border: `1.5px solid ${selected ? theme.primary : theme.line}`,
                backgroundColor: selected ? theme.primaryLight : theme.white,
                color: selected ? theme.primaryDark : theme.ink,
                boxShadow: selected ? theme.shadowPill : undefined,
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
