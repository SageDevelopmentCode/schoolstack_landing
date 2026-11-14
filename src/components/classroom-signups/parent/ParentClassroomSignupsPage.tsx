"use client";

import { Suspense, useCallback } from "react";
import { ClipboardList, Eye } from "lucide-react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import { GCard, GIcon, GSkeleton } from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { ParentClassroomSignupsPageBundle } from "@/lib/classroom-signups/types";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import GardenSignupDrawer from "./garden/GardenSignupDrawer";
import SignupsListCard, { SIGNUPS_LIST_ID } from "./garden/SignupsListCard";
import SignupsNextUpCard from "./garden/SignupsNextUpCard";
import { HowSignupsWorkCard, UpcomingHelpCard } from "./garden/SignupsRailCards";
import type { SignupFilter } from "./garden/signups-garden-ui";
import { useParentClassroomSignupsModel } from "./useParentClassroomSignupsModel";

type ParentClassroomSignupsPageProps = {
  organizationId: string;
  slug: string;
  initialBundle: ParentClassroomSignupsPageBundle;
  previewBasePath?: string;
  readOnly?: boolean;
  initialSignupId?: string;
};

function SignupsPageSkeleton() {
  const { theme } = useParentTheme();
  return (
    <ParentGardenFrame theme={theme}>
      <div className={PORTAL_HOME_CONTAINER_CLASS} aria-busy="true" aria-label="Loading signups">
        <span className="sr-only">Loading signups…</span>
        <GSkeleton className="h-20 w-2/3 max-w-md" />
        <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
          <GSkeleton className="h-72" />
          <GSkeleton className="h-48" />
        </div>
      </div>
    </ParentGardenFrame>
  );
}

export default function ParentClassroomSignupsPage(props: ParentClassroomSignupsPageProps) {
  return (
    <Suspense fallback={<SignupsPageSkeleton />}>
      <ParentClassroomSignupsPageContent {...props} />
    </Suspense>
  );
}

/**
 * Parent Classroom signups (Garden): the waiting requests up top (first one
 * as the accent strip), every signup below, booked help + how-it-works in
 * the rail. A signup opens in the Garden drawer via `?signup=`.
 * Preview (readOnly) shows everything with responding disabled.
 */
function ParentClassroomSignupsPageContent({
  organizationId,
  initialBundle,
  readOnly = false,
  initialSignupId,
}: ParentClassroomSignupsPageProps) {
  const { theme } = useParentTheme();
  const model = useParentClassroomSignupsModel({
    initialItems: initialBundle.items,
    initialSignupId,
  });
  const { setFilter } = model;

  // No confetti in admin previews.
  useCelebrate(model.justAnsweredAll && !readOnly, theme, "parent-signups-all-answered");

  const showFilter = useCallback(
    (filter: SignupFilter) => {
      setFilter(filter);
      document.getElementById(SIGNUPS_LIST_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [setFilter],
  );

  const empty = model.items.length === 0;

  return (
    <>
      <ParentGardenFrame theme={theme}>
        <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="parent-classroom-signups-page">
          <ParentGardenPageHeader
            kicker="Help in the classroom"
            title={
              <>
                Classroom <span className="text-[var(--sf-clay)]">signups</span>
              </>
            }
            subtitle="Help teachers by signing up for volunteer requests."
            data-testid="parent-classroom-signups-header"
          />

          {readOnly ? (
            <p className="m-0 -mt-3 flex w-fit items-center gap-2 rounded-[12px] bg-[var(--sf-sky)] px-3 py-2 text-[12px] font-extrabold text-[#24507a]">
              <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Preview mode — signups can be opened but not answered here.
            </p>
          ) : null}

          {empty ? (
            <GCard index={1} kicker="Classroom signups" title="No classroom signups right now" data-testid="parent-signups-empty">
              <div className="flex flex-col items-start gap-3 rounded-[18px] bg-[var(--sf-paper)] p-5 sm:flex-row sm:items-center">
                <GIcon>
                  <ClipboardList />
                </GIcon>
                <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
                  When a teacher posts a volunteer request for your family, it will show up here.
                </p>
              </div>
            </GCard>
          ) : (
            <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
              <div className="flex min-w-0 flex-col gap-5">
                <SignupsNextUpCard
                  index={1}
                  model={model}
                  readOnly={readOnly}
                  onShowNeeds={() => showFilter("needs_response")}
                />
                <SignupsListCard index={3} model={model} readOnly={readOnly} />
              </div>
              <div className="flex min-w-0 flex-col gap-5">
                <UpcomingHelpCard
                  index={2}
                  model={model}
                  onShowSignedUp={() => showFilter("signed_up")}
                  onShowNeeds={() => showFilter("needs_response")}
                />
                <HowSignupsWorkCard index={4} model={model} />
              </div>
            </div>
          )}
        </div>
      </ParentGardenFrame>

      <GardenSignupDrawer
        key={model.selectedSignupId ?? "closed"}
        theme={theme}
        open={model.selectedSignupId != null && model.selectedItem != null}
        organizationId={organizationId}
        signupId={model.selectedSignupId}
        signup={model.selectedItem?.signup ?? null}
        initialFamilyResponse={model.selectedItem?.familyResponse ?? null}
        studentOptions={initialBundle.studentOptions}
        readOnly={readOnly}
        onClose={model.closeSignup}
        onSubmitted={model.handleSubmitted}
        onWithdrawn={model.handleWithdrawn}
      />
    </>
  );
}
