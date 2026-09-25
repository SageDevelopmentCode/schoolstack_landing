import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Story } from '@/constants/story-theme';
import { parentTabRoute } from '@/lib/parent/parent-nav';

/**
 * Stripe Checkout returns to `schoolstack://stripe-checkout?outcome=...&slug=...`.
 * On Android (and cold starts) expo-router routes that link here; the billing screen
 * that opened checkout handles the outcome, so this screen only navigates back to it.
 */
export default function StripeCheckoutReturnRoute() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string; outcome?: string }>();

  useEffect(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(typeof slug === 'string' && slug ? parentTabRoute(slug, 'billing') : '/');
  }, [router, slug]);

  return <View style={{ flex: 1, backgroundColor: Story.paper }} />;
}
