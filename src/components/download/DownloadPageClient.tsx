"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import AndroidDownloadLeadSheet from "@/components/download/AndroidDownloadLeadSheet";
import { APPLE_APP_STORE_URL } from "@/lib/mobile-app-download/constants";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

const theme = MUDKITCHEN_MARKETING_STORY_THEME;

const FEATURES = [
  "Messages, tuition, and school updates in one calm app",
  "Application and enrollment progress for your family",
  "Attendance, forms, and bulletins from your school",
];

export default function DownloadPageClient() {
  const [androidSheetOpen, setAndroidSheetOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden pb-24 pt-[120px] sm:pt-[140px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(520px,70vh)] opacity-90"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, #A6B89A 35%, transparent), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 20%, color-mix(in srgb, #A05C45 12%, transparent), transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-[720px] px-6 lg:px-8">
          <GetStartedStoryHeader
            theme={theme}
            kicker="MudKitchen mobile"
            title={
              <>
                Your school,{" "}
                <em style={{ color: theme.coral, fontStyle: "italic" }}>
                  in your pocket.
                </em>
              </>
            }
            subtitle="Download the MudKitchen app for iPhone today. On Android, leave your email and we’ll send you the Google Play link when it’s live."
            headingAs="h1"
            titleId="download-page-heading"
            className="mb-10 sm:mb-12"
          />

          <div
            className="rounded-[22px] border border-black/[0.08] bg-white/80 px-6 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:px-10 sm:py-10"
            style={{ boxShadow: theme.shadowCard }}
          >
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-text-faint font-secondary">
              Get the app
            </p>

            <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-5">
              <a
                href={APPLE_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex justify-center rounded-2xl outline-none ring-clay/40 transition hover:scale-[1.02] focus-visible:ring-2"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/images/AppleStore.webp"
                  alt=""
                  width={200}
                  height={60}
                  className="h-[52px] w-auto object-contain sm:h-[58px]"
                  priority
                />
              </a>

              <button
                type="button"
                onClick={() => setAndroidSheetOpen(true)}
                className="group flex justify-center rounded-2xl outline-none ring-clay/40 transition hover:scale-[1.02] focus-visible:ring-2"
                aria-label="Get notified for Google Play"
              >
                <Image
                  src="/images/GooglePlay.webp"
                  alt=""
                  width={200}
                  height={60}
                  className="h-[52px] w-auto object-contain sm:h-[58px]"
                  priority
                />
              </button>
            </div>

            <ul className="mt-10 space-y-3 border-t border-black/[0.06] pt-8">
              {FEATURES.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-[15px] leading-relaxed text-text-muted font-secondary"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 text-center text-sm text-text-muted font-secondary leading-relaxed">
            Already have access?{" "}
            <Link href="/login" className="font-medium text-clay hover:underline">
              Sign in
            </Link>{" "}
            with the account your school provided.
          </p>
          <p className="mt-3 text-center text-xs text-text-faint font-secondary">
            MudKitchen mobile is for schools already on the platform.{" "}
            <Link href="/get-started" className="text-clay hover:underline">
              Learn how schools get started
            </Link>
            .
          </p>
        </div>
      </section>

      <AndroidDownloadLeadSheet
        open={androidSheetOpen}
        onClose={() => setAndroidSheetOpen(false)}
      />
    </>
  );
}
