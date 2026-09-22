"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { RIVER_OAK_ACADEMY_ADMIN_COLORS } from "@/data/school-demos/river-oak-academy-admin-demo";

export default function RiverOakAcademyMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={RIVER_OAK_ACADEMY_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: RIVER_OAK_ACADEMY_ADMIN_COLORS.accent,
        teacherName: "Kathy Aguilar",
        teacherTitle: "Guide",
        schoolName: "River Oak Academy",
      })}
    />
  );
}
