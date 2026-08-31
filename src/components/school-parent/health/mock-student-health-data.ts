import type { StudentHealthProfile } from "@/components/school-parent/health/parent-health-types";

const MOCK_PROFILE: StudentHealthProfile = {
  allergies: [
    {
      id: "allergy_peanuts",
      type: "allergy",
      allergen: "Peanuts",
      severity: "high",
      treatmentNotes: "EpiPen in nurse office. Avoid all peanut products in classroom snacks.",
      updatedAt: "2026-03-02",
      addedBy: "parent",
    },
    {
      id: "allergy_dairy",
      type: "allergy",
      allergen: "Dairy",
      severity: "medium",
      treatmentNotes: "Lactose intolerance — offer dairy-free alternatives at lunch.",
      updatedAt: "2026-01-15",
      addedBy: "parent",
    },
  ],
  medications: [
    {
      id: "med_amoxicillin",
      type: "medication",
      name: "Amoxicillin",
      dose: "With lunch",
      timeOfDay: "12:30 PM",
      daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      instructions: "Take with food. Refrigerated bottle in nurse office.",
      startDate: "2026-03-24",
      endDate: "2026-04-04",
      ongoing: false,
      updatedAt: "2026-03-24",
      addedBy: "school",
    },
    {
      id: "med_inhaler",
      type: "medication",
      name: "Daily inhaler",
      dose: "2 puffs",
      timeOfDay: "8:45 AM",
      daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      instructions: "Before morning recess if weather is cold.",
      startDate: "2025-09-01",
      endDate: null,
      ongoing: true,
      updatedAt: "2025-09-01",
      addedBy: "parent",
    },
  ],
  updates: [
    {
      id: "update_stomach_bug",
      type: "update",
      title: "Stomach bug — staying home today",
      details: "Emma had nausea overnight. Keeping her home today and will update if she returns tomorrow.",
      startDate: "2026-03-28",
      endDate: "2026-03-28",
      createdAt: "2026-03-28",
      addedBy: "parent",
    },
    {
      id: "update_pe_cleared",
      type: "update",
      title: "Cleared for PE after ankle sprain",
      details: "Doctor cleared light activity. No running for two more weeks.",
      startDate: "2026-03-15",
      endDate: "2026-03-29",
      createdAt: "2026-03-15",
      addedBy: "school",
    },
  ],
};

export function getMockStudentHealthProfile(_studentId: string): StudentHealthProfile {
  return {
    allergies: MOCK_PROFILE.allergies.map((item) => ({ ...item })),
    medications: MOCK_PROFILE.medications.map((item) => ({
      ...item,
      daysOfWeek: [...item.daysOfWeek],
    })),
    updates: MOCK_PROFILE.updates.map((item) => ({ ...item })),
  };
}
