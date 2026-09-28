export type DemoRequestRoleId = "starting" | "running" | "program" | "other";

/** Public get-started options (stored as `demo_requests.role`). */
export const DEMO_REQUEST_ROLE_OPTIONS: {
  id: DemoRequestRoleId;
  label: string;
}[] = [
  {
    id: "starting",
    label: "Exploring or starting a microschool",
  },
  {
    id: "running",
    label: "Running a microschool or small private school",
  },
  {
    id: "program",
    label: "Running an enrichment, homeschool, or hybrid program",
  },
  { id: "other", label: "Something else" },
];

export const DEMO_REQUEST_ROLE_LABELS: Record<string, string> = {
  starting: DEMO_REQUEST_ROLE_OPTIONS[0].label,
  running: DEMO_REQUEST_ROLE_OPTIONS[1].label,
  program: DEMO_REQUEST_ROLE_OPTIONS[2].label,
  other: DEMO_REQUEST_ROLE_OPTIONS[3].label,
  /** Legacy submissions before form simplification */
  private: "Private school operator",
};

export function demoRequestRoleLabel(role: string): string {
  return DEMO_REQUEST_ROLE_LABELS[role] ?? role;
}
