"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { ASHEBORO_HYBRID_ACADEMY_ADMIN_COLORS } from "@/data/school-demos/asheboro-hybrid-academy-admin-demo";

export default function AsheboroHybridAcademyMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={ASHEBORO_HYBRID_ACADEMY_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: ASHEBORO_HYBRID_ACADEMY_ADMIN_COLORS.accent,
        teacherName: "AHA Teacher",
        teacherTitle: "Hybrid Classroom Educator",
        schoolName: "Asheboro Hybrid Academy",
      })}
    />
  );
}
