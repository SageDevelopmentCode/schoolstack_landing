const mockSecureStore = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value);
  }),
  getItemAsync: jest.fn(async (key: string) => mockSecureStore.get(key) ?? null),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore.delete(key);
  }),
}));

import {
  PORTAL_USER_ID_KEY,
  clearPortalState,
  persistPortalState,
  readPersistedPortalState,
} from '@/lib/auth/portal-persistence';

const demoSchool = {
  id: 'org-1',
  slug: 'demo',
  name: 'Demo',
  branding: {
    colors: {
      primary: '#000',
      secondary: '#000',
      accent: '#000',
      background: '#fff',
      text: '#000',
    },
    logoSrc: '',
    logoAlt: '',
  },
};

describe('portal-persistence', () => {
  beforeEach(() => {
    mockSecureStore.clear();
  });

  it('scopes persisted portal state to a user id', async () => {
    await persistPortalState(
      { portalType: 'teacher', school: demoSchool },
      false,
      null,
      'user-a',
    );

    const forUserA = await readPersistedPortalState('user-a');
    expect(forUserA.portalType).toBe('teacher');
    expect(forUserA.persistedUserId).toBe('user-a');

    await persistPortalState(
      { portalType: 'teacher', school: demoSchool },
      false,
      null,
      'user-a',
    );

    const forUserB = await readPersistedPortalState('user-b');
    expect(forUserB.portalType).toBeNull();
    expect(mockSecureStore.has(PORTAL_USER_ID_KEY)).toBe(false);
  });

  it('clears all portal keys', async () => {
    await persistPortalState({ portalType: 'platform_admin', school: null }, true, null, 'user-a');
    await clearPortalState();
    const state = await readPersistedPortalState('user-a');
    expect(state.portalType).toBeNull();
    expect(mockSecureStore.size).toBe(0);
  });
});
