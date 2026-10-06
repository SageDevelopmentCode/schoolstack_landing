import React from 'react';
import { Text } from 'react-native';
import { create, act, type ReactTestRenderer } from 'react-test-renderer';

import { usePortalOrganization } from '@/hooks/use-portal-organization';
import type { OrganizationWithSettings } from '@/lib/school-admin/fetch-organization';

const mockRefreshSelectedSchool = jest.fn();

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    refreshSelectedSchool: mockRefreshSelectedSchool,
  }),
}));

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => {
        const cleanup = callback();
        return typeof cleanup === 'function' ? cleanup : undefined;
      });
    },
  };
});

type PendingFetch = {
  slug: string;
  resolve: (org: OrganizationWithSettings | null) => void;
};

const pendingFetches: PendingFetch[] = [];

jest.mock('@/lib/school-admin/fetch-organization', () => ({
  fetchOrganizationBySlug: jest.fn((slug: string) => {
    return new Promise<OrganizationWithSettings | null>((resolve) => {
      pendingFetches.push({ slug, resolve });
    });
  }),
}));

function mockOrganization(slug: string): OrganizationWithSettings {
  return {
    id: `id-${slug}`,
    slug,
    name: `Name ${slug}`,
    branding: {
      colors: {
        accent: '#000000',
        accentBright: '#111111',
        accentMid: '#222222',
        accentDark: '#333333',
        accentLight: 'rgba(0,0,0,0.1)',
        accentGlow: 'rgba(0,0,0,0.12)',
        bg: '#ffffff',
        border: '#eeeeee',
        borderStrong: '#000000',
        textPrimary: '#000000',
        textSecondary: '#666666',
        clay: '#cccccc',
        clayBg: 'rgba(0,0,0,0.1)',
        clayBorder: 'rgba(0,0,0,0.2)',
        secondaryBtnBorder: 'rgba(0,0,0,0.2)',
      },
      logoSrc: null,
      logoAlt: null,
    },
  };
}

function HookProbe({ slug }: { slug: string | undefined }) {
  const { organization, status } = usePortalOrganization(slug);
  return (
    <>
      <Text testID="status">{status}</Text>
      <Text testID="orgSlug">{organization?.slug ?? ''}</Text>
    </>
  );
}

function readProbe(tree: ReactTestRenderer) {
  return {
    status: tree.root.findByProps({ testID: 'status' }).props.children as string,
    orgSlug: tree.root.findByProps({ testID: 'orgSlug' }).props.children as string,
  };
}

describe('usePortalOrganization', () => {
  beforeEach(() => {
    pendingFetches.length = 0;
    mockRefreshSelectedSchool.mockClear();
  });

  it('clears organization and shows loading when slug changes before the next fetch resolves', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = create(<HookProbe slug="school-a" />);
    });

    expect(pendingFetches).toHaveLength(1);
    expect(pendingFetches[0].slug).toBe('school-a');

    await act(async () => {
      pendingFetches.shift()?.resolve(mockOrganization('school-a'));
    });

    expect(readProbe(tree!)).toEqual({ status: 'ready', orgSlug: 'school-a' });

    await act(async () => {
      tree!.update(<HookProbe slug="school-b" />);
    });

    expect(readProbe(tree!)).toEqual({ status: 'loading', orgSlug: '' });
    expect(pendingFetches.some((entry) => entry.slug === 'school-b')).toBe(true);

    await act(async () => {
      const schoolBFetches = pendingFetches.filter((entry) => entry.slug === 'school-b');
      for (const fetch of schoolBFetches) {
        fetch.resolve(mockOrganization('school-b'));
      }
    });

    expect(readProbe(tree!)).toEqual({ status: 'ready', orgSlug: 'school-b' });
  });
});
