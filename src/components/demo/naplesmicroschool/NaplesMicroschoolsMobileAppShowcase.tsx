"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { NAPLES_MICROSCHOOLS_ADMIN_COLORS } from "@/data/school-demos/naples-microschools-admin-demo";

export default function NaplesMicroschoolsMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={NAPLES_MICROSCHOOLS_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: NAPLES_MICROSCHOOLS_ADMIN_COLORS.accent,
        teacherName: "Dr. Dee",
        teacherTitle: "Head of Schools",
        schoolName: "Naples MicroSchools",
      })}
    />
  );
}
