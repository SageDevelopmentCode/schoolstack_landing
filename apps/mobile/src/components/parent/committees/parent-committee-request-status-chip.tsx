import { StoryChip } from '@/components/story/story-chip';
import type { StoryChipTone } from '@/components/story/story-chip';
import type { CommitteeJoinRequestStatus } from '@/lib/parent/parent-committees-types';

const STATUS_CONFIG: Record<CommitteeJoinRequestStatus, { label: string; tone: StoryChipTone }> = {
  pending: { label: 'Request pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  declined: { label: 'Declined', tone: 'alert' },
  withdrawn: { label: 'Withdrawn', tone: 'info' },
};

type ParentCommitteeRequestStatusChipProps = {
  status: CommitteeJoinRequestStatus;
};

export function ParentCommitteeRequestStatusChip({ status }: ParentCommitteeRequestStatusChipProps) {
  const config = STATUS_CONFIG[status];
  return <StoryChip tone={config.tone} label={config.label} />;
}
