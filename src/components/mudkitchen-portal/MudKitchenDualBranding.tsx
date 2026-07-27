import Image from "next/image";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { MUDKITCHEN_PORTAL_THEME } from "@/lib/mudkitchen-portal/theme";

type MudKitchenDualBrandingProps = {
  schoolName: string;
  branding: OrganizationBranding;
  progressPercent?: number | null;
};

export default function MudKitchenDualBranding({
  schoolName,
  branding,
  progressPercent = null,
}: MudKitchenDualBrandingProps) {
  const { logo } = branding;
  const showProgress =
    progressPercent !== null &&
    progressPercent !== undefined &&
    Number.isFinite(progressPercent);

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: "rgba(247, 241, 231, 0.92)",
        borderColor: MUDKITCHEN_PORTAL_THEME.border,
      }}
    >
      <div className="mx-auto flex max-w-[1100px] justify-center px-6 py-4 lg:px-16">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <Image
              src="/images/Logo.webp"
              alt="MudKitchen"
              width={28}
              height={28}
              priority
              className="h-7 w-auto shrink-0 object-contain"
            />
            <span
              className="font-secondary text-center text-[10px] font-semibold leading-tight sm:text-xs"
              style={{ color: MUDKITCHEN_PORTAL_THEME.accent }}
            >
              MudKitchen
            </span>
          </div>
          <div
            className="h-10 w-px shrink-0 self-stretch"
            style={{ backgroundColor: MUDKITCHEN_PORTAL_THEME.border }}
            aria-hidden
          />
          <div className="flex shrink-0 items-center justify-center">
            {logo.src.trim() ? (
              <Image
                src={logo.src.trim()}
                alt={logo.alt || schoolName}
                width={logo.width ?? 200}
                height={logo.height ?? 40}
                className="h-9 w-auto max-w-[160px] object-contain sm:h-10 sm:max-w-[200px]"
              />
            ) : (
              <span
                className="font-heading text-center text-lg font-medium sm:text-xl"
                style={{ color: MUDKITCHEN_PORTAL_THEME.textPrimary }}
              >
                {logo.alt.trim() || schoolName}
              </span>
            )}
          </div>
        </div>
      </div>
      {showProgress ? (
        <div
          className="h-1 w-full"
          style={{ backgroundColor: MUDKITCHEN_PORTAL_THEME.border }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Rollout progress toward v1"
        >
          <div
            className="h-full transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: MUDKITCHEN_PORTAL_THEME.accent,
            }}
          />
        </div>
      ) : null}
    </header>
  );
}
