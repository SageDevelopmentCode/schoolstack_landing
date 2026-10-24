import Link from "next/link";
import MobileAppDownloadBadges from "@/components/download/MobileAppDownloadBadges";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

const theme = MUDKITCHEN_MARKETING_STORY_THEME;

export default function DownloadCtaBand() {
  return (
    <section className="pb-24 pt-4 sm:pb-28">
      <div className="mx-auto max-w-[640px] px-6 text-center lg:px-8">
        <div
          className="rounded-[22px] border border-black/[0.08] bg-white/85 px-6 py-10 backdrop-blur-sm sm:px-10"
          style={{ boxShadow: theme.shadowCard }}
        >
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-accent">
            Ready when your school is
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-text-muted font-secondary">
            Grab the app on iPhone, or join the Android waitlist—we&apos;ll email
            you when Google Play goes live.
          </p>
          <MobileAppDownloadBadges
            className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-5"
            badgeClassName="h-[52px] w-auto object-contain sm:h-[58px]"
          />
        </div>

        <p className="mt-8 text-sm text-text-muted font-secondary leading-relaxed">
          Already have access?{" "}
          <Link href="/login" className="font-medium text-clay hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-xs text-text-faint font-secondary">
          MudKitchen mobile is for schools already on the platform.{" "}
          <Link href="/get-started" className="text-clay hover:underline">
            Learn how schools get started
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
