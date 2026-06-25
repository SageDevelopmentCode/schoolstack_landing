export {
  NATURES_SCHOOLHOUSE_LOGO as NATURES_SCHOOLHOUSE_TEACHER_LOGO,
} from "./natures-schoolhouse-admin-demo";

export const NATURES_SCHOOLHOUSE_TEACHER_OFFICE = "Nature's Schoolhouse Microschool Office";
export const NATURES_SCHOOLHOUSE_TEACHER_ACCENT = "#3F7652";
export const NATURES_SCHOOLHOUSE_TEACHER_ACCENT_HOVER = "#2F5E40";

export const NATURES_SCHOOLHOUSE_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  full_time_explorers: "Full-Time Explorers (K–6)",
  discovery_days: "Discovery Days (Mon)",
  teen_lounge: "Teen Learning Lounge (7–12)",
};

export const NATURES_SCHOOLHOUSE_TEACHER_PROGRAM_ORDER = [
  "full_time_explorers",
  "discovery_days",
  "teen_lounge",
] as const;
