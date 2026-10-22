"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AndroidDownloadLeadSheet from "@/components/download/AndroidDownloadLeadSheet";
import {
  APPLE_APP_STORE_URL,
  MOBILE_APP_DOWNLOAD_DEFAULT_SOURCE_PAGE_PATH,
} from "@/lib/mobile-app-download/constants";

const badgeTriggerClassName =
  "group flex justify-center rounded-2xl outline-none ring-clay/40 transition hover:scale-[1.02] focus-visible:ring-2";

type MobileAppDownloadBadgesProps = {
  className?: string;
  badgeClassName?: string;
  priority?: boolean;
};

export default function MobileAppDownloadBadges({
  className = "flex flex-wrap items-center gap-3",
  badgeClassName = "h-[52px] w-auto object-contain sm:h-[58px]",
  priority = false,
}: MobileAppDownloadBadgesProps) {
  const [androidSheetOpen, setAndroidSheetOpen] = useState(false);
  const pathname = usePathname();
  const sourcePagePath =
    pathname && pathname.length > 0
      ? pathname
      : MOBILE_APP_DOWNLOAD_DEFAULT_SOURCE_PAGE_PATH;

  return (
    <>
      <div className={className}>
        <a
          href={APPLE_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={badgeTriggerClassName}
          aria-label="Download on the App Store"
        >
          <Image
            src="/images/AppleStore.webp"
            alt=""
            width={200}
            height={60}
            className={badgeClassName}
            priority={priority}
          />
        </a>

        <button
          type="button"
          onClick={() => setAndroidSheetOpen(true)}
          className={badgeTriggerClassName}
          aria-label="Get notified for Google Play"
        >
          <Image
            src="/images/GooglePlay.webp"
            alt=""
            width={200}
            height={60}
            className={badgeClassName}
            priority={priority}
          />
        </button>
      </div>

      <AndroidDownloadLeadSheet
        open={androidSheetOpen}
        onClose={() => setAndroidSheetOpen(false)}
        sourcePagePath={sourcePagePath}
      />
    </>
  );
}
