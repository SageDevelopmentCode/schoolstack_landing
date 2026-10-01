import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentDocGuide } from '@/lib/parent/parent-portal-api';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentDocumentationGuideSheetProps = {
  visible: boolean;
  guide: ParentDocGuide | null;
  onClose: () => void;
  onStepAction: (href: string) => void;
};

export function ParentDocumentationGuideSheet({
  visible,
  guide,
  onClose,
  onStepAction,
}: ParentDocumentationGuideSheetProps) {
  const theme = useParentTheme();

  return (
    <StoryBottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel={guide?.title ?? 'How-to guide'}>
      {guide ? (
        <ScrollView contentContainerStyle={styles.content}>
          <StoryDisplayHeading size="section">{guide.title}</StoryDisplayHeading>
          <Text style={[styles.summary, { color: theme.muted }]}>{guide.summary}</Text>

          <View style={styles.steps}>
            {guide.steps.map((step, index) => (
              <View key={`${guide.id}-step-${index}`} style={styles.step}>
                <Text style={[styles.stepTitle, { color: theme.ink }]}>
                  {index + 1}. {step.title}
                </Text>
                <Text style={[styles.stepDescription, { color: theme.muted }]}>
                  {step.description}
                </Text>
                {step.action ? (
                  <StoryButton
                    label={step.action.label}
                    previewSafe
                    variant="outline"
                    onPress={() => {
                      onClose();
                      onStepAction(step.action!.href);
                    }}
                    style={styles.stepAction}
                  />
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  summary: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  steps: {
    gap: Spacing.four,
  },
  step: {
    gap: Spacing.one,
  },
  stepTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  stepDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  stepAction: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
});
