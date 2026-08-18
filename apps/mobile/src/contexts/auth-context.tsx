import type { Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  resolvePlatformAdmin,
  resolvePortalForSchool,
  type PortalType,
  type ResolvedPortal,
} from '@/lib/auth/resolve-portal';
import type { LiveOrganization } from '@/lib/organizations';
import { getSupabaseClient } from '@/lib/supabase';

const PORTAL_TYPE_KEY = 'mobile_auth_portal_type';
const SELECTED_SCHOOL_KEY = 'mobile_auth_selected_school';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  portalType: PortalType | null;
  selectedSchool: LiveOrganization | null;
  isLoading: boolean;
  setResolvedPortal: (portal: ResolvedPortal) => Promise<void>;
  signOut: () => Promise<void>;
  restorePortalState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistPortalState(portal: ResolvedPortal) {
  await SecureStore.setItemAsync(PORTAL_TYPE_KEY, portal.portalType);
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
  ]);
}

async function readPersistedPortalState(): Promise<{
  portalType: PortalType | null;
  selectedSchool: LiveOrganization | null;
}> {
  const [portalType, schoolJson] = await Promise.all([
    SecureStore.getItemAsync(PORTAL_TYPE_KEY),
    SecureStore.getItemAsync(SELECTED_SCHOOL_KEY),
  ]);

  let selectedSchool: LiveOrganization | null = null;
  if (schoolJson) {
    try {
      selectedSchool = JSON.parse(schoolJson) as LiveOrganization;
    } catch {
      selectedSchool = null;
    }
  }

  return {
    portalType: portalType as PortalType | null,
    selectedSchool,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portalType, setPortalType] = useState<PortalType | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<LiveOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restorePortalState = useCallback(async () => {
    const persisted = await readPersistedPortalState();
    setPortalType(persisted.portalType);
    setSelectedSchool(persisted.selectedSchool);
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
        void clearPortalState();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [restorePortalState, supabase.auth]);

  const setResolvedPortal = useCallback(async (portal: ResolvedPortal) => {
    setPortalType(portal.portalType);
    setSelectedSchool(portal.school);
    await persistPortalState(portal);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setPortalType(null);
    setSelectedSchool(null);
    await clearPortalState();
  }, [supabase.auth]);

  const value = useMemo(
    () => ({
      session,
      user,
      portalType,
      selectedSchool,
      isLoading,
      setResolvedPortal,
      signOut,
      restorePortalState,
    }),
    [
      session,
      user,
      portalType,
      selectedSchool,
      isLoading,
      setResolvedPortal,
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
