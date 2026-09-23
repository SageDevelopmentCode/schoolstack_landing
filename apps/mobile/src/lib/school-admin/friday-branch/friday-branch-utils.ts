import type {
  FridayBranchBlock,
  FridayBranchBlockAccent,
  FridayBranchClass,
  FridayBranchScheduleGap,
  FridayBranchStatusTagVariant,
  FridayBranchTimeSlot,
} from '@/lib/school-admin/friday-branch/friday-branch-types';

const BLOCK_ACCENTS: FridayBranchBlockAccent[] = ['sky', 'berry', 'sage', 'sun'];

export function newFridayBranchId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-000000000000';
}

export function createEmptyClass(): FridayBranchClass {
  return {
    id: newFridayBranchId(),
    name: '',
    location: '',
    ageGroup: '',
    teacher: '',
    familyVisible: true,
  };
}

export const COMMON_SLOT_TIMES = ['9:00', '10:00', '11:00', '12:00', '1:00'];

export function createEmptySlot(time = '9:00'): FridayBranchTimeSlot {
  return {
    id: newFridayBranchId(),
    time,
    classes: [createEmptyClass()],
  };
}

export type FridayBranchFirstClassSeed = {
  id?: string;
  name?: string;
  location?: string;
  ageGroup?: string;
  teacher?: string;
  priceCents?: number | null;
  flyerStoragePath?: string | null;
  flyerFileName?: string | null;
  flyerFileSizeBytes?: number | null;
};

export function createSlotWithTime(
  time: string,
  firstClass?: FridayBranchFirstClassSeed,
): FridayBranchTimeSlot {
  const slot = createEmptySlot(time.trim());
  if (firstClass) {
    slot.classes[0] = {
      ...slot.classes[0],
      ...(firstClass.id ? { id: firstClass.id } : {}),
      ...(firstClass.name?.trim() ? { name: firstClass.name.trim() } : {}),
      ...(firstClass.location ? { location: firstClass.location } : {}),
      ...(firstClass.ageGroup ? { ageGroup: firstClass.ageGroup } : {}),
      ...(firstClass.teacher ? { teacher: firstClass.teacher } : {}),
      ...(firstClass.priceCents !== undefined ? { priceCents: firstClass.priceCents } : {}),
      ...(firstClass.flyerStoragePath !== undefined
        ? { flyerStoragePath: firstClass.flyerStoragePath }
        : {}),
      ...(firstClass.flyerFileName !== undefined ? { flyerFileName: firstClass.flyerFileName } : {}),
      ...(firstClass.flyerFileSizeBytes !== undefined
        ? { flyerFileSizeBytes: firstClass.flyerFileSizeBytes }
        : {}),
    };
  }
  return slot;
}

export function removeClassFromBlock(
  block: FridayBranchBlock,
  slotId: string,
  classId: string,
): FridayBranchBlock {
  const slots = block.slots
    .map((slot) => {
      if (slot.id !== slotId) return slot;
      const classes = slot.classes.filter((entry) => entry.id !== classId);
      return { ...slot, classes };
    })
    .filter((slot) => slot.classes.length > 0);

  return { ...block, slots };
}

export function removeSlotFromBlock(block: FridayBranchBlock, slotId: string): FridayBranchBlock {
  return {
    ...block,
    slots: block.slots.filter((slot) => slot.id !== slotId),
  };
}

function parseSimpleSlotTime(time: string): { hour: number; minute: number } | null {
  const trimmed = time.trim();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = Number.parseInt(match[1], 10);
  const minute = match[2] ? Number.parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  if (!meridiem && hour >= 1 && hour <= 5) hour += 12;

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function formatSimpleSlotTime(hour: number, minute: number): string {
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, '0')}`;
}

export function fridayBranchSlotTimeToMinutes(time: string): number | null {
  const parsed = parseSimpleSlotTime(time);
  if (!parsed) return null;
  return parsed.hour * 60 + parsed.minute;
}

export function sortFridayBranchTimeSlots(slots: FridayBranchTimeSlot[]): FridayBranchTimeSlot[] {
  return slots
    .map((slot, index) => ({ slot, index }))
    .sort((a, b) => {
      const aMinutes = fridayBranchSlotTimeToMinutes(a.slot.time);
      const bMinutes = fridayBranchSlotTimeToMinutes(b.slot.time);

      if (aMinutes === null && bMinutes === null) return a.index - b.index;
      if (aMinutes === null) return 1;
      if (bMinutes === null) return -1;
      if (aMinutes !== bMinutes) return aMinutes - bMinutes;
      return a.index - b.index;
    })
    .map(({ slot }) => slot);
}

export function suggestNextSlotTime(slots: FridayBranchTimeSlot[]): string {
  if (slots.length === 0) return '9:00';

  const sorted = sortFridayBranchTimeSlots(slots);
  const lastSlot = sorted[sorted.length - 1];
  const parsed = parseSimpleSlotTime(lastSlot.time);
  if (!parsed) return '9:00';

  const totalMinutes = parsed.hour * 60 + parsed.minute + 60;
  const nextHour = Math.floor(totalMinutes / 60) % 24;
  const nextMinute = totalMinutes % 60;
  return formatSimpleSlotTime(nextHour, nextMinute);
}

export function getAvailableQuickPickTimes(slots: FridayBranchTimeSlot[]): string[] {
  const used = new Set(slots.map((slot) => slot.time.trim().toLowerCase()));
  return COMMON_SLOT_TIMES.filter((time) => !used.has(time.toLowerCase()));
}

export function slotTimeExists(slots: FridayBranchTimeSlot[], time: string): boolean {
  const normalized = time.trim().toLowerCase();
  return slots.some((slot) => slot.time.trim().toLowerCase() === normalized);
}

export function getBlockDisplayLabel(block: FridayBranchBlock, index: number): string {
  const trimmed = block.label.trim();
  return trimmed || `Block ${index + 1}`;
}

export function createEmptyBlock(blockNumber: number): FridayBranchBlock {
  const accent = BLOCK_ACCENTS[(blockNumber - 1) % BLOCK_ACCENTS.length] ?? 'sky';

  return {
    id: newFridayBranchId(),
    label: '',
    startDate: '',
    endDate: '',
    accent,
    status: 'draft',
    description: '',
    slots: [createEmptySlot()],
  };
}

export function duplicateBlock(block: FridayBranchBlock): FridayBranchBlock {
  const copyNumber = block.label.match(/\d+/)?.[0] ?? '';
  return {
    ...block,
    id: newFridayBranchId(),
    label: copyNumber ? `Block ${copyNumber} (copy)` : `${block.label} (copy)`,
    status: 'draft',
    slots: block.slots.map((slot) => ({
      ...slot,
      id: newFridayBranchId(),
      classes: slot.classes.map(
        ({ flyerStoragePath: _flyerPath, flyerFileName: _flyerName, flyerFileSizeBytes: _flyerSize, ...classEntry }) => ({
          ...classEntry,
          id: newFridayBranchId(),
          flyerStoragePath: null,
          flyerFileName: null,
          flyerFileSizeBytes: null,
        }),
      ),
    })),
  };
}

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortDate(date: Date, includeYear: boolean): string {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  if (includeYear) {
    return `${month} ${day}, ${date.getFullYear()}`;
  }
  return `${month} ${day}`;
}

export function formatBlockTabDateRange(startDate: string, endDate: string): string {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return 'Dates TBD';

  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = formatShortDate(start, false);
  const endLabel = formatShortDate(end, !sameYear);
  return `${startLabel} – ${endLabel}`;
}

const BLOCK_ACCENT_COLORS: Record<FridayBranchBlockAccent, string> = {
  sky: '#8ABAC6',
  berry: '#B66A83',
  sage: '#5F8F72',
  sun: '#D4A843',
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
  if (slots === 0 && classes === 0) return 'Ready to plan';
  const slotLabel = slots === 1 ? 'time slot' : 'time slots';
  const classLabel = classes === 1 ? 'class' : 'classes';
  return `${slots} ${slotLabel} · ${classes} ${classLabel}`;
}

export function getBlockStatusTag(
  block: FridayBranchBlock,
  index: number,
): { label: string; variant: FridayBranchStatusTagVariant } {
  const status = block.status ?? (index === 0 ? 'current' : index === 1 ? 'upcoming' : 'draft');
  switch (status) {
    case 'current':
      return { label: 'Current block', variant: 'green' };
    case 'upcoming':
      return { label: 'Upcoming', variant: 'blue' };
    default:
      return { label: 'Draft', variant: 'purple' };
  }
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
          className: classEntry.name || 'Untitled class',
          missingLocation,
          missingAge,
        });
      }
    }
  }
  return gaps;
}

export function formatGapReviewLabel(gapCount: number): string {
  if (gapCount === 1) return 'Review 1 open item';
  return `Review ${gapCount} open items`;
}

export function formatBlockCompletionStatus(block: FridayBranchBlock): string {
  const gaps = getScheduleGaps(block);
  const incompleteClasses = new Set(gaps.map((gap) => gap.classId)).size;

  if (incompleteClasses === 0) {
    if (block.slots.length === 0) return 'Ready to plan';
    return 'Schedule complete';
  }
  if (incompleteClasses === 1) return '1 class incomplete';
  return `${incompleteClasses} classes incomplete`;
}

export function cloneFridayBranchBlocks(blocks: FridayBranchBlock[]): FridayBranchBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as FridayBranchBlock[];
}

export function findBlockIdForClass(
  blocks: FridayBranchBlock[],
  classId: string | null,
): string | null {
  if (!classId) return null;
  for (const block of blocks) {
    for (const slot of block.slots) {
      if (slot.classes.some((entry) => entry.id === classId)) {
        return block.id;
      }
    }
  }
  return null;
}

export function findClassInBlocks(
  blocks: FridayBranchBlock[],
  classId: string,
): { block: FridayBranchBlock; slotId: string; classEntry: FridayBranchClass; slotTime: string } | null {
  for (const block of blocks) {
    for (const slot of block.slots) {
      const classEntry = slot.classes.find((entry) => entry.id === classId);
      if (classEntry) {
        return { block, slotId: slot.id, classEntry, slotTime: slot.time };
      }
    }
  }
  return null;
}
