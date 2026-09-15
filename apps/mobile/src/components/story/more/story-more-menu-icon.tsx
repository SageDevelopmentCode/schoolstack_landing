import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type StoryMoreMenuIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

export function StoryMoreMenuIcon({ name, iconBg, iconColor }: StoryMoreMenuIconProps) {
  return (
    <View style={[styles.wrap, { backgroundColor: iconBg }]}>
      <Ionicons name={name} size={18} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
