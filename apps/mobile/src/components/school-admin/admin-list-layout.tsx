import { View } from 'react-native';

import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

export const ADMIN_LIST_HORIZONTAL_PADDING = SCREEN_HORIZONTAL_PADDING;

export function AdminListSeparator() {
  return <View style={{ height: Spacing.two }} />;
}
