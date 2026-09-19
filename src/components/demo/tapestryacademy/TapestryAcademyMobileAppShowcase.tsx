"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { TAPESTRY_ACADEMY_ADMIN_COLORS } from "@/data/school-demos/tapestry-academy-admin-demo";

export default function TapestryAcademyMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={TAPESTRY_ACADEMY_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: TAPESTRY_ACADEMY_ADMIN_COLORS.accent,
        teacherName: "Tapestry Educator",
        teacherTitle: "Microschool Mentor",
        schoolName: "Tapestry Academy",
      })}
    />
  );
}
