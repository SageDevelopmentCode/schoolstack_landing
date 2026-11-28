import GardenToaster from "@/components/school-parent/garden/GardenToaster";
import { MUDKITCHEN_ADMIN_GARDEN_THEME } from "@/components/admin/garden/theme";

/**
 * Marketing tabs render their own Garden header (h1, status line, tab bar);
 * the layout only sizes the pane and mounts the Garden toaster once.
 */
export default function AdminMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100dvh-3rem)] min-h-0 flex-col bg-[#F7F1E7]">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <GardenToaster theme={MUDKITCHEN_ADMIN_GARDEN_THEME} />
    </div>
  );
}
