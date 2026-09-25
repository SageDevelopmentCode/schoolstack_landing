import * as SecureStore from 'expo-secure-store';
import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { prefetchParentBilling } from '@/contexts/parent-billing-context';
import { prefetchParentCalendar } from '@/contexts/parent-calendar-context';
import { prefetchParentHome } from '@/contexts/parent-home-context';
import { prefetchParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { prefetchTeacherHome } from '@/contexts/teacher-home-context';
import { prefetchTeacherMessagesInbox } from '@/contexts/teacher-messages-inbox-context';
import { prefetchSchoolAdminMessagesInbox, prefetchSchoolAdminMessagesContacts } from '@/contexts/school-admin-messages-inbox-context';
import { prefetchSchoolAdminStudents } from '@/contexts/school-admin-students-context';
import { prefetchSchoolAdminSubmissions } from '@/contexts/school-admin-submissions-context';
import {
  resolvePlatformAdmin,
  resolvePortalForSchool,
  type PortalType,
  type ResolvedPortal,
} from '@/lib/auth/resolve-portal';
import type { LiveOrganization } from '@/lib/organizations';
import { normalizeStoredOrganization } from '@/lib/organizations';
import { clearAllPersistedPortalCaches } from '@/lib/portal-cache';
import {
  logMobileAuthSessionCleared,
  logMobileAuthSessionRestored,
  logMobileAuthSignedOut,
} from '@/lib/mobile-activity';
import { clearExpoPushToken } from '@/lib/push-notifications';
import type {
  PortalPreviewSession,
  StartPortalPreviewInput,
} from '@/lib/platform-admin/preview-session-types';
import { setActivePreviewSession } from '@/lib/platform-admin/preview-session-store';
import { getCachedAccessToken, setCachedAccessToken } from '@/lib/auth/auth-session';
import {
  consumeExplicitMobileSignOut,
  markExplicitMobileSignOut,
} from '@/lib/auth/mobile-explicit-sign-out';
import { ensureSupabaseAuthStorageReady, getSupabaseClient } from '@/lib/supabase';

const PORTAL_TYPE_KEY = 'mobile_auth_portal_type';
const SELECTED_SCHOOL_KEY = 'mobile_auth_selected_school';
const PLATFORM_ADMIN_SESSION_KEY = 'mobile_auth_platform_admin_session';
const PREVIEW_SESSION_KEY = 'mobile_auth_preview_session';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  portalType: PortalType | null;
  selectedSchool: LiveOrganization | null;
  isPlatformAdminSession: boolean;
  previewSession: PortalPreviewSession | null;
  isLoading: boolean;
  setResolvedPortal: (portal: ResolvedPortal) => Promise<void>;
  enterSchoolAsPlatformAdmin: (school: LiveOrganization) => Promise<void>;
  startPortalPreview: (input: StartPortalPreviewInput) => Promise<void>;
  exitPortalPreview: () => Promise<void>;
  exitSchoolAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
  restorePortalState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function whenSessionReady(run: () => void): Promise<void> {
  const supabase = getSupabaseClient();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      run();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
  }
}

function prefetchParentPortalData(school: LiveOrganization): void {
  void whenSessionReady(() => {
    void Promise.all([
      prefetchParentHome(school.id, school.slug),
      prefetchParentCalendar(school.id, school.slug),
      prefetchParentBilling(school.id, school.slug),
      prefetchParentMessagesInbox(school.id, school.name),
    ]);
  });
}

function prefetchSchoolAdminPortalData(school: LiveOrganization): void {
  void whenSessionReady(() => {
    void Promise.all([
      prefetchSchoolAdminSubmissions(school.id),
      prefetchSchoolAdminStudents(school.id),
      prefetchSchoolAdminMessagesInbox(school.id, school.name),
      prefetchSchoolAdminMessagesContacts(school.id, school.name),
    ]);
  });
}

function prefetchTeacherPortalData(school: LiveOrganization): void {
  void whenSessionReady(() => {
    void Promise.all([
      prefetchTeacherHome(school.id, school.slug),
      prefetchTeacherMessagesInbox(school.id, school.name),
    ]);
  });
}

async function persistPreviewSession(session: PortalPreviewSession | null) {
  if (session) {
    await SecureStore.setItemAsync(PREVIEW_SESSION_KEY, JSON.stringify(session));
  } else {
    await SecureStore.deleteItemAsync(PREVIEW_SESSION_KEY);
  }
  setActivePreviewSession(session);
}

async function persistPortalState(
  portal: ResolvedPortal,
  isPlatformAdminSession: boolean,
  previewSession: PortalPreviewSession | null = null,
) {
  await SecureStore.setItemAsync(PORTAL_TYPE_KEY, portal.portalType);
  await SecureStore.setItemAsync(
    PLATFORM_ADMIN_SESSION_KEY,
    isPlatformAdminSession ? 'true' : 'false',
  );
  if (portal.school) {
    await SecureStore.setItemAsync(SELECTED_SCHOOL_KEY, JSON.stringify(portal.school));
  } else {
    await SecureStore.deleteItemAsync(SELECTED_SCHOOL_KEY);
  }
  await persistPreviewSession(previewSession);
}

async function clearPortalState() {
  setActivePreviewSession(null);
  await Promise.all([
    SecureStore.deleteItemAsync(PORTAL_TYPE_KEY),
    SecureStore.deleteItemAsync(SELECTED_SCHOOL_KEY),
    SecureStore.deleteItemAsync(PLATFORM_ADMIN_SESSION_KEY),
    SecureStore.deleteItemAsync(PREVIEW_SESSION_KEY),
  ]);
}

async function readPersistedPortalState(): Promise<{
  portalType: PortalType | null;
  selectedSchool: LiveOrganization | null;
  isPlatformAdminSession: boolean;
  previewSession: PortalPreviewSession | null;
}> {
  const [portalType, schoolJson, platformAdminSession, previewJson] = await Promise.all([
    SecureStore.getItemAsync(PORTAL_TYPE_KEY),
    SecureStore.getItemAsync(SELECTED_SCHOOL_KEY),
    SecureStore.getItemAsync(PLATFORM_ADMIN_SESSION_KEY),
    SecureStore.getItemAsync(PREVIEW_SESSION_KEY),
  ]);

  let selectedSchool: LiveOrganization | null = null;
  if (schoolJson) {
    try {
      selectedSchool = normalizeStoredOrganization(JSON.parse(schoolJson) as LiveOrganization);
    } catch {
      selectedSchool = null;
    }
  }

  let previewSession: PortalPreviewSession | null = null;
  if (previewJson) {
    try {
      previewSession = JSON.parse(previewJson) as PortalPreviewSession;
    } catch {
      previewSession = null;
    }
  }

  setActivePreviewSession(previewSession);

  return {
    portalType: portalType as PortalType | null,
    selectedSchool,
    isPlatformAdminSession: platformAdminSession === 'true',
    previewSession,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portalType, setPortalType] = useState<PortalType | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<LiveOrganization | null>(null);
  const [isPlatformAdminSession, setIsPlatformAdminSession] = useState(false);
  const [previewSession, setPreviewSession] = useState<PortalPreviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const explicitSignOutRef = useRef(false);
  const portalTypeRef = useRef(portalType);
  const selectedSchoolIdRef = useRef(selectedSchool?.id ?? null);

  useEffect(() => {
    portalTypeRef.current = portalType;
  }, [portalType]);

  useEffect(() => {
    selectedSchoolIdRef.current = selectedSchool?.id ?? null;
  }, [selectedSchool?.id]);

  useEffect(() => {
    setActivePreviewSession(previewSession);
  }, [previewSession]);

  const restorePortalState = useCallback(async () => {
    const persisted = await readPersistedPortalState();
    setPortalType(persisted.portalType);
    setSelectedSchool(persisted.selectedSchool);
    setIsPlatformAdminSession(persisted.isPlatformAdminSession);
    setPreviewSession(persisted.previewSession);

    if (persisted.previewSession) {
      return;
    }

    if (persisted.portalType === 'parent' && persisted.selectedSchool) {
      prefetchParentPortalData(persisted.selectedSchool);
    }

    if (persisted.portalType === 'school_admin' && persisted.selectedSchool) {
      prefetchSchoolAdminPortalData(persisted.selectedSchool);
    }

    if (persisted.portalType === 'teacher' && persisted.selectedSchool) {
      prefetchTeacherPortalData(persisted.selectedSchool);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    async function init() {
      try {
        await ensureSupabaseAuthStorageReady();
        const supabase = getSupabaseClient();

        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange((event, nextSession) => {
          if (!nextSession) {
            const wasExplicitSignOut =
              explicitSignOutRef.current || consumeExplicitMobileSignOut();
            explicitSignOutRef.current = false;

            if (!wasExplicitSignOut) {
              void logMobileAuthSessionCleared({
                accessToken: getCachedAccessToken(),
                event,
                portalType: portalTypeRef.current,
                organizationId: selectedSchoolIdRef.current,
              });
            }

            setCachedAccessToken(null);
            setSession(null);
            setUser(null);
            setPortalType(null);
            setSelectedSchool(null);
            setIsPlatformAdminSession(false);
            setPreviewSession(null);
            void Promise.all([clearPortalState(), clearAllPersistedPortalCaches()]);
            return;
          }

          setCachedAccessToken(nextSession.access_token ?? null);
          setSession(nextSession);
          setUser(nextSession.user ?? null);

          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            void restorePortalState();
          }
        });
        subscription = authSubscription;

        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        setCachedAccessToken(initialSession?.access_token ?? null);
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const persisted = await readPersistedPortalState();
          await restorePortalState();
          if (persisted.selectedSchool?.id && persisted.portalType) {
            void logMobileAuthSessionRestored(
              persisted.portalType,
              persisted.selectedSchool.id,
            );
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [restorePortalState]);

  const setResolvedPortal = useCallback(async (portal: ResolvedPortal) => {
    const platformAdminSession = portal.portalType === 'platform_admin';
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    setIsPlatformAdminSession(platformAdminSession);
    setActivePreviewSession(null);
    setPreviewSession(null);
    await persistPortalState(portal, platformAdminSession, null);

    if (portal.portalType === 'parent' && portal.school) {
      prefetchParentPortalData(portal.school);
    }

    if (portal.portalType === 'school_admin' && portal.school) {
      prefetchSchoolAdminPortalData(portal.school);
    }

    if (portal.portalType === 'teacher' && portal.school) {
      prefetchTeacherPortalData(portal.school);
    }
  }, []);

  const enterSchoolAsPlatformAdmin = useCallback(async (school: LiveOrganization) => {
    const portal: ResolvedPortal = {
      portalType: 'school_admin',
      school,
    };
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    setIsPlatformAdminSession(true);
    setActivePreviewSession(null);
    setPreviewSession(null);
    await persistPortalState(portal, true, null);
    prefetchSchoolAdminPortalData(school);
  }, []);

  const startPortalPreview = useCallback(async (input: StartPortalPreviewInput) => {
    const session: PortalPreviewSession = {
      portal: input.portal,
      organizationId: input.organizationId,
      slug: input.slug,
      subjectLabel: input.subjectLabel,
      membershipId: input.membershipId,
      staffMemberId: input.staffMemberId,
      familyId: input.familyId,
    };
    const portal: ResolvedPortal = {
      portalType: input.portal,
      school: input.school,
    };

    setActivePreviewSession(session);
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    setIsPlatformAdminSession(true);
    setPreviewSession(session);
    await persistPortalState(portal, true, session);

    if (input.portal === 'parent') {
      prefetchParentPortalData(input.school);
    } else if (input.portal === 'school_admin') {
      prefetchSchoolAdminPortalData(input.school);
    } else if (input.portal === 'teacher') {
      prefetchTeacherPortalData(input.school);
    }
  }, []);

  const exitPortalPreview = useCallback(async () => {
    const portal: ResolvedPortal = {
      portalType: 'platform_admin',
      school: null,
    };
    setPortalType(portal.portalType);
    setSelectedSchool(null);
    setIsPlatformAdminSession(true);
    setActivePreviewSession(null);
    setPreviewSession(null);
    await persistPortalState(portal, true, null);
    await clearAllPersistedPortalCaches();
  }, []);

  const exitSchoolAdmin = useCallback(async () => {
    if (previewSession) {
      await exitPortalPreview();
      return;
    }

    const portal: ResolvedPortal = {
      portalType: 'platform_admin',
      school: null,
    };
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    setIsPlatformAdminSession(true);
    setActivePreviewSession(null);
    setPreviewSession(null);
    await persistPortalState(portal, true, null);
  }, [exitPortalPreview, previewSession]);

  const signOut = useCallback(async () => {
    explicitSignOutRef.current = true;
    markExplicitMobileSignOut();
    void logMobileAuthSignedOut(portalType, selectedSchool?.id);
    await clearExpoPushToken();
    await getSupabaseClient().auth.signOut();
    setPortalType(null);
    setSelectedSchool(null);
    setIsPlatformAdminSession(false);
    setActivePreviewSession(null);
    setPreviewSession(null);
    await Promise.all([clearPortalState(), clearAllPersistedPortalCaches()]);
  }, [portalType, selectedSchool?.id]);

  const value = useMemo(
    () => ({
      session,
      user,
      portalType,
      selectedSchool,
      isPlatformAdminSession,
      previewSession,
      isLoading,
      setResolvedPortal,
      enterSchoolAsPlatformAdmin,
      startPortalPreview,
      exitPortalPreview,
      exitSchoolAdmin,
      signOut,
      restorePortalState,
    }),
    [
      session,
      user,
      portalType,
      selectedSchool,
      isPlatformAdminSession,
      previewSession,
      isLoading,
      setResolvedPortal,
      enterSchoolAsPlatformAdmin,
      startPortalPreview,
      exitPortalPreview,
      exitSchoolAdmin,
      signOut,
      restorePortalState,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export async function completeSchoolSignIn(
  userId: string,
  school: LiveOrganization,
): Promise<ResolvedPortal> {
  const supabase = getSupabaseClient();
  return resolvePortalForSchool(supabase, userId, school);
}

export async function completePlatformAdminSignIn(userId: string): Promise<ResolvedPortal> {
  const supabase = getSupabaseClient();
  return resolvePlatformAdmin(supabase, userId);
}
