export type AdminFeatureIconStyle = {
  iconColor: string;
};

const ADMIN_FEATURE_ICON_COLORS: Record<string, string> = {
  dashboard: "#4F46E5",
  admissions: "#D97706",
  my_school: "#059669",
  committees: "#E11D48",
  schedule: "#7C3AED",
  messages: "#2563EB",
  notifications: "#64748B",
  finances: "#059669",
  marketing: "#0284C7",
  programs: "#D97706",
  flows: "#7C3AED",
  payments: "#059669",
  submissions: "#CA8A04",
  overview: "#4F46E5",
  expenses: "#059669",
  revenue: "#16A34A",
  insights: "#EAB308",
  transactions: "#6366F1",
  payroll: "#0D9488",
};

const DEFAULT_ICON_COLOR = "#64748B";

export function getAdminNavIconColor(featureKey: string): string {
  return ADMIN_FEATURE_ICON_COLORS[featureKey] ?? DEFAULT_ICON_COLOR;
}
