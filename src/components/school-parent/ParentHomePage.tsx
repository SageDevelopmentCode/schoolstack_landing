"use client";

import { Fragment } from "react";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { useParentHomeModel } from "@/components/school-parent/home/useParentHomeModel";
import type { ParentHomePageProps } from "@/components/school-parent/home/parent-home-types";
import HomeStartHereCard from "@/components/school-parent/home/garden/HomeStartHereCard";
import HomeChildrenCard from "@/components/school-parent/home/garden/HomeChildrenCard";
import {
  HomeBulletinTile,
  HomeEventsCard,
  HomeJumpToCard,
  HomeMessagesTile,
} from "@/components/school-parent/home/garden/HomeRail";
import {
  HomeFormsCard,
  HomeGuidesCard,
  HomeNewsCard,
  HomeOverlays,
  HomeProgramSections,
} from "@/components/school-parent/home/garden/HomeLowerCards";

export type { ParentHomePageProps };

/**
 * Parent portal Home — "Garden dashboard" (parent-portal-garden-design).
 *
 * Header → [Start here | rail: events, bulletin, messages, jump-to]
 *        → children → forms + what's new → program blocks → guides.
 *
 * Rendered by the live portal (ParentHomePageShell), the admin family
 * preview, program portal previews and the marketing demos, so keep the
 * props stable and honour previewMode / previewBasePath.
 */
export default function ParentHomePage(props: ParentHomePageProps) {
  const model = useParentHomeModel(props);
  const hasForms = Boolean(props.formSnapshot) || (Boolean(props.contentDeferred) && model.formsFeatureEnabled);
  const hasNews = (props.featureAnnouncements ?? []).length > 0;
  const coopLabel =
    props.coopModeEnabled && props.programPortalLabel ? ` · Co-op mode · ${props.programPortalLabel}` : "";

  return (
    <Fragment>
      <ParentGardenFrame theme={model.theme}>
        <div className={PORTAL_HOME_CONTAINER_CLASS}>
          <ParentGardenPageHeader
            kicker={`${model.familyLabel}${coopLabel}`}
            title={
              <>
                {model.greetingPrefix}, <span className="text-[var(--sf-clay)]">{model.name}.</span>{" "}
                <span aria-hidden="true">{model.greetingEmoji}</span>
              </>
            }
            subtitle={<>Here&apos;s what your family needs for {model.todayLabel}.</>}
          />

          <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
            <HomeStartHereCard model={model} props={props} />
            <div className="flex min-w-0 flex-col gap-5">
              <HomeEventsCard model={model} props={props} />
              <HomeBulletinTile model={model} props={props} />
              <HomeMessagesTile model={model} props={props} />
              <HomeJumpToCard props={props} />
            </div>
          </div>

          <HomeChildrenCard model={model} props={props} />

          {hasForms || hasNews ? (
            <div className={`grid items-start gap-5 ${hasForms && hasNews ? "lg:grid-cols-2" : ""}`}>
              <HomeFormsCard model={model} props={props} />
              <HomeNewsCard props={props} />
            </div>
          ) : null}

          <HomeProgramSections model={model} props={props} />
          <HomeGuidesCard model={model} />
        </div>
      </ParentGardenFrame>
      <HomeOverlays model={model} props={props} />
    </Fragment>
  );
}
