"use client";

import { ArrowRight, BookOpen, CalendarDays, ClipboardList, FileText, Heart, Users, type LucideIcon } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, G_FOCUS, NOTE_TINTS } from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { CLASSROOM_SIGNUP_TEMPLATES } from "@/lib/classroom-signups/templates";
import { SIGNUP_TYPE_LABELS, type ClassroomSignupTemplateId } from "@/lib/classroom-signups/types";

type SignupTemplateSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: ClassroomSignupTemplateId) => void;
};

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  users: Users,
  "calendar-days": CalendarDays,
  heart: Heart,
  "file-text": FileText,
};

/** Template picker drawer (Garden): one tappable card per common request. */
export default function SignupTemplateSidebar({ theme, open, onClose, onSelect }: SignupTemplateSidebarProps) {
  const templates = CLASSROOM_SIGNUP_TEMPLATES.filter((t) => t.id !== "blank");

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={onClose}
      kicker="Create signup"
      title="Choose a template"
      subtitle="Start from a common classroom request. Your audience settings stay the same."
      testId="teacher-signup-template-sidebar"
      panelId="teacher-signup-template-sidebar"
      closeLabel="Close templates"
    >
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {templates.map((template, index) => {
          const Icon = TEMPLATE_ICONS[template.icon] ?? ClipboardList;
          return (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => onSelect(template.id)}
                className={`group flex w-full items-start gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/35 hover:shadow-[0_3px_0_0_rgba(43,36,29,0.12)] ${G_FOCUS}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${NOTE_TINTS[index % NOTE_TINTS.length]}`}
                >
                  <Icon className="h-5 w-5 text-[var(--sf-ink)]/80" strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="sf-display block text-[1.05rem] leading-tight text-[var(--sf-ink)]">{template.label}</span>
                  <span className="mt-1 block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                    {template.description}
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2">
                    <GChip tone="info">{SIGNUP_TYPE_LABELS[template.signupType]}</GChip>
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] opacity-80 group-hover:opacity-100">
                      Use template <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </GSidePanel>
  );
}
