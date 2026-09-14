import { Alert } from 'react-native';

export function haveSameIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

export function confirmDiscardUnsavedChanges(onDiscard: () => void): void {
  Alert.alert(
    'Discard changes?',
    'You have unsaved changes. If you leave now, your changes will be lost.',
    [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard changes', style: 'destructive', onPress: onDiscard },
    ],
  );
}

export function requestCloseIfClean({
  isDirty,
  onClose,
}: {
  isDirty: boolean;
  onClose: () => void;
}): void {
  if (!isDirty) {
    onClose();
    return;
  }

  confirmDiscardUnsavedChanges(onClose);
}
