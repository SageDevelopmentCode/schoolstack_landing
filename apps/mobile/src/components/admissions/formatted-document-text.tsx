import { useMemo } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Spacing } from '@/constants/theme';
import { addMarkdownSubsectionBreaks } from '@/lib/admissions/markdown-text';

type FormattedDocumentTextProps = {
  content: string;
};

export function FormattedDocumentText({ content }: FormattedDocumentTextProps) {
  const theme = useAdminTheme();
  const normalizedContent = useMemo(() => addMarkdownSubsectionBreaks(content), [content]);

  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          color: theme.textPrimary,
          fontFamily: Fonts.body,
          fontSize: 14,
          lineHeight: 22,
        },
        paragraph: {
          marginTop: Spacing.two,
          marginBottom: 0,
        },
        heading1: {
          color: theme.textPrimary,
          fontFamily: Fonts.bodySemiBold,
          fontSize: 18,
          marginTop: Spacing.four,
          marginBottom: Spacing.two,
        },
        heading2: {
          color: theme.textPrimary,
          fontFamily: Fonts.bodySemiBold,
          fontSize: 16,
          marginTop: Spacing.four,
          marginBottom: Spacing.two,
        },
        heading3: {
          color: theme.textPrimary,
          fontFamily: Fonts.bodySemiBold,
          fontSize: 14,
          marginTop: Spacing.three,
          marginBottom: Spacing.one,
        },
        heading4: {
          color: theme.textPrimary,
          fontFamily: Fonts.bodySemiBold,
          fontSize: 14,
          marginTop: Spacing.two,
          marginBottom: Spacing.one,
        },
        strong: {
          color: theme.textPrimary,
          fontFamily: Fonts.bodySemiBold,
        },
        em: {
          color: theme.textPrimary,
          fontStyle: 'italic',
        },
        bullet_list: {
          marginTop: Spacing.two,
        },
        ordered_list: {
          marginTop: Spacing.two,
        },
        list_item: {
          marginBottom: Spacing.one,
        },
        blockquote: {
          borderLeftWidth: 2,
          borderLeftColor: theme.border,
          paddingLeft: Spacing.three,
          marginTop: Spacing.two,
          color: theme.textSecondary,
        },
        hr: {
          backgroundColor: theme.border,
          height: StyleSheet.hairlineWidth,
          marginVertical: Spacing.three,
        },
        link: {
          color: theme.accent,
          textDecorationLine: 'underline',
        },
      }),
    [theme],
  );

  return (
    <View>
      <Markdown
        style={markdownStyles}
        onLinkPress={(url) => {
          void Linking.openURL(url);
          return false;
        }}>
        {normalizedContent}
      </Markdown>
    </View>
  );
}
