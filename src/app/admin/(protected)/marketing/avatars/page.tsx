import { Suspense } from "react";
import BrandMarkStudio from "@/components/admin/marketing/brand-marks/BrandMarkStudio";

export default function AdminMarketingAvatarsPage() {
  return (
    <Suspense fallback={null}>
      <BrandMarkStudio />
    </Suspense>
  );
}
