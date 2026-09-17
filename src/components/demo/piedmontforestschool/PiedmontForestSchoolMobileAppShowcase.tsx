"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { PIEDMONT_FOREST_SCHOOL_ADMIN_COLORS } from "@/data/school-demos/piedmont-forest-school-admin-demo";

export default function PiedmontForestSchoolMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={PIEDMONT_FOREST_SCHOOL_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: PIEDMONT_FOREST_SCHOOL_ADMIN_COLORS.accent,
        teacherName: "Sheri Grace",
        teacherTitle: "Founder & Director",
        schoolName: "Piedmont Forest School",
      })}
    />
  );
}
