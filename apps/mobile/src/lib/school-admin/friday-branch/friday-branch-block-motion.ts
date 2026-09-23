import { SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';

import { isMobileE2e } from '@/lib/e2e';

export type FridayBranchBlockTransitionDirection = 'forward' | 'back';

const BLOCK_SCHEDULE_ENTER_DURATION = 220;
const BLOCK_SCHEDULE_EXIT_DURATION = 180;

export function blockScheduleEntering(direction: FridayBranchBlockTransitionDirection) {
  if (isMobileE2e) return undefined;

  return direction === 'forward'
    ? SlideInRight.duration(BLOCK_SCHEDULE_ENTER_DURATION)
    : SlideInLeft.duration(BLOCK_SCHEDULE_ENTER_DURATION);
}

export function blockScheduleExiting(direction: FridayBranchBlockTransitionDirection) {
  if (isMobileE2e) return undefined;

  return direction === 'forward'
    ? SlideOutLeft.duration(BLOCK_SCHEDULE_EXIT_DURATION)
    : SlideOutRight.duration(BLOCK_SCHEDULE_EXIT_DURATION);
}
