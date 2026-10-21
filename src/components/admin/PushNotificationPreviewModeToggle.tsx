"use client";

import type { PushNotificationPreviewMode } from "@/components/admin/MobilePushNotificationPreview";

const OPTIONS: { id: PushNotificationPreviewMode; label: string }[] = [
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
  { id: "both", label: "Both" },
];

type PushNotificationPreviewModeToggleProps = {
  value: PushNotificationPreviewMode;
  onChange: (mode: PushNotificationPreviewMode) => void;
};

export default function PushNotificationPreviewModeToggle({
  value,
  onChange,
}: PushNotificationPreviewModeToggleProps) {
  return (
    <div
      className="flex flex-wrap gap-1"
      role="tablist"
      aria-label="Notification preview platform"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-admin-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              selected
                ? "bg-admin-accent-soft text-admin-accent"
                : "text-admin-muted hover:bg-admin-bg hover:text-admin-text"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
