import { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { isMobileE2e } from '@/lib/e2e';

export const TAB_ENTER_DURATION = 220;

export const TAB_PANEL_ENTER_DURATION = 180;
export const TAB_PANEL_EXIT_DURATION = 140;

export const tabPanelEntering = isMobileE2e
  ? undefined
  : FadeInUp.duration(TAB_PANEL_ENTER_DURATION);

export const tabPanelExiting = isMobileE2e
  ? undefined
  : FadeOutUp.duration(TAB_PANEL_EXIT_DURATION);

export const CARD_PRESS_SPRING = { damping: 20, stiffness: 400 } as const;

export const TAB_PRESS_SPRING = { damping: 20, stiffness: 400 } as const;

export function detailStackAnimation(): 'slide_from_right' | 'none' {
  return isMobileE2e ? 'none' : 'slide_from_right';
}
