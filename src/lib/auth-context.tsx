'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { UserSettings } from '@/types/database';
import type { SpeciesId } from './species';
import { getSpeciesConfig } from './species';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  settings: UserSettings | null;
  species: SpeciesId;
  signOut: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  settings: null,
  species: 'eclectus',
  signOut: async () => {},
  refreshSettings: async () => {},
});

const PUBLIC_ROUTES = ['/login', '/auth', '/legal'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isOnboarding = pathname === '/onboarding';

  const loadSettings = async (userId: string) => {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();
    setSettings(data);
    return data;
  };

  const refreshSettings = async () => {
    if (user) {
      await loadSettings(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await loadSettings(currentUser.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await loadSettings(currentUser.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect to login if not authenticated and not on public route
  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicRoute) {
      router.replace('/login');
      return;
    }
    // Redirect to onboarding if authenticated but no species selected
    if (user && !isPublicRoute && !isOnboarding && settings !== null && !settings.species) {
      router.replace('/onboarding');
    }
  }, [user, loading, isPublicRoute, isOnboarding, router, settings]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSettings(null);
    window.location.href = '/login';
  };

  const species: SpeciesId = (settings?.species as SpeciesId) || 'eclectus';

  return (
    <AuthContext.Provider value={{ user, loading, settings, species, signOut, refreshSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
