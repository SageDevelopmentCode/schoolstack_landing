import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import type {
  FridayBranchBlock,
  FridayBranchBlockAccent,
  FridayBranchBlockStatus,
  FridayBranchClass,
  FridayBranchScheduleGap,
  FridayBranchStatusTagVariant,
  FridayBranchTimeSlot,
} from "./friday-branch-types";

const BLOCK_ACCENTS: FridayBranchBlockAccent[] = ["sky", "berry", "sage", "sun"];

export const MOCK_FRIDAY_BRANCH_LEARNERS = 37;

export function createEmptyClass(): FridayBranchClass {
  return {
    id: newAdmissionsId(),
    name: "",
    location: "",
    ageGroup: "",
    teacher: "",
    familyVisible: true,
  };
}

export function createEmptySlot(time = "9:00"): FridayBranchTimeSlot {
  return {
    id: newAdmissionsId(),
    time,
    classes: [createEmptyClass()],
  };
}

export function createEmptyBlock(blockNumber: number): FridayBranchBlock {
  const accent = BLOCK_ACCENTS[(blockNumber - 1) % BLOCK_ACCENTS.length] ?? "sky";

  return {
    id: newAdmissionsId(),
    label: `Block ${blockNumber}`,
    startDate: "",
    endDate: "",
    accent,
    status: "draft",
    description: "",
    slots: [createEmptySlot()],
  };
}

export function cloneDemoBlocks(): FridayBranchBlock[] {
  return DEMO_FRIDAY_BRANCH_BLOCKS.map((block) => ({
    ...block,
    slots: block.slots.map((slot) => ({
      ...slot,
      classes: slot.classes.map((classEntry) => ({ ...classEntry })),
    })),
  }));
}

export function duplicateBlock(block: FridayBranchBlock): FridayBranchBlock {
  const copyNumber = block.label.match(/\d+/)?.[0] ?? "";
  return {
    ...block,
    id: newAdmissionsId(),
    label: copyNumber ? `Block ${copyNumber} (copy)` : `${block.label} (copy)`,
    status: "draft",
    slots: block.slots.map((slot) => ({
      ...slot,
      id: newAdmissionsId(),
      classes: slot.classes.map((classEntry) => ({
        ...classEntry,
        id: newAdmissionsId(),
      })),
    })),
  };
}

export function formatBlockDateRange(startDate: string, endDate: string): string {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return "Date range not set";

  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = formatShortDate(start, !sameYear);
  const endLabel = formatShortDate(end, true);
  return `${startLabel} – ${endLabel}`;
}

export function formatBlockTabDateRange(startDate: string, endDate: string): string {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return "Dates TBD";

  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = formatShortDate(start, false);
  const endLabel = formatShortDate(end, !sameYear);
  return `${startLabel} – ${endLabel}`;
}

export function formatBlockStripLabel(block: FridayBranchBlock): string {
  return `${block.label} · ${formatBlockTabDateRange(block.startDate, block.endDate)}`;
}

export function formatFridayDateLong(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return "Date not set";
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  const month = date.toLocaleString("en-US", { month: "long" });
  return `${weekday}, ${month} ${date.getDate()}`;
}

const BLOCK_ACCENT_COLORS: Record<FridayBranchBlockAccent, string> = {
  sky: "#8ABAC6",
  berry: "#B66A83",
  sage: "#5F8F72",
  sun: "#D4A843",
};

export function getBlockAccentColor(accent: FridayBranchBlockAccent): string {
  return BLOCK_ACCENT_COLORS[accent];
}

export function countBlockClasses(block: FridayBranchBlock): number {
  return block.slots.reduce((total, slot) => total + slot.classes.length, 0);
}

export function formatBlockStats(block: FridayBranchBlock): string {
  const slots = block.slots.length;
  const classes = countBlockClasses(block);
  if (slots === 0 && classes === 0) return "Ready to plan";
  const slotLabel = slots === 1 ? "time slot" : "time slots";
  const classLabel = classes === 1 ? "class" : "classes";
  return `${slots} ${slotLabel} · ${classes} ${classLabel}`;
}

export function getBlockStatusTag(
  block: FridayBranchBlock,
  index: number,
): { label: string; variant: FridayBranchStatusTagVariant } {
  const status = block.status ?? (index === 0 ? "current" : index === 1 ? "upcoming" : "draft");
  switch (status) {
    case "current":
      return { label: "Current block", variant: "green" };
    case "upcoming":
      return { label: "Upcoming", variant: "blue" };
    default:
      return { label: "Draft", variant: "purple" };
  }
}

export function countClassesWithField(
  block: FridayBranchBlock,
  field: "location" | "ageGroup",
): { filled: number; total: number } {
  const total = countBlockClasses(block);
  let filled = 0;
  for (const slot of block.slots) {
    for (const classEntry of slot.classes) {
      const value = field === "location" ? classEntry.location : classEntry.ageGroup;
      if (value.trim()) filled += 1;
    }
  }
  return { filled, total };
}

export function getScheduleGaps(block: FridayBranchBlock): FridayBranchScheduleGap[] {
  const gaps: FridayBranchScheduleGap[] = [];
  for (const slot of block.slots) {
    for (const classEntry of slot.classes) {
      const missingLocation = !classEntry.location.trim();
      const missingAge = !classEntry.ageGroup.trim();
      if (missingLocation || missingAge) {
        gaps.push({
          classId: classEntry.id,
          slotId: slot.id,
          className: classEntry.name || "Untitled class",
          missingLocation,
          missingAge,
        });
      }
    }
  }
  return gaps;
}

export function getBlockSummaryTitle(block: FridayBranchBlock): string {
  const classes = countBlockClasses(block);
  const slots = block.slots.length;
  if (slots === 0) return "Begin with time slots.";
  if (classes === 0) return "Add classes to each time slot.";
  if (getScheduleGaps(block).length > 0) return "A few details still need attention.";
  return "A full Friday takes shape.";
}

export function getBlockSummaryText(block: FridayBranchBlock): string {
  const classes = countBlockClasses(block);
  const slots = block.slots.length;
  if (slots === 0) {
    return "Begin with time slots, then add classes that give learners a rich and balanced Friday.";
  }
  if (classes === 0) {
    return "Add classes with locations and age groups so families can browse the block schedule.";
  }
  const gapCount = getScheduleGaps(block).length;
  if (gapCount > 0) {
    return `${classes} classes span ${slots} time slots. ${gapCount} still need location or age group details.`;
  }
  return `${classes} classes span ${slots} time slots, with a good mix of indoor studio, meadow learning, and off-site exploration.`;
}

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortDate(date: Date, includeYear: boolean): string {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  if (includeYear) {
    return `${month} ${day}, ${date.getFullYear()}`;
  }
  return `${month} ${day}`;
}

function classEntry(
  name: string,
  location = "",
  ageGroup = "",
  teacher = "",
): FridayBranchClass {
  return {
    id: newAdmissionsId(),
    name,
    location,
    ageGroup,
    teacher,
    familyVisible: true,
  };
}

export const DEMO_FRIDAY_BRANCH_BLOCKS: FridayBranchBlock[] = [
  {
    id: "block-3",
    label: "Block 3",
    startDate: "2026-11-06",
    endDate: "2026-11-20",
    accent: "sky",
    status: "current",
    description:
      "A three-week Friday rhythm for vibrant project work, movement, handwork, and outdoor exploration.",
    slots: [
      {
        id: "slot-b3-900",
        time: "9:00",
        classes: [classEntry("VIVIAN PROJECT")],
      },
      {
        id: "slot-b3-1000",
        time: "10:00",
        classes: [
          classEntry(
            "Bookworms / World Games",
            "La Casita",
            "9 yr – 12 yr",
            "Rachael Sparhawk",
          ),
          classEntry("Books & Tea", "Garden Room", "6 – 8", "Celeste Velazquez"),
        ],
      },
      {
        id: "slot-b3-1100",
        time: "11:00",
        classes: [
          classEntry("Intro to Dance K–3", "The Meadow", "K – 3", "Jazmin Caballero"),
        ],
      },
      {
        id: "slot-b3-1200",
        time: "12:00",
        classes: [
          classEntry("Intro to Dance 4–8", "The Meadow", "4 – 8", "Jazmin Caballero"),
        ],
      },
      {
        id: "slot-b3-1300",
        time: "1:00",
        classes: [
          classEntry(
            "Orienteering Club",
            "Various off-site locations",
            "All ages",
            "Jordin Ross",
          ),
        ],
      },
    ],
  },
  {
    id: "block-4",
    label: "Block 4",
    startDate: "2026-12-04",
    endDate: "2026-12-18",
    accent: "berry",
    status: "upcoming",
    description:
      "A fresh December block ready for imaginative course planning, team assignment, and family enrollment.",
    slots: [],
  },
];

export function countFridayBranchClasses(blocks: FridayBranchBlock[]): number {
  return blocks.reduce(
    (total, block) =>
      total +
      block.slots.reduce((slotTotal, slot) => slotTotal + slot.classes.length, 0),
    0,
  );
}

export function countFridayBranchTimeSlots(blocks: FridayBranchBlock[]): number {
  return blocks.reduce((total, block) => total + block.slots.length, 0);
}
