"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { WILDCAT_MICROSCHOOL_ADMIN_COLORS } from "@/data/school-demos/wildcat-microschool-admin-demo";

export default function WildcatMicroschoolMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={WILDCAT_MICROSCHOOL_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: WILDCAT_MICROSCHOOL_ADMIN_COLORS.accent,
        teacherName: "Heather Long",
        teacherTitle: "Guide",
        schoolName: "Wildcat Microschool",
      })}
    />
  );
}
