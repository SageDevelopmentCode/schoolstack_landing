import * as SecureStore from 'expo-secure-store';
import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { prefetchParentBilling } from '@/contexts/parent-billing-context';
import { prefetchParentCalendar } from '@/contexts/parent-calendar-context';
import { prefetchParentHome } from '@/contexts/parent-home-context';
import { prefetchParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { prefetchSchoolAdminMessagesInbox } from '@/contexts/school-admin-messages-inbox-context';
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
import { getSupabaseClient } from '@/lib/supabase';

const PORTAL_TYPE_KEY = 'mobile_auth_portal_type';
const SELECTED_SCHOOL_KEY = 'mobile_auth_selected_school';
const PLATFORM_ADMIN_SESSION_KEY = 'mobile_auth_platform_admin_session';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  portalType: PortalType | null;
  selectedSchool: LiveOrganization | null;
  isPlatformAdminSession: boolean;
  isLoading: boolean;
  setResolvedPortal: (portal: ResolvedPortal) => Promise<void>;
  enterSchoolAsPlatformAdmin: (school: LiveOrganization) => Promise<void>;
  exitSchoolAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
  restorePortalState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function prefetchParentPortalData(school: LiveOrganization): void {
  void Promise.all([
    prefetchParentHome(school.id, school.slug),
    prefetchParentCalendar(school.id, school.slug),
    prefetchParentBilling(school.id, school.slug),
    prefetchParentMessagesInbox(school.id, school.name),
  ]);
}

function prefetchSchoolAdminPortalData(school: LiveOrganization): void {
  void Promise.all([
    prefetchSchoolAdminSubmissions(school.id),
    prefetchSchoolAdminStudents(school.id),
    prefetchSchoolAdminMessagesInbox(school.id, school.name),
  ]);
}

async function persistPortalState(portal: ResolvedPortal, isPlatformAdminSession: boolean) {
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
}

async function clearPortalState() {
  await Promise.all([
    SecureStore.deleteItemAsync(PORTAL_TYPE_KEY),
    SecureStore.deleteItemAsync(SELECTED_SCHOOL_KEY),
    SecureStore.deleteItemAsync(PLATFORM_ADMIN_SESSION_KEY),
  ]);
}

async function readPersistedPortalState(): Promise<{
  portalType: PortalType | null;
  selectedSchool: LiveOrganization | null;
  isPlatformAdminSession: boolean;
}> {
  const [portalType, schoolJson, platformAdminSession] = await Promise.all([
    SecureStore.getItemAsync(PORTAL_TYPE_KEY),
    SecureStore.getItemAsync(SELECTED_SCHOOL_KEY),
    SecureStore.getItemAsync(PLATFORM_ADMIN_SESSION_KEY),
  ]);

  let selectedSchool: LiveOrganization | null = null;
  if (schoolJson) {
    try {
      selectedSchool = normalizeStoredOrganization(JSON.parse(schoolJson) as LiveOrganization);
    } catch {
      selectedSchool = null;
    }
  }

  return {
    portalType: portalType as PortalType | null,
    selectedSchool,
    isPlatformAdminSession: platformAdminSession === 'true',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portalType, setPortalType] = useState<PortalType | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<LiveOrganization | null>(null);
  const [isPlatformAdminSession, setIsPlatformAdminSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const restorePortalState = useCallback(async () => {
    const persisted = await readPersistedPortalState();
    setPortalType(persisted.portalType);
    setSelectedSchool(persisted.selectedSchool);
    setIsPlatformAdminSession(persisted.isPlatformAdminSession);

    if (persisted.portalType === 'parent' && persisted.selectedSchool) {
      prefetchParentPortalData(persisted.selectedSchool);
    }

    if (persisted.portalType === 'school_admin' && persisted.selectedSchool) {
      prefetchSchoolAdminPortalData(persisted.selectedSchool);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await restorePortalState();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession) {
        setPortalType(null);
        setSelectedSchool(null);
        setIsPlatformAdminSession(false);
        void Promise.all([clearPortalState(), clearAllPersistedPortalCaches()]);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [restorePortalState, supabase.auth]);

  const setResolvedPortal = useCallback(async (portal: ResolvedPortal) => {
    const platformAdminSession = portal.portalType === 'platform_admin';
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    setIsPlatformAdminSession(platformAdminSession);
    await persistPortalState(portal, platformAdminSession);

    if (portal.portalType === 'parent' && portal.school) {
      prefetchParentPortalData(portal.school);
    }

    if (portal.portalType === 'school_admin' && portal.school) {
      prefetchSchoolAdminPortalData(portal.school);
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
    await persistPortalState(portal, true);
    prefetchSchoolAdminPortalData(school);
  }, []);

  const exitSchoolAdmin = useCallback(async () => {
    const portal: ResolvedPortal = {
      portalType: 'platform_admin',
      school: null,
    };
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    setIsPlatformAdminSession(true);
    await persistPortalState(portal, true);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setPortalType(null);
    setSelectedSchool(null);
    setIsPlatformAdminSession(false);
    await Promise.all([clearPortalState(), clearAllPersistedPortalCaches()]);
  }, [supabase.auth]);

  const value = useMemo(
    () => ({
      session,
      user,
      portalType,
      selectedSchool,
      isPlatformAdminSession,
      isLoading,
      setResolvedPortal,
      enterSchoolAsPlatformAdmin,
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
      isLoading,
      setResolvedPortal,
      enterSchoolAsPlatformAdmin,
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
