"use client";

import { Calendar, ChevronDown, Eye } from "lucide-react";
import DemoStaffAvatar from "@/components/demo/marketing/DemoStaffAvatar";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import { BUILDER_CANVAS_BG } from "@/components/school-admin/admissions/outline-item-styles";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  DEMO_NEWSLETTER_ACTIVE,
  DEMO_NEWSLETTER_COLLABORATORS,
  DEMO_NEWSLETTER_SECTIONS,
  DEMO_NEWSLETTER_TEACHER_UPDATES,
} from "@/data/school-demos/demo-newsletter-editor-fixtures";

const DEMO_RADIUS = "8px";

const TAB_ROW_CLASS = "text-sm font-semibold";

export default function NewsletterEditorDemoCanvas() {
  const { theme, C } = useSchoolAdminStoryTheme();

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <header
        className="shrink-0 border-b px-4 pt-3 pb-0"
        style={{ borderColor: C.border, backgroundColor: theme.white }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b"
          style={{ borderColor: C.border }}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-5">
            <button
              type="button"
              className={`-mb-px inline-flex max-w-full items-center gap-1 border-b-2 border-transparent pb-2 ${TAB_ROW_CLASS}`}
              style={{ color: C.textSecondary }}
            >
              <span className="truncate max-w-[min(100%,20rem)]">
                {DEMO_NEWSLETTER_ACTIVE.title}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            </button>
            <span
              className={`-mb-px border-b-2 pb-2 ${TAB_ROW_CLASS}`}
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              Editor
            </span>
            <span className={`pb-2 ${TAB_ROW_CLASS}`} style={{ color: theme.muted }}>
              Change log{" "}
              <span
                className="ml-1 rounded-md px-1.5 py-0.5 text-[10px]"
                style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
              >
                15
              </span>
            </span>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: C.border, color: C.textSecondary }}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {DEMO_NEWSLETTER_ACTIVE.dateRange}
            </button>
            {DEMO_NEWSLETTER_ACTIVE.status === "draft" ? (
              <AdminChip theme={theme} tone="warning">Draft</AdminChip>
            ) : null}
            <AdminButton theme={theme} variant="soft" className="gap-2">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Parent preview
            </AdminButton>
            <AdminButton theme={theme} variant="primary">
              Publish
            </AdminButton>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 w-full flex-1 grid-cols-[200px_minmax(0,1fr)_260px]">
        <aside
          className="flex min-h-0 flex-col border-r px-3 py-3"
          style={{ borderColor: C.border, backgroundColor: BUILDER_CANVAS_BG }}
        >
          <p
            className="mb-3 text-[10px] font-extrabold uppercase tracking-widest"
            style={{ color: "#98A39F" }}
          >
            In this newsletter
          </p>
          <ol className="space-y-1 text-sm">
            {DEMO_NEWSLETTER_SECTIONS.map((section, index) => (
              <li key={section.id}>
                <div
                  className="rounded-md border px-2.5 py-2"
                  style={{
                    borderColor: section.active ? theme.sage : "transparent",
                    backgroundColor: section.active ? theme.primarySoft : "transparent",
                    color: section.active ? theme.primary : C.textSecondary,
                    fontWeight: section.active ? 700 : 500,
                  }}
                >
                  <span className="mr-1.5 text-[11px] opacity-70">{index + 1}.</span>
                  {section.label}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-auto pt-6 text-[11px] leading-snug" style={{ color: theme.muted }}>
            One school week. Every classroom&apos;s story.
          </p>
        </aside>

        <div
          className="min-h-0 min-w-0 overflow-y-auto px-4 pt-2 pb-4"
          style={{ backgroundColor: BUILDER_CANVAS_BG }}
        >
          <AdminDisplayHeading theme={theme} size="section" as="h2">
            Class Updates
          </AdminDisplayHeading>
          <p className="mt-1 text-sm" style={{ color: theme.muted }}>
            Each teacher can add their own update for the week.
          </p>

          <div className="mt-4 space-y-3">
            {DEMO_NEWSLETTER_TEACHER_UPDATES.map((teacher) => (
              <AdminCard
                key={teacher.id}
                theme={theme}
                padding="canvas"
                style={{ borderRadius: DEMO_RADIUS }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <DemoStaffAvatar
                      name={teacher.name}
                      initials={teacher.initials}
                      photoUrl={teacher.photoUrl}
                      size={36}
                    />
                    <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                      {teacher.name}
                    </span>
                  </div>
                  <AdminChip
                    theme={theme}
                    tone={teacher.hasUpdate ? "success" : "purple"}
                  >
                    {teacher.hasUpdate ? "Update added" : "No update yet"}
                  </AdminChip>
                </div>
                <div
                  className="mt-3 min-h-[72px] rounded-md border px-3 py-2.5 text-sm leading-relaxed"
                  style={{
                    borderColor: C.border,
                    backgroundColor: theme.white,
                    color: teacher.preview ? C.textPrimary : theme.muted,
                  }}
                >
                  {teacher.preview ?? `${teacher.name.split(" ")[0]}'s update for this week…`}
                </div>
              </AdminCard>
            ))}
          </div>
        </div>

        <aside
          className="flex min-h-0 flex-col gap-4 border-l px-4 py-3"
          style={{ borderColor: C.border, backgroundColor: theme.white }}
        >
          <MetaField label="Newsletter title" value={DEMO_NEWSLETTER_ACTIVE.title} />
          <MetaField label="Week" value={DEMO_NEWSLETTER_ACTIVE.dateRange} />
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-widest"
              style={{ color: "#98A39F" }}
            >
              Collaborators
            </p>
            <ul className="mt-2 space-y-2">
              {DEMO_NEWSLETTER_COLLABORATORS.map((person) => (
                <li key={person.id} className="flex items-center gap-2 text-sm">
                  <DemoStaffAvatar
                    name={person.name}
                    initials={person.initials}
                    photoUrl={person.photoUrl}
                    size={28}
                  />
                  <span style={{ color: C.textPrimary }}>
                    {person.name}
                    {person.isYou ? " (You)" : ""}
                  </span>
                  <span
                    className="ml-auto h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: person.online ? "#348457" : C.border,
                    }}
                    aria-hidden
                  />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-widest"
              style={{ color: "#98A39F" }}
            >
              Cover image
            </p>
            <div
              className="mt-2 flex h-20 items-center justify-center rounded-md border border-dashed text-xs"
              style={{ borderColor: C.border, color: theme.muted }}
            >
              Autumn campus photo
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-[10px] font-extrabold uppercase tracking-widest"
        style={{ color: "#98A39F" }}
      >
        {label}
      </p>
      <p
        className="mt-1 rounded-md border px-2.5 py-2 text-xs font-medium"
        style={{ borderColor: "#E2E8F0", color: "#1e141f" }}
      >
        {value}
      </p>
    </div>
  );
}
