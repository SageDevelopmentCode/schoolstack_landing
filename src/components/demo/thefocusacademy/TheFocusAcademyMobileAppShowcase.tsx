"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { THE_FOCUS_ACADEMY_ADMIN_COLORS } from "@/data/school-demos/the-focus-academy-admin-demo";

export default function TheFocusAcademyMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={THE_FOCUS_ACADEMY_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: THE_FOCUS_ACADEMY_ADMIN_COLORS.accent,
        teacherName: "Karolyn Miller",
        teacherTitle: "Founder",
        schoolName: "The FOCUS Academy",
      })}
    />
  );
}
