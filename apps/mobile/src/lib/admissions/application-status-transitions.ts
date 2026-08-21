export type ApplicationDecisionAction = {
  status: string;
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
};

const APPLICATION_STATUSES = [
  'draft',
  'submitted',
  'fee_pending',
  'under_review',
  'observation',
  'accepted',
  'enrolling',
  'enrolled',
  'declined',
  'withdrawn',
] as const;

function isApplicationStatus(value: string): value is (typeof APPLICATION_STATUSES)[number] {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function getApplicationDecisionActions(currentStatus: string): ApplicationDecisionAction[] {
  if (!isApplicationStatus(currentStatus)) return [];

  switch (currentStatus) {
    case 'submitted':
    case 'fee_pending':
      return [
        { status: 'under_review', label: 'Mark under review', variant: 'secondary' },
        { status: 'accepted', label: 'Accept', variant: 'primary' },
        { status: 'declined', label: 'Decline', variant: 'danger' },
      ];
    case 'under_review':
      return [
        { status: 'observation', label: 'Schedule observation', variant: 'secondary' },
        { status: 'accepted', label: 'Accept', variant: 'primary' },
        { status: 'declined', label: 'Decline', variant: 'danger' },
      ];
    case 'observation':
      return [
        { status: 'accepted', label: 'Accept', variant: 'primary' },
        { status: 'declined', label: 'Decline', variant: 'danger' },
      ];
    case 'accepted':
      return [
        { status: 'submitted', label: 'Return to submitted', variant: 'secondary' },
        { status: 'withdrawn', label: 'Withdraw', variant: 'secondary' },
        { status: 'declined', label: 'Decline', variant: 'danger' },
      ];
    case 'enrolling':
      return [{ status: 'withdrawn', label: 'Withdraw', variant: 'danger' }];
    case 'enrolled':
      return [{ status: 'withdrawn', label: 'Withdraw', variant: 'danger' }];
    default:
      return [];
  }
}
