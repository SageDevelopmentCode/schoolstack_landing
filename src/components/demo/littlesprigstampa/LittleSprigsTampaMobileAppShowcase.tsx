"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { LITTLE_SPRIGS_TAMPA_ADMIN_COLORS } from "@/data/school-demos/little-sprigs-tampa-admin-demo";

export default function LittleSprigsTampaMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={LITTLE_SPRIGS_TAMPA_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: LITTLE_SPRIGS_TAMPA_ADMIN_COLORS.accent,
        teacherName: "Charlene Favorite",
        teacherTitle: "Founder & Lead Teacher",
        schoolName: "Little Sprigs of Tampa",
      })}
    />
  );
}
