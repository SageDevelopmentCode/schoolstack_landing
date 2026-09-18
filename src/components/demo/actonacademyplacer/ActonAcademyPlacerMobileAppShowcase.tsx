"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { ACTON_ACADEMY_PLACER_ADMIN_COLORS } from "@/data/school-demos/acton-academy-placer-admin-demo";

export default function ActonAcademyPlacerMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={ACTON_ACADEMY_PLACER_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: ACTON_ACADEMY_PLACER_ADMIN_COLORS.accent,
        teacherName: "Studio Guide",
        teacherTitle: "Acton Academy Placer",
        schoolName: "Acton Academy Placer",
      })}
    />
  );
}
