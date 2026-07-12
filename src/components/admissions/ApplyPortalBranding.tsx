import Image from "next/image";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyPortalBrandingProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolLogoClassName?: string;
  className?: string;
};

const DEFAULT_SCHOOL_LOGO_CLASS =
  "h-7 w-auto max-w-[min(200px,50vw)] object-contain sm:h-8";

export default function ApplyPortalBranding({
  branding,
  schoolName,
  schoolLogoClassName = DEFAULT_SCHOOL_LOGO_CLASS,
  className = "",
}: ApplyPortalBrandingProps) {
  const C = buildAdminThemeTokens(branding);

  return (
    <div className={`flex min-w-0 items-center gap-4 ${className}`.trim()}>
      <div className="flex shrink-0 items-center gap-0.5">
        <Image
          src="/images/Logo.png"
          alt="MudKitchen"
          width={40}
          height={40}
          className="h-10 w-auto shrink-0 object-contain"
        />
        <span className="font-display text-xs font-semibold leading-tight text-clay">
          MudKitchen
        </span>
      </div>
      <div
        className="h-8 w-px shrink-0"
        style={{ backgroundColor: C.border }}
        aria-hidden
      />
      <SchoolDemoWordmark
        logo={{
          src: branding.logo.src,
          alt: branding.logo.alt || schoolName,
          width: branding.logo.width,
          height: branding.logo.height,
          text: branding.logo.src ? undefined : schoolName,
        }}
        className={schoolLogoClassName}
      />
    </div>
  );
}
