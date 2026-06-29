"use client";

import type { ReactNode } from "react";

type DemoPreviewVariant =
  | "website"
  | "application"
  | "observation"
  | "admin"
  | "parent"
  | "teacher"
  | "contact"
  | "mobile";

const VARIANT_CONFIG: Record<
  DemoPreviewVariant,
  {
    label: string;
    emoji: string;
    outerBg: string;
    cardBorder: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
  }
> = {
  website: {
    label: "Website",
    emoji: "🌐",
    outerBg: "#F9FAFB",
    cardBorder: "#E5E7EB",
    pillBg: "#FFFFFF",
    pillText: "#374151",
    pillBorder: "#E5E7EB",
  },
  application: {
    label: "Application",
    emoji: "📝",
    outerBg: "#F0EBF2",
    cardBorder: "#C9BBD4",
    pillBg: "#E8E0EC",
    pillText: "#5A4D68",
    pillBorder: "#C9BBD4",
  },
  observation: {
    label: "Observation booking",
    emoji: "📅",
    outerBg: "#F0EBF2",
    cardBorder: "#C9BBD4",
    pillBg: "#E8E0EC",
    pillText: "#5A4D68",
    pillBorder: "#C9BBD4",
  },
  admin: {
    label: "Admin view",
    emoji: "📊",
    outerBg: "#EEF4F8",
    cardBorder: "#C5D9E8",
    pillBg: "#E4EDF4",
    pillText: "#173B5C",
    pillBorder: "#C5D9E8",
  },
  parent: {
    label: "Parent portal",
    emoji: "👨‍👩‍👧",
    outerBg: "#FBFAF6",
    cardBorder: "#E8D9BC",
    pillBg: "#F2E7D1",
    pillText: "#173B5C",
    pillBorder: "#E8D9BC",
  },
  teacher: {
    label: "Teacher view",
    emoji: "📋",
    outerBg: "#EEF4F8",
    cardBorder: "#C5D9E8",
    pillBg: "#E4EDF4",
    pillText: "#173B5C",
    pillBorder: "#C5D9E8",
  },
  contact: {
    label: "Get in touch",
    emoji: "✉️",
    outerBg: "#F7F1E7",
    cardBorder: "#D9C9A3",
    pillBg: "#F2E7D1",
    pillText: "#2E4A3C",
    pillBorder: "#D9C9A3",
  },
  mobile: {
    label: "Mobile app",
    emoji: "📱",
    outerBg: "#F0EBF2",
    cardBorder: "#C9BBD4",
    pillBg: "#E8E0EC",
    pillText: "#5A4D68",
    pillBorder: "#C9BBD4",
  },
};

interface Props {
  variant: DemoPreviewVariant;
  children: ReactNode;
}

export default function DemoPreviewFrame({ variant, children }: Props) {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      className="flex flex-1 h-full flex-col overflow-hidden p-4 lg:p-8"
      style={{ backgroundColor: config.outerBg }}
    >
      <div className="mb-3 flex shrink-0 justify-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: config.pillBg,
            color: config.pillText,
            borderColor: config.pillBorder,
          }}
        >
          <span aria-hidden>{config.emoji}</span>
          {config.label}
        </span>
      </div>
      <div
        className="min-h-0 flex-1 overflow-hidden rounded-2xl border bg-white shadow-lg"
        style={{ borderColor: config.cardBorder }}
      >
        {children}
      </div>
    </div>
  );
}
