"use client";

import { Toaster } from "sonner";
import { gardenFontVariables } from "@/components/garden/fonts";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/*
 * Parent portal toasts in the Garden look: Nunito body, ink-bordered paper
 * card with a soft hard shadow, pastel tints per type, and an accent action
 * pill. Scoped by `.sf-garden-toaster` so the admin/teacher StoryToaster and
 * any other sonner instance are untouched.
 */
function buildGardenToasterStyles(theme: ParentThemeTokens): string {
  return `
    .sf-garden-toaster [data-sonner-toaster] {
      --normal-bg: #fffaf4;
      --normal-border: rgba(43, 36, 29, 0.14);
      --normal-text: #2b241d;
      --success-bg: #ddebd5;
      --success-border: rgba(46, 74, 60, 0.28);
      --success-text: #1f3329;
      --info-bg: #e3edfb;
      --info-border: rgba(36, 80, 122, 0.24);
      --info-text: #1d3f61;
      --warning-bg: #fff3c4;
      --warning-border: rgba(107, 79, 0, 0.25);
      --warning-text: #4d3900;
      --error-bg: color-mix(in srgb, #c2410c 10%, #fffaf4);
      --error-border: rgba(154, 52, 18, 0.3);
      --error-text: #7c2d12;
      --width: 380px;
      font-family: var(--font-sf-body), ui-rounded, system-ui, sans-serif;
    }

    .sf-garden-toaster [data-sonner-toast][data-styled='true'] {
      padding: 14px 40px 14px 14px !important;
      border-width: 1.5px !important;
      border-radius: 18px !important;
      box-shadow: 0 3px 0 0 rgba(43, 36, 29, 0.12), 0 18px 32px -22px rgba(43, 36, 29, 0.45) !important;
      font-size: 14px !important;
      gap: 10px !important;
      align-items: flex-start !important;
    }

    .sf-garden-toaster [data-sonner-toast][data-styled='true'] [data-icon] {
      margin-top: 1px;
    }

    .sf-garden-toaster [data-sonner-toast][data-styled='true'] [data-title] {
      font-weight: 800 !important;
      line-height: 1.3 !important;
    }

    .sf-garden-toaster [data-sonner-toast][data-styled='true'] [data-description] {
      margin-top: 2px;
      font-weight: 600 !important;
      line-height: 1.4 !important;
      opacity: 0.82;
      color: inherit !important;
    }

    .sf-garden-toaster [data-sonner-toast][data-styled='true'] [data-button] {
      align-self: center;
      height: 30px !important;
      padding: 0 12px !important;
      border-radius: 999px !important;
      border: 1.5px solid #2b241d !important;
      background: ${theme.primary} !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      font-size: 12.5px !important;
      box-shadow: 0 2px 0 0 #2b241d !important;
    }

    .sf-garden-toaster [data-sonner-toast][data-styled='true'] [data-button]:focus-visible {
      outline: none;
      box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.primary} 35%, transparent) !important;
    }

    .sf-garden-toaster [data-sonner-toast][data-styled='true'] [data-close-button] {
      --toast-close-button-start: auto;
      --toast-close-button-end: 8px;
      --toast-close-button-transform: none !important;
      top: 12px !important;
      z-index: 10 !important;
      opacity: 1 !important;
      height: 24px !important;
      width: 24px !important;
      background: rgba(255, 255, 255, 0.85) !important;
      border: 1.5px solid rgba(43, 36, 29, 0.16) !important;
      border-radius: 999px !important;
      color: rgba(43, 36, 29, 0.7) !important;
    }

    .sf-garden-toaster [data-sonner-toast][data-styled='true'] [data-close-button]:hover {
      background: #ffffff !important;
      border-color: rgba(43, 36, 29, 0.4) !important;
      color: #2b241d !important;
    }
  `;
}

export default function GardenToaster({
  theme,
  bottomOffset = 16,
}: {
  theme: ParentThemeTokens;
  bottomOffset?: number;
}) {
  return (
    <div className={`sf-garden-toaster ${gardenFontVariables}`}>
      <style>{buildGardenToasterStyles(theme)}</style>
      <Toaster
        theme="light"
        richColors
        position="bottom-right"
        closeButton
        visibleToasts={4}
        offset={{ bottom: bottomOffset, right: 16 }}
        mobileOffset={{ bottom: bottomOffset, left: 12, right: 12 }}
      />
    </div>
  );
}
