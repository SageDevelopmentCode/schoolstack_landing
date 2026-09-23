import {
  createEmptyBlock,
  duplicateBlock,
  formatGapReviewLabel,
  getScheduleGaps,
  slotTimeExists,
  sortFridayBranchTimeSlots,
} from '@/lib/school-admin/friday-branch/friday-branch-utils';

describe('friday-branch-utils', () => {
  it('duplicates a block with new ids', () => {
    const block = createEmptyBlock(1);
    block.label = 'Block 3';
    block.slots[0].classes[0].name = 'Art';

    const copy = duplicateBlock(block);

    expect(copy.id).not.toBe(block.id);
    expect(copy.label).toContain('copy');
    expect(copy.slots[0].id).not.toBe(block.slots[0].id);
    expect(copy.slots[0].classes[0].id).not.toBe(block.slots[0].classes[0].id);
    expect(copy.slots[0].classes[0].name).toBe('Art');
  });

  it('strips flyer fields when duplicating a block', () => {
    const block = createEmptyBlock(1);
    block.slots[0].classes[0].flyerStoragePath = 'org/classes/class-1/flyer.pdf';
    block.slots[0].classes[0].flyerFileName = 'Flyer.pdf';
    block.slots[0].classes[0].flyerFileSizeBytes = 2048;

    const copy = duplicateBlock(block);

    expect(copy.slots[0].classes[0].flyerStoragePath).toBeNull();
    expect(copy.slots[0].classes[0].flyerFileName).toBeNull();
    expect(copy.slots[0].classes[0].flyerFileSizeBytes).toBeNull();
    expect(block.slots[0].classes[0].flyerStoragePath).toBe('org/classes/class-1/flyer.pdf');
  });

  it('detects schedule gaps for missing location and age group', () => {
    const block = createEmptyBlock(1);
    block.slots[0].classes[0].name = 'Dance';
    block.slots[0].classes[0].location = '';
    block.slots[0].classes[0].ageGroup = '';

    const gaps = getScheduleGaps(block);

    expect(gaps).toHaveLength(1);
    expect(gaps[0].className).toBe('Dance');
    expect(gaps[0].missingLocation).toBe(true);
    expect(gaps[0].missingAge).toBe(true);
    expect(formatGapReviewLabel(gaps.length)).toBe('Review 1 open item');
  });

  it('sorts time slots chronologically', () => {
    const block = createEmptyBlock(1);
    block.slots = [
      { id: 'slot-2', time: '11:00', classes: [] },
      { id: 'slot-1', time: '9:00', classes: [] },
    ];

    const sorted = sortFridayBranchTimeSlots(block.slots);

    expect(sorted.map((slot) => slot.time)).toEqual(['9:00', '11:00']);
    expect(slotTimeExists(sorted, '9:00')).toBe(true);
    expect(slotTimeExists(sorted, '12:00')).toBe(false);
  });
});
