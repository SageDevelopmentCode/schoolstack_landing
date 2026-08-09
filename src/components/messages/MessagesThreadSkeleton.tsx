"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";

const BUBBLES: Array<{ align: "left" | "right"; width: string; grouped?: boolean }> = [
  { align: "left", width: "w-[58%]" },
  { align: "left", width: "w-[42%]", grouped: true },
  { align: "right", width: "w-[48%]" },
  { align: "right", width: "w-[36%]", grouped: true },
  { align: "left", width: "w-[52%]" },
  { align: "right", width: "w-[44%]" },
];

export default function MessagesThreadSkeleton({
  C,
  embedded = false,
}: {
  C: AdminThemeTokens;
  embedded?: boolean;
}) {
  return (
    <div
      className="space-y-3 py-1"
      aria-busy="true"
      aria-label="Loading messages"
    >
      {BUBBLES.map((bubble, index) => (
        <div
          key={index}
          className={`flex ${bubble.align === "right" ? "justify-end" : "justify-start"} ${
            bubble.grouped ? "-mt-2" : ""
          }`}
        >
          <SkeletonBlock
            C={C}
            className={`h-12 ${bubble.width} ${
              embedded
                ? bubble.align === "right"
                  ? "rounded-2xl rounded-br-md"
                  : "rounded-2xl rounded-bl-md"
                : "rounded-xl"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
