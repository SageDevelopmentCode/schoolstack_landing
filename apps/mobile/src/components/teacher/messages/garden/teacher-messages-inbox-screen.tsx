import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { GCard } from '@/components/parent/garden/ui';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { ParentMessagesGardenScreen } from '@/components/parent/messages/garden/parent-messages-garden-screen';
import { useTeacherMessagesInboxController } from '@/components/teacher/messages/garden/use-teacher-messages-inbox-controller';

type Props = { organizationId: string; organizationSlug: string; schoolName: string };

/**
 * Teacher › Messages inbox (Garden). Reuses the Garden inbox (header with the
 * one toy button, search, All / Unread filter, latest-unread note, empty
 * states, help sheet, start-a-conversation sheet) on teacher data. Student
 * names on a row open that student's page.
 */
export function TeacherMessagesInboxScreen(props: Props) {
  const { screen, openStudent, homeLoaded, messagesEnabled } = useTeacherMessagesInboxController(props);

  if (homeLoaded && !messagesEnabled) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.disabledWrap}>
        <StatusBar style="dark" />
        <GCard title="Messages unavailable" index={0} testID="teacher-messages-disabled">
          <Text style={styles.disabledCopy}>Messaging is not enabled for your teacher account at this school.</Text>
        </GCard>
      </ScrollView>
    );
  }

  return <ParentMessagesGardenScreen controller={screen} onStudentPress={openStudent} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  disabledWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  disabledCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 14.5, lineHeight: 22, color: Garden.soft },
});
