"use client";

import Image from "next/image";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { PortalTheme } from "@/lib/mudkitchen-portal/theme";

type PortalBrandingLogosProps = {
  schoolName: string;
  branding: OrganizationBranding;
  theme: PortalTheme;
  align?: "start" | "center";
  compact?: boolean;
};

export default function PortalBrandingLogos({
  schoolName,
  branding,
  theme: T,
  align = "start",
  compact = false,
}: PortalBrandingLogosProps) {
  const { logo } = branding;

  return (
    <div
      className={`flex min-w-0 items-center gap-2 sm:gap-3 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <div className="flex shrink-0 items-center">
        <Image
          src="/images/Logo.webp"
          alt="MudKitchen"
          width={40}
          height={40}
          priority
          className={`${compact ? "h-8" : "h-9 sm:h-10"} w-auto shrink-0 object-contain`}
        />
      </div>
      <div
        className={`w-px shrink-0 ${compact ? "h-8" : "h-9 sm:h-10"}`}
        style={{ backgroundColor: T.border }}
        aria-hidden
      />
      <div className="flex min-w-0 shrink items-center">
        {logo.src.trim() ? (
          <Image
            src={logo.src.trim()}
            alt={logo.alt || schoolName}
            width={logo.width ?? 200}
            height={logo.height ?? 40}
            className={`w-auto object-contain ${
              compact
                ? "h-8 max-w-[100px] sm:max-w-[140px]"
                : "h-9 max-w-[160px] sm:h-10 sm:max-w-[200px]"
            }`}
          />
        ) : (
          <span
            className={`font-heading truncate font-medium ${
              compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
            }`}
            style={{ color: T.textPrimary }}
          >
            {logo.alt.trim() || schoolName}
          </span>
        )}
      </div>
    </div>
  );
}
