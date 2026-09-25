import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Story } from '@/constants/story-theme';
import { parentTabRoute } from '@/lib/parent/parent-nav';
import {
  isStripeCheckoutReturnOutcome,
  type StripeCheckoutReturnOutcome,
} from '@/lib/parent/stripe-checkout-outcome';
import { stageCheckoutReturn } from '@/lib/parent/stripe-checkout-return-handoff';

/**
 * Stripe Checkout returns to `schoolstack://stripe-checkout?outcome=...&slug=...`.
 * Expo Router opens this route on Android and on cold starts. We stage the outcome for
 * billing to settle (refresh/poll) and navigate to the billing tab — do not rely on
 * `openAuthSessionAsync` still being in flight on the billing screen.
 */
export default function StripeCheckoutReturnRoute() {
  const router = useRouter();
  const { slug, outcome: outcomeParam } = useLocalSearchParams<{
    slug?: string;
    outcome?: string;
  }>();

  useEffect(() => {
    const orgSlug = typeof slug === 'string' ? slug : null;
    const outcomeRaw = typeof outcomeParam === 'string' ? outcomeParam : null;
    const outcome: StripeCheckoutReturnOutcome | null =
      outcomeRaw && isStripeCheckoutReturnOutcome(outcomeRaw) ? outcomeRaw : null;

    if (orgSlug && outcome) {
      stageCheckoutReturn(orgSlug, outcome);
    }

    if (orgSlug) {
      router.replace(parentTabRoute(orgSlug, 'billing'));
      return;
    }
    router.replace('/');
  }, [outcomeParam, router, slug]);

  return <View style={{ flex: 1, backgroundColor: Story.paper }} />;
}
