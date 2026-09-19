import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type FridayBranchPageSkeletonProps = {
  C: AdminThemeTokens;
  label?: string;
};

export default function FridayBranchPageSkeleton({
  C,
  label = "Loading Friday Branch schedule",
}: FridayBranchPageSkeletonProps) {
  return (
    <div aria-busy="true" aria-label={label}>
      <div className="flex gap-[9px] overflow-x-auto pb-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="min-w-[120px] shrink-0 rounded-[13px] border p-[13px]"
            style={{ borderColor: "#DDE6DE", backgroundColor: "#fff" }}
          >
            <SkeletonBlock C={C} className="h-4 w-20" />
            <SkeletonBlock C={C} className="mt-2 h-5 w-16 rounded-full" />
          </div>
        ))}
        <div
          className="min-w-[140px] shrink-0 rounded-[13px] border border-dashed p-[13px]"
          style={{ borderColor: "#A9C4AF" }}
        >
          <SkeletonBlock C={C} className="h-4 w-24" />
        </div>
      </div>

      <div
        className="mt-4 overflow-hidden rounded-xl border"
        style={{ borderColor: "#E0E7E0", backgroundColor: "#fff" }}
      >
        <div
          className="flex flex-col gap-3 border-b px-[18px] py-[17px] sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "#EDF1ED" }}
        >
          <div>
            <SkeletonBlock C={C} className="h-6 w-24" />
            <SkeletonBlock C={C} className="mt-1.5 h-3 w-48" />
          </div>
          <SkeletonBlock C={C} className="h-8 w-28 rounded-sm" />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div
              className="flex gap-3 px-[17px] py-2.5"
              style={{ backgroundColor: "#FBFCFB" }}
            >
              <SkeletonBlock C={C} className="h-3 w-10" />
              <SkeletonBlock C={C} className="h-3 w-12" />
              <SkeletonBlock C={C} className="h-3 w-16" />
              <SkeletonBlock C={C} className="h-3 w-16" />
              <SkeletonBlock C={C} className="ml-auto h-3 w-8" />
            </div>

            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-start gap-3 border-t px-[17px] py-[13px]"
                style={{ borderColor: "#EDF1ED" }}
              >
                <SkeletonBlock C={C} className="h-7 w-14 rounded-[9px]" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <SkeletonBlock C={C} className="h-3.5 w-32" />
                  <SkeletonBlock C={C} className="h-2.5 w-24" />
                </div>
                <SkeletonBlock C={C} className="h-5 w-20 rounded-full" />
                <SkeletonBlock C={C} className="h-5 w-16 rounded-full" />
                <SkeletonBlock C={C} className="h-6 w-12 rounded-[7px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
