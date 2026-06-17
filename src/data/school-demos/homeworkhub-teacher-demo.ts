export {
  HOMEWORK_HUB_ADMIN_LOGO as HOMEWORK_HUB_TEACHER_LOGO,
} from "./homeworkhub-admin-demo";

export const HOMEWORK_HUB_TEACHER_OFFICE = "Homework Hub Office";
export const HOMEWORK_HUB_TEACHER_ACCENT = "#05BFFB";
export const HOMEWORK_HUB_TEACHER_ACCENT_HOVER = "#04A8E0";

export const HOMEWORK_HUB_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  summer_26: "Summer Hub Programs",
  school_year_26_27: "HwH Academic Year",
  homeschool_drop_in: "HwH Hotline (20-min)",
  hwh_plus: "HwH+ Programs",
  test_prep: "Test Prep Hub",
  hwh_academy: "HwH Academy Microschool",
};

export const HOMEWORK_HUB_TEACHER_PROGRAM_ORDER = [
  "school_year_26_27",
  "hwh_plus",
  "test_prep",
  "hwh_academy",
  "summer_26",
  "homework_hotline",
] as const;
