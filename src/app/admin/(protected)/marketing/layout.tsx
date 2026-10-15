import MarketingAdminTabs from "@/components/admin/marketing/MarketingAdminTabs";

export default function AdminMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col">
      <MarketingAdminTabs />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
