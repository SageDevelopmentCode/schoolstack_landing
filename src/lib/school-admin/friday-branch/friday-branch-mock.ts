import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import type {
  FridayBranchBlock,
  FridayBranchBlockAccent,
  FridayBranchClass,
  FridayBranchTimeSlot,
} from "./friday-branch-types";

const BLOCK_ACCENTS: FridayBranchBlockAccent[] = ["sky", "berry", "sage", "sun"];

export function createEmptyClass(): FridayBranchClass {
  return {
    id: newAdmissionsId(),
    name: "",
    location: "",
    ageGroup: "",
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
  const year = new Date().getFullYear();
  const startMonth = String(Math.min(blockNumber * 2, 11)).padStart(2, "0");

  return {
    id: newAdmissionsId(),
    label: `Block ${blockNumber}`,
    startDate: `${year}-${startMonth}-01`,
    endDate: `${year}-${startMonth}-28`,
    accent,
    slots: [createEmptySlot()],
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

export function formatBlockTabLabel(block: FridayBranchBlock): string {
  return `${block.label} · ${formatBlockTabDateRange(block.startDate, block.endDate)}`;
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
  const slotLabel = slots === 1 ? "time slot" : "time slots";
  const classLabel = classes === 1 ? "class" : "classes";
  return `${slots} ${slotLabel} · ${classes} ${classLabel}`;
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
): FridayBranchClass {
  return {
    id: newAdmissionsId(),
    name,
    location,
    ageGroup,
  };
}

export const DEMO_FRIDAY_BRANCH_BLOCKS: FridayBranchBlock[] = [
  {
    id: "block-3",
    label: "Block 3",
    startDate: "2026-11-06",
    endDate: "2026-11-20",
    accent: "sky",
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
          classEntry("Bookworms/World Games", "La Casita", "9 yr – 12 yr"),
          classEntry("Books & Tea", "", "6–8"),
        ],
      },
      {
        id: "slot-b3-1100",
        time: "11:00",
        classes: [classEntry("Intro to Dance k–3", "The Meadow", "k–3")],
      },
      {
        id: "slot-b3-1200",
        time: "12:00",
        classes: [classEntry("Intro to Dance 4–8", "The Meadow", "4–8")],
      },
      {
        id: "slot-b3-1300",
        time: "1:00",
        classes: [
          classEntry("Orienteering club", "Various Off Site locations", ""),
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
    slots: [
      {
        id: "slot-b4-900",
        time: "9:00",
        classes: [classEntry("Morning circle & games", "The Meadow", "K–5")],
      },
      {
        id: "slot-b4-1000",
        time: "10:00",
        classes: [
          classEntry("Handwork studio", "La Casita", "6–10"),
          classEntry("Nature journaling", "Garden path", "8–12"),
        ],
      },
      {
        id: "slot-b4-1100",
        time: "11:00",
        classes: [classEntry("Winter crafts", "The Meadow", "K–3")],
      },
    ],
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
