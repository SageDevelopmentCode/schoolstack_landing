"use client";

import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import { InViewSectionGate } from "@/components/ui/InViewSectionGate";
import {
  GET_STARTED_FILM_COPY,
  GET_STARTED_FILM_VIDEO_SRC,
} from "@/lib/marketing/get-started-film";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

const theme = MUDKITCHEN_MARKETING_STORY_THEME;

export default function GetStartedFilmSection() {
  return (
    <section
      className="border-t border-border bg-surface py-16 sm:py-20 font-secondary text-text"
      aria-labelledby="get-started-film-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <GetStartedStoryHeader
          theme={theme}
          kicker={GET_STARTED_FILM_COPY.kicker}
          title={
            <>
              Before your demo,{" "}
              <em style={{ color: theme.coral, fontStyle: "italic" }}>
                watch how it works.
              </em>
            </>
          }
          subtitle={GET_STARTED_FILM_COPY.subtitle}
          className="mb-8 sm:mb-10"
          headingAs="h2"
          titleId="get-started-film-heading"
        />

        <InViewSectionGate minHeight="12rem" className="w-full">
          <div
            className="overflow-hidden rounded-[22px] border border-border bg-bg"
            style={{ boxShadow: theme.shadowCard }}
          >
            <div className="aspect-video w-full bg-ink/5">
              <video
                className="h-full w-full object-cover"
                src={GET_STARTED_FILM_VIDEO_SRC}
                controls
                playsInline
                preload="metadata"
                aria-label="MudKitchen product overview"
              />
            </div>
          </div>
        </InViewSectionGate>
      </div>
    </section>
  );
}
