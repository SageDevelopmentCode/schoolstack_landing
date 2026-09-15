import { useLocalSearchParams } from 'expo-router';

import { TransactionsListScreen } from '@/components/school-admin/more/transactions-list-screen';
import { useAuth } from '@/contexts/auth-context';
import { SchoolAdminTransactionsProvider } from '@/contexts/school-admin-transactions-context';

export default function SchoolAdminTransactionsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <SchoolAdminTransactionsProvider organizationId={selectedSchool.id}>
      <TransactionsListScreen organizationId={selectedSchool.id} slug={selectedSchool.slug} />
    </SchoolAdminTransactionsProvider>
  );
}
