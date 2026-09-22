"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { ROOTS_AND_WINGS_ADMIN_COLORS } from "@/data/school-demos/roots-and-wings-microschool-admin-demo";

export default function RootsAndWingsMicroschoolMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={ROOTS_AND_WINGS_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: ROOTS_AND_WINGS_ADMIN_COLORS.accent,
        teacherName: "Julie",
        teacherTitle: "Lead Teacher",
        schoolName: "Roots and Wings Microschool",
      })}
    />
  );
}
