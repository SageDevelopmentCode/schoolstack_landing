import type { StoryChipTone } from '@/components/story/story-chip';
import type { PaymentStatus } from '@/lib/admissions/payment-records';

export function paymentStatusStoryChipTone(status: PaymentStatus): StoryChipTone {
  switch (status) {
    case 'succeeded':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'alert';
    case 'refunded':
      return 'info';
  }
}
