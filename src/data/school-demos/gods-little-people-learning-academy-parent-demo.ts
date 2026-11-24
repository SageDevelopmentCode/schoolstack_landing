export {
  GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_LOGO as GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_LOGO,
  GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_COLORS,
} from "./gods-little-people-learning-academy-admin-demo";

export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_ACCENT = "#3A3A8C";
export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_ACCENT_HOVER = "#4B4BA6";
export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_SCHOOL_NAME = "God's Little People Learning Academy";
export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_SCHOOL_SHORT = "God's Little People";
export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_OFFICE = "God's Little People Office";

import { GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_LOGO } from "./gods-little-people-learning-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const godsLittlePeopleLearningAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "gods-little-people-learning-academy",
  logo: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_ACCENT,
    accentHover: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_PARENT_OFFICE,
  },
};
