"use client";

import Link from "next/link";
import {
  childIsolatedPortalHref,
  childIsolatedPortalLabel,
  programPortalChildrenEmptyMessage,
} from "@/components/school-parent/children/parent-children-utils";
import {
  ChildThumb,
  GCard,
  GProgress,
  GSkeleton,
  SPRINGY,
  StatusChip,
  gBtnOutlineSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import type { ParentHomePageProps } from "../parent-home-types";
import { childApplicationHref, childDetailsHref, childMetaLine, type ParentHomeModel } from "../useParentHomeModel";

/** "Your children": one mini-card per child (polaroid thumb, status, checklist bar, links). */
export default function HomeChildrenCard({ model, props }: { model: ParentHomeModel; props: ParentHomePageProps }) {
  const kids = props.familyChildren;
  return (
    <GCard index={4} kicker="Your family" title="Your children">
      {props.contentDeferred ? (
        <GSkeleton className="h-40" />
      ) : kids.length === 0 ? (
        <p className="m-0 text-[15px] leading-relaxed text-[var(--sf-soft)]">
          {props.programPortalLabel ? (
            programPortalChildrenEmptyMessage(props.programPortalLabel)
          ) : (
            <>
              We don&apos;t have any student records from your applications yet. Visit your{" "}
              <Link href={model.applyDashboardHref} className={gLinkSm}>
                application dashboard
              </Link>{" "}
              to get started.
            </>
          )}
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kids.map((child, i) => {
            const first = child.studentName.split(" ")[0];
            const progress = child.checklistProgress;
            const complete = progress ? progress.completed >= progress.total : false;
            const isolatedHref = childIsolatedPortalHref(
              props.schoolSlug,
              child,
              props.previewBasePath ? `${props.previewBasePath}/parent` : undefined,
            );
            const isolatedLabel = childIsolatedPortalLabel(child);
            const showEnrollmentLink = child.isEnrolled || child.status === "enrolling";
            return (
              <li
                key={child.applicationId}
                className={`flex flex-col rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/25 ${SPRINGY}`}
              >
                <div className="flex items-start gap-3.5">
                  <ChildThumb child={child} index={i} tilt={i % 2 === 0 ? -3 : 3} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="sf-display m-0 text-xl leading-none text-[var(--sf-ink)]">{first}</h3>
                      <StatusChip child={child} />
                    </div>
                    <p className="m-0 mt-1.5 text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">{childMetaLine(child)}</p>
                  </div>
                </div>
                {progress && progress.total > 0 ? (
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-extrabold text-[var(--sf-ink)]/70">
                      <span>Enrollment checklist</span>
                      <span className={complete ? "text-[var(--sf-forest)]" : ""}>
                        {progress.completed} of {progress.total} complete
                      </span>
                    </div>
                    <GProgress value={progress.completed} total={progress.total} done={complete} label={`${first}'s enrollment checklist`} />
                  </div>
                ) : null}
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                  <Link href={childDetailsHref(props.schoolSlug, child.applicationId, props.previewBasePath)} className={gBtnOutlineSm}>
                    See {first}&apos;s details
                  </Link>
                  {showEnrollmentLink ? (
                    <Link href={childApplicationHref(props.schoolSlug, child, props.previewBasePath)} className={gLinkSm}>
                      Enrollment checklist
                    </Link>
                  ) : null}
                  {isolatedHref && isolatedLabel ? (
                    <Link href={isolatedHref} className={gLinkSm}>
                      Open {isolatedLabel} portal
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GCard>
  );
}
