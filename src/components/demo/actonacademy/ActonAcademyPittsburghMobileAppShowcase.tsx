"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { ACTON_ACADEMY_PITTSBURGH_ADMIN_COLORS } from "@/data/school-demos/acton-academy-pittsburgh-admin-demo";

export default function ActonAcademyPittsburghMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={ACTON_ACADEMY_PITTSBURGH_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: ACTON_ACADEMY_PITTSBURGH_ADMIN_COLORS.accent,
        teacherName: "Meghan Esposito",
        teacherTitle: "Co-Founder & Guide",
        schoolName: "Acton Academy Pittsburgh",
      })}
    />
  );
}
