import { Suspense } from "react";
import MarketingStudio from "@/components/admin/marketing/MarketingStudio";

export default function AdminMarketingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3rem)] items-center justify-center text-sm text-admin-muted">
          Loading marketing studio…
        </div>
      }
    >
      <MarketingStudio />
    </Suspense>
  );
}
