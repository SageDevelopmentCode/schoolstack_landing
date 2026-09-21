"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { BVHA_ADMIN_COLORS } from "@/data/school-demos/brazos-valley-honor-academy-admin-demo";

export default function BrazosValleyHonorAcademyMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={BVHA_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: BVHA_ADMIN_COLORS.accent,
        teacherName: "Ms. Carter",
        teacherTitle: "Lead Teacher",
        schoolName: "Brazos Valley Honor Academy",
      })}
    />
  );
}
