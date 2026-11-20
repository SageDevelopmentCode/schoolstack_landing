import DemosAdminTabs from "@/components/admin/demos/DemosAdminTabs";

export default function AdminDemosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <DemosAdminTabs />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
