'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      // The supabase-js client will detect the hash fragment or code
      // and exchange it for a session automatically
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        // Try exchanging code manually if present
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Exchange error:', exchangeError.message);
            router.replace('/login?error=auth');
            return;
          }
        } else {
          router.replace('/login?error=auth');
          return;
        }
      }

      // Verify we have a user now
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if user_settings exists (determines if new user)
        try {
          const { data: existing } = await supabase
            .from('user_settings')
            .select('id, species')
            .eq('user_id', user.id)
            .single();

          if (!existing) {
            // New user: create minimal settings and redirect to onboarding
            await supabase.from('user_settings').insert({
              user_id: user.id,
              bird_name: 'Mon oiseau',
            });
            window.location.href = '/onboarding';
            return;
          }

          if (!existing.species) {
            // Existing user without species: redirect to onboarding
            window.location.href = '/onboarding';
            return;
          }
        } catch {
          // Non-critical
        }

        // Force full page reload to update middleware auth state
        window.location.href = '/';
      } else {
        router.replace('/login?error=auth');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-accent-violet" />
        <p className="text-sm text-muted">Connexion en cours...</p>
      </div>
    </div>
  );
}
