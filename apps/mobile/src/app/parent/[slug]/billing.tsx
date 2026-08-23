import { useLocalSearchParams } from 'expo-router';

import { ParentBillingScreen } from '@/components/parent/billing/parent-billing-screen';

export default function ParentBillingRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  if (!slug) return null;

  return <ParentBillingScreen slug={slug} />;
}
