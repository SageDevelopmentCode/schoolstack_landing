"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { FAMILY_LYCEUM_ADMIN_COLORS } from "@/data/school-demos/family-lyceum-admin-demo";

export default function FamilyLyceumMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={FAMILY_LYCEUM_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: FAMILY_LYCEUM_ADMIN_COLORS.accent,
        teacherName: "Renae Zentz",
        teacherTitle: "Founder & Director",
        schoolName: "Family Lyceum",
      })}
    />
  );
}
