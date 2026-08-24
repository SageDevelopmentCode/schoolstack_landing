import { isMobileE2e } from '@/lib/e2e';

export const TAB_ENTER_DURATION = 220;

export const CARD_PRESS_SPRING = { damping: 20, stiffness: 400 } as const;

export const TAB_PRESS_SPRING = { damping: 20, stiffness: 400 } as const;

export function detailStackAnimation(): 'slide_from_right' | 'none' {
  return isMobileE2e ? 'none' : 'slide_from_right';
}
