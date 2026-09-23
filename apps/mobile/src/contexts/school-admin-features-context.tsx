import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import {
  isSchoolAdminFridayBranchEnabled,
  type SchoolAdminOrganizationFeatures,
} from '@/lib/school-admin/school-admin-features';

type SchoolAdminFeaturesContextValue = {
  features: SchoolAdminOrganizationFeatures | undefined;
  isLoading: boolean;
  error: string | null;
  fridayBranchEnabled: boolean;
  refresh: () => Promise<void>;
};

const SchoolAdminFeaturesContext = createContext<SchoolAdminFeaturesContextValue | null>(null);

type SchoolAdminFeaturesProviderProps = {
  children: ReactNode;
  slug: string;
};

export function SchoolAdminFeaturesProvider({ children, slug }: SchoolAdminFeaturesProviderProps) {
  const [features, setFeatures] = useState<SchoolAdminOrganizationFeatures | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const organization = await fetchOrganizationBySlug(slug);
      if (!organization) {
        throw new Error('Organization not found.');
      }
      setFeatures(organization.features);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load school features.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const fridayBranchEnabled = isSchoolAdminFridayBranchEnabled(features);

  const value = useMemo(
    () => ({
      features,
      isLoading,
      error,
      fridayBranchEnabled,
      refresh: load,
    }),
    [features, fridayBranchEnabled, isLoading, error, load],
  );

  return (
    <SchoolAdminFeaturesContext.Provider value={value}>
      {children}
    </SchoolAdminFeaturesContext.Provider>
  );
}

export function useSchoolAdminFeatures(): SchoolAdminFeaturesContextValue {
  const context = useContext(SchoolAdminFeaturesContext);
  if (!context) {
    throw new Error('useSchoolAdminFeatures must be used within SchoolAdminFeaturesProvider');
  }
  return context;
}
