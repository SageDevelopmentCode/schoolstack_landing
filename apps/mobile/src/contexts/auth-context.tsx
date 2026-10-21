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
import { resolvePortalForOption } from '@/lib/auth/resolve-portal-choice';
import {
  resolvePlatformAdmin,
  resolvePortalForSchool,
  type PortalType,
  type ResolvedPortal,
} from '@/lib/auth/resolve-portal';
import type { AccountPortalId } from '@/lib/auth/school-portal-options-types';
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
import {
  clearPortalState,
  persistPortalState,
  readPersistedPortalState,
} from '@/lib/auth/portal-persistence';
import { reconcilePersistedPortal } from '@/lib/auth/reconcile-persisted-portal';
import { shouldClearPersistedPortalOnAuthEvent } from '@/lib/auth/should-clear-persisted-portal';
import { shouldClearPortalOnSignedIn } from '@/lib/auth/should-clear-portal-on-signed-in';
import { ensureSupabaseAuthStorageReady, getSupabaseClient } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  portalType: PortalType | null;
  selectedSchool: LiveOrganization | null;
  isPlatformAdminSession: boolean;
  previewSession: PortalPreviewSession | null;
  isLoading: boolean;
  setResolvedPortal: (portal: ResolvedPortal, forUserId?: string) => Promise<void>;
  enterSchoolAsPlatformAdmin: (school: LiveOrganization) => Promise<void>;
  startPortalPreview: (input: StartPortalPreviewInput) => Promise<void>;
  exitPortalPreview: () => Promise<void>;
  exitSchoolAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
  switchSchool: () => Promise<void>;
  switchAccountPortal: (optionId: AccountPortalId) => Promise<ResolvedPortal>;
  accountPortalSwitchInProgress: boolean;
  clearAccountPortalSwitchInProgress: () => void;
  restorePortalState: (sessionUserId?: string) => Promise<void>;
  refreshSelectedSchool: (school: LiveOrganization) => Promise<void>;
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

function applyPortalStateToReact(
  setters: {
    setPortalType: (value: PortalType | null) => void;
    setSelectedSchool: (value: LiveOrganization | null) => void;
    setIsPlatformAdminSession: (value: boolean) => void;
    setPreviewSession: (value: PortalPreviewSession | null) => void;
  },
  state: {
    portalType: PortalType | null;
    selectedSchool: LiveOrganization | null;
    isPlatformAdminSession: boolean;
    previewSession: PortalPreviewSession | null;
  },
) {
  setters.setPortalType(state.portalType);
  setters.setSelectedSchool(state.selectedSchool);
  setters.setIsPlatformAdminSession(state.isPlatformAdminSession);
  setters.setPreviewSession(state.previewSession);
}

function prefetchPortalDataForType(
  portalType: PortalType | null,
  school: LiveOrganization | null,
  previewSession: PortalPreviewSession | null,
) {
  if (previewSession || !school || !portalType) {
    return;
  }

  if (portalType === 'parent') {
    prefetchParentPortalData(school);
  }

  if (portalType === 'school_admin') {
    prefetchSchoolAdminPortalData(school);
  }

  if (portalType === 'teacher') {
    prefetchTeacherPortalData(school);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portalType, setPortalType] = useState<PortalType | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<LiveOrganization | null>(null);
  const [isPlatformAdminSession, setIsPlatformAdminSession] = useState(false);
  const [previewSession, setPreviewSession] = useState<PortalPreviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountPortalSwitchInProgress, setAccountPortalSwitchInProgress] = useState(false);

  const explicitSignOutRef = useRef(false);
  const hadEstablishedSessionRef = useRef(false);
  const portalTypeRef = useRef(portalType);
  const selectedSchoolIdRef = useRef(selectedSchool?.id ?? null);
  const portalResolvedForUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    portalTypeRef.current = portalType;
  }, [portalType]);

  useEffect(() => {
    selectedSchoolIdRef.current = selectedSchool?.id ?? null;
  }, [selectedSchool?.id]);

  useEffect(() => {
    setActivePreviewSession(previewSession);
  }, [previewSession]);

  const restorePortalState = useCallback(async (sessionUserId?: string) => {
    const userId = sessionUserId ?? user?.id;
    if (!userId) {
      return;
    }

    const persisted = await readPersistedPortalState(userId);
    if (!persisted.portalType && !persisted.previewSession) {
      applyPortalStateToReact(
        {
          setPortalType,
          setSelectedSchool,
          setIsPlatformAdminSession,
          setPreviewSession,
        },
        {
          portalType: null,
          selectedSchool: null,
          isPlatformAdminSession: false,
          previewSession: null,
        },
      );
      return;
    }

    let nextState = persisted;

    if (!persisted.previewSession && persisted.portalType && persisted.selectedSchool) {
      const supabase = getSupabaseClient();
      const reconciled = await reconcilePersistedPortal(supabase, userId, persisted);
      nextState = reconciled;

      if (reconciled.didChange && reconciled.portalType) {
        await persistPortalState(
          {
            portalType: reconciled.portalType,
            school: reconciled.selectedSchool,
          },
          reconciled.isPlatformAdminSession,
          null,
          userId,
        );
      }
    }

    applyPortalStateToReact(
      {
        setPortalType,
        setSelectedSchool,
        setIsPlatformAdminSession,
        setPreviewSession,
      },
      {
        portalType: nextState.portalType,
        selectedSchool: nextState.selectedSchool,
        isPlatformAdminSession: nextState.isPlatformAdminSession,
        previewSession: nextState.previewSession,
      },
    );

    prefetchPortalDataForType(
      nextState.portalType,
      nextState.selectedSchool,
      nextState.previewSession,
    );
  }, [user?.id]);

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

            const shouldClearPersistedPortal = shouldClearPersistedPortalOnAuthEvent({
              event,
              wasExplicitSignOut,
              hadEstablishedSession: hadEstablishedSessionRef.current,
            });

            if (shouldClearPersistedPortal && !wasExplicitSignOut) {
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
            portalResolvedForUserIdRef.current = null;

            if (shouldClearPersistedPortal) {
              hadEstablishedSessionRef.current = false;
              void Promise.all([clearPortalState(), clearAllPersistedPortalCaches()]);
            }
            return;
          }

          hadEstablishedSessionRef.current = true;
          setCachedAccessToken(nextSession.access_token ?? null);
          setSession(nextSession);
          setUser(nextSession.user ?? null);

          if (event === 'SIGNED_IN') {
            const sessionUserId = nextSession.user?.id;
            if (
              sessionUserId &&
              !shouldClearPortalOnSignedIn({
                resolvedUserId: portalResolvedForUserIdRef.current,
                sessionUserId,
              })
            ) {
              return;
            }

            portalResolvedForUserIdRef.current = null;
            setPortalType(null);
            setSelectedSchool(null);
            setIsPlatformAdminSession(false);
            setPreviewSession(null);
            setActivePreviewSession(null);
            void clearPortalState();
            return;
          }

          if (event === 'INITIAL_SESSION') {
            void restorePortalState(nextSession.user.id);
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
          hadEstablishedSessionRef.current = true;
          const persisted = await readPersistedPortalState(initialSession.user.id);
          await restorePortalState(initialSession.user.id);
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

  const setResolvedPortal = useCallback(async (portal: ResolvedPortal, forUserId?: string) => {
    const userId = forUserId ?? user?.id;
    if (!userId) {
      throw new Error('You must be signed in to set a portal.');
    }

    portalResolvedForUserIdRef.current = userId;

    const platformAdminSession = portal.portalType === 'platform_admin';
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    setIsPlatformAdminSession(platformAdminSession);
    setActivePreviewSession(null);
    setPreviewSession(null);
    await persistPortalState(portal, platformAdminSession, null, userId);

    prefetchPortalDataForType(portal.portalType, portal.school, null);
  }, [user?.id]);

  const enterSchoolAsPlatformAdmin = useCallback(async (school: LiveOrganization) => {
    const userId = user?.id;
    if (!userId) {
      throw new Error('You must be signed in to open a school.');
    }

    const portal: ResolvedPortal = {
      portalType: 'school_admin',
      school,
    };
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    setIsPlatformAdminSession(true);
    setActivePreviewSession(null);
    setPreviewSession(null);
    await persistPortalState(portal, true, null, userId);
    prefetchSchoolAdminPortalData(school);
  }, [user?.id]);

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

    const userId = user?.id;
    if (!userId) {
      throw new Error('You must be signed in to start a preview.');
    }
    await persistPortalState(portal, true, session, userId);

    if (input.portal === 'parent') {
      prefetchParentPortalData(input.school);
    } else if (input.portal === 'school_admin') {
      prefetchSchoolAdminPortalData(input.school);
    } else if (input.portal === 'teacher') {
      prefetchTeacherPortalData(input.school);
    }
  }, [user?.id]);

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
    const userId = user?.id;
    if (userId) {
      await persistPortalState(portal, true, null, userId);
    }
    await clearAllPersistedPortalCaches();
  }, [user?.id]);

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
    const userId = user?.id;
    if (userId) {
      await persistPortalState(portal, true, null, userId);
    }
  }, [exitPortalPreview, previewSession, user?.id]);

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

  const switchSchool = useCallback(async () => {
    setAccountPortalSwitchInProgress(true);
  }, []);

  const clearAccountPortalSwitchInProgress = useCallback(() => {
    setAccountPortalSwitchInProgress(false);
  }, []);

  const switchAccountPortal = useCallback(
    async (optionId: AccountPortalId) => {
      const userId = user?.id;
      const school = selectedSchool;
      if (!userId || !school) {
        throw new Error('You must be signed in to a school to switch portals.');
      }

      setAccountPortalSwitchInProgress(true);
      const supabase = getSupabaseClient();
      const portal = await resolvePortalForOption(supabase, userId, school, optionId);
      await clearAllPersistedPortalCaches();
      await setResolvedPortal(portal);
      return portal;
    },
    [selectedSchool, setResolvedPortal, user?.id],
  );

  const refreshSelectedSchool = useCallback(
    async (school: LiveOrganization) => {
      const normalized = normalizeStoredOrganization(school);
      if (
        selectedSchool?.slug !== normalized.slug &&
        selectedSchool?.id !== normalized.id
      ) {
        return;
      }
      if (!portalType) return;

      setSelectedSchool(normalized);
      const userId = user?.id;
      if (userId) {
        await persistPortalState(
          { portalType, school: normalized },
          isPlatformAdminSession,
          previewSession,
          userId,
        );
      }
    },
    [
      isPlatformAdminSession,
      portalType,
      previewSession,
      selectedSchool?.id,
      selectedSchool?.slug,
      user?.id,
    ],
  );

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
      switchSchool,
      switchAccountPortal,
      accountPortalSwitchInProgress,
      clearAccountPortalSwitchInProgress,
      restorePortalState,
      refreshSelectedSchool,
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
      switchSchool,
      switchAccountPortal,
      accountPortalSwitchInProgress,
      clearAccountPortalSwitchInProgress,
      restorePortalState,
      refreshSelectedSchool,
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
