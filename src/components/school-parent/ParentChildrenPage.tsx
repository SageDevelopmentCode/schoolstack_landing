"use client";

import Link from "next/link";
import { Fragment } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import ParentChildRecordWorkspace from "@/components/school-parent/children/ParentChildRecordWorkspace";
import ChildNextStepsCard from "@/components/school-parent/children/garden/ChildNextStepsCard";
import ChildRecordSkeleton from "@/components/school-parent/children/garden/ChildRecordSkeleton";
import ChildSnapshotCard from "@/components/school-parent/children/garden/ChildSnapshotCard";
import ChildTeamCard from "@/components/school-parent/children/garden/ChildTeamCard";
import ChildrenSwitcher from "@/components/school-parent/children/garden/ChildrenSwitcher";
import {
  familyChildrenSubtitle,
  formatChildrenPageDate,
  programPortalChildrenEmptyMessage,
} from "@/components/school-parent/children/parent-children-utils";
import {
  useParentChildrenModel,
  type ParentChildrenPageProps,
} from "@/components/school-parent/children/useParentChildrenModel";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GIcon, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";

/**
 * Parent portal "My children" — Garden dashboard (parent-portal-garden-design).
 *
 * Header → child switcher → [Next steps | rail: at a glance, guides at school]
 *        → School record (Application · Checklist · Teachers · Health · Pickup).
 *
 * Rendered by the live portal, the admin family preview (read-only),
 * program portal previews and the marketing demo, so props stay stable.
 */
export default function ParentChildrenPage(props: ParentChildrenPageProps) {
  const model = useParentChildrenModel(props);
  const reduce = useReducedMotion() === true;
  const {
    theme,
    adminCompat,
    children,
    selectedChild,
    selectedProfile,
    healthProfiles,
    handleHealthProfileChange,
    profileError,
    isRecordLoading,
    recordSection,
    setRecordSection,
    recordWorkspaceRef,
    applyDashboardHref,
    readOnly,
    firstName,
  } = model;

  if (children.length === 0) {
    return (
      <ParentGardenFrame theme={theme} className="shrink-0">
        <div className={PORTAL_HOME_CONTAINER_CLASS}>
          <ParentGardenPageHeader
            data-testid="parent-children-story-header"
            kicker={`My children · ${formatChildrenPageDate()}`}
            title="Follow their day."
          />
          <GCard index={1} kicker="Your family" title="No student records yet" data-testid="parent-children-empty">
            <p className="m-0 max-w-2xl text-[15px] leading-relaxed text-[var(--sf-soft)]">
              {props.programPortalLabel ? (
                programPortalChildrenEmptyMessage(props.programPortalLabel)
              ) : (
                <>
                  We don&apos;t have any student records from your applications yet. Visit your
                  application dashboard to get started.
                </>
              )}
            </p>
            {props.programPortalLabel ? null : (
              <div className="mt-5">
                <Link href={applyDashboardHref} className={gBtnPopSm}>
                  Go to application dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </GCard>
        </div>
      </ParentGardenFrame>
    );
  }

  const panelMotion = reduce
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.26, ease: PORTAL_EASE },
      };

  return (
    <Fragment>
      <ParentGardenFrame theme={theme} className="shrink-0">
        <div className={PORTAL_HOME_CONTAINER_CLASS}>
          <ParentGardenPageHeader
            data-testid="parent-children-story-header"
            kicker={`My children · ${formatChildrenPageDate()}`}
            title={
              selectedChild ? (
                <>
                  <span className="text-[var(--sf-clay)]">{firstName}</span>&apos;s profile
                </>
              ) : (
                "Follow their day."
              )
            }
            subtitle={familyChildrenSubtitle(children) || undefined}
            actions={
              selectedChild ? (
                <button
                  type="button"
                  className={`${gBtnOutlineSm} w-full sm:w-auto`}
                  onClick={() => model.openRecordSection("application")}
                >
                  View school record <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null
            }
          />

          <p className="sr-only" aria-live="polite">
            {selectedChild ? `Showing ${firstName}'s profile` : ""}
          </p>

          <ChildrenSwitcher
            learners={children}
            selectedApplicationId={model.selectedApplicationId ?? children[0].applicationId}
            onSelect={model.selectChild}
          />

          <AnimatePresence mode="wait" initial={false}>
            {selectedChild ? (
              <motion.div
                key={selectedChild.applicationId}
                {...panelMotion}
                className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[auto_1fr] xl:grid-cols-[minmax(0,1fr)_340px]"
                data-testid="parent-children-overview"
              >
                <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                  <ChildNextStepsCard model={model} />
                </div>
                {/* Rail spans both rows so the School record sits right under Next steps. */}
                <div className="flex min-w-0 flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                  <ChildSnapshotCard
                    model={model}
                    schoolSlug={props.schoolSlug}
                    previewBasePath={props.previewBasePath}
                  />
                  <ChildTeamCard model={model} />
                </div>
                <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-2">
                  {profileError ? (
                    <GCard index={2} className="!bg-[var(--sf-peach)]" data-testid="parent-children-profile-error">
                      <div role="alert" className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <GIcon size="md">
                          <AlertTriangle />
                        </GIcon>
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
                            We couldn&apos;t open {firstName ? `${firstName}'s` : "this"} school record
                          </p>
                          <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/70">{profileError}</p>
                        </div>
                        <button type="button" className={gBtnOutlineSm} onClick={model.retryProfile}>
                          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
                        </button>
                      </div>
                    </GCard>
                  ) : null}

                  {isRecordLoading ? <ChildRecordSkeleton /> : null}

                  {selectedProfile?.application ? (
                    <ParentChildRecordWorkspace
                      key={selectedProfile.application.id}
                      theme={theme}
                      adminCompat={adminCompat}
                      branding={props.branding}
                      schoolName={props.schoolName}
                      schoolSlug={props.schoolSlug}
                      organizationId={props.organizationId}
                      application={selectedProfile.application}
                      checklist={selectedProfile.checklist}
                      assignedTeachers={selectedProfile.assignedTeachers}
                      enrolledPrograms={selectedChild?.enrolledPrograms ?? []}
                      readOnly={readOnly}
                      activeSection={recordSection}
                      onSectionChange={setRecordSection}
                      onPhotoUpdated={model.handlePhotoUpdated}
                      initialHealthProfile={
                        selectedProfile.application.studentId
                          ? healthProfiles[selectedProfile.application.studentId] ?? null
                          : null
                      }
                      onHealthProfileChange={
                        selectedProfile.application.studentId
                          ? (profile) =>
                              handleHealthProfileChange(selectedProfile.application.studentId!, profile)
                          : undefined
                      }
                      workspaceRef={recordWorkspaceRef}
                      studentName={selectedChild?.studentName}
                      checklistLeft={model.attentionItems.length}
                      healthNeedsAttention={model.showHealthAttention}
                    />
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </ParentGardenFrame>
    </Fragment>
  );
}
