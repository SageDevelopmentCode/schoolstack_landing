"use client";

import {
  BookOpen,
  CalendarDays,
  FileText,
  Heart,
  Users,
} from "lucide-react";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  CLASSROOM_SIGNUP_TEMPLATES,
  type ClassroomSignupTemplate,
} from "@/lib/classroom-signups/templates";
import type { ClassroomSignupTemplateId } from "@/lib/classroom-signups/types";
import ParentCard from "@/components/school-parent/ui/ParentCard";

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  "book-open": <BookOpen className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  "calendar-days": <CalendarDays className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  "file-text": <FileText className="h-5 w-5" />,
};

type SignupTemplatePickerProps = {
  theme: ParentThemeTokens;
  onSelect: (templateId: ClassroomSignupTemplateId) => void;
};

function TemplateCard({
  theme,
  template,
  onSelect,
}: {
  theme: ParentThemeTokens;
  template: ClassroomSignupTemplate;
  onSelect: () => void;
}) {
  const Icon = getFeatureIcon(template.icon);
  const iconNode = TEMPLATE_ICONS[template.icon] ?? <Icon className="h-5 w-5" />;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left"
    >
      <ParentCard
        theme={theme}
        className="h-full transition-shadow hover:shadow-md"
      >
        <div
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px]"
          style={{ backgroundColor: "#E9F2EA", color: theme.primary }}
        >
          {iconNode}
        </div>
        <h3 className="text-sm font-semibold" style={{ color: theme.ink }}>
          {template.label}
        </h3>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "#76828A" }}>
          {template.description}
        </p>
      </ParentCard>
    </button>
  );
}

export default function SignupTemplatePicker({
  theme,
  onSelect,
}: SignupTemplatePickerProps) {
  const templates = CLASSROOM_SIGNUP_TEMPLATES.filter((t) => t.id !== "blank");
  const blank = CLASSROOM_SIGNUP_TEMPLATES.find((t) => t.id === "blank");

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            theme={theme}
            template={template}
            onSelect={() => onSelect(template.id)}
          />
        ))}
      </div>
      {blank ? (
        <button
          type="button"
          onClick={() => onSelect("blank")}
          className="w-full rounded-[14px] border border-dashed px-4 py-4 text-sm font-medium transition-colors hover:bg-[#F7F9F7]"
          style={{ borderColor: "#DCE4DC", color: theme.primary }}
        >
          Start blank — configure from scratch
        </button>
      ) : null}
    </div>
  );
}
