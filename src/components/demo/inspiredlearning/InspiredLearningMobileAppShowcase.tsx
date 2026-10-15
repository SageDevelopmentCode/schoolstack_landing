"use client";

import SchoolMobileAppShowcase from "@/components/demo/mobile/SchoolMobileAppShowcase";
import { createMicroschoolMobileSlides } from "@/components/demo/mobile/createMicroschoolMobileSlides";
import { INSPIRED_LEARNING_ADMIN_COLORS } from "@/data/school-demos/inspired-learning-academy-admin-demo";

export default function InspiredLearningMobileAppShowcase() {
  return (
    <SchoolMobileAppShowcase
      accentColor={INSPIRED_LEARNING_ADMIN_COLORS.accent}
      slides={createMicroschoolMobileSlides({
        accentColor: INSPIRED_LEARNING_ADMIN_COLORS.accent,
        teacherName: "Carol Franklin",
        teacherTitle: "Lead Facilitator",
        schoolName: "Inspired Learning Academy",
      })}
    />
  );
}
