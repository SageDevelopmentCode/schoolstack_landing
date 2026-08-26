"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { KINDER_ACADEMY_PREP_SCHOOL_ADMIN_COLORS } from "@/data/school-demos/kinder-academy-prep-school-admin-demo";

export default function KinderAcademyPrepSchoolMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={KINDER_ACADEMY_PREP_SCHOOL_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: KINDER_ACADEMY_PREP_SCHOOL_ADMIN_COLORS.accent,
        teacherName: "Kimberly Lind",
        teacherTitle: "Founder & Principal",
        schoolName: "KAPS",
      })}
    />
  );
}
