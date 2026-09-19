"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { GATHERED_OAK_FARM_ADMIN_COLORS } from "@/data/school-demos/gathered-oak-farm-admin-demo";

export default function GatheredOakFarmMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={GATHERED_OAK_FARM_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: GATHERED_OAK_FARM_ADMIN_COLORS.accent,
        teacherName: "Mindy Kinnier",
        teacherTitle: "Co-owner & Educator",
        schoolName: "Gathered Oak Farm",
      })}
    />
  );
}
