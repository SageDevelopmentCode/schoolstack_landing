"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { KATS_COMMUNITY_MICROSCHOOL_ADMIN_COLORS } from "@/data/school-demos/kats-community-microschool-admin-demo";

export default function KatsCommunityMicroschoolMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={KATS_COMMUNITY_MICROSCHOOL_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: KATS_COMMUNITY_MICROSCHOOL_ADMIN_COLORS.accent,
        teacherName: "Kathleen Graves",
        teacherTitle: "Founder & Lead Guide",
        schoolName: "Kat's Community",
      })}
    />
  );
}
