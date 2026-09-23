import { useLocalSearchParams } from 'expo-router';

import { ParentBillingScreen } from '@/components/parent/billing/parent-billing-screen';

export default function ParentBillingRoute() {
  const { slug, tab, form } = useLocalSearchParams<{
    slug: string;
    tab?: string;
    form?: string;
  }>();

  if (!slug) return null;

  return (
    <ParentBillingScreen
      slug={slug}
      initialTab={typeof tab === 'string' ? tab : undefined}
      initialFormId={typeof form === 'string' ? form : undefined}
    />
  );
}
