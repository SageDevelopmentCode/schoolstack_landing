import { Linking, StyleSheet, Text, type TextStyle } from 'react-native';

import { splitPlainTextLinks } from '@/lib/text/plain-text-links';

type LinkifiedTextProps = {
  text: string;
  style?: TextStyle | TextStyle[];
  linkColor: string;
  linkStyle?: TextStyle;
};

export function LinkifiedText({ text, style, linkColor, linkStyle }: LinkifiedTextProps) {
  const segments = splitPlainTextLinks(text);

  return (
    <Text style={style}>
      {segments.map((segment, index) => {
        if (segment.type === 'link') {
          return (
            <Text
              key={`link-${index}`}
              style={[styles.link, { color: linkColor }, linkStyle]}
              accessibilityRole="link"
              onPress={() => {
                void Linking.openURL(segment.href);
              }}>
              {segment.value}
            </Text>
          );
        }
        return <Text key={`text-${index}`}>{segment.value}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
});
