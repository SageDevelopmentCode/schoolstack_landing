export const PLANNER_KICKER = "Tuition planning";

export const PLANNER_HEADING = "What would your annual tuition revenue be?";

export const PLANNER_SUPPORT =
  "Start with what you collect today. Change tuition or enrollment and see the difference in annual revenue before you tell families.";

export const STORAGE_NOTE = "Saved only in this browser";

export const ENROLLMENT_CROSS_LINK_QUESTION = "Need the student count that covers your costs?";

export const ENROLLMENT_CROSS_LINK_LABEL = "Students needed";

export const TUITION_HELP = "Before discounts or scholarships.";

export const ENROLLMENT_HELP =
  "Students included in this estimate. The slider goes to 60. Type any whole number up to 500.";

export const MONTHS_HELP =
  "Use the number of months families pay tuition—not the number of calendar months.";

export const SIBLING_HELP =
  "A lower monthly tuition for students who qualify, such as siblings.";

export const SCHOLARSHIP_HELP =
  "Tuition assistance that reduces what you collect. It applies to different students than the sibling discount.";

export const EFFECTIVE_HELP = "Average collected per student per billing month.";

export const PARTITION_NOTE =
  "Sibling discounts and scholarships apply to different students. Everyone else pays standard tuition.";

export const BREAKDOWN_ORDER =
  "Sibling discounts are applied to their recipients. Scholarships are applied to their own recipients.";

export const PART_TIME_NOTE =
  "This is a mixed estimate: full-time enrollment plus a separate part-time program. It is not a single averaged tuition rate.";

export const MULTIPLE_PROGRAMS_NOTE =
  "You entered more than one monthly tuition rate. Revenue adds each age group or program separately—it is not one averaged tuition.";

export const TUITION_GROUPS_HELP =
  "Optional: add another age group if you charge different monthly tuition. Everyone in a group pays the same rate before discounts.";

export function questionTuitionAll(): string {
  return "What do you charge per student each month?";
}

export function questionEnrollmentAll(): string {
  return "How many students are in each group?";
}

export const REVENUE_UNAVAILABLE = "Revenue unavailable";

export const QUESTION_DONE_TITLE = "You're set";

export const QUESTION_DONE_KICKER = "Estimate ready";

export const QUESTION_DONE_BODY =
  "Your annual tuition revenue estimate is ready. Take a look at the numbers and open the breakdown if you want to see how it adds up.";

export const VIEW_RESULTS_BUTTON = "View your results";

export const QUESTION_DONE_DESKTOP_HINT = "Your live estimate is beside this card.";

export function questionDoneRevenueTeaser(formattedAnnual: string): string {
  return `Estimated annual tuition revenue: ${formattedAnnual}`;
}

export function questionTuition(groupLabel?: string): string {
  if (groupLabel) return `What do you charge per month for ${groupLabel.toLowerCase()} students?`;
  return "What do you charge per student each month?";
}

export function questionEnrollment(groupLabel?: string): string {
  if (groupLabel) return `How many ${groupLabel.toLowerCase()} students are enrolled?`;
  return "How many students are enrolled?";
}

export function questionBillingMonths(groupLabel?: string): string {
  if (groupLabel) return `How many billing months per year for ${groupLabel.toLowerCase()}?`;
  return "How many months do families pay tuition each year?";
}

export function questionSiblingDiscount(groupLabel?: string): string {
  if (groupLabel) return `Do any ${groupLabel.toLowerCase()} students receive a sibling discount?`;
  return "Do any students receive a sibling discount?";
}

export function questionSiblingDetails(): string {
  return "How much is the sibling discount?";
}

export function questionScholarship(groupLabel?: string): string {
  if (groupLabel) return `Do any ${groupLabel.toLowerCase()} students receive a scholarship or tuition assistance?`;
  return "Do any students receive a scholarship or tuition assistance?";
}

export function questionScholarshipDetails(): string {
  return "How much tuition assistance applies?";
}

export const NEXT_KICKER = "From planning to school day";

export const NEXT_TITLE = "A tuition plan is just the beginning.";

export const NEXT_SUPPORT =
  "See how MudKitchen brings tuition collection and school operations together.";
