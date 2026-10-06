import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { toLiveOrganization } from '@/lib/portal-organization';
import { fetchOrganizationBySlug } from '@/lib/school-admin/fetch-organization';
import type { LiveOrganization } from '@/lib/organizations';

export type PortalOrganizationStatus = 'loading' | 'ready' | 'failed';

export function usePortalOrganization(slug: string | undefined) {
  const { user, refreshSelectedSchool } = useAuth();
  const [organization, setOrganization] = useState<LiveOrganization | null>(null);
  const [status, setStatus] = useState<PortalOrganizationStatus>('loading');

  useEffect(() => {
    if (!slug) {
      setOrganization(null);
      setStatus('failed');
      return;
    }
    setOrganization(null);
    setStatus('loading');
  }, [slug]);

  useFocusEffect(
    useCallback(() => {
      if (!slug) {
        setOrganization(null);
        setStatus('failed');
        return;
      }

      if (!user) {
        setOrganization(null);
        setStatus('loading');
        return;
      }

      let cancelled = false;

      void fetchOrganizationBySlug(slug).then((org) => {
        if (cancelled) return;
        if (!org) {
          setOrganization(null);
          setStatus('failed');
          return;
        }

        const live = toLiveOrganization(org);
        if (live.slug !== slug) return;
        setOrganization(live);
        setStatus('ready');
        void refreshSelectedSchool(live);
      });

      return () => {
        cancelled = true;
      };
    }, [refreshSelectedSchool, slug, user]),
  );

  return { organization, status };
}
