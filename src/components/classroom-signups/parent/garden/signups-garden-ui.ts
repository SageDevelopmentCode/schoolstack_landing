import type { GChipTone } from "@/components/school-parent/garden/ui";
import type {
  ClassroomSignup,
  ClassroomSignupTimeSlot,
  ParentClassroomSignupListItem,
  ParentClassroomSignupListStatus,
} from "@/lib/classroom-signups/types";
import { formatSignupDeadline } from "@/lib/classroom-signups/utils";

/*
 * Small helpers shared by the parent Classroom signups Garden views.
 */

export type SignupFilter = ParentClassroomSignupListStatus | "all";

export const SIGNUP_FILTERS: { key: SignupFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_response", label: "Needs response" },
  { key: "signed_up", label: "Signed up" },
  { key: "closed", label: "Past" },
];

export const SIGNUP_GROUP_LABELS: Record<ParentClassroomSignupListStatus, string> = {
  needs_response: "Needs your response",
  signed_up: "You're signed up",
  closed: "Past signups",
};

/** "9:00 AM – 10:00 AM" from "09:00" / "10:00". */
export function formatTimeRange(start: string, end: string): string {
  const format = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };
  return `${format(start)} – ${format(end)}`;
}

/** "Tue, Nov 18" for a slot's YYYY-MM-DD date (null when the slot has no date). */
export function slotDateLabel(slot: Pick<ClassroomSignupTimeSlot, "date">): string | null {
  if (!slot.date) return null;
  const date = new Date(`${slot.date}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** "Tue, Nov 18 · 9:00 AM – 10:00 AM" (or just the time range). */
export function slotWhen(slot: ClassroomSignupTimeSlot): string {
  const date = slotDateLabel(slot);
  const time = formatTimeRange(slot.startTime, slot.endTime);
  return date ? `${date} · ${time}` : time;
}

/** "From Ms. Rivera · Willow Room". */
export function signupFromLine(signup: ClassroomSignup): string {
  return `From ${signup.teacherName}${signup.classroomName ? ` · ${signup.classroomName}` : ""}`;
}

export function signupDeadlineLabel(signup: ClassroomSignup): string | null {
  const deadline = formatSignupDeadline(signup.responseDeadline);
  return deadline ? `Sign up by ${deadline}` : null;
}

/** The chosen slots / roles / note as one human line ("" when nothing is chosen). */
export function selectionSummary(
  signup: ClassroomSignup,
  slotIds: string[],
  roleIds: string[],
  note: string,
): string {
  if (signup.signupType === "time_slots") {
    return (signup.config.slots ?? [])
      .filter((slot) => slotIds.includes(slot.id))
      .map((slot) => `${slot.label} (${slotWhen(slot)})`)
      .join("; ");
  }
  if (signup.signupType === "roles") {
    return (signup.config.roles ?? [])
      .filter((role) => roleIds.includes(role.id))
      .map((role) => role.name)
      .join(", ");
  }
  const trimmed = note.trim();
  if (!trimmed) return "";
  return trimmed.length > 90 ? `“${trimmed.slice(0, 87)}…”` : `“${trimmed}”`;
}

/** What the "choose" step is called for this signup type. */
export function chooseStepLabel(signup: ClassroomSignup): string {
  if (signup.signupType === "time_slots") {
    return signup.config.allowMultipleSelections ? "Pick your times" : "Pick a time";
  }
  if (signup.signupType === "roles") return "Choose roles";
  return "Tell the teacher how you'll help";
}

/** Why the confirm button is disabled (matches canSubmit). */
export function missingChoiceHint(signup: ClassroomSignup): string {
  if (signup.signupType === "time_slots") return "Pick a time to continue";
  if (signup.signupType === "roles") return "Choose at least one role to continue";
  return "Add a note to continue";
}

export function listStatusChip(status: ParentClassroomSignupListStatus): { tone: GChipTone; label: string } {
  if (status === "needs_response") return { tone: "warning", label: "Needs your response" };
  if (status === "signed_up") return { tone: "success", label: "You're signed up" };
  return { tone: "neutral", label: "Closed" };
}

/** Row action text (the existing labels). */
export function signupActionLabel(status: ParentClassroomSignupListStatus, readOnly: boolean): string {
  if (status === "needs_response") return readOnly ? "Preview signup" : "Sign up";
  if (status === "signed_up") return "View signup";
  return "View details";
}

export function pluralSignups(count: number): string {
  return `${count} signup${count === 1 ? "" : "s"}`;
}

/** The family's booked help for an open signup they joined, for the rail tickets. */
export type UpcomingHelp = {
  key: string;
  signupId: string;
  title: string;
  date: string | null;
  detail: string;
};

export function buildUpcomingHelp(items: ParentClassroomSignupListItem[]): UpcomingHelp[] {
  const out: UpcomingHelp[] = [];
  for (const item of items) {
    if (item.listStatus !== "signed_up" || !item.familyResponse) continue;
    const { signup, familyResponse } = item;
    if (signup.signupType === "time_slots") {
      const slots = (signup.config.slots ?? []).filter((slot) =>
        familyResponse.selectedSlotIds.includes(slot.id),
      );
      if (slots.length === 0) {
        out.push({ key: signup.id, signupId: signup.id, title: signup.title, date: null, detail: "You're signed up" });
      }
      for (const slot of slots) {
        out.push({
          key: `${signup.id}:${slot.id}`,
          signupId: signup.id,
          title: signup.title,
          date: slot.date || null,
          detail: `${slot.label} · ${formatTimeRange(slot.startTime, slot.endTime)}`,
        });
      }
    } else if (signup.signupType === "roles") {
      const roles = (signup.config.roles ?? [])
        .filter((role) => familyResponse.selectedRoleIds.includes(role.id))
        .map((role) => role.name);
      out.push({
        key: signup.id,
        signupId: signup.id,
        title: signup.title,
        date: null,
        detail: roles.length > 0 ? roles.join(", ") : "You're signed up",
      });
    } else {
      out.push({ key: signup.id, signupId: signup.id, title: signup.title, date: null, detail: "You offered to help" });
    }
  }
  // Dated help first (soonest first), then the rest in list order.
  return out.sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}
