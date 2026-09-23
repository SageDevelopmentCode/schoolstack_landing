import { type ReactNode } from 'react';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { Story } from '@/constants/story-theme';

type StoryBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
};

export function StoryBottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel = 'Close',
}: StoryBottomSheetProps) {
  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel={accessibilityLabel}
      backgroundColor={Story.paper}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="92%">
      {children}
    </BottomSheetShell>
  );
}
