"use client";

import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import {
  GET_STARTED_FILM_COPY,
  GET_STARTED_FILM_YOUTUBE_EMBED_SRC,
} from "@/lib/marketing/get-started-film";
import { ACCENT_HIGHLIGHT } from "@/components/home/bright-styles";

export default function GetStartedFilmSection() {
  return (
    <section
      className="bg-white px-3 py-16 sm:py-20 lg:px-6"
      aria-labelledby="get-started-film-heading"
    >
      <div className="mx-auto max-w-[1400px] rounded-[40px] bg-[#FFF4EC] px-6 py-12 md:px-10 lg:px-14">
        <div className="mx-auto max-w-3xl">
          <GetStartedStoryHeader
            kicker={GET_STARTED_FILM_COPY.kicker}
            title={
              <>
                Before your demo, <span className={ACCENT_HIGHLIGHT}>watch how it works.</span>
              </>
            }
            subtitle={GET_STARTED_FILM_COPY.subtitle}
            className="mb-8 sm:mb-10"
            headingAs="h2"
            titleId="get-started-film-heading"
          />

          <div className="relative aspect-video w-full overflow-hidden rounded-[24px] border border-black/10 bg-black shadow-[0_24px_60px_rgba(30,60,30,0.10)]">
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={GET_STARTED_FILM_YOUTUBE_EMBED_SRC}
              title="MudKitchen product overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
