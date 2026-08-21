import { View } from 'react-native';

import { Spacing } from '@/constants/theme';

export const ADMIN_LIST_HORIZONTAL_PADDING = Spacing.three;

export function AdminListSeparator() {
  return <View style={{ height: Spacing.two }} />;
}
