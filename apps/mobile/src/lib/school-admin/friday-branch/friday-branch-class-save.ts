import { parseFridayBranchPriceInput } from '@/lib/school-admin/friday-branch/friday-branch-price-utils';
import type { FridayBranchBlock, FridayBranchClass } from '@/lib/school-admin/friday-branch/friday-branch-types';

export function mergeFridayBranchClassIntoBlock(
  block: FridayBranchBlock,
  targetSlotId: string,
  classEntry: FridayBranchClass,
  previousSlotId?: string,
): FridayBranchBlock {
  let slots = block.slots.map((slot) => ({
    ...slot,
    classes: slot.classes.map((entry) => ({ ...entry })),
  }));

  if (previousSlotId && previousSlotId !== targetSlotId) {
    const sourceSlot = slots.find((slot) => slot.id === previousSlotId);
    if (sourceSlot) {
      sourceSlot.classes = sourceSlot.classes.filter((entry) => entry.id !== classEntry.id);
    }
    const targetSlot = slots.find((slot) => slot.id === targetSlotId);
    if (targetSlot) {
      const exists = targetSlot.classes.some((entry) => entry.id === classEntry.id);
      if (exists) {
        targetSlot.classes = targetSlot.classes.map((entry) =>
          entry.id === classEntry.id ? classEntry : entry,
        );
      } else {
        targetSlot.classes.push(classEntry);
      }
    }
  } else {
    slots = slots.map((slot) => {
      if (slot.id !== targetSlotId) return slot;
      const exists = slot.classes.some((entry) => entry.id === classEntry.id);
      return {
        ...slot,
        classes: exists
          ? slot.classes.map((entry) => (entry.id === classEntry.id ? classEntry : entry))
          : [...slot.classes, classEntry],
      };
    });
  }

  return { ...block, slots };
}

export function buildFridayBranchClassSavePayload(
  classEntry: FridayBranchClass,
  priceInput: string,
): FridayBranchClass | { error: string } {
  const trimmedPrice = priceInput.trim();
  let priceCents: number | null = null;

  if (trimmedPrice) {
    const parsedPrice = parseFridayBranchPriceInput(trimmedPrice);
    if (parsedPrice == null) {
      return { error: 'Enter a valid price (e.g. 12.50).' };
    }
    priceCents = parsedPrice;
  }

  return {
    ...classEntry,
    priceCents,
  };
}
