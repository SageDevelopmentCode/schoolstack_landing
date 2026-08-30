"use client";

import { motion } from "framer-motion";
import { CheckCircle, FileText } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import {
  childFirstName,
  type ParentChildRecordSection,
} from "@/components/school-parent/children/parent-children-utils";
import { parentChildrenViewTransition } from "@/components/school-parent/children/parent-children-view-transition";
import type {
  ChildProfileData,
  FamilyChildOverview,
} from "@/lib/admissions/parent-portal-access";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { EnrollmentChecklistItemInstance } from "@/lib/admissions/enrollment-checklist-schema";

type ParentChildrenOverviewProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  child: FamilyChildOverview;
  profile: ChildProfileData | null;
  onOpenRecordSection: (section: ParentChildRecordSection) => void;
};

function incompleteChecklistItems(
  profile: ChildProfileData | null,
): Array<{ label: string; status: string }> {
  if (!profile?.checklist) return [];

  const instanceByTemplateId = new Map<string, EnrollmentChecklistItemInstance>();
  for (const instance of profile.checklist.instances) {
    instanceByTemplateId.set(instance.templateItemId, instance);
  }

  return profile.checklist.items
    .filter((item) => {
      if (!item.required) return false;
      const status = instanceByTemplateId.get(item.id)?.status ?? "not_started";
      return status === "not_started" || status === "in_progress";
    })
    .map((item) => ({
      label: item.label,
      status: instanceByTemplateId.get(item.id)?.status ?? "not_started",
    }));
}

export default function ParentChildrenOverview({
  theme,
  adminCompat,
  child,
  profile,
  onOpenRecordSection,
}: ParentChildrenOverviewProps) {
  const firstName = childFirstName(child.studentName);
  const attentionItems = incompleteChecklistItems(profile);
  const teachers = profile?.assignedTeachers ?? [];

  return (
    <motion.div
      key={child.applicationId}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      {...parentChildrenViewTransition}
      data-testid="parent-children-overview"
    >
      <ParentCard theme={theme} className="!p-5">
        <ParentSectionKicker theme={theme}>Needs your attention</ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h3" size="section" className="!mt-2 !text-[1.05rem]">
          {attentionItems.length === 0 ? "Everything is in good shape" : "Next steps"}
        </ParentDisplayHeading>
        {attentionItems.length === 0 ? (
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" style={{ color: theme.success }} />
            <p className="m-0 text-[12px]" style={{ color: theme.muted }}>
              No required enrollment items are waiting on you right now.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {attentionItems.slice(0, 3).map((item) => (
              <li
                key={item.label}
                className="flex items-start gap-2.5 border-t pt-2.5 first:border-t-0 first:pt-0"
                style={{ borderColor: theme.line }}
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: theme.warningBg }}
                >
                  <FileText className="h-3.5 w-3.5" style={{ color: theme.warning }} />
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[12px] font-bold" style={{ color: theme.ink }}>
                    {item.label}
                  </p>
                  <p className="m-0 mt-0.5 text-[11px] capitalize" style={{ color: theme.muted }}>
                    {item.status.replace(/_/g, " ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {attentionItems.length > 0 ? (
          <ParentTextLink
            theme={theme}
            className="mt-3 inline-block"
            onClick={() => onOpenRecordSection("checklist")}
          >
            Review checklist →
          </ParentTextLink>
        ) : null}
      </ParentCard>

      <ParentCard theme={theme} className="!p-5">
        <ParentSectionKicker theme={theme}>Guides at school</ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h3" size="section" className="!mt-2 !text-[1.05rem]">
          {teachers.length === 0 ? "Teachers coming soon" : `${firstName}'s team`}
        </ParentDisplayHeading>
        {teachers.length === 0 ? (
          <p className="mt-2 text-[12px]" style={{ color: theme.muted }}>
            Assigned teachers will appear here once {firstName} is linked to a class group.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {teachers.slice(0, 2).map((teacher) => (
              <li key={teacher.id} className="flex items-center gap-2.5">
                <StudentPhoto
                  name={teacher.name}
                  photoUrl={teacher.profilePhotoUrl}
                  size="md"
                  shape="circle"
                  theme={adminCompat}
                />
                <div className="min-w-0">
                  <p className="m-0 truncate text-[12px] font-bold" style={{ color: theme.ink }}>
                    {teacher.name}
                  </p>
                  {teacher.roleTitle ? (
                    <p className="m-0 truncate text-[11px]" style={{ color: theme.muted }}>
                      {teacher.roleTitle}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        {teachers.length > 0 ? (
          <ParentTextLink
            theme={theme}
            className="mt-3 inline-block"
            onClick={() => onOpenRecordSection("teachers")}
          >
            See all teachers →
          </ParentTextLink>
        ) : null}
      </ParentCard>
    </motion.div>
  );
}
