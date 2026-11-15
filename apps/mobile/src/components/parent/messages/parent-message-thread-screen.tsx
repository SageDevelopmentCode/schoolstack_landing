import { ParentMessageThreadGardenScreen } from '@/components/parent/messages/garden/parent-message-thread-garden-screen';

type ParentMessageThreadScreenProps = {
  threadId: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

/** One parent conversation (main portal and program portal routes). */
export function ParentMessageThreadScreen(props: ParentMessageThreadScreenProps) {
  return <ParentMessageThreadGardenScreen key={props.threadId} {...props} />;
}
