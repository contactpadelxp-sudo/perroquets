'use client';

import { useAuth } from './auth-context';
import { supabase } from './supabase';

export function useUserSupabase() {
  const { user } = useAuth();
  return { supabase, userId: user?.id ?? null };
}
