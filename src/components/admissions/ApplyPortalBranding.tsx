import Image from "next/image";
import Link from "next/link";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyPortalBrandingProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolLogoClassName?: string;
  className?: string;
  platformHomeHref?: string;
  schoolHomeHref?: string;
};

const DEFAULT_SCHOOL_LOGO_CLASS =
  "h-7 w-auto max-w-[min(200px,50vw)] object-contain sm:h-8";

export default function ApplyPortalBranding({
  branding,
  schoolName,
  schoolLogoClassName = DEFAULT_SCHOOL_LOGO_CLASS,
  className = "",
  platformHomeHref = "/",
  schoolHomeHref,
}: ApplyPortalBrandingProps) {
  const C = buildAdminThemeTokens(branding);

  const platformBranding = (
    <div className="flex shrink-0 items-center gap-0.5">
      <Image
        src="/images/Logo.webp"
        alt="MudKitchen"
        width={40}
        height={40}
        priority
        sizes="40px"
        className="h-10 w-auto shrink-0 object-contain"
      />
      <span className="font-display text-xs font-semibold leading-tight text-clay">
        MudKitchen
      </span>
    </div>
  );

  const schoolBranding = (
    <SchoolDemoWordmark
      logo={{
        src: branding.logo.src,
        alt: branding.logo.alt || schoolName,
        width: branding.logo.width,
        height: branding.logo.height,
        text: branding.logo.src ? undefined : schoolName,
      }}
      className={schoolLogoClassName}
      sizes="(max-width: 640px) 160px, 200px"
    />
  );

  return (
    <div className={`flex min-w-0 items-center gap-4 ${className}`.trim()}>
      {platformHomeHref ? (
        <Link
          href={platformHomeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-sm transition-opacity hover:opacity-80"
        >
          {platformBranding}
        </Link>
      ) : (
        platformBranding
      )}
      <div
        className="h-8 w-px shrink-0"
        style={{ backgroundColor: C.border }}
        aria-hidden
      />
      {schoolHomeHref ? (
        <Link
          href={schoolHomeHref}
          className="min-w-0 shrink-0 rounded-sm transition-opacity hover:opacity-80"
        >
          {schoolBranding}
        </Link>
      ) : (
        schoolBranding
      )}
    </div>
  );
}
