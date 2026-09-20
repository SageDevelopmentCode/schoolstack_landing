"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { FREEDOM_PREP_ACADEMY_ADMIN_COLORS } from "@/data/school-demos/freedom-prep-academy-admin-demo";

export default function FreedomPrepAcademyMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={FREEDOM_PREP_ACADEMY_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: FREEDOM_PREP_ACADEMY_ADMIN_COLORS.accent,
        teacherName: "Jordan",
        teacherTitle: "Student Support Guide",
        schoolName: "Freedom Prep Academy",
      })}
    />
  );
}
