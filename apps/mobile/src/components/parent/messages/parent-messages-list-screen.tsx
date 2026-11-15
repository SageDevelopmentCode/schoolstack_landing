import { ParentMessagesGardenScreen } from '@/components/parent/messages/garden/parent-messages-garden-screen';
import { useParentMessagesInboxController } from '@/components/parent/messages/garden/use-parent-messages-inbox-controller';

type ParentMessagesListScreenProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

/** Parent Messages inbox (main portal and program portal routes). */
export function ParentMessagesListScreen(props: ParentMessagesListScreenProps) {
  const controller = useParentMessagesInboxController(props);
  return <ParentMessagesGardenScreen controller={controller} />;
}
