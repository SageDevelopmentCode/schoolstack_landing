import { View, type ViewProps } from 'react-native';

import { Brand } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  type?: 'background' | 'surface' | 'element';
};

export function ThemedView({ style, type = 'background', ...otherProps }: ThemedViewProps) {
  const backgroundColor =
    type === 'surface' ? Brand.surface : type === 'element' ? Brand.surface : Brand.bg;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
