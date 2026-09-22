"use client";

import { Toaster } from "sonner";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StoryToasterProps = {
  C: AdminThemeTokens;
  bottomOffset?: number;
};

function buildStoryToasterStyles(C: AdminThemeTokens): string {
  return `
    [data-sonner-toaster][data-sonner-theme='light'] {
      --normal-bg: ${C.surface};
      --normal-border: ${C.border};
      --normal-text: ${C.textPrimary};
      --success-bg: ${C.successBg};
      --success-border: ${C.successBorder};
      --success-text: ${C.success};
      --info-bg: ${C.infoBg};
      --info-border: ${C.infoBorder};
      --info-text: ${C.info};
      --warning-bg: ${C.warningBg};
      --warning-border: ${C.warningBorder};
      --warning-text: ${C.warning};
      --error-bg: ${C.errorBg};
      --error-border: ${C.errorBorder};
      --error-text: ${C.error};
      font-family: var(--font-dm-sans), system-ui, sans-serif;
    }

    [data-sonner-toast][data-styled='true'] {
      padding: 12px 36px 12px 14px !important;
      border-radius: ${C.r.md} !important;
      box-shadow: ${C.shadowCard} !important;
      font-size: 13px !important;
    }

    [data-sonner-toast][data-styled='true'] [data-title] {
      font-weight: 600 !important;
    }

    [data-sonner-toast][data-styled='true'] [data-close-button] {
      --toast-close-button-start: auto;
      --toast-close-button-end: 8px;
      --toast-close-button-transform: translateY(-50%) !important;
      top: 50% !important;
      z-index: 10 !important;
      opacity: 1 !important;
      height: 22px !important;
      width: 22px !important;
      background: rgba(255, 255, 255, 0.72) !important;
      border: 1px solid ${C.border} !important;
      border-radius: ${C.r.sm} !important;
      color: ${C.textSecondary} !important;
    }

    [data-sonner-toast][data-styled='true'] [data-close-button]:hover {
      background: rgba(255, 255, 255, 0.92) !important;
      border-color: ${C.borderStrong} !important;
    }

    [data-rich-colors='true'][data-sonner-toast][data-type='success'] [data-close-button] {
      background: rgba(255, 255, 255, 0.78) !important;
      border-color: ${C.successBorder} !important;
      color: ${C.success} !important;
    }

    [data-rich-colors='true'][data-sonner-toast][data-type='error'] [data-close-button] {
      background: rgba(255, 255, 255, 0.78) !important;
      border-color: ${C.errorBorder} !important;
      color: ${C.error} !important;
    }

    [data-rich-colors='true'][data-sonner-toast][data-type='info'] [data-close-button] {
      background: rgba(255, 255, 255, 0.78) !important;
      border-color: ${C.infoBorder} !important;
      color: ${C.info} !important;
    }

    [data-rich-colors='true'][data-sonner-toast][data-type='warning'] [data-close-button] {
      background: rgba(255, 255, 255, 0.78) !important;
      border-color: ${C.warningBorder} !important;
      color: ${C.warning} !important;
    }
  `;
}

export default function StoryToaster({
  C,
  bottomOffset = 16,
}: StoryToasterProps) {
  return (
    <>
      <style>{buildStoryToasterStyles(C)}</style>
      <Toaster
        theme="light"
        richColors
        position="bottom-right"
        closeButton
        offset={{ bottom: bottomOffset, right: 16 }}
      />
    </>
  );
}
